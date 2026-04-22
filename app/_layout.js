import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { auth } from '../config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { CartProvider } from '../context/CartContext';
import { View, ActivityIndicator } from 'react-native';

// Keep splash visible until we decide where to go
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const segments = useSegments();

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // Handle redirection
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Not logged in -> Login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Logged in -> Home
      router.replace('/(tabs)');
    }
    
    // Hide splash screen now that we are navigating
    SplashScreen.hideAsync().catch(() => {});
  }, [user, initializing, segments]);

  // While checking Firebase, show a clean loading state (avoids white screen)
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3498db' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </CartProvider>
  );
}