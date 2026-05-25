import { useEffect, useMemo, useState } from 'react';

import { STATUS } from '../constants/taskManager';
import { buildLog, getNextStatus } from '../utils/taskHelpers';
import { loadLocalData, saveLogs, saveTasks } from '../storage/taskStorage';

export function useTaskManager() {
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
    if (!isReady) {
      return;
    }

    saveTasks(tasks).catch((error) => {
      console.log('Failed to save tasks:', error);
    });
  }, [tasks, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveLogs(logs).catch((error) => {
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

  const resetForm = () => {
    setName('');
    setOwner('');
    setDeadline('');
    setPriority('Medium');
    setRequiredTime('');
    setMembers('');
    setDescription('');
    setStatus(STATUS.TODO);
  };

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
    setLogs((prev) => [buildLog(task.owner, 'added', task.name, now.toLocaleString()), ...prev]);
    resetForm();
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

  return {
    activeTab,
    addTask,
    deadline,
    deleteTask,
    description,
    isReady,
    logs,
    members,
    name,
    owner,
    priority,
    requiredTime,
    setActiveTab,
    setDeadline,
    setDescription,
    setMembers,
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