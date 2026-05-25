import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

import { STORAGE_KEYS } from '../constants/taskManager';
import { normalizeMembers, serializeMembers } from '../utils/taskHelpers';

const DATABASE_NAME = 'taskmanager.db';

let databasePromise;

function mapTaskRow(row) {
  return {
    id: row.id,
    name: row.name,
    owner: row.owner,
    startDateIso: row.startDateIso,
    startDateLabel: row.startDateLabel,
    deadline: row.deadline,
    priority: row.priority,
    requiredTime: row.requiredTime,
    members: normalizeMembers(row.members),
    description: row.description,
    status: row.status,
  };
}

function mapLogRow(row) {
  return {
    id: row.id,
    owner: row.owner,
    action: row.action,
    taskName: row.taskName,
    time: row.time,
    message: row.message,
  };
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          owner TEXT NOT NULL,
          startDateIso TEXT NOT NULL,
          startDateLabel TEXT NOT NULL,
          deadline TEXT NOT NULL,
          priority TEXT NOT NULL,
          requiredTime TEXT,
          members TEXT,
          description TEXT,
          status TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY NOT NULL,
          owner TEXT NOT NULL,
          action TEXT NOT NULL,
          taskName TEXT NOT NULL,
          time TEXT NOT NULL,
          message TEXT NOT NULL
        );
      `);

      return db;
    });
  }

  return databasePromise;
}

async function migrateLegacyStorageIfNeeded(db) {
  const taskCountRow = await db.getFirstAsync('SELECT COUNT(*) AS count FROM tasks');
  const logCountRow = await db.getFirstAsync('SELECT COUNT(*) AS count FROM logs');

  const taskCount = Number(taskCountRow?.count || 0);
  const logCount = Number(logCountRow?.count || 0);

  if (taskCount > 0 || logCount > 0) {
    return;
  }

  const [savedTasksRaw, savedLogsRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.TASKS),
    AsyncStorage.getItem(STORAGE_KEYS.LOGS),
  ]);

  const savedTasks = savedTasksRaw ? JSON.parse(savedTasksRaw) : [];
  const savedLogs = savedLogsRaw ? JSON.parse(savedLogsRaw) : [];

  if (Array.isArray(savedTasks) && savedTasks.length > 0) {
    for (const task of savedTasks) {
      await db.runAsync(
        `
          INSERT OR REPLACE INTO tasks (
            id, name, owner, startDateIso, startDateLabel, deadline, priority, requiredTime, members, description, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        task.id,
        task.name,
        task.owner,
        task.startDateIso,
        task.startDateLabel,
        task.deadline,
        task.priority,
        task.requiredTime,
        serializeMembers(task.members),
        task.description,
        task.status
      );
    }
  }

  if (Array.isArray(savedLogs) && savedLogs.length > 0) {
    for (const log of savedLogs) {
      await db.runAsync(
        `
          INSERT OR REPLACE INTO logs (
            id, owner, action, taskName, time, message
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        log.id,
        log.owner,
        log.action,
        log.taskName,
        log.time,
        log.message
      );
    }
  }

  if ((savedTasksRaw && Array.isArray(savedTasks) && savedTasks.length > 0) || (savedLogsRaw && Array.isArray(savedLogs) && savedLogs.length > 0)) {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TASKS),
      AsyncStorage.removeItem(STORAGE_KEYS.LOGS),
    ]);
  }
}

export async function loadLocalData() {
  const db = await getDatabase();
  await migrateLegacyStorageIfNeeded(db);

  const tasks = await db.getAllAsync('SELECT * FROM tasks ORDER BY rowid DESC');
  const logs = await db.getAllAsync('SELECT * FROM logs ORDER BY rowid DESC');

  return {
    tasks: tasks.map(mapTaskRow),
    logs: logs.map(mapLogRow),
  };
}

export async function insertTask(task) {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT OR REPLACE INTO tasks (
        id, name, owner, startDateIso, startDateLabel, deadline, priority, requiredTime, members, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    task.id,
    task.name,
    task.owner,
    task.startDateIso,
    task.startDateLabel,
    task.deadline,
    task.priority,
    task.requiredTime,
    serializeMembers(task.members),
    task.description,
    task.status
  );
}

export async function updateTaskStatus(taskId, status) {
  const db = await getDatabase();
  await db.runAsync('UPDATE tasks SET status = ? WHERE id = ?', status, taskId);
}

export async function deleteTask(taskId) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', taskId);
}

export async function insertLog(log) {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT OR REPLACE INTO logs (
        id, owner, action, taskName, time, message
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    log.id,
    log.owner,
    log.action,
    log.taskName,
    log.time,
    log.message
  );
}