import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PRIORITIES, STATUS } from '../constants/taskManager';

export function TaskForm({
  addTask,
  deadline,
  description,
  members,
  name,
  owner,
  priority,
  requiredTime,
  setDeadline,
  setDescription,
  setMembers,
  setName,
  setOwner,
  setPriority,
  setRequiredTime,
  setStatus,
  status,
}) {
  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Task Name"
        placeholderTextColor="#6b7280"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Owner"
        placeholderTextColor="#6b7280"
        value={owner}
        onChangeText={setOwner}
      />
      <TextInput
        style={styles.input}
        placeholder="Deadline (e.g. 2026-06-01 18:00)"
        placeholderTextColor="#6b7280"
        value={deadline}
        onChangeText={setDeadline}
      />
      <TextInput
        style={styles.input}
        placeholder="Required Time (e.g. 6h)"
        placeholderTextColor="#6b7280"
        value={requiredTime}
        onChangeText={setRequiredTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Members (comma-separated)"
        placeholderTextColor="#6b7280"
        value={members}
        onChangeText={setMembers}
      />
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Description"
        placeholderTextColor="#6b7280"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.optionRow}>
        {PRIORITIES.map((item) => (
          <Pressable
            key={item}
            style={[styles.optionBtn, priority === item && styles.optionBtnActive]}
            onPress={() => setPriority(item)}
          >
            <Text style={[styles.optionBtnText, priority === item && styles.optionBtnTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.optionRow}>
        {Object.values(STATUS).map((item) => (
          <Pressable
            key={item}
            style={[styles.optionBtn, status === item && styles.optionBtnActive]}
            onPress={() => setStatus(item)}
          >
            <Text style={[styles.optionBtnText, status === item && styles.optionBtnTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.createBtn} onPress={addTask}>
        <Text style={styles.createBtnText}>Create Task</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#374151',
    color: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  label: {
    color: '#e5e7eb',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  optionBtn: {
    borderColor: '#6b7280',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionBtnActive: {
    borderColor: '#60a5fa',
    backgroundColor: '#1e3a8a',
  },
  optionBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  optionBtnTextActive: {
    color: '#dbeafe',
    fontWeight: '700',
  },
  createBtn: {
    marginTop: 2,
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#082f49',
    fontWeight: '800',
    fontSize: 14,
  },
});