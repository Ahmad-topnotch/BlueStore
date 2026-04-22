import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { db } from '../../config/firebase';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = (id) => {
    Alert.alert("Delete Product", "Are you sure? This cannot be undone.", [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => await deleteDoc(doc(db, "products", id)) }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory Management</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color="#3498db" style={{marginTop: 50}} /> : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemPrice}>Now: Rs. {item.price}</Text>
                {item.discountPercentage > 0 && (
                  <Text style={styles.discountLabel}>Discount: {item.discountPercentage}%</Text>
                )}
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.editBtn} 
                  onPress={() => router.push({ pathname: "/admin/edit-product", params: { id: item.id } })}
                >
                  <Ionicons name="pencil" size={20} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', margin: 10, borderRadius: 12, padding: 10, alignItems: 'center', elevation: 2 },
  itemImg: { width: 60, height: 60, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  itemPrice: { fontSize: 13, color: '#2ecc71', marginTop: 2 },
  discountLabel: { fontSize: 11, color: '#e74c3c', fontWeight: '600' },
  actions: { flexDirection: 'row' },
  editBtn: { padding: 10, backgroundColor: '#f0f7ff', borderRadius: 8, marginRight: 8 },
  deleteBtn: { padding: 10, backgroundColor: '#fff5f5', borderRadius: 8 }
});