import { TaskManagerScreen } from './screens/TaskManagerScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TaskManagerScreen />
    </GestureHandlerRootView>
  );
}