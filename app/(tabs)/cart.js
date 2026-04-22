import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { db } from '../../config/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Live listener for cart items
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        cartId: doc.id, 
        ...doc.data()
      }));
      setCartItems(items);

      // 2. Calculate Total (Ensuring numbers are treated as numbers)
      const sum = items.reduce((acc, item) => {
        const itemPrice = Number(item.price) || 0; 
        return acc + itemPrice;
      }, 0);

      setTotal(sum);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const removeItem = async (cartId) => {
    try {
      await deleteDoc(doc(db, "cart", cartId));
    } catch (e) {
      Alert.alert("Error", "Could not remove item");
    }
  };

  // --- THE NEW CHECKOUT LOGIC ---
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Add some products before checking out!");
      return;
    }
    // Navigate to the checkout folder (app/checkout/index.js)
    router.push('/checkout');
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartCard}>
      <Image source={{ uri: item.image }} style={styles.itemImg} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemPrice}>Rs. {item.price}</Text>
        {item.discountPercentage > 0 && (
          <Text style={styles.savedText}>Saved {item.discountPercentage}%</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => removeItem(item.cartId)} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Shopping Cart</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.cartId}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalPrice}>Rs. {total.toLocaleString()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  cartCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 12, 
    marginBottom: 15, 
    alignItems: 'center', 
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  itemImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#f1f5f9' },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#334155' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71', marginTop: 4 },
  savedText: { fontSize: 11, color: '#e74c3c', fontWeight: 'bold', marginTop: 2 },
  removeBtn: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, color: '#94a3b8', marginTop: 10 },
  footer: { 
    backgroundColor: '#fff', 
    padding: 25, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 10
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 16, color: '#64748b' },
  totalPrice: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  checkoutBtn: { 
    backgroundColor: '#3498db', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    height: 60, 
    justifyContent: 'center' 
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});