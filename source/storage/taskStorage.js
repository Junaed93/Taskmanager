import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/taskManager';

export async function loadLocalData() {
  const [savedTasksRaw, savedLogsRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.TASKS),
    AsyncStorage.getItem(STORAGE_KEYS.LOGS),
  ]);

  const tasks = savedTasksRaw ? JSON.parse(savedTasksRaw) : [];
  const logs = savedLogsRaw ? JSON.parse(savedLogsRaw) : [];

  return {
    tasks: Array.isArray(tasks) ? tasks : [],
    logs: Array.isArray(logs) ? logs : [],
  };
}

export async function saveTasks(tasks) {
  await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export async function saveLogs(logs) {
  await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}