import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import { formatDateTimeLabel, formatMembersLabel, getDeadlineColorInfo } from '../utils/taskHelpers';

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
  const comments = Array.isArray(task.comments) ? task.comments : [];

  const onGestureEvent = useCallback((event) => {
    const ne = event.nativeEvent || {};
    const pageX = ne.absoluteX ?? ne.pageX ?? 0;
    const pageY = ne.absoluteY ?? ne.pageY ?? 0;
    const tx = ne.translationX ?? 0;
    const ty = ne.translationY ?? 0;

    translate.setValue({ x: tx, y: ty });

    if (onDragMove) {
      onDragMove(task.id, pageX, pageY);
    }
  }, [onDragMove, task.id, translate]);

  const onHandlerStateChange = useCallback((event) => {
    const ne = event.nativeEvent || {};
    const state = ne.state;
    const pageX = ne.absoluteX ?? ne.pageX ?? 0;
    const pageY = ne.absoluteY ?? ne.pageY ?? 0;

    // ACTIVE
    if (state === State.ACTIVE) {
      onDragStateChange?.(true);
      setIsDragging(true);
    }

    // END / CANCEL / FAIL
    if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      if (onDragEnd) {
        onDragEnd(task.id, pageX, pageY);
      }

      onDragStateChange?.(false);
      setIsDragging(false);

      Animated.spring(translate, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    }
  }, [onDragEnd, onDragStateChange, task.id, translate]);

  const handleAddComment = useCallback(() => {
    const nextComment = commentText.trim();

    if (!nextComment) {
      return;
    }

    onAddComment?.(task.id, nextComment);
    setCommentText('');
  }, [commentText, onAddComment, task.id]);

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
                  <Text style={styles.commentTime}>
                    {comment.createdAtLabel || formatDateTimeLabel(comment.createdAtIso)}
                  </Text>
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
              placeholderTextColor="#64748b"
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
      ) : null}
    </>
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
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 6,
    marginBottom: 10,
    position: 'relative',
    zIndex: 0,
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
    flexDirection: 'column',
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
  commentSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.2)',
  },
  commentSectionTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  commentEmptyText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  commentList: {
    gap: 8,
  },
  commentItem: {
    backgroundColor: '#111827',
    borderColor: '#334155',
    borderWidth: 1,
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
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  commentTime: {
    color: '#64748b',
    fontSize: 10,
  },
  commentText: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 16,
  },
  commentComposer: {
    marginTop: 8,
    gap: 8,
  },
  commentInput: {
    backgroundColor: '#111827',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 10,
    color: '#f9fafb',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  commentBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#38bdf8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentBtnText: {
    color: '#082f49',
    fontSize: 12,
    fontWeight: '800',
  },
});