import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

export default function AnimatedSplash() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Fade in text animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate to home after 3.5 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)'); // Or '/auth/login' depending on your auth state
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/cart-animation.json')} // You'll need a JSON file here
        autoPlay
        loop={false}
        style={styles.lottie}
      />
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.logoText}>BLUE STORE</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 300,
    height: 300,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    letterSpacing: 3,
    marginTop: -20,
  },
});