import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct(snap.data());
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const addToCart = async (goToCart = false) => {
    try {
      await addDoc(collection(db, "cart"), {
        ...product,
        productId: id,
        addedAt: new Date()
      });
      
      if (goToCart) {
        router.push('/cart');
      } else {
        Alert.alert("Success", "Added to cart!");
      }
    } catch (e) {
      Alert.alert("Error", "Could not add to cart");
    }
  };

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" color="#3498db" />;

  return (
    <View style={styles.container}>
      <ScrollView>
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
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BUTTONS */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart(false)}>
          <Ionicons name="cart-outline" size={20} color="#3498db" />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn} onPress={() => addToCart(true)}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 350, resizeMode: 'cover' },
  info: { padding: 20 },
  category: { color: '#3498db', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginTop: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#2ecc71' },
  oldPrice: { fontSize: 16, color: '#94a3b8', textDecorationLine: 'line-through', marginLeft: 10 },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, color: '#2c3e50' },
  description: { fontSize: 15, color: '#5a7184', marginTop: 10, lineHeight: 22 },
  
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