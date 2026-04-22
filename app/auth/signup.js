import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter, Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      return Alert.alert("Error", "Please fill in all details.");
    }
    
    setLoading(true);
    try {
      // 1. Create Auth Account
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Create User Profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'user', // Default role for everyone
        createdAt: new Date().toISOString()
      });

      // No need to redirect manually, RootLayout detects user state and moves to /(tabs)
    } catch (error) {
      console.log(error);
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Sign Up', headerShown: false }} />
      
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to start shopping on Daraz Clone</Text>
      
      <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput 
        placeholder="Email Address" 
        style={styles.input} 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.btn} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CREATE ACCOUNT</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? <Text style={styles.link}>Login</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.darazOrange, marginBottom: 5 },
  subtitle: { color: '#666', marginBottom: 40 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', padding: 15, marginBottom: 20, fontSize: 16 },
  btn: { backgroundColor: Colors.darazOrange, padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#888' },
  link: { color: Colors.darazOrange, fontWeight: 'bold' }
});