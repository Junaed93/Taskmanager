import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, Platform, StyleSheet, Text, View } from 'react-native';

import { formatDateTimeLabel, formatMembersLabel, getDeadlineColorInfo } from '../utils/taskHelpers';

export function TaskCard({ task, onAdvance, onDelete, onDragMove, onDragEnd }) {
  const deadlineColor = getDeadlineColorInfo(task);
  const [isDragging, setIsDragging] = useState(false);
  const [webDragOffset, setWebDragOffset] = useState({ x: 0, y: 0 });
  const [webDragSession, setWebDragSession] = useState(null);
  const dragOffset = useMemo(() => new Animated.ValueXY(), []);
  const isWeb = Platform.OS === 'web';
  const webDragState = useRef(null);

  useEffect(() => {
    if (!isWeb || !webDragSession) {
      return undefined;
    }

    const updateDragPosition = (event) => {
      const dragState = webDragState.current;
      if (!dragState) {
        return;
      }

      const nextOffset = {
        x: event.pageX - dragState.startX,
        y: event.pageY - dragState.startY,
      };

      setWebDragOffset(nextOffset);

      if (onDragMove) {
        onDragMove(task.id, event.pageX, event.pageY);
      }
    };

    const endDrag = (event) => {
      const dragState = webDragState.current;
      if (!dragState) {
        return;
      }

      if (onDragEnd) {
        onDragEnd(task.id, event.pageX, event.pageY);
      }

      webDragState.current = null;
      setIsDragging(false);
      setWebDragOffset({ x: 0, y: 0 });
      setWebDragSession(null);
    };

    const handleMove = (event) => {
      const dragState = webDragState.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      updateDragPosition(event);
    };

    const handleUp = (event) => {
      const dragState = webDragState.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      endDrag(event);
    };

    window.addEventListener('pointermove', handleMove, true);
    window.addEventListener('pointerup', handleUp, true);
    window.addEventListener('pointercancel', handleUp, true);

    return () => {
      window.removeEventListener('pointermove', handleMove, true);
      window.removeEventListener('pointerup', handleUp, true);
      window.removeEventListener('pointercancel', handleUp, true);
    };
  }, [isWeb, onDragEnd, onDragMove, task.id, webDragSession]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4,
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4,
        onPanResponderGrant: () => {
          setIsDragging(true);
          dragOffset.setOffset({ x: 0, y: 0 });
          dragOffset.setValue({ x: 0, y: 0 });
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          dragOffset.setValue({ x: gestureState.dx, y: gestureState.dy });

          if (onDragMove) {
            onDragMove(task.id, gestureState.moveX, gestureState.moveY);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (onDragEnd) {
            onDragEnd(task.id, gestureState.moveX, gestureState.moveY);
          }

          setIsDragging(false);
          dragOffset.flattenOffset();
          Animated.spring(dragOffset, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
        onPanResponderTerminate: (_, gestureState) => {
          if (onDragEnd) {
            onDragEnd(task.id, gestureState.moveX, gestureState.moveY);
          }

          setIsDragging(false);
          dragOffset.flattenOffset();
          Animated.spring(dragOffset, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      }),
    [dragOffset, onDragEnd, onDragMove, task.id]
  );

  const cardStyle = [
    styles.card,
    { borderLeftColor: deadlineColor.color },
    isDragging && styles.cardDragging,
  ];

  const cardContent = (
    <>
      <Text style={styles.cardTitle}>{task.name || 'Untitled Task'}</Text>
      <Text style={styles.cardLine}>Owner: {task.owner || '-'}</Text>
      <Text style={styles.cardLine}>Start Date: {task.startDateLabel || formatDateTimeLabel(task.startDateIso)}</Text>
      <Text style={styles.cardLine}>Deadline: {formatDateTimeLabel(task.deadline)}</Text>
      <Text style={styles.cardLine}>Priority: {task.priority}</Text>
      <Text style={styles.cardLine}>Required Time: {task.requiredTime || '-'}</Text>
      <Text style={styles.cardLine}>Members: {formatMembersLabel(task.members)}</Text>
      <Text style={styles.cardLine}>Description: {task.description || '-'}</Text>
      <Text style={styles.cardLine}>Status: {task.status}</Text>
      <View style={styles.colorRow}>
        <View style={[styles.colorSwatch, { backgroundColor: deadlineColor.color }]} />
        <Text style={styles.colorText}>{deadlineColor.label}</Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable style={styles.cardActionBtn} onPress={() => onAdvance(task.id)}>
          <Text style={styles.cardActionText}>Update Status</Text>
        </Pressable>
        <Pressable
          style={[styles.cardActionBtn, styles.cardDeleteBtn]}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.cardActionText}>Delete</Text>
        </Pressable>
      </View>
    </>
  );

  if (isWeb) {
    return (
      <View
        style={[...cardStyle, styles.webCard]}
        onPointerDown={(event) => {
          event.preventDefault();
          webDragState.current = {
            pointerId: event.pointerId,
            startX: event.pageX,
            startY: event.pageY,
          };
          setIsDragging(true);
          setWebDragSession({ pointerId: event.pointerId });
          setWebDragOffset({ x: 0, y: 0 });

          event.currentTarget?.setPointerCapture?.(event.pointerId);
        }}
      >
        <View style={{ transform: [{ translateX: webDragOffset.x }, { translateY: webDragOffset.y }] }}>
          {cardContent}
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[...cardStyle, { transform: dragOffset.getTranslateTransform() }]} {...panResponder.panHandlers}>
      {cardContent}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 6,
    marginBottom: 10,
  },
  cardDragging: {
    opacity: 0.92,
    zIndex: 20,
    elevation: 10,
  },
  webCard: {
    cursor: 'grab',
    userSelect: 'none',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  cardActionBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  cardDeleteBtn: {
    backgroundColor: '#7f1d1d',
  },
  cardActionText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardLine: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 2,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  colorText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '600',
  },
});