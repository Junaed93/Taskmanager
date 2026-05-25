import { useMemo, useState } from 'react';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PRIORITIES, STATUS } from '../constants/taskManager';
import { formatDateTimeLabel } from '../utils/taskHelpers';

export function TaskForm({
  addTask,
  addMember,
  deadline,
  description,
  members,
  memberName,
  name,
  owner,
  priority,
  requiredTime,
  removeMember,
  setDeadline,
  setDescription,
  setMemberName,
  setName,
  setOwner,
  setPriority,
  setRequiredTime,
  setStatus,
  status,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const deadlineDate = useMemo(() => {
    if (!deadline) {
      return null;
    }

    const parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }, [deadline]);

  const getDeadlineBase = () => deadlineDate || new Date();

  const deadlineDateValue = deadlineDate
    ? `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')}`
    : '';

  const deadlineTimeValue = deadlineDate
    ? `${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`
    : '';

  const updateDeadlineDate = (_, selectedDate) => {
    if (Platform.OS !== 'web') {
      setShowDatePicker(false);
    }

    if (!selectedDate) {
      return;
    }

    const nextDeadline = getDeadlineBase();
    nextDeadline.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    setDeadline(nextDeadline.toISOString());
  };

  const updateDeadlineTime = (_, selectedTime) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(false);
    }

    if (!selectedTime) {
      return;
    }

    const nextDeadline = getDeadlineBase();
    nextDeadline.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

    setDeadline(nextDeadline.toISOString());
  };

  const updateDeadlineDateWeb = (value) => {
    if (!value) {
      return;
    }

    const nextDeadline = getDeadlineBase();
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
      return;
    }

    nextDeadline.setFullYear(year, month - 1, day);
    setDeadline(nextDeadline.toISOString());
  };

  const updateDeadlineTimeWeb = (value) => {
    if (!value) {
      return;
    }

    const nextDeadline = getDeadlineBase();
    const [hours, minutes] = value.split(':').map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return;
    }

    nextDeadline.setHours(hours, minutes, 0, 0);
    setDeadline(nextDeadline.toISOString());
  };

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
      <View style={styles.pickerCard}>
        <Text style={styles.label}>Deadline</Text>
        <Text style={styles.helperText}>
          Pick a calendar date and a clock time. Current selection: {formatDateTimeLabel(deadline)}
        </Text>
        {Platform.OS === 'web' ? (
          <View style={styles.deadlineWebRow}>
            <TextInput
              style={[styles.input, styles.deadlineField]}
              value={deadlineDateValue}
              onChangeText={updateDeadlineDateWeb}
              placeholder="Select date"
              placeholderTextColor="#6b7280"
              {...(Platform.OS === 'web' ? { type: 'date' } : {})}
            />
            <TextInput
              style={[styles.input, styles.deadlineField]}
              value={deadlineTimeValue}
              onChangeText={updateDeadlineTimeWeb}
              placeholder="Select time"
              placeholderTextColor="#6b7280"
              {...(Platform.OS === 'web' ? { type: 'time' } : {})}
            />
          </View>
        ) : (
          <View style={styles.deadlineButtonRow}>
            <Pressable style={styles.secondaryBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.secondaryBtnText}>Pick Date</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.secondaryBtnText}>Pick Time</Text>
            </Pressable>
          </View>
        )}
        {showDatePicker ? (
          <DateTimePicker
            value={deadlineDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={updateDeadlineDate}
          />
        ) : null}
        {showTimePicker ? (
          <DateTimePicker
            value={deadlineDate || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={updateDeadlineTime}
          />
        ) : null}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Required Time (e.g. 6h)"
        placeholderTextColor="#6b7280"
        value={requiredTime}
        onChangeText={setRequiredTime}
      />
      <Text style={styles.label}>Members</Text>
      <View style={styles.memberRow}>
        <TextInput
          style={[styles.input, styles.memberInput]}
          placeholder="Enter member name"
          placeholderTextColor="#6b7280"
          value={memberName}
          onChangeText={setMemberName}
          returnKeyType="done"
          onSubmitEditing={addMember}
        />
        <Pressable style={styles.addMemberBtn} onPress={addMember}>
          <Text style={styles.addMemberBtnText}>Add</Text>
        </Pressable>
      </View>
      <View style={styles.memberChipWrap}>
        {members.length > 0 ? (
          members.map((member) => (
            <Pressable
              key={member}
              style={styles.memberChip}
              onPress={() => removeMember(member)}
            >
              <Text style={styles.memberChipText}>{member} ×</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.helperText}>Add members one by one.</Text>
        )}
      </View>
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
  pickerCard: {
    backgroundColor: '#111827',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  label: {
    color: '#e5e7eb',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  helperText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 10,
  },
  deadlineButtonRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  deadlineWebRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  deadlineField: {
    flex: 1,
    minWidth: 140,
    marginBottom: 0,
  },
  secondaryBtn: {
    backgroundColor: '#0f172a',
    borderColor: '#38bdf8',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secondaryBtnText: {
    color: '#bae6fd',
    fontWeight: '700',
    fontSize: 13,
  },
  memberRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  memberInput: {
    flex: 1,
    marginBottom: 0,
  },
  addMemberBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  addMemberBtnText: {
    color: '#052e16',
    fontWeight: '800',
  },
  memberChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  memberChip: {
    backgroundColor: '#1f2937',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  memberChipText: {
    color: '#e2e8f0',
    fontSize: 12,
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