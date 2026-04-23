import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { auth } from '../config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { CartProvider } from '../context/CartContext';
import { View, ActivityIndicator } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === 'auth';

    // Hide splash screen immediately
    SplashScreen.hideAsync().catch(() => {});

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* These names match your actual folder structure from the logs */}
        <Stack.Screen name="auth" /> 
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
        {/* Do NOT add 'admin' or 'checkout' here yet; Expo Router finds them automatically */}
      </Stack>
    </CartProvider>
  );
}