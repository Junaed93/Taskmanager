import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { TAB_KEYS } from '../constants/taskManager';
import { useTaskManager } from '../hooks/useTaskManager';
import { ActivityLogList } from '../components/ActivityLogList';
import { TabSwitcher } from '../components/TabSwitcher';
import { TaskBoard } from '../components/TaskBoard';
import { TaskForm } from '../components/TaskForm';

export function TaskManagerScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const {
    activeTab,
    addTask,
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
    updateTaskStatus,
  } = useTaskManager();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={[styles.content, isWide && styles.contentWide]}>
          <View style={[styles.formCard, isWide && styles.formCardWide]}>
            <Text style={styles.heading}>Task Manager</Text>
            <Text style={styles.subheading}>Create a task and view it by status</Text>

            <TabSwitcher activeTab={activeTab} onChangeTab={setActiveTab} />

            {activeTab === TAB_KEYS.BOARD ? (
              <TaskForm
                addTask={addTask}
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
            ) : (
              <ActivityLogList logs={logs} />
            )}
          </View>

          {activeTab === TAB_KEYS.BOARD ? (
            <TaskBoard
              isWide={isWide}
              taskGroups={taskGroups}
              onAdvance={updateTaskStatus}
              onDelete={deleteTask}
            />
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
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