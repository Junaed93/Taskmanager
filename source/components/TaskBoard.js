import { StyleSheet, Text, View } from 'react-native';

import { STATUS } from '../constants/taskManager';
import { TaskCard } from './TaskCard';

export function TaskBoard({ isWide, taskGroups, onAdvance, onDelete }) {
  return (
    <View style={[styles.board, isWide && styles.boardWide]}>
      {Object.values(STATUS).map((group) => (
        <View key={group} style={[styles.column, isWide && styles.columnWide]}>
          <Text style={styles.columnTitle}>{group}</Text>
          {taskGroups[group].length === 0 ? (
            <Text style={styles.emptyText}>No tasks yet</Text>
          ) : (
            taskGroups[group].map((task) => (
              <TaskCard key={task.id} task={task} onAdvance={onAdvance} onDelete={onDelete} />
            ))
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: '100%',
  },
  boardWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  column: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  columnWide: {
    flex: 1,
    minWidth: 220,
  },
  columnTitle: {
    color: '#f3f4f6',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});