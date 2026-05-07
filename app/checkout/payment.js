
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db, auth } from '../../config/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCart } from '../../context/CartContext'; // Import Cart Context

export default function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { clearCart } = useCart(); // Destructure clearCart function
  const [loading, setLoading] = useState(true);
  const [paymentReady, setPaymentReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (params.method === 'card') {
      initializePaymentSheet();
    } else {
      setLoading(false);
      setPaymentReady(true); 
    }
  }, []);

  const initializePaymentSheet = async () => {
    try {
      const amountInCents = Math.round(parseFloat(params.totalAmount || "0") * 100);
      const localUrl = 'http://192.168.1.67/database-336c3/us-central1/createPaymentIntent';
      
      const response = await fetch(localUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInCents, currency: 'pkr' }),
      });
      const { paymentIntent, customer, ephemeralKey } = await response.json();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "BlueStore",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: { name: params.name },
      });

      if (!error) setPaymentReady(true);
    } catch (e) {
      Alert.alert("Error", "Payment system offline.");
    } finally { setLoading(false); }
  };

  const handleOrderPlacement = async () => {
    setIsProcessing(true);

    if (params.method === 'card') {
      const { error } = await presentPaymentSheet();
      if (error) {
        Alert.alert(`Error`, error.message);
        setIsProcessing(false);
        return;
      }
    }

    const saved = await saveOrderToFirestore();
    if (saved) {
      clearCart(); // <--- FIX 1: CLEAR CART AFTER SUCCESS
      Alert.alert('Success', 'Order placed successfully!');
      router.replace('/(tabs)/account');
    } else {
      Alert.alert('Error', 'Failed to record order.');
      setIsProcessing(false);
    }
  };

  const saveOrderToFirestore = async () => {
    try {
      const user = auth.currentUser;
      const orderItems = params.cartItems ? JSON.parse(params.cartItems) : [];

      await addDoc(collection(db, "orders"), {
        userId: user?.uid || "guest",
        customer: {
          name: params.name,
          phone: params.phone,
          address: params.address,
          email: user?.email || "No Email",
        },
        total: params.totalAmount,
        method: params.method, 
        status: "active",
        items: orderItems,
        createdAt: serverTimestamp(),
        paymentStatus: params.method === 'card' ? "paid" : "unpaid",
        hiddenByAdmin: false
      });
      return true;
    } catch (err) { 
      console.error("Firestore Save Error:", err);
      return false; 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Final Step</Text>
        <View style={styles.card}>
            <Text style={styles.subHeader}>Total to Pay</Text>
            <Text style={styles.amountText}>Rs. {params.totalAmount}</Text>
            <Text style={styles.methodLabel}>Method: {params.method?.toUpperCase()}</Text>
        </View>

        {loading || isProcessing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loaderSub}>{isProcessing ? "Finalizing Order..." : "Loading Payment..."}</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.btn, !paymentReady && styles.btnDisabled]} 
            onPress={handleOrderPlacement}
            disabled={!paymentReady}
          >
            <Text style={styles.btnText}>
              {params.method === 'card' ? "Pay & Place Order" : "Confirm Order"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 40, elevation: 2 },
  subHeader: { fontSize: 14, color: '#64748b' },
  amountText: { fontSize: 36, fontWeight: 'bold', color: '#1e293b', marginVertical: 10 },
  methodLabel: { fontSize: 12, color: '#3498db', fontWeight: 'bold', textTransform: 'uppercase' },
  loaderContainer: { alignItems: 'center' },
  loaderSub: { marginTop: 10, color: '#64748b' },
  btn: { backgroundColor: '#3498db', padding: 20, borderRadius: 15, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#cbd5e1' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});