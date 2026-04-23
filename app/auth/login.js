import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
          />
        </View>

        <TouchableOpacity 
          style={[styles.loginBtn, loading && { backgroundColor: '#a0aec0' }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
        </TouchableOpacity>

        {/* FIXED PATH BELOW */}
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={styles.footerText}>Don't have an account? <Text style={styles.link}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff', justifyContent: 'center', padding: 20 },
  headerBox: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#3498db', marginTop: 10 },
  subtitle: { color: '#5a7184', marginTop: 5 },
  inputContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 5 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 15, borderRadius: 12, marginBottom: 15, height: 55, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  loginBtn: { backgroundColor: '#3498db', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 20, color: '#64748b' },
  link: { color: '#3498db', fontWeight: 'bold' }
});