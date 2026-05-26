import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { TAB_KEYS } from '../constants/taskManager';
import { useTaskManager } from '../hooks/useTaskManager';
import { ActivityLogList } from '../components/ActivityLogList';
import { TabSwitcher } from '../components/TabSwitcher';
import { TaskBoard } from '../components/TaskBoard';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';

export function TaskManagerScreen() {
  const { width, height } = useWindowDimensions();
  const isWide = width >= 900;
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isFormVisible, setIsFormVisible] = useState(true);
  const scrollRef = useRef(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const {
    activeTab,
    addTask,
    addTaskComment,
    addMember,
    deadline,
    deleteTask,
    description,
    logs,
    memberName,
    members,
    name,
    owner,
    priority,
    removeMember,
    setActiveTab,
    setDeadline,
    setDescription,
    setMemberName,
    setName,
    setOwner,
    setPriority,
    setStatus,
    status,
    taskGroups,
    tasks,
    updateTaskStatus,
  } = useTaskManager();

  const isBoardTab = activeTab === TAB_KEYS.BOARD;
  const isListTab = activeTab === TAB_KEYS.LIST;
  const isLogsTab = activeTab === TAB_KEYS.LOGS;
  const hasTasks = tasks.length > 0;
  const logsPanelHeight = Math.max(height - 190, 360);

  const handleCreateTask = async () => {
    const created = await addTask();

    if (created) {
      setIsFormVisible(false);
    }
  };

  const subheading = isBoardTab
    ? 'Create tasks, comment on cards, and drag them across the board.'
    : isListTab
      ? 'See every task in deadline order, with the nearest due date first.'
      : 'Review the add, update, and delete history for each task.';

  const handleDragMovePageY = useCallback(
    (pageY) => {
      const edgeThreshold = 120;
      const scrollStep = 24;
      const currentY = scrollYRef.current;

      if (pageY <= edgeThreshold) {
        scrollRef.current?.scrollTo({ y: Math.max(0, currentY - scrollStep), animated: false });
        return;
      }

      if (pageY >= height - edgeThreshold) {
        scrollRef.current?.scrollTo({ y: currentY + scrollStep, animated: false });
      }
    },
    [height]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { width }]}>
      <StatusBar style="light" />
      <ScrollView
        ref={scrollRef}
        style={[styles.scroll, { width }]}
        onScroll={(event) => {
          scrollYRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.screen, { width, minWidth: width }]}
      >
        <View style={[styles.content, { width: Math.max(width - 28, 0), minWidth: Math.max(width - 28, 0) }]}>
          <Text style={styles.heading}>Task Manager</Text>
          <Text style={styles.subheading}>{subheading}</Text>

          <TabSwitcher activeTab={activeTab} onChangeTab={setActiveTab} />

          {isBoardTab ? (
            isFormVisible ? (
              <View style={[styles.formCard, isWide && styles.formCardWide]}>
                <TaskForm
                  addTask={handleCreateTask}
                  addMember={addMember}
                  deadline={deadline}
                  description={description}
                  members={members}
                  memberName={memberName}
                  name={name}
                  owner={owner}
                  priority={priority}
                  removeMember={removeMember}
                  setDeadline={setDeadline}
                  setDescription={setDescription}
                  setMemberName={setMemberName}
                  setName={setName}
                  setOwner={setOwner}
                  setPriority={setPriority}
                  setStatus={setStatus}
                  status={status}
                />
              </View>
            ) : (
              <View style={styles.boardShell}>
                <View style={styles.boardHeaderRow}>
                  <View style={styles.boardHeaderSpacer} />
                  <Pressable style={styles.boardAddBtn} onPress={() => setIsFormVisible(true)}>
                    <Text style={styles.boardAddBtnText}>Add Task</Text>
                  </Pressable>
                </View>

                {hasTasks ? (
                  <View style={[styles.boardLayout, isWide && styles.boardLayoutWide]}>
                    <TaskBoard
                      isWide={isWide}
                      currentTime={currentTime}
                      taskGroups={taskGroups}
                      onAdvance={updateTaskStatus}
                      onDelete={deleteTask}
                      onAddComment={addTaskComment}
                      onDragMovePageY={handleDragMovePageY}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyBoardCard}>
                    <Text style={styles.emptyBoardTitle}>No tasks yet</Text>
                    <Text style={styles.emptyBoardText}>Create your first task by clicking the "Add Task" button.</Text>
                  </View>
                )}
              </View>
            )
          ) : isListTab ? (
            <TaskList
              tasks={tasks}
              currentTime={currentTime}
              onAdvance={updateTaskStatus}
              onDelete={deleteTask}
              onAddComment={addTaskComment}
            />
          ) : isLogsTab ? (
            <ActivityLogList logs={logs} panelHeight={logsPanelHeight} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b1120',
    alignSelf: 'stretch',
  },
  scroll: {
    flex: 1,
  },
  screen: {
    flexGrow: 1,
    padding: 14,
    paddingBottom: 26,
    alignItems: 'stretch',
  },
  content: {
    alignSelf: 'stretch',
  },
  contentWide: {
    alignItems: 'stretch',
  },
  boardLayout: {
    gap: 14,
  },
  boardLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  boardShell: {
    gap: 12,
  },
  boardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardHeaderSpacer: {
    flex: 1,
  },
  boardAddBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  boardAddBtnText: {
    color: '#082f49',
    fontWeight: '800',
    fontSize: 14,
  },
  heading: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  subheading: {
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 14,
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#243244',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  formCardWide: {
    width: 380,
    marginBottom: 0,
  },
  emptyBoardCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#243244',
    padding: 16,
  },
  emptyBoardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },
  emptyBoardText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 6,
  },
});