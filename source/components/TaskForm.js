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
  removeMember,
  setDeadline,
  setDescription,
  setMemberName,
  setName,
  setOwner,
  setPriority,
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

  const toLocalDateTimeInputValue = (date) => {
    if (!date || Number.isNaN(date.getTime())) {
      return '';
    }

    const offsetMs = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offsetMs);

    return localDate.toISOString().slice(0, 16);
  };

  const fromDateTimeInputValue = (value) => {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

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

  const updateDeadlineWeb = (event) => {
    const value = typeof event === 'string' ? event : event?.target?.value || '';

    if (!value) {
      setDeadline('');
      return;
    }

    const parsed = fromDateTimeInputValue(value);

    if (!parsed) {
      return;
    }

    setDeadline(parsed.toISOString());
  };

  return (
    <View>
      <View style={styles.formHeaderRow}>
        <Text style={styles.formHeaderTitle}>Create Task</Text>
        <Text style={styles.helperText}>Fill the form, then create the task.</Text>
      </View>
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
      <View style={styles.startDatePreview}>
        <Text style={styles.startDateLabel}>Start Date</Text>
        <Text style={styles.startDateValue}>{formatDateTimeLabel(new Date().toISOString())}</Text>
        <Text style={styles.helperText}>This will be captured automatically when you create the task.</Text>
      </View>
      <View style={styles.pickerCard}>
        <Text style={styles.label}>Deadline</Text>
        <Text style={styles.helperText}>
          Pick a calendar date and a clock time. Current selection: {formatDateTimeLabel(deadline)}
        </Text>
        {Platform.OS === 'web' ? (
          <View style={styles.deadlineWebRow}>
            <input
              type="datetime-local"
              value={toLocalDateTimeInputValue(deadlineDate)}
              onChange={updateDeadlineWeb}
              style={styles.webDateTimeInput}
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
  startDatePreview: {
    backgroundColor: '#111827',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  startDateLabel: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  startDateValue: {
    color: '#dbeafe',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
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
  formHeaderRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    marginBottom: 12,
  },
  formHeaderTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
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
  webDateTimeInput: {
    width: '100%',
    minWidth: 0,
    backgroundColor: '#374151',
    color: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#6b7280',
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
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
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 108,
  },
  createBtnText: {
    color: '#082f49',
    fontWeight: '800',
    fontSize: 14,
  },
});