import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext'; // Use Context instead of local state
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { cartItems, removeFromCart, totalPrice } = useCart();
  const router = useRouter();

  // --- THE CHECKOUT LOGIC ---
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Add some products before checking out!");
      return;
    }
    // Navigates to checkout where the order document will be created with hidden flags
    router.push('/checkout');
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartCard}>
      <Image source={{ uri: item.image }} style={styles.itemImg} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title || item.name}</Text>
        
        {/* Price and Quantity Row */}
        <View style={styles.priceQtyRow}>
          <Text style={styles.itemPrice}>Rs. {item.price}</Text>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>x{item.quantity}</Text>
          </View>
        </View>

        {/* Subtotal for this item */}
        <Text style={styles.itemSubtotal}>Total: Rs. {item.price * item.quantity}</Text>
      </View>

      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Shopping Cart</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity 
              style={styles.shopBtn} 
              onPress={() => router.push('/')}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalPrice}>Rs. {totalPrice.toLocaleString()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginLeft: 10}} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    paddingTop: 20, 
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
  itemImg: { width: 75, height: 75, borderRadius: 12, backgroundColor: '#f1f5f9' },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#334155' },
  priceQtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#64748b' },
  qtyBadge: { backgroundColor: '#f0f9ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  qtyText: { fontSize: 12, fontWeight: 'bold', color: '#3498db' },
  itemSubtotal: { fontSize: 14, fontWeight: 'bold', color: '#2ecc71', marginTop: 5 },
  removeBtn: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, color: '#94a3b8', marginTop: 10 },
  shopBtn: { marginTop: 20, backgroundColor: '#3498db', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 10 },
  shopBtnText: { color: '#fff', fontWeight: 'bold' },
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
    flexDirection: 'row',
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    height: 60, 
    justifyContent: 'center' 
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});