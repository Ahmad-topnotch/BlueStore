import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function CheckoutIndex() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const goToPayment = () => {
    if (!name || !phone || !address) {
      Alert.alert("Required", "Please fill in all details");
      return;
    }
    
    // IMPORTANT: Path must match your folder structure
    router.push({
      pathname: "/checkout/payment", 
      params: { name, phone, address }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shipping Info</Text>
      <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Phone" style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput placeholder="Address" style={[styles.input, {height: 80}]} multiline value={address} onChangeText={setAddress} />
      
      <TouchableOpacity style={styles.button} onPress={goToPayment}>
        <Text style={styles.buttonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#3498db', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});