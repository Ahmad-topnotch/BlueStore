import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, Dimensions 
} from 'react-native';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter, Stack } from 'expo-router'; // Added Stack
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log("User signed in successfully");
      // Use replace so they can't go back to login screen
      router.replace('/(tabs)'); 
    } catch (error) {
      console.error(error);
      let message = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found') message = "No user found with this email.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password.";
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. This hides the default white header bar from the navigation stack */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 2. Status bar setup for seamless blending */}
      <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={true} />
      
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <Ionicons name="cart" size={80} color="#3498db" />
          <Text style={styles.title}>BlueStore</Text>
          <Text style={styles.subtitle}>Welcome back! Please login to continue.</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color="#3498db" />
            <TextInput 
              placeholder="Email" 
              style={styles.input} 
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholderTextColor="#a0aec0"
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#3498db" />
            <TextInput 
              placeholder="Password" 
              style={styles.input} 
              value={password}
              onChangeText={setPassword}
              secureTextEntry 
              placeholderTextColor="#a0aec0"
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && { backgroundColor: '#a0aec0' }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.link}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // backgroundColor here covers the notch area
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f0f7ff' 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f0f7ff', 
    justifyContent: 'center', // Changed to center for better look on different screens
    padding: 25,
  },
  headerBox: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  title: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#3498db', 
    marginTop: 10,
    letterSpacing: -1
  },
  subtitle: { 
    color: '#5a7184', 
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center'
  },
  inputContainer: { 
    backgroundColor: '#fff', 
    padding: 25, 
    borderRadius: 25, 
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 8, 
  },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc', 
    paddingHorizontal: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    height: 55, 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  input: { 
    flex: 1, 
    marginLeft: 10, 
    fontSize: 16,
    color: '#2d3748'
  },
  loginBtn: { 
    backgroundColor: '#3498db', 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    // Add a little shadow to the button too
    elevation: 4,
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loginText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  footerText: { 
    textAlign: 'center', 
    marginTop: 25, 
    color: '#64748b',
    fontSize: 14
  },
  link: { 
    color: '#3498db', 
    fontWeight: 'bold' 
  }
});