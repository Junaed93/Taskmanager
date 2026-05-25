import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { TAB_KEYS } from '../constants/taskManager';
import { useTaskManager } from '../hooks/useTaskManager';
import { ActivityLogList } from '../components/ActivityLogList';
import { TabSwitcher } from '../components/TabSwitcher';
import { TaskBoard } from '../components/TaskBoard';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';

export function TaskManagerScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isFormVisible, setIsFormVisible] = useState(true);

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
    requiredTime,
    removeMember,
    setActiveTab,
    setDeadline,
    setDescription,
    setMemberName,
    setName,
    setOwner,
    setPriority,
    setRequiredTime,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView scrollEnabled={!isDraggingTask} contentContainerStyle={styles.screen}>
        <View style={styles.content}>
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
                  requiredTime={requiredTime}
                  removeMember={removeMember}
                  setDeadline={setDeadline}
                  setDescription={setDescription}
                  setMemberName={setMemberName}
                  setName={setName}
                  setOwner={setOwner}
                  setPriority={setPriority}
                  setRequiredTime={setRequiredTime}
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
                      onDragStateChange={setIsDraggingTask}
                    />
                  </View>
                ) : null}
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
            <ActivityLogList logs={logs} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  screen: {
    padding: 14,
    paddingBottom: 26,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 1200,
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
    color: '#f9fafb',
    fontSize: 28,
    fontWeight: '700',
  },
  subheading: {
    color: '#cbd5e1',
    marginTop: 4,
    marginBottom: 14,
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  formCardWide: {
    width: 380,
    marginBottom: 0,
  },
});