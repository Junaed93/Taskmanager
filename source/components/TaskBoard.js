import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { STATUS } from '../constants/taskManager';
import { TaskCard } from './TaskCard';

function pointInBounds(x, y, bounds) {
  if (!bounds) {
    return false;
  }

  return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
}

export function TaskBoard({ isWide, taskGroups, onAdvance, onDelete }) {
  const boardRef = useRef(null);
  const [boardBounds, setBoardBounds] = useState(null);
  const [columnLayouts, setColumnLayouts] = useState({});
  const [deleteLayout, setDeleteLayout] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);

  const statusList = useMemo(() => Object.values(STATUS), []);

  const measureBoard = useCallback(() => {
    if (!boardRef.current?.measureInWindow) {
      return;
    }

    boardRef.current.measureInWindow((x, y, width, height) => {
      setBoardBounds({ x, y, width, height });
    });
  }, []);

  const resolveDropTarget = useCallback(
    (pageX, pageY) => {
      if (!boardBounds) {
        return null;
      }

      const toAbsoluteBounds = (layout) =>
        layout
          ? {
              x: boardBounds.x + layout.x,
              y: boardBounds.y + layout.y,
              width: layout.width,
              height: layout.height,
            }
          : null;

      if (pointInBounds(pageX, pageY, toAbsoluteBounds(deleteLayout))) {
        return { type: 'delete' };
      }

      if (pointInBounds(pageX, pageY, toAbsoluteBounds(columnLayouts[STATUS.ONGOING]))) {
        return { type: 'status', status: STATUS.ONGOING };
      }

      if (pointInBounds(pageX, pageY, toAbsoluteBounds(columnLayouts[STATUS.COMPLETED]))) {
        return { type: 'status', status: STATUS.COMPLETED };
      }

      if (pointInBounds(pageX, pageY, toAbsoluteBounds(columnLayouts[STATUS.TODO]))) {
        return { type: 'status', status: STATUS.TODO };
      }

      return null;
    },
    [boardBounds, columnLayouts, deleteLayout]
  );

  useEffect(() => {
    measureBoard();
  }, [isWide, taskGroups, measureBoard]);

  const handleDragMove = useCallback(
    (taskId, pageX, pageY) => {
      const target = resolveDropTarget(pageX, pageY);
      setActiveTarget(target ? { taskId, ...target } : null);
    },
    [resolveDropTarget]
  );

  const handleDragEnd = useCallback(
    (taskId, pageX, pageY) => {
      const target = resolveDropTarget(pageX, pageY);
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

  const registerColumnLayout = useCallback(
    (group) => (event) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      setColumnLayouts((currentLayouts) => ({
        ...currentLayouts,
        [group]: { x, y, width, height },
      }));
    },
    []
  );

  const registerDeleteLayout = useCallback((event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setDeleteLayout({ x, y, width, height });
  }, []);

  return (
    <View ref={boardRef} onLayout={measureBoard} style={[styles.board, isWide && styles.boardWide]}>
      <View
        onLayout={registerDeleteLayout}
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
              onLayout={registerColumnLayout(group)}
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
                    onAdvance={onAdvance}
                    onDelete={onDelete}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
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