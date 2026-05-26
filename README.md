Task Manager (Expo + React Native)

A small task management app built with Expo and React Native. Features include drag-and-drop task cards across columns (To Do → On Going → Completed), drag-to-delete, local deadline notifications, and deadline-based color/priority hints.

Requirements
- Node.js 16+ (or compatible)
- Yarn or npm
- Expo CLI (use `npx expo`)
- Android/iOS device or emulator for full notification support

Quick Start (local)

- Install dependencies:

```powershell
npm install
```

- Install native Expo packages used by this project (safe to run even if already installed):

```powershell
npx expo install expo-notifications expo-sqlite react-native-gesture-handler @react-native-async-storage/async-storage @react-native-community/datetimepicker expo-status-bar
```

- Start the dev server (clear cache recommended):

```powershell
npx expo start -c
```

Open the Expo Dev Tools in your browser, then run on a simulator, an attached device (Expo Go), or web.

Docker (development image)

This repository includes a development Dockerfile that runs the Expo dev server inside a container. The image is intended for development and testing, not production mobile builds.

- Build the image:

```bash
docker build -t taskmanager:dev .
```

- Run the container (exposes Expo ports and DevTools):

```bash
docker run --rm -it -p 19000:19000 -p 19001:19001 -p 19002:19002 -p 3000:3000 -e EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 taskmanager:dev
```

Notes:
- When running in Docker, set `EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0` so DevTools are reachable from the host.
- The container runs `npm start` (Expo). Use the DevTools web UI to open the app on your device or web.

Features
- Create tasks with owner, description, priority, members, and deadline.
- Drag-and-drop between columns (To Do → On Going → Completed).
- Drag-to-delete.
- Local persistence using SQLite (expo-sqlite) with a migration from AsyncStorage.
- Scheduled deadline notifications (expo-notifications).
- Activity log for add/update/delete events.

Project Structure (key files)
- [App.js](App.js): App root and notification setup.
- [source/screens/TaskManagerScreen.js](source/screens/TaskManagerScreen.js): Main screen and layout.
- [source/components/TaskBoard.js](source/components/TaskBoard.js): Board layout and drop handling.
- [source/components/TaskCard.js](source/components/TaskCard.js): Task card UI and gestures.
- [source/components/TaskForm.js](source/components/TaskForm.js): Add task form.
- [source/hooks/useTaskManager.js](source/hooks/useTaskManager.js): Tasks state, persistence, notifications.
- [source/storage/taskStorage.js](source/storage/taskStorage.js): SQLite persistence helpers.
- [source/utils/taskHelpers.js](source/utils/taskHelpers.js): Formatting and deadline helpers.

Development Tips
- Clear Metro cache if you see stale JS/gesture issues:

```powershell
npx expo start -c
```

- For notification testing, use a physical device or supported simulator. iOS simulators have limitations for notifications.

Known Issues / Notes
- The Docker image is for dev only — building production mobile binaries still requires native toolchains or EAS Build.
- UI tweaks have been iterated; if the layout appears narrow on your device, check for leftover style constraints in [source/screens/TaskManagerScreen.js](source/screens/TaskManagerScreen.js) and the component wrappers.

 
