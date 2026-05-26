import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function ActivityLogList({ logs, panelHeight }) {
  return (
    <View style={[styles.logsCard, { minHeight: panelHeight, maxHeight: panelHeight }]}>
      {logs.length === 0 ? (
        <Text style={styles.emptyText}>No activity yet</Text>
      ) : (
        <ScrollView
          style={styles.logsScroll}
          contentContainerStyle={styles.logsScrollContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          {logs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logText}>{log.message}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logsCard: {
    width: '100%',
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
  },
  logsScroll: {
    flex: 1,
  },
  logsScrollContent: {
    paddingBottom: 4,
  },
  logRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 8,
  },
  logText: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});