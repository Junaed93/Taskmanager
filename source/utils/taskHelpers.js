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