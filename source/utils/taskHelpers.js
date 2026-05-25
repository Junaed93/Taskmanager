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

export function getDeadlineColor(task, nowMs = Date.now()) {
  return getDeadlineColorInfo(task, nowMs).color;
}

export function getDeadlineColorInfo(task, nowMs = Date.now()) {
  if (task.status === STATUS.COMPLETED) {
    return {
      color: 'rgb(40,180,85)',
      label: 'Completed = Green',
      progress: 1,
      progressPercent: 100,
      remainingMs: 0,
      completed: true,
    };
  }

  const deadlineMs = new Date(task.deadline).getTime();
  const startMs = new Date(task.startDateIso).getTime();
  if (!Number.isFinite(deadlineMs) || deadlineMs <= startMs) {
    return {
      color: 'rgb(255,0,0)',
      label: 'Deadline passed = Red',
      progress: 1,
      progressPercent: 100,
      remainingMs: 0,
      completed: false,
    };
  }

  const totalWindow = deadlineMs - startMs;
  const elapsed = Math.max(0, nowMs - startMs);
  const fraction = Math.min(1, elapsed / totalWindow);
  const remainingMs = Math.max(0, deadlineMs - nowMs);
  const progressPercent = Math.round(fraction * 100);
  const remainingPercent = Math.max(0, 100 - progressPercent);

  const red = Math.round((255 / totalWindow) * elapsed);
  const green = Math.round(255 - (255 / totalWindow) * elapsed);

  return {
    color: `rgb(${red},${green},0)`,
    label: `Green → Red (${remainingPercent}% left)`,
    progress: fraction,
    progressPercent,
    remainingMs,
    completed: false,
  };
}

export function formatDurationLabel(durationMs) {
  const safeDuration = Math.max(0, durationMs);
  const totalSeconds = Math.floor(safeDuration / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
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

function normalizeCommentEntry(entry) {
  if (!entry) {
    return null;
  }

  if (typeof entry === 'string') {
    const text = entry.trim();

    if (!text) {
      return null;
    }

    const createdAt = new Date();

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: 'You',
      text,
      createdAtIso: createdAt.toISOString(),
      createdAtLabel: formatDateTimeLabel(createdAt.toISOString()),
    };
  }

  if (typeof entry !== 'object') {
    return null;
  }

  const text = `${entry.text ?? ''}`.trim();
  if (!text) {
    return null;
  }

  const createdAtIso = entry.createdAtIso || new Date().toISOString();

  return {
    id: entry.id ? String(entry.id) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: `${entry.author ?? 'You'}`.trim() || 'You',
    text,
    createdAtIso,
    createdAtLabel: entry.createdAtLabel || formatDateTimeLabel(createdAtIso),
  };
}

export function normalizeComments(value) {
  let rawValue = value;

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();

    if (!trimmed) {
      return [];
    }

    try {
      rawValue = JSON.parse(trimmed);
    } catch (error) {
      return [];
    }
  }

  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue.map(normalizeCommentEntry).filter(Boolean);
}

export function serializeComments(value) {
  return JSON.stringify(normalizeComments(value));
}