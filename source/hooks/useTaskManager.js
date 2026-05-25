import { useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { STATUS } from '../constants/taskManager';
import { buildLog, getNextStatus } from '../utils/taskHelpers';
import {
  deleteTask as deleteTaskRecord,
  insertLog,
  insertTask,
  loadLocalData,
  updateTaskStatus as updateTaskStatusRecord,
} from '../storage/taskStorage';

export function useTaskManager() {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [requiredTime, setRequiredTime] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(STATUS.TODO);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('board');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadLocalData();
        setTasks(data.tasks);
        setLogs(data.logs);
      } catch (error) {
        console.log('Failed to load local data:', error);
      } finally {
        setIsReady(true);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const { status, ios } = await Notifications.getPermissionsAsync();
        const isGranted = status === 'granted' || ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

        if (!isGranted) {
          await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowProvisional: true,
            },
          });
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
      } catch (error) {
        console.log('Failed to initialize notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    if (!isReady || tasks.length === 0) {
      return;
    }

    const syncNotifications = async () => {
      for (const task of tasks) {
        if (task.status === STATUS.COMPLETED || !task.deadline) {
          continue;
        }

        const deadlineDate = new Date(task.deadline);
        if (Number.isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) {
          continue;
        }

        await scheduleNotificationForTask(task);
      }
    };

    syncNotifications();
  }, [isReady, tasks]);

  const taskGroups = useMemo(
    () => ({
      [STATUS.TODO]: tasks.filter((task) => task.status === STATUS.TODO),
      [STATUS.ONGOING]: tasks.filter((task) => task.status === STATUS.ONGOING),
      [STATUS.COMPLETED]: tasks.filter((task) => task.status === STATUS.COMPLETED),
    }),
    [tasks]
  );

  const resetForm = () => {
    setName('');
    setOwner('');
    setDeadline('');
    setPriority('Medium');
    setRequiredTime('');
    setMemberName('');
    setMembers([]);
    setDescription('');
    setStatus(STATUS.TODO);
  };

  const addMember = () => {
    const nextMember = memberName.trim();

    if (!nextMember) {
      return;
    }

    setMembers((currentMembers) => {
      if (currentMembers.includes(nextMember)) {
        return currentMembers;
      }

      return [...currentMembers, nextMember];
    });
    setMemberName('');
  };

  const removeMember = (memberToRemove) => {
    setMembers((currentMembers) => currentMembers.filter((member) => member !== memberToRemove));
  };

  const addTask = async () => {
    if (!isReady) {
      return;
    }

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
      members,
      description: description.trim(),
      status,
    };

    const newLog = buildLog(task.owner, 'added', task.name, now.toLocaleString());

    try {
      await insertTask(task);
      // schedule notification for deadline
      try {
        await scheduleNotificationForTask(task);
      } catch (e) {
        console.log('Failed to schedule notification:', e);
      }
      await insertLog(newLog);
      setTasks((prev) => [task, ...prev]);
      setLogs((prev) => [newLog, ...prev]);
      resetForm();
    } catch (error) {
      console.log('Failed to add task:', error);
    }
  };

  // Notification helpers use AsyncStorage to persist mapping taskId -> notificationId
  const NOTIF_KEY = 'taskmanager.notifications.v1';

  const loadNotifMap = async () => {
    try {
      const raw = await AsyncStorage.getItem(NOTIF_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  const saveNotifMap = async (map) => {
    try {
      await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(map));
    } catch (e) {
      // ignore
    }
  };

  const scheduleNotificationForTask = async (task) => {
    if (!task || !task.deadline) return null;

    const when = new Date(task.deadline);
    if (Number.isNaN(when.getTime())) return null;

    // don't schedule past notifications
    if (when.getTime() <= Date.now()) return null;

    const content = {
      title: `Task due: ${task.name}`,
      body: `"${task.name}" is due now.`,
      data: { taskId: task.id },
    };

    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const existing = scheduled.find((request) => request?.content?.data?.taskId === task.id);
      if (existing) {
        return existing.identifier;
      }

      const trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      };
      const notifId = await Notifications.scheduleNotificationAsync({ content, trigger });
      const map = await loadNotifMap();
      map[task.id] = notifId;
      await saveNotifMap(map);
      return notifId;
    } catch (e) {
      console.log('scheduleNotificationForTask error', e);
      return null;
    }
  };

  const sendStatusChangeNotification = async (task, nextStatus) => {
    if (!task) {
      return null;
    }

    const content = {
      title: `${task.name} updated`,
      body: `${task.name} moved to ${nextStatus}.`,
      data: { taskId: task.id, status: nextStatus },
    };

    try {
      return await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });
    } catch (error) {
      console.log('sendStatusChangeNotification error', error);
      return null;
    }
  };

  const cancelNotificationForTask = async (taskId) => {
    try {
      const map = await loadNotifMap();
      const notifId = map[taskId];
      if (notifId) {
        await Notifications.cancelScheduledNotificationAsync(notifId);
        delete map[taskId];
        await saveNotifMap(map);
      }
    } catch (e) {
      // ignore
    }
  };

  const updateTaskStatus = async (taskId, nextStatus) => {
    if (!isReady) {
      return;
    }

    const nowLabel = new Date().toLocaleString();

    try {
      const existingTask = tasks.find((task) => task.id === taskId);
      if (!existingTask) {
        return;
      }

      const resolvedStatus = nextStatus || getNextStatus(existingTask.status);

      if (existingTask.status === resolvedStatus) {
        return;
      }

      const updatedTask = {
        ...existingTask,
        status: resolvedStatus,
      };

      const newLog = buildLog(existingTask.owner, 'updated', existingTask.name, nowLabel);

      await updateTaskStatusRecord(taskId, updatedTask.status);
      await insertLog(newLog);
      await sendStatusChangeNotification(updatedTask, updatedTask.status);

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setLogs((prevLogs) => [newLog, ...prevLogs]);

      // if task was completed, cancel any scheduled notification
      if (updatedTask.status === STATUS.COMPLETED) {
        try {
          await cancelNotificationForTask(taskId);
        } catch (e) {
          // ignore
        }
      }
    } catch (error) {
      console.log('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!isReady) {
      return;
    }

    const nowLabel = new Date().toLocaleString();

    try {
      const existingTask = tasks.find((task) => task.id === taskId);
      if (!existingTask) {
        return;
      }

      const newLog = buildLog(existingTask.owner, 'deleted', existingTask.name, nowLabel);

      // cancel any scheduled notification for this task
      try {
        await cancelNotificationForTask(taskId);
      } catch (e) {
        // ignore
      }

      await deleteTaskRecord(taskId);
      await insertLog(newLog);

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setLogs((prevLogs) => [newLog, ...prevLogs]);
    } catch (error) {
      console.log('Failed to delete task:', error);
    }
  };

  return {
    activeTab,
    addTask,
    addMember,
    deadline,
    deleteTask,
    description,
    isReady,
    logs,
    members,
    memberName,
    name,
    owner,
    priority,
    requiredTime,
    removeMember,
    setActiveTab,
    setDeadline,
    setDescription,
    setMembers,
    setMemberName,
    setName,
    setOwner,
    setPriority,
    setRequiredTime,
    setStatus,
    status,
    taskGroups,
    tasks,
    updateTaskStatus,
  };
}