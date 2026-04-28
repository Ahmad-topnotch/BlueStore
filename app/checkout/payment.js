import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db, auth } from '../../config/firebase'; 
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext'; 

export default function PaymentScreen() {
  const { name, phone, address, paymentMethod, total, subtotal } = useLocalSearchParams();
  const { cartItems, clearCart } = useCart(); 
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const completeOrder = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Error", "Login required");

    if (cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty. Please add items before ordering.");
      return;
    }

    setLoading(true);
    try {
      // 1. PLACE THE ORDER WITH NEW FLAGS
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        customer: { name, phone, address },
        paymentMethod: paymentMethod,
        items: cartItems, 
        subtotal: subtotal,
        totalAmount: total,
        status: "Pending",
        createdAt: serverTimestamp(),
        // LOGIC UPDATE: Set visibility flags for new orders
        hiddenByUser: false,
        hiddenByAdmin: false
      });

      // 2. SAVE USER SHIPPING ADDRESS
      await setDoc(doc(db, "users", user.uid), {
        savedAddress: { name, phone, address, updatedAt: serverTimestamp() }
      }, { merge: true });

      // 3. CLEAR GLOBAL CART
      clearCart();

      Alert.alert("Success", "Your order is on the way!", [
        { text: "View My Orders", onPress: () => router.replace('/account') }
      ]);
    } catch (error) {
      Alert.alert("Order Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <View style={styles.card}>
          <Ionicons name="receipt-outline" size={50} color="#3498db" style={{alignSelf: 'center'}} />
          <Text style={styles.title}>Review Your Order</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Ship to:</Text>
            <Text style={styles.value}>{name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{phone}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment:</Text>
            <Text style={styles.value}>{paymentMethod}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Items ({cartItems.length})</Text>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.itemSummary}>
              <Text style={styles.itemText}>{item.quantity}x {item.title || item.name}</Text>
              <Text style={styles.itemPrice}>Rs. {item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Grand Total:</Text>
            <Text style={styles.totalValue}>Rs. {total}</Text>
          </View>
          
          <Text style={styles.infoText}>By clicking below, you agree to our terms of service.</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.payBtn, loading && {backgroundColor: '#94a3b8'}]} 
          onPress={completeOrder} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Confirm & Place Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#1e293b' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#64748b', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemSummary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemText: { color: '#475569', fontSize: 14 },
  itemPrice: { color: '#1e293b', fontWeight: '600' },
  label: { color: '#64748b', fontSize: 15 },
  value: { color: '#1e293b', fontWeight: 'bold', fontSize: 15, flex: 1, textAlign: 'right', marginLeft: 10 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#2ecc71' },
  infoText: { fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 18, marginTop: 15 },
  payBtn: { backgroundColor: '#3498db', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});