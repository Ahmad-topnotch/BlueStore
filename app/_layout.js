import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { auth } from '../config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { CartProvider } from '../context/CartContext';
// 1. Import StripeProvider
import { StripeProvider } from '@stripe/stripe-react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const hideStaticSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideStaticSplash();

    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
    });

    const timer = setTimeout(() => {
      setAppIsReady(true);
    }, 3000); 

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

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
    // 2. StripeProvider initialized with your provided test key
    <StripeProvider
      publishableKey="pk_test_51TS944Pmx7v25GtiFZxBNh3cfWtd6rGsmnDPYWHDhkDNz9g3xTBSYSHVOF7i9OTksQD8Vq5GeYgApD3lZIwsC3pm00ZMrztm8W"
      merchantIdentifier="merchant.com.bluestore" 
    >
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
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
});