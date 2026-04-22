import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // SAVE THE NAME TO FIREBASE
      await updateProfile(res.user, { displayName: name });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // ... (Your styled UI remains the same)
}