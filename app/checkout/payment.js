import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db, auth } from '../../config/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const { name, phone, address, paymentMethod } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const completeOrder = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Error", "Login required");

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

      // 1. PLACE THE ORDER (Including Payment Method)
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        customer: { name, phone, address },
        paymentMethod: paymentMethod,
        items: items,
        totalAmount: total,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      // 2. SAVE USER SHIPPING ADDRESS
      await setDoc(doc(db, "users", user.uid), {
        savedAddress: { name, phone, address, updatedAt: serverTimestamp() }
      }, { merge: true });

      // 3. CLEAR CART
      for (const item of cartSnap.docs) await deleteDoc(doc(db, "cart", item.id));

      Alert.alert("Success", "Your order is on the way!", [
        { text: "View My Orders", onPress: () => router.replace('/account') }
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="document-text-outline" size={50} color="#3498db" style={{alignSelf: 'center'}} />
        <Text style={styles.title}>Order Summary</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Ship to:</Text>
          <Text style={styles.value}>{name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment:</Text>
          <Text style={styles.value}>{paymentMethod}</Text>
        </View>

        <View style={styles.divider} />
        
        <Text style={styles.infoText}>By clicking below, you agree to our terms of service and delivery policy.</Text>
      </View>
      
      <TouchableOpacity style={styles.payBtn} onPress={completeOrder} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Place Order Now</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc', justifyContent: 'center' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#1e293b' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#64748b', fontSize: 15 },
  value: { color: '#1e293b', fontWeight: 'bold', fontSize: 15, flex: 1, textAlign: 'right', marginLeft: 10 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
  infoText: { fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 18 },
  payBtn: { backgroundColor: '#3498db', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});