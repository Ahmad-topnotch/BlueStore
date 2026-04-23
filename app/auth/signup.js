import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
    } catch (error) {
      console.error(error);
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff', padding: 20 },
  headerBox: { alignItems: 'center', marginVertical: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#3498db', marginTop: 10 },
  subtitle: { color: '#5a7184', marginTop: 5 },
  inputContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 5 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 15, borderRadius: 12, marginBottom: 15, height: 55, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  signupBtn: { backgroundColor: '#3498db', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  signupText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 20, color: '#64748b' },
  link: { color: '#3498db', fontWeight: 'bold' }
});