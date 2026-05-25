import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TAB_KEYS } from '../constants/taskManager';

export function TabSwitcher({ activeTab, onChangeTab }) {
  return (
    <View style={styles.tabsRow}>
      <Pressable
        style={[styles.tabBtn, activeTab === TAB_KEYS.BOARD && styles.tabBtnActive]}
        onPress={() => onChangeTab(TAB_KEYS.BOARD)}
      >
        <Text style={[styles.tabText, activeTab === TAB_KEYS.BOARD && styles.tabTextActive]}>
          Board
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tabBtn, activeTab === TAB_KEYS.LOGS && styles.tabBtnActive]}
        onPress={() => onChangeTab(TAB_KEYS.LOGS)}
      >
        <Text style={[styles.tabText, activeTab === TAB_KEYS.LOGS && styles.tabTextActive]}>
          Activity Log
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6b7280',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderColor: '#60a5fa',
    backgroundColor: '#1e3a8a',
  },
  tabText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#dbeafe',
  },
});