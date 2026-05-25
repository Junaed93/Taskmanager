Task Manager (Expo + React Native)

A small task management app built with Expo and React Native. Features drag-and-drop task cards across columns (To Do → On Going → Completed), drag-to-delete, local deadline notifications, and realtime deadline color updates.

**Requirements**
- Node.js (16+ recommended)
- Expo CLI (use `npx expo`)
- Android or iOS device/emulator for full notification support

**Dependencies**
- `expo` ~54.0.33
- `react` 19.1.0
- `react-native` 0.81.5
- `react-dom` 19.1.0
- `react-native-web` ^0.21.0
- `expo-notifications` ~0.32.17
- `react-native-gesture-handler` ^2.31.2
- `@react-native-async-storage/async-storage` 2.2.0
- `expo-sqlite` ~16.0.10
- `@react-native-community/datetimepicker` ^8.4.4
- `expo-status-bar` ~3.0.9

**Install**
- Install JS dependencies:

```powershell
npm install
```

- Install native Expo packages (recommended):

```powershell
npx expo install expo-notifications react-native-gesture-handler
```

For a fresh setup (explicit commands that match this project):

```powershell
npm install
npx expo install expo-notifications expo-sqlite react-native-gesture-handler @react-native-async-storage/async-storage @react-native-community/datetimepicker expo-status-bar
npm install react-dom react-native-web
```

**Run (Development)**

```powershell
npx expo start -c
```

Open the app on a simulator or device using the Expo Dev Tools QR code or the platform-specific options.

**Quick Manual Tests**
- Create a task with a short deadline (1–2 minutes) to verify scheduled notifications.
- Drag a card to the `On Going` or `Completed` columns to confirm status updates and immediate notifications.
- Drag a card to the delete zone to confirm deletion.

**Project Layout (key files)**
- `App.js`: App root, gesture handler wrapper, and notification handler.
- `source/screens/TaskManagerScreen.js`: Main screen (clock tick for realtime colors).
- `source/components/TaskBoard.js`: Columns, drop target measurement, and drop resolution.
- `source/components/TaskCard.js`: Card UI and gesture handling (PanGestureHandler).
- `source/hooks/useTaskManager.js`: Task CRUD, persistence, notification scheduling/cancellation.
- `source/storage/taskStorage.js`: Persistence layer.
- `source/utils/taskHelpers.js`: Deadline color and progress calculations.

**Notes & Troubleshooting**
- Notifications: scheduled notifications require a real device or proper simulator support; iOS simulators may have limitations.
- If notifications do not appear, ensure permissions are granted and the app is running or has scheduled triggers.
- If gesture behavior is off, clear Metro cache and restart:

```powershell
npx expo start -c
```
