import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InfoScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cod'

  const proceedToPayment = () => {
    if (!name || !phone || !address) {
      Alert.alert("Missing Info", "Please fill in all shipping details.");
      return;
    }

    router.push({
      pathname: '/checkout/payment',
      params: {
        totalAmount: params.totalAmount,
        cartItems: params.cartItems, 
        name: name,
        phone: phone,
        address: address,
        method: paymentMethod // Passing the choice forward
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Shipping Details</Text>
      
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={[styles.input, {height: 80}]} placeholder="Complete Address" multiline value={address} onChangeText={setAddress} />

      <Text style={styles.sectionLabel}>Select Payment Method</Text>
      
      <View style={styles.methodContainer}>
        <TouchableOpacity 
          style={[styles.methodBox, paymentMethod === 'card' && styles.activeMethod]} 
          onPress={() => setPaymentMethod('card')}
        >
          <Ionicons name="card-outline" size={24} color={paymentMethod === 'card' ? '#3498db' : '#64748b'} />
          <Text style={[styles.methodText, paymentMethod === 'card' && styles.activeText]}>Credit Card</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.methodBox, paymentMethod === 'cod' && styles.activeMethod]} 
          onPress={() => setPaymentMethod('cod')}
        >
          <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cod' ? '#2ecc71' : '#64748b'} />
          <Text style={[styles.methodText, paymentMethod === 'cod' && styles.activeText]}>COD</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={proceedToPayment}>
        <Text style={styles.btnText}>
          {paymentMethod === 'card' ? "Continue to Payment" : "Place Order (COD)"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8fafc', flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#1e293b', textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', padding: 15, borderRadius: 12, marginBottom: 15 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#64748b', marginBottom: 10, marginTop: 10 },
  methodContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  methodBox: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  activeMethod: { borderColor: '#3498db', backgroundColor: '#f0f9ff' },
  methodText: { marginTop: 8, fontSize: 14, color: '#64748b', fontWeight: '500' },
  activeText: { color: '#3498db' },
  btn: { backgroundColor: '#3498db', padding: 20, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});