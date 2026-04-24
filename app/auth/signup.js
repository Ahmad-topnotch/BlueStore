import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, Stack } from 'expo-router'; // Added Stack
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar'; // Added StatusBar

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email: email.trim(),
        uid: userCredential.user.uid,
        createdAt: serverTimestamp(),
      });
      console.log("Account created successfully");
      // Use replace so they are logged in and can't back out to the sign-up page
      router.replace('/(tabs)');
    } catch (error) {
      console.error(error);
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Hides the white header bar from the navigator */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 2. Makes the battery/clock dark and blends the top bar */}
      <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={true} />

      <View style={styles.container}>
        {/* Back Button since it's a sub-page */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>

        <View style={styles.headerBox}>
          <Ionicons name="person-add" size={70} color="#3498db" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join BlueStore to start shopping.</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={20} color="#3498db" />
            <TextInput 
              placeholder="Full Name" 
              style={styles.input} 
              value={name}
              onChangeText={setName}
              placeholderTextColor="#a0aec0"
            />
          </View>

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
            style={[styles.signupBtn, loading && { backgroundColor: '#a0aec0' }]} 
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupText}>Sign Up</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerText}>Already have an account? <Text style={styles.link}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f7ff' },
  container: { flex: 1, backgroundColor: '#f0f7ff', padding: 25, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 10, left: 20, zIndex: 10 },
  headerBox: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '900', color: '#3498db', marginTop: 10, letterSpacing: -1 },
  subtitle: { color: '#5a7184', marginTop: 5, textAlign: 'center' },
  inputContainer: { 
    backgroundColor: '#fff', 
    padding: 25, 
    borderRadius: 25, 
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#2d3748' },
  signupBtn: { 
    backgroundColor: '#3498db', 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 4,
  },
  signupText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#64748b' },
  link: { color: '#3498db', fontWeight: 'bold' }
});