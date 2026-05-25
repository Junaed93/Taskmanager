import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TaskCard } from './TaskCard';

function getDeadlineValue(task) {
  const value = new Date(task.deadline).getTime();

  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

export function TaskList({ tasks, currentTime, onAdvance, onDelete, onAddComment }) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((left, right) => {
      const deadlineDelta = getDeadlineValue(left) - getDeadlineValue(right);

      if (deadlineDelta !== 0) {
        return deadlineDelta;
      }

      return left.name.localeCompare(right.name);
    });
  }, [tasks]);

  return (
    <View style={styles.listCard}>
      <Text style={styles.heading}>Task List</Text>
      <Text style={styles.note}>Sorted by deadline, earliest due date first.</Text>
      {sortedTasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks yet</Text>
      ) : (
        <View style={styles.listWrap}>
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentTime={currentTime}
              onAdvance={onAdvance}
              onDelete={onDelete}
              onAddComment={onAddComment}
              draggable={false}
              showActions={false}
              showCommentComposer={false}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
  },
  heading: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '700',
  },
  note: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  listWrap: {
    gap: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});