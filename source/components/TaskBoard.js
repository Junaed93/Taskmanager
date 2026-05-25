import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { STATUS } from '../constants/taskManager';
import { TaskCard } from './TaskCard';

function pointInBounds(x, y, bounds) {
  if (!bounds) {
    return false;
  }

  return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
}

function getBoundsCenter(bounds) {
  if (!bounds) {
    return null;
  }

  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

function getSquaredDistance(point, bounds) {
  const center = getBoundsCenter(bounds);

  if (!center) {
    return Number.POSITIVE_INFINITY;
  }

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return dx * dx + dy * dy;
}

export function TaskBoard({
  isWide,
  currentTime,
  taskGroups,
  onAdvance,
  onDelete,
  onAddComment,
  onDragStateChange,
}) {
  const boardRef = useRef(null);
  const deleteZoneRef = useRef(null);
  const columnRefs = useRef({});
  const activeTargetRef = useRef(null);
  const lastValidTargetRef = useRef(null);
  const [columnBounds, setColumnBounds] = useState({});
  const [deleteBounds, setDeleteBounds] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);

  const statusList = useMemo(() => Object.values(STATUS), []);

  const measureZone = useCallback((ref, setBounds) => {
    if (!ref?.measureInWindow) {
      return;
    }

    ref.measureInWindow((x, y, width, height) => {
      setBounds({ x, y, width, height });
    });
  }, []);

  const refreshMeasurements = useCallback(() => {
    measureZone(deleteZoneRef.current, setDeleteBounds);

    statusList.forEach((group) => {
      measureZone(columnRefs.current[group], (nextBounds) => {
        setColumnBounds((currentBounds) => ({
          ...currentBounds,
          [group]: nextBounds,
        }));
      });
    });
  }, [measureZone, statusList]);

  const resolveDropTarget = useCallback(
    (pageX, pageY) => {
      const point = { x: pageX, y: pageY };

      // Prefer column hits first (avoid accidental deletes when zones overlap)
      if (pointInBounds(pageX, pageY, columnBounds[STATUS.ONGOING])) {
        return { type: 'status', status: STATUS.ONGOING };
      }

      if (pointInBounds(pageX, pageY, columnBounds[STATUS.COMPLETED])) {
        return { type: 'status', status: STATUS.COMPLETED };
      }

      if (pointInBounds(pageX, pageY, columnBounds[STATUS.TODO])) {
        return { type: 'status', status: STATUS.TODO };
      }

      if (pointInBounds(pageX, pageY, deleteBounds)) {
        return { type: 'delete' };
      }

      if (Platform.OS !== 'web') {
        const candidates = [
          { type: 'delete' },
          { type: 'status', status: STATUS.ONGOING },
          { type: 'status', status: STATUS.COMPLETED },
          { type: 'status', status: STATUS.TODO },
        ];

        const candidateBounds = {
          delete: deleteBounds,
          [STATUS.ONGOING]: columnBounds[STATUS.ONGOING],
          [STATUS.COMPLETED]: columnBounds[STATUS.COMPLETED],
          [STATUS.TODO]: columnBounds[STATUS.TODO],
        };

        const scored = candidates
          .map((candidate) => {
            const bounds = candidate.type === 'delete' ? candidateBounds.delete : candidateBounds[candidate.status];

            return {
              candidate,
              distance: getSquaredDistance(point, bounds),
            };
          })
          .sort((left, right) => left.distance - right.distance);

        const closest = scored[0];
        if (closest && Number.isFinite(closest.distance)) {
          const maxSnapDistance = 180 * 180;

          if (closest.distance <= maxSnapDistance) {
            return closest.candidate;
          }
        }
      }

      return null;
    },
    [columnBounds, deleteBounds]
  );

  useEffect(() => {
    refreshMeasurements();
  }, [isWide, taskGroups, refreshMeasurements]);

  const handleDragMove = useCallback(
    (taskId, pageX, pageY) => {
      const target = resolveDropTarget(pageX, pageY);
      const nextTarget = target ? { taskId, ...target } : null;
      activeTargetRef.current = nextTarget;
      if (nextTarget) {
        lastValidTargetRef.current = nextTarget;
      }
      setActiveTarget(nextTarget);
    },
    [resolveDropTarget]
  );

  const handleDragEnd = useCallback(
    (taskId, pageX, pageY) => {
      const target = activeTargetRef.current || lastValidTargetRef.current || resolveDropTarget(pageX, pageY);
      
      activeTargetRef.current = null;
      lastValidTargetRef.current = null;
      setActiveTarget(null);

      if (!target) {
        return;
      }

      if (target.type === 'delete') {
        onDelete(taskId);
        return;
      }

      onAdvance(taskId, target.status);
    },
    [onAdvance, onDelete, resolveDropTarget]
  );

  const registerColumnRef = useCallback(
    (group) => (node) => {
      columnRefs.current[group] = node;
    },
    []
  );

  const allowDrop = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleWebDrop = useCallback(
    (dropType, status) => (event) => {
      event.preventDefault();

      const taskId = event.dataTransfer.getData('text/plain');
      if (!taskId) {
        return;
      }

      setActiveTarget(null);

      if (dropType === 'delete') {
        onDelete(taskId);
        return;
      }

      onAdvance(taskId, status);
    },
    [onAdvance, onDelete]
  );

  return (
    <View ref={boardRef} style={[styles.board, isWide && styles.boardWide]}>
      <View
        ref={deleteZoneRef}
        onLayout={refreshMeasurements}
        onDragOver={allowDrop}
        onDrop={handleWebDrop('delete')}
        style={[styles.deleteZone, activeTarget?.type === 'delete' && styles.deleteZoneActive]}
      >
        <Text style={styles.deleteZoneTitle}>Drop here to delete</Text>
        <Text style={styles.deleteZoneText}>Drag a task card onto this area to remove it</Text>
      </View>

      <View style={[styles.columnsWrap, isWide && styles.columnsWrapWide]}>
        {statusList.map((group) => {
          const isActive = activeTarget?.type === 'status' && activeTarget.status === group;

          return (
            <View
              key={group}
              ref={registerColumnRef(group)}
              onLayout={refreshMeasurements}
              onDragOver={allowDrop}
              onDrop={handleWebDrop('status', group)}
              style={[
                styles.column,
                isWide && styles.columnWide,
                isActive && styles.columnActive,
              ]}
            >
              <Text style={styles.columnTitle}>{group}</Text>
              {taskGroups[group].length === 0 ? (
                <Text style={styles.emptyText}>No tasks yet</Text>
              ) : (
                taskGroups[group].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentTime={currentTime}
                    onAdvance={onAdvance}
                    onDelete={onDelete}
                    onAddComment={onAddComment}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onDragStateChange={onDragStateChange}
                  />
                ))
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: '100%',
  },
  boardWide: {
    flex: 1,
  },
  columnsWrap: {
    width: '100%',
  },
  columnsWrapWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  column: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    minHeight: 180,
  },
  columnWide: {
    flex: 1,
    minWidth: 220,
  },
  columnActive: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#243244',
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
  deleteZone: {
    backgroundColor: '#431616',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    padding: 12,
    marginBottom: 12,
  },
  deleteZoneActive: {
    backgroundColor: '#5b1c1c',
    borderColor: '#fca5a5',
  },
  deleteZoneTitle: {
    color: '#fee2e2',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteZoneText: {
    color: '#fecaca',
    fontSize: 12,
    marginTop: 4,
  },
});