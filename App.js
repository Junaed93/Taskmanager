import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

const STATUS = {
  TODO: 'To Do',
  ONGOING: 'On Going',
  COMPLETED: 'Completed',
};

const PRIORITIES = ['High', 'Medium', 'Low'];

function getDeadlineColor(task) {
  if (task.status === STATUS.COMPLETED) {
    return 'rgb(40,180,85)';
  }

  const deadlineMs = new Date(task.deadline).getTime();
  const startMs = new Date(task.startDateIso).getTime();
  const nowMs = Date.now();

  if (!Number.isFinite(deadlineMs) || deadlineMs <= startMs) {
    return 'rgb(220,95,80)';
  }

  const totalWindow = deadlineMs - startMs;
  const elapsed = Math.max(0, nowMs - startMs);
  const fraction = Math.min(1, elapsed / totalWindow);

  const red = Math.round(255 * fraction);
  const green = Math.round(255 - 255 * fraction);

  return `rgb(${red},${green},95)`;
}

function TaskCard({ task }) {
  return (
    <View style={[styles.card, { borderLeftColor: getDeadlineColor(task) }]}>
      <Text style={styles.cardTitle}>{task.name || 'Untitled Task'}</Text>
      <Text style={styles.cardLine}>Owner: {task.owner || '-'}</Text>
      <Text style={styles.cardLine}>Start Date: {task.startDateLabel}</Text>
      <Text style={styles.cardLine}>Deadline: {task.deadline || '-'}</Text>
      <Text style={styles.cardLine}>Priority: {task.priority}</Text>
      <Text style={styles.cardLine}>Required Time: {task.requiredTime || '-'}</Text>
      <Text style={styles.cardLine}>Members: {task.members || '-'}</Text>
      <Text style={styles.cardLine}>Description: {task.description || '-'}</Text>
      <Text style={styles.cardLine}>Status: {task.status}</Text>
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [requiredTime, setRequiredTime] = useState('');
  const [members, setMembers] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(STATUS.TODO);
  const [tasks, setTasks] = useState([]);

  const taskGroups = useMemo(
    () => ({
      [STATUS.TODO]: tasks.filter((task) => task.status === STATUS.TODO),
      [STATUS.ONGOING]: tasks.filter((task) => task.status === STATUS.ONGOING),
      [STATUS.COMPLETED]: tasks.filter((task) => task.status === STATUS.COMPLETED),
    }),
    [tasks]
  );

  const addTask = () => {
    if (!name.trim() || !owner.trim() || !deadline.trim()) {
      return;
    }

    const now = new Date();
    const task = {
      id: `${now.getTime()}`,
      name: name.trim(),
      owner: owner.trim(),
      startDateIso: now.toISOString(),
      startDateLabel: now.toLocaleString(),
      deadline: deadline.trim(),
      priority,
      requiredTime: requiredTime.trim(),
      members: members.trim(),
      description: description.trim(),
      status,
    };

    setTasks((prev) => [task, ...prev]);

    setName('');
    setOwner('');
    setDeadline('');
    setPriority('Medium');
    setRequiredTime('');
    setMembers('');
    setDescription('');
    setStatus(STATUS.TODO);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={[styles.content, isWide && styles.contentWide]}>
          <View style={[styles.formCard, isWide && styles.formCardWide]}>
            <Text style={styles.heading}>Task Manager</Text>
            <Text style={styles.subheading}>Create a task and view it by status</Text>

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
                  <Text
                    style={[
                      styles.optionBtnText,
                      priority === item && styles.optionBtnTextActive,
                    ]}
                  >
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
                  <Text
                    style={[
                      styles.optionBtnText,
                      status === item && styles.optionBtnTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.createBtn} onPress={addTask}>
              <Text style={styles.createBtnText}>Create Task</Text>
            </Pressable>
          </View>

          <View style={[styles.board, isWide && styles.boardWide]}>
            {Object.values(STATUS).map((group) => (
              <View key={group} style={[styles.column, isWide && styles.columnWide]}>
                <Text style={styles.columnTitle}>{group}</Text>
                {taskGroups[group].length === 0 ? (
                  <Text style={styles.emptyText}>No tasks yet</Text>
                ) : (
                  taskGroups[group].map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  screen: {
    padding: 14,
    paddingBottom: 26,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 1200,
  },
  contentWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  heading: {
    color: '#f9fafb',
    fontSize: 28,
    fontWeight: '700',
  },
  subheading: {
    color: '#cbd5e1',
    marginTop: 4,
    marginBottom: 14,
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  formCardWide: {
    width: 380,
    marginBottom: 0,
  },
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
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 6,
    marginBottom: 10,
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
});
