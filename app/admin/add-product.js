import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [description, setDescription] = useState('');
  const [actualPrice, setActualPrice] = useState(''); 
  const [discountPercent, setDiscountPercent] = useState(''); 

  const handleSave = async () => {
    // Basic Validation
    if (!title || !category || !imgUrl || !actualPrice) {
      Alert.alert("Error", "Please fill in all required fields (Name, Category, Image, and Price)");
      return;
    }

    setLoading(true);

    // Calculate the Sale Price based on percentage
    const originalPrice = parseFloat(actualPrice);
    const discount = discountPercent ? parseFloat(discountPercent) : 0;
    const salePrice = originalPrice - (originalPrice * (discount / 100));

    try {
      await addDoc(collection(db, "products"), {
        title,
        category: category.trim(),
        image: imgUrl.trim(),
        description,
        actualPrice: originalPrice,
        discountPercentage: discount,
        price: Math.round(salePrice), // This is the final price users pay
        createdAt: serverTimestamp(),
      });
      
      Alert.alert("Success", "Product listed successfully!");
      router.back();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
      </View>

      <View style={styles.form}>
        {/* Product Name */}
        <Text style={styles.label}>Product Name *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Samsung Galaxy S23" 
          value={title} 
          onChangeText={setTitle} 
        />

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Electronics, Fashion, Home" 
          value={category} 
          onChangeText={setCategory} 
        />

        {/* Image URL */}
        <Text style={styles.label}>Direct Image URL (PostImages/ImgBB) *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="https://i.postimg.cc/..." 
          value={imgUrl} 
          onChangeText={setImgUrl} 
        />

        {/* Pricing Row */}
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Actual Price (Rs.) *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="1000" 
              keyboardType="numeric" 
              value={actualPrice} 
              onChangeText={setActualPrice} 
            />
          </View>
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.label}>Discount (%)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="10" 
              keyboardType="numeric" 
              value={discountPercent} 
              onChangeText={setDiscountPercent} 
            />
          </View>
        </View>

        {/* Description */}
        <Text style={styles.label}>Product Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Enter detailed specifications and features..." 
          multiline 
          numberOfLines={5}
          value={description} 
          onChangeText={setDescription} 
        />

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.btn, loading && {backgroundColor: '#94a3b8'}]} 
          onPress={handleSave} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{marginRight: 10}} />
              <Text style={styles.btnText}>Add Product to Store</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: '#1e293b' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  input: { 
    backgroundColor: '#f8fafc', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    color: '#1e293b'
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  btn: { 
    backgroundColor: '#3498db', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center',
    marginTop: 10,
    elevation: 4
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});