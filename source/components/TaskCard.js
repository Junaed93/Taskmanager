import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateTimeLabel, formatMembersLabel, getDeadlineColorInfo } from '../utils/taskHelpers';

export function TaskCard({ task, onAdvance, onDelete }) {
  const deadlineColor = getDeadlineColorInfo(task);

  return (
    <View style={[styles.card, { borderLeftColor: deadlineColor.color }]}> 
      <Text style={styles.cardTitle}>{task.name || 'Untitled Task'}</Text>
      <Text style={styles.cardLine}>Owner: {task.owner || '-'}</Text>
      <Text style={styles.cardLine}>Start Date: {task.startDateLabel || formatDateTimeLabel(task.startDateIso)}</Text>
      <Text style={styles.cardLine}>Deadline: {formatDateTimeLabel(task.deadline)}</Text>
      <Text style={styles.cardLine}>Priority: {task.priority}</Text>
      <Text style={styles.cardLine}>Required Time: {task.requiredTime || '-'}</Text>
      <Text style={styles.cardLine}>Members: {formatMembersLabel(task.members)}</Text>
      <Text style={styles.cardLine}>Description: {task.description || '-'}</Text>
      <Text style={styles.cardLine}>Status: {task.status}</Text>
      <View style={styles.colorRow}>
        <View style={[styles.colorSwatch, { backgroundColor: deadlineColor.color }]} />
        <Text style={styles.colorText}>{deadlineColor.label}</Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable style={styles.cardActionBtn} onPress={() => onAdvance(task.id)}>
          <Text style={styles.cardActionText}>Update Status</Text>
        </Pressable>
        <Pressable
          style={[styles.cardActionBtn, styles.cardDeleteBtn]}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.cardActionText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 6,
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  cardActionBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  cardDeleteBtn: {
    backgroundColor: '#7f1d1d',
  },
  cardActionText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardLine: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 2,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  colorText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '600',
  },
});