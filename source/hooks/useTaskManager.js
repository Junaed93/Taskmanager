import { useEffect, useMemo, useState } from 'react';

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
      await insertLog(newLog);
      setTasks((prev) => [task, ...prev]);
      setLogs((prev) => [newLog, ...prev]);
      resetForm();
    } catch (error) {
      console.log('Failed to add task:', error);
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

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setLogs((prevLogs) => [newLog, ...prevLogs]);
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