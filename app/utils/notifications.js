import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how alerts look when they arrive
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  // 🛑 CRITICAL FIX: If running in Expo Go, stop immediately to prevent crash
  if (Constants.appOwnership === 'expo') {
    console.log("Push Tokens are disabled in Expo Go (SDK 53+). Use a Development Build for remote push.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (e) {
    console.log("Token error:", e);
    return null;
  }
}

export async function sendLocalNotification(title, body) {
  // Local notifications STILL WORK in Expo Go!
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch (e) {
    console.log("Local Notification Error:", e);
  }
}

// Default export to satisfy Expo Router
export default function NotificationSetup() { return null; }