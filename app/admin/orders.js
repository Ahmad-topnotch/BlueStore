import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { db } from '../../config/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      Alert.alert("Success", `Order status: ${newStatus}`);
    } catch (e) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const confirmDelete = (orderId) => {
    Alert.alert("Delete Order", "Permanently remove this record?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await deleteDoc(doc(db, "orders", orderId)) }
    ]);
  };

  const renderOrderItem = ({ item }) => {
    const firstImg = item.items && item.items.length > 0 ? item.items[0].image : null;
    
    // --- SMART PRICE CALCULATION ---
    // Checks totalPrice, then total, then sums up item prices if others are missing
    const displayPrice = item.totalPrice || item.total || 
      item.items?.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

    return (
      <View style={styles.orderCard}>
        <View style={styles.mainInfo}>
          <Image source={{ uri: firstImg }} style={styles.prodImg} />
          <View style={styles.textDetails}>
            <View style={styles.rowBetween}>
              <Text style={styles.custName}>{item.customer?.name || "No Name"}</Text>
              <Text style={[styles.statusTxt, 
                { color: item.status === 'Delivered' ? '#2ecc71' : item.status === 'Shipped' ? '#3498db' : '#f39c12' }
              ]}>
                ● {item.status || 'Pending'}
              </Text>
            </View>
            
            <Text style={styles.subText}>{item.customer?.phone}</Text>
            <Text style={styles.subText} numberOfLines={1}>{item.customer?.address}</Text>
            
            {/* Displaying the Fixed Price Line */}
            <Text style={styles.priceTxt}>Amount: Rs. {displayPrice}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.borderBlue]} 
            onPress={() => updateStatus(item.id, 'Shipped')}
          >
            <Ionicons name="airplane-outline" size={18} color="#3498db" />
            <Text style={[styles.btnLabel, { color: '#3498db' }]}>Ship</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.borderGreen]} 
            onPress={() => updateStatus(item.id, 'Delivered')}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#2ecc71" />
            <Text style={[styles.btnLabel, { color: '#2ecc71' }]}>Deliver</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.borderRed]} 
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#e74c3c" />
            <Text style={[styles.btnLabel, { color: '#e74c3c' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Order Management</Text></View>
      {loading ? <ActivityIndicator size="large" color="#3498db" style={{marginTop: 50}} /> : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  orderCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
  mainInfo: { flexDirection: 'row', alignItems: 'center' },
  prodImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#f1f5f9' },
  textDetails: { flex: 1, marginLeft: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  custName: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  statusTxt: { fontSize: 11, fontWeight: 'bold' },
  subText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  priceTxt: { fontSize: 15, fontWeight: 'bold', color: '#2ecc71', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  actionBar: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  btnLabel: { fontSize: 13, fontWeight: 'bold', marginLeft: 5 },
  borderBlue: { borderColor: '#3498db', backgroundColor: '#f0f9ff' },
  borderGreen: { borderColor: '#2ecc71', backgroundColor: '#f0fdf4' },
  borderRed: { borderColor: '#e74c3c', backgroundColor: '#fff5f5' }
});