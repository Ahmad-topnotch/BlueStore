import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { auth } from '../config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { CartProvider } from '../context/CartContext';

// Keep the system splash locked until we are ready to swap
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 1. HIDE THE SYSTEM SPLASH IMMEDIATELY
    const hideStaticSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideStaticSplash();

    // 2. Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
    });

    // 3. ADJUSTED DURATION
    // Changed from 5000 to 3000 to prevent a second loop.
    // If it still loops once, try reducing this to 2500.
    const timer = setTimeout(() => {
      setAppIsReady(true);
    }, 3000); 

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // 4. Handle Navigation after animation is done
  useEffect(() => {
    if (appIsReady) {
      const inAuthGroup = segments[0] === 'auth';
      
      if (!user && !inAuthGroup) {
        router.replace('/auth/login');
      } else if (user && (inAuthGroup || segments.length === 0 || segments[0] === 'index')) {
        router.replace('/(tabs)');
      }
    }
  }, [appIsReady, user, segments]);

  return (
    <CartProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" /> 
          <Stack.Screen name="auth" /> 
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </View>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
});