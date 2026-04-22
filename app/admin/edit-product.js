import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Gets the Product ID from the URL
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [description, setDescription] = useState('');
  const [actualPrice, setActualPrice] = useState(''); 
  const [discountPercent, setDiscountPercent] = useState(''); 

  // 1. Fetch current product data when screen opens
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title);
          setCategory(data.category || '');
          setImgUrl(data.image);
          setDescription(data.description || '');
          setActualPrice(data.actualPrice.toString());
          setDiscountPercent(data.discountPercentage ? data.discountPercentage.toString() : '0');
        }
      } catch (e) {
        Alert.alert("Error", "Could not load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. Update logic
  const handleUpdate = async () => {
    if (!title || !actualPrice) {
      Alert.alert("Error", "Name and Price are required!");
      return;
    }

    setUpdating(true);
    const originalPrice = parseFloat(actualPrice);
    const discount = discountPercent ? parseFloat(discountPercent) : 0;
    const salePrice = originalPrice - (originalPrice * (discount / 100));

    try {
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        title,
        category: category.trim(),
        image: imgUrl.trim(),
        description,
        actualPrice: originalPrice,
        discountPercentage: discount,
        price: Math.round(salePrice), // Recalculated final price
      });
      
      Alert.alert("Success", "Product updated!");
      router.back();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Category</Text>
        <TextInput style={styles.input} value={category} onChangeText={setCategory} />

        <Text style={styles.label}>Image URL</Text>
        <TextInput style={styles.input} value={imgUrl} onChangeText={setImgUrl} />

        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Actual Price (Rs.)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={actualPrice} onChangeText={setActualPrice} />
          </View>
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.label}>Discount (%)</Text>
            <TextInput style={styles.input} placeholder="Set to 0 to remove" keyboardType="numeric" value={discountPercent} onChangeText={setDiscountPercent} />
          </View>
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          multiline value={description} 
          onChangeText={setDescription} 
        />

        <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={updating}>
          {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  btn: { backgroundColor: '#2ecc71', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});