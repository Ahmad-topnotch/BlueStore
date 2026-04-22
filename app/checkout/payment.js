import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db, auth } from '../../config/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function PaymentScreen() {
  const { name, phone, address } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const completeOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to order.");
      return;
    }

    setLoading(true);
    try {
      const cartSnap = await getDocs(collection(db, "cart"));
      const items = cartSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (items.length === 0) {
        Alert.alert("Error", "Cart is empty.");
        setLoading(false);
        return;
      }

      const total = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

      // Save order with userId link
      await addDoc(collection(db, "orders"), {
        userId: user.uid, // This allows the Account screen to filter orders
        customer: { name, phone, address },
        items: items,
        totalAmount: total,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      // Clear Cart
      for (const item of cartSnap.docs) {
        await deleteDoc(doc(db, "cart", item.id));
      }

      Alert.alert("Success", "Your order has been placed!", [
        { text: "View Orders", onPress: () => router.replace('/(tabs)/account') }
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      <Text style={styles.sub}>Order for: {name}</Text>
      
      <TouchableOpacity 
        style={styles.payBtn} 
        onPress={completeOrder}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Cash on Delivery</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  sub: { textAlign: 'center', color: '#64748b', marginBottom: 40, marginTop: 5 },
  payBtn: { backgroundColor: '#3498db', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 4 },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 }
});