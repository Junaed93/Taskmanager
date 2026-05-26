import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import {
  formatDateTimeLabel,
  formatMembersLabel,
  getCalculatedRequiredTimeLabel,
  getDeadlineColorInfo,
} from '../utils/taskHelpers';

export function TaskCard({
  task,
  currentTime,
  onAdvance,
  onDelete,
  onAddComment,
  onDragMove,
  onDragEnd,
  onDragStateChange,
  draggable = true,
  showActions = true,
  showCommentComposer = true,
}) {
  const deadlineColor = getDeadlineColorInfo(task, currentTime);
  const [isDragging, setIsDragging] = useState(false);
  const [commentText, setCommentText] = useState('');
  const translate = useMemo(() => new Animated.ValueXY(), []);
  const gestureRef = useRef(null);
  const lastPageYRef = useRef(null);
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const calculatedRequiredTime = getCalculatedRequiredTimeLabel(task);

  const onGestureEvent = useCallback(
    (event) => {
      const ne = event.nativeEvent || {};
      const pageX = ne.absoluteX ?? ne.pageX ?? 0;
      const pageY = ne.absoluteY ?? ne.pageY ?? 0;
      const previousPageY = lastPageYRef.current;
      const deltaY = previousPageY == null ? 0 : pageY - previousPageY;

      lastPageYRef.current = pageY;

      translate.setValue({ x: ne.translationX ?? 0, y: ne.translationY ?? 0 });
      onDragMove?.(task.id, pageX, pageY, deltaY);
    },
    [onDragMove, task.id, translate]
  );

  const onHandlerStateChange = useCallback(
    (event) => {
      const ne = event.nativeEvent || {};
      const state = ne.state;
      const pageX = ne.absoluteX ?? ne.pageX ?? 0;
      const pageY = ne.absoluteY ?? ne.pageY ?? 0;

      if (state === State.ACTIVE) {
        onDragStateChange?.(task.id, true);
        setIsDragging(true);
      }

      if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
        onDragEnd?.(task.id, pageX, pageY);
        onDragStateChange?.(task.id, false);
        setIsDragging(false);
        lastPageYRef.current = null;

        Animated.spring(translate, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
    [onDragEnd, onDragStateChange, task.id, translate]
  );

  const handleAddComment = useCallback(() => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment?.(task.id, text);
    setCommentText('');
  }, [commentText, onAddComment, task.id]);

  const cardStyle = [styles.card, { backgroundColor: deadlineColor.color }, isDragging && styles.cardDragging];

  const cardContent = (
    <View style={styles.cardInner}>
      <View style={styles.infoBlock}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>{task.name || 'Untitled Task'}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{task.status}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Owner: </Text><Text style={styles.metaValue}>{task.owner || '-'}</Text></Text>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Start: </Text><Text style={styles.metaValue}>{task.startDateLabel || formatDateTimeLabel(task.startDateIso)}</Text></Text>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Deadline: </Text><Text style={styles.metaValue}>{formatDateTimeLabel(task.deadline)}</Text></Text>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Required Time: </Text><Text style={styles.metaValue}>{calculatedRequiredTime}</Text></Text>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Priority: </Text><Text style={styles.metaValue}>{task.priority}</Text></Text>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Members: </Text><Text style={styles.metaValue}>{formatMembersLabel(task.members)}</Text></Text>
        </View>

        <Text style={styles.description}>{task.description || '-'}</Text>

        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: deadlineColor.color }]} />
          <Text style={styles.colorText}>{deadlineColor.label}</Text>
        </View>
      </View>

      <View style={styles.actionsBlock}>
        <View style={styles.commentSection}>
          <Text style={styles.commentSectionTitle}>Comments</Text>
          {comments.length === 0 ? (
            <Text style={styles.commentEmptyText}>No comments yet.</Text>
          ) : (
            <View style={styles.commentList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentMetaRow}>
                    <Text style={styles.commentAuthor}>{comment.author || 'You'}</Text>
                    <Text style={styles.commentTime}>{comment.createdAtLabel || formatDateTimeLabel(comment.createdAtIso)}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </View>
          )}

          {showCommentComposer ? (
            <View style={styles.commentComposer}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment"
                placeholderTextColor="#94a3b8"
                style={styles.commentInput}
                multiline
              />
              <Pressable style={styles.commentBtn} onPress={handleAddComment}>
                <Text style={styles.commentBtnText}>Comment</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {showActions ? (
          <View style={styles.cardActionsRow}>
            <Pressable style={styles.cardActionBtn} onPress={() => onAdvance(task.id)}>
              <Text style={styles.cardActionText}>Update Status</Text>
            </Pressable>
            <Pressable style={[styles.cardActionBtn, styles.cardDeleteBtn]} onPress={() => onDelete(task.id)}>
              <Text style={styles.cardDeleteText}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );

  const containerStyle = [...cardStyle, draggable ? { transform: translate.getTranslateTransform() } : null].filter(Boolean);

  if (!draggable) {
    return <View style={containerStyle}>{cardContent}</View>;
  }

  return (
    <PanGestureHandler ref={gestureRef} onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <Animated.View style={containerStyle}>{cardContent}</Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
    zIndex: 0,
    borderWidth: 1,
    borderColor: '#0f172a',
  },
  cardDragging: {
    opacity: 0.96,
    zIndex: 20,
    elevation: 12,
  },
  cardInner: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 8,
    gap: 12,
  },
  infoBlock: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
  },
  actionsBlock: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    flex: 1,
  },
  statusPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  metaGrid: {
    paddingVertical: 6,
    gap: 4,
  },
  metaLine: {
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 3,
    fontWeight: '700',
  },
  metaLabel: {
    color: '#ffffff',
    fontWeight: '900',
  },
  metaValue: {
    color: '#ffffff',
    fontWeight: '700',
  },
  description: {
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#000000',
  },
  colorText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  commentSection: {
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  commentSectionTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  commentEmptyText: {
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '700',
  },
  commentList: {
    gap: 8,
  },
  commentItem: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 8,
  },
  commentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  commentTime: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  commentText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  commentComposer: {
    marginTop: 8,
    gap: 8,
  },
  commentInput: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    color: '#f8fafc',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  commentBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  commentBtnText: {
    color: '#082f49',
    fontSize: 14,
    fontWeight: '900',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  cardActionBtn: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  cardActionText: {
    color: '#082f49',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  cardDeleteBtn: {
    backgroundColor: '#7f1d1d',
  },
  cardDeleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
});

export default TaskCard;
