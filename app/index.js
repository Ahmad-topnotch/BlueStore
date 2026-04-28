import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';

export default function AnimatedSplash() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/cart-animation.json')}
        autoPlay
        loop={false} // --- CHANGED TO FALSE ---
        style={styles.lottie}
        // This ensures it stays on the last frame until the router replaces the screen
        resizeMode="contain" 
      />
      <Text style={styles.title}>BLUE STORE</Text>
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
    width: 250,
    height: 250,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    letterSpacing: 4,
    marginTop: 20
  }
});