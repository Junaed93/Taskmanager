Task Manager (Expo + React Native)

A small task management app built with Expo and React Native. Features include drag-and-drop task cards across columns (To Do → On Going → Completed), drag-to-delete, local deadline notifications, and deadline-based color/priority hints.

## What You Need

- Node.js 18 or newer
- npm (comes with Node.js)
- A browser for web testing
- Android device/emulator or iPhone/simulator if you want to test mobile features

## Install Dependencies

Run this once after cloning the project:

```powershell
npm install
```

If Expo asks for matching packages, install them with:

```powershell
npx expo install expo-notifications expo-sqlite react-native-gesture-handler @react-native-async-storage/async-storage @react-native-community/datetimepicker expo-status-bar
```

## Run The Project Without Docker

### Web

```powershell
npx expo start --web
```

Then open the browser URL that Expo prints in the terminal.

### Android

```powershell
npx expo start
```

Then press `a` in the Expo terminal to open Android, or scan the QR code with Expo Go on a physical device.

### iOS

```powershell
npx expo start
```

Then press `i` on macOS to open the iOS simulator, or use Expo Go on a real device.

## Docker Option

If you do have Docker, you can run the web app in a container:

```powershell
docker build -t taskmanager:dev .
docker run --rm -it -p 19006:19006 -e EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 -e BROWSER=none taskmanager:dev
```

Then open `http://localhost:19006` in your browser.

## Features

- Create tasks with owner, description, priority, members, and deadline.
- Drag-and-drop between columns (To Do → On Going → Completed).
- Drag-to-delete.
- Local persistence using SQLite (`expo-sqlite`) with a migration from AsyncStorage.
- Scheduled deadline notifications (`expo-notifications`).
- Activity log for add/update/delete events.

## Project Structure

- [App.js](App.js): App root and notification setup.
- [source/screens/TaskManagerScreen.js](source/screens/TaskManagerScreen.js): Main screen and layout.
- [source/components/TaskBoard.js](source/components/TaskBoard.js): Board layout and drop handling.
- [source/components/TaskCard.js](source/components/TaskCard.js): Task card UI and gestures.
- [source/components/TaskForm.js](source/components/TaskForm.js): Add task form.
- [source/hooks/useTaskManager.js](source/hooks/useTaskManager.js): Task state, persistence, notifications.
- [source/storage/taskStorage.js](source/storage/taskStorage.js): SQLite persistence helpers.
- [source/utils/taskHelpers.js](source/utils/taskHelpers.js): Formatting and deadline helpers.

## Development Tips

- If Metro or the web bundle gets stuck, clear the cache:

```powershell
npx expo start -c
```

- For notification testing, use a physical device or supported simulator. iOS simulators have limitations for notifications.



 
