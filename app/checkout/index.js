import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

export default function CheckoutInfo() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  const { totalPrice } = useCart(); 
  const router = useRouter();

  useEffect(() => {
    const loadUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        // 1. Set name from Firebase Auth profile as a priority
        if (user.displayName) {
          setName(user.displayName);
        }

        try {
          // 2. Check Firestore for saved profile/address data
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // If Firestore has a name and Auth profile didn't, use Firestore
            if (data.name && !name) {
              setName(data.name);
            }
            
            // Populate address and phone if saved previously
            if (data.savedAddress) {
              const saved = data.savedAddress;
              if (!name && saved.name) setName(saved.name);
              setPhone(saved.phone || '');
              setAddress(saved.address || '');
            }
          }
        } catch (error) {
          console.log("Error fetching profile details:", error);
        }
      }
    };
    loadUserDetails();
  }, []);

  const handleNext = () => {
    if (!name || !phone || !address) {
      Alert.alert("Missing Info", "Please fill in all fields to continue.");
      return;
    }

    router.push({
      pathname: '/checkout/payment',
      params: { 
        name, 
        phone, 
        address, 
        paymentMethod,
        subtotal: totalPrice.toFixed(2),
        total: (totalPrice + 200).toFixed(2) 
      }
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Shipping & Payment Method</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Your actual name" 
          value={name} 
          onChangeText={setName} 
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput 
          style={styles.input} 
          placeholder="03xx xxxxxxx" 
          keyboardType="phone-pad" 
          value={phone} 
          onChangeText={setPhone} 
        />

        <Text style={styles.label}>Delivery Address</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Complete Address" 
          multiline 
          value={address} 
          onChangeText={setAddress} 
        />
      </View>

      <Text style={styles.label}>Payment Method</Text>
      <TouchableOpacity 
        style={[styles.paymentOption, paymentMethod === 'COD' && styles.activeOption]} 
        onPress={() => setPaymentMethod('COD')}
      >
        <Ionicons name="cash-outline" size={24} color={paymentMethod === 'COD' ? '#3498db' : '#64748b'} />
        <Text style={[styles.paymentText, paymentMethod === 'COD' && styles.activePaymentText]}>Cash on Delivery (COD)</Text>
        {paymentMethod === 'COD' && <Ionicons name="checkmark-circle" size={20} color="#3498db" />}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>Review Order (Rs. {(totalPrice + 200).toLocaleString()})</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 20 },
  subtitle: { color: '#64748b', marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 10, marginTop: 10 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  paymentOption: { 
    flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, 
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10, gap: 12 
  },
  activeOption: { borderColor: '#3498db', backgroundColor: '#f0f9ff' },
  paymentText: { flex: 1, fontSize: 15, color: '#475569', fontWeight: '500' },
  activePaymentText: { color: '#3498db', fontWeight: 'bold' },
  btn: { backgroundColor: '#3498db', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});