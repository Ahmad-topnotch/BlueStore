import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext'; 

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart: addToCartContext } = useCart(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); 

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct({ ...snap.data(), id: snap.id });
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = (goToCart = false) => {
    try {
      addToCartContext(product, quantity);
      if (goToCart) {
        router.push('/cart');
      } else {
        Alert.alert("Success", `Added ${quantity} item(s) to cart!`);
      }
    } catch (e) {
      Alert.alert("Error", "Could not add to cart");
    }
  };

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" color="#3498db" />;

  return (
    <SafeAreaView style={styles.container}>
      {/* --- CUSTOM BACK BUTTON --- */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.title}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs. {product.price}</Text>
            {product.discountPercentage > 0 && (
              <Text style={styles.oldPrice}>Rs. {product.actualPrice}</Text>
            )}
          </View>
          
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityPicker}>
              <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQty}>
                <Ionicons name="remove" size={20} color="#3498db" />
              </TouchableOpacity>
              
              <Text style={styles.qtyNumber}>{quantity}</Text>

              <TouchableOpacity style={styles.qtyBtn} onPress={increaseQty}>
                <Ionicons name="add" size={20} color="#3498db" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} onPress={() => handleAddToCart(false)}>
          <Ionicons name="cart-outline" size={20} color="#3498db" />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn} onPress={() => handleAddToCart(true)}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  // BACK BUTTON STYLE
  backButton: {
    position: 'absolute',
    top: 50, 
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: { width: '100%', height: 350, resizeMode: 'cover' },
  info: { padding: 20 },
  category: { color: '#3498db', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginTop: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#2ecc71' },
  oldPrice: { fontSize: 16, color: '#94a3b8', textDecorationLine: 'line-through', marginLeft: 10 },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, color: '#2c3e50' },
  description: { fontSize: 15, color: '#5a7184', marginTop: 10, lineHeight: 22 },
  
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 15,
  },
  quantityLabel: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  quantityPicker: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  qtyBtn: { 
    width: 35, 
    height: 35, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  qtyNumber: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', minWidth: 20, textAlign: 'center' },

  bottomBar: { 
    flexDirection: 'row', 
    padding: 15, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
    gap: 10
  },
  cartBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    borderWidth: 1, 
    borderColor: '#3498db', 
    borderRadius: 12, 
    height: 55, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  cartBtnText: { color: '#3498db', fontWeight: 'bold', marginLeft: 8 },
  buyBtn: { 
    flex: 1, 
    backgroundColor: '#3498db', 
    borderRadius: 12, 
    height: 55, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});