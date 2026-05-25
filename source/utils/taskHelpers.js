import { STATUS } from '../constants/taskManager';

export function buildLog(owner, action, taskName, timeLabel) {
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

export function getNextStatus(currentStatus) {
  if (currentStatus === STATUS.TODO) {
    return STATUS.ONGOING;
  }

  if (currentStatus === STATUS.ONGOING) {
    return STATUS.COMPLETED;
  }

  return STATUS.TODO;
}

export function getDeadlineColor(task) {
  return getDeadlineColorInfo(task).color;
}

export function getDeadlineColorInfo(task) {
  if (task.status === STATUS.COMPLETED) {
    return {
      color: 'rgb(40,180,85)',
      label: 'Completed = Green',
      progress: 1,
      completed: true,
    };
  }

  const deadlineMs = new Date(task.deadline).getTime();
  const startMs = new Date(task.startDateIso).getTime();
  const nowMs = Date.now();

  if (!Number.isFinite(deadlineMs) || deadlineMs <= startMs) {
    return {
      color: 'rgb(255,0,0)',
      label: 'Deadline passed = Red',
      progress: 1,
      completed: false,
    };
  }

  const totalWindow = deadlineMs - startMs;
  const elapsed = Math.max(0, nowMs - startMs);
  const fraction = Math.min(1, elapsed / totalWindow);

  const red = Math.round(255 * fraction);
  const green = Math.round(255 - 255 * fraction);
  const remainingPercent = Math.round((1 - fraction) * 100);

  return {
    color: `rgb(${red},${green},95)`,
    label: `Green → Red (${remainingPercent}% left)`,
    progress: fraction,
    completed: false,
  };
}

export function formatDateTimeLabel(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

export function normalizeMembers(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((member) => member.trim())
    .filter(Boolean);
}

export function serializeMembers(value) {
  return normalizeMembers(value).join(', ');
}

export function formatMembersLabel(value) {
  const members = normalizeMembers(value);

  return members.length > 0 ? members.join(', ') : '-';
}