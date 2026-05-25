import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
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
const TASKS_KEY = 'taskmanager.tasks.v1';
const LOGS_KEY = 'taskmanager.logs.v1';

function buildLog(owner, action, taskName, timeLabel) {
  const safeOwner = owner?.trim() || 'Unknown';
  const safeTask = taskName?.trim() || 'Untitled Task';

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    owner: safeOwner,
    action,
    taskName: safeTask,
    time: timeLabel,
    message: `[${safeOwner}] ${action} [${safeTask}] at [${timeLabel}]`,
  };
}

function getNextStatus(currentStatus) {
  if (currentStatus === STATUS.TODO) {
    return STATUS.ONGOING;
  }

  if (currentStatus === STATUS.ONGOING) {
    return STATUS.COMPLETED;
  }

  return STATUS.TODO;
}

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

function TaskCard({ task, onAdvance, onDelete }) {
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
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('board');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const [savedTasksRaw, savedLogsRaw] = await Promise.all([
          AsyncStorage.getItem(TASKS_KEY),
          AsyncStorage.getItem(LOGS_KEY),
        ]);

        if (savedTasksRaw) {
          const savedTasks = JSON.parse(savedTasksRaw);
          if (Array.isArray(savedTasks)) {
            setTasks(savedTasks);
          }
        }

        if (savedLogsRaw) {
          const savedLogs = JSON.parse(savedLogsRaw);
          if (Array.isArray(savedLogs)) {
            setLogs(savedLogs);
          }
        }
      } catch (error) {
        console.log('Failed to load local data:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadLocalData();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks)).catch((error) => {
      console.log('Failed to save tasks:', error);
    });
  }, [tasks, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs)).catch((error) => {
      console.log('Failed to save logs:', error);
    });
  }, [logs, isReady]);

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

    const nowLabel = now.toLocaleString();
    const newLog = buildLog(task.owner, 'added', task.name, nowLabel);

    setTasks((prev) => [task, ...prev]);
    setLogs((prev) => [newLog, ...prev]);

    setName('');
    setOwner('');
    setDeadline('');
    setPriority('Medium');
    setRequiredTime('');
    setMembers('');
    setDescription('');
    setStatus(STATUS.TODO);
  };

  const updateTaskStatus = (taskId) => {
    const nowLabel = new Date().toLocaleString();

    setTasks((prevTasks) => {
      const existingTask = prevTasks.find((task) => task.id === taskId);
      if (!existingTask) {
        return prevTasks;
      }

      const updatedTask = {
        ...existingTask,
        status: getNextStatus(existingTask.status),
      };

      setLogs((prevLogs) => [
        buildLog(existingTask.owner, 'updated', existingTask.name, nowLabel),
        ...prevLogs,
      ]);

      return prevTasks.map((task) => (task.id === taskId ? updatedTask : task));
    });
  };

  const deleteTask = (taskId) => {
    const nowLabel = new Date().toLocaleString();

    setTasks((prevTasks) => {
      const existingTask = prevTasks.find((task) => task.id === taskId);
      if (!existingTask) {
        return prevTasks;
      }

      setLogs((prevLogs) => [
        buildLog(existingTask.owner, 'deleted', existingTask.name, nowLabel),
        ...prevLogs,
      ]);

      return prevTasks.filter((task) => task.id !== taskId);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={[styles.content, isWide && styles.contentWide]}>
          <View style={[styles.formCard, isWide && styles.formCardWide]}>
            <Text style={styles.heading}>Task Manager</Text>
            <Text style={styles.subheading}>Create a task and view it by status</Text>

            <View style={styles.tabsRow}>
              <Pressable
                style={[styles.tabBtn, activeTab === 'board' && styles.tabBtnActive]}
                onPress={() => setActiveTab('board')}
              >
                <Text style={[styles.tabText, activeTab === 'board' && styles.tabTextActive]}>
                  Board
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tabBtn, activeTab === 'logs' && styles.tabBtnActive]}
                onPress={() => setActiveTab('logs')}
              >
                <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
                  Activity Log
                </Text>
              </Pressable>
            </View>

            {activeTab === 'board' ? (
              <>
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
              </>
            ) : (
              <View style={styles.logsCard}>
                {logs.length === 0 ? (
                  <Text style={styles.emptyText}>No activity yet</Text>
                ) : (
                  logs.map((log) => (
                    <View key={log.id} style={styles.logRow}>
                      <Text style={styles.logText}>{log.message}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>

          {activeTab === 'board' ? (
            <View style={[styles.board, isWide && styles.boardWide]}>
              {Object.values(STATUS).map((group) => (
                <View key={group} style={[styles.column, isWide && styles.columnWide]}>
                  <Text style={styles.columnTitle}>{group}</Text>
                  {taskGroups[group].length === 0 ? (
                    <Text style={styles.emptyText}>No tasks yet</Text>
                  ) : (
                    taskGroups[group].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onAdvance={updateTaskStatus}
                        onDelete={deleteTask}
                      />
                    ))
                  )}
                </View>
              ))}
            </View>
          ) : null}
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
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6b7280',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderColor: '#60a5fa',
    backgroundColor: '#1e3a8a',
  },
  tabText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#dbeafe',
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
  logsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    maxHeight: 420,
  },
  logRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 8,
  },
  logText: {
    color: '#e2e8f0',
    fontSize: 13,
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
});
