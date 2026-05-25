import { StyleSheet, Text, View } from 'react-native';

export function ActivityLogList({ logs }) {
  return (
    <View style={styles.logsCard}>
      {logs.length === 0 ? (
        <Text style={styles.emptyText}>No activity yet</Text>
      ) : (
        logs.map((log) => (
          <View key={log.id} style={styles.logRow}>
            <Text style={styles.logText}>{log.message}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    maxHeight: 420,
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