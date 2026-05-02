import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db } from '../../config/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener: The UI will update automatically whenever Firestore changes
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(d => ({ 
        id: d.id, // This ID is critical for updateStatus
        ...d.data() 
      }));
      
      const visibleOrders = allOrders.filter(order => order.hiddenByAdmin !== true);
      setOrders(visibleOrders);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listen Error: ", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      // FIX 2: Explicit Document Reference
      const orderRef = doc(db, "orders", orderId);
      const updateData = { status: newStatus };
      
      if (newStatus === 'Delivered') {
        updateData.paymentStatus = 'paid';
      }

      await updateDoc(orderRef, updateData);
      Alert.alert("Success", `Order updated to ${newStatus}`);
    } catch (e) {
      console.error("Update Error:", e);
      Alert.alert("Error", "Could not update status. Check internet/permissions.");
    }
  };

  const confirmHide = (orderId) => {
    Alert.alert("Archive", "Hide this order from list?", [
      { text: "Cancel" },
      { text: "Hide", style: "destructive", onPress: async () => {
          await updateDoc(doc(db, "orders", orderId), { hiddenByAdmin: true });
      }}
    ]);
  };

  const renderOrderItem = ({ item }) => {
    const firstImg = item.items && item.items.length > 0 ? item.items[0].image : null;
    const isCOD = item.method === 'cod';

    return (
      <View style={styles.orderCard}>
        <View style={styles.mainInfo}>
          <Image source={{ uri: firstImg }} style={styles.prodImg} />
          <View style={styles.textDetails}>
            <View style={styles.rowBetween}>
              <Text style={styles.custName}>{item.customer?.name || "Guest"}</Text>
              <Text style={[styles.statusTxt, { color: item.status === 'active' ? '#f39c12' : '#2ecc71' }]}>
                ● {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.subText}>{item.customer?.phone}</Text>
            <Text style={styles.priceTxt}>Rs. {item.total || item.totalAmount}</Text>
            <View style={[styles.methodBadge, { backgroundColor: isCOD ? '#fff7ed' : '#f0fdf4' }]}>
                <Text style={[styles.methodText, { color: isCOD ? '#ea580c' : '#16a34a' }]}>
                  {isCOD ? "COD" : "CARD PAID"} ({item.paymentStatus})
                </Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.actionBar}>
          <TouchableOpacity style={[styles.actionBtn, styles.borderBlue]} onPress={() => updateStatus(item.id, 'Shipped')}>
            <Text style={styles.blueText}>Ship</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.borderGreen]} onPress={() => updateStatus(item.id, 'Delivered')}>
            <Text style={styles.greenText}>Deliver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.borderRed]} onPress={() => confirmHide(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Order Management</Text></View>
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={<Text style={styles.emptyLabel}>No active orders.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  orderCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
  mainInfo: { flexDirection: 'row', alignItems: 'center' },
  prodImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#f1f5f9' },
  textDetails: { flex: 1, marginLeft: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  custName: { fontSize: 16, fontWeight: 'bold' },
  statusTxt: { fontSize: 11, fontWeight: 'bold' },
  subText: { fontSize: 13, color: '#64748b' },
  priceTxt: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71', marginTop: 5 },
  methodBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  methodText: { fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  actionBar: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  borderBlue: { borderColor: '#3498db' },
  borderGreen: { borderColor: '#2ecc71' },
  borderRed: { borderColor: '#e74c3c', flex: 0.3 },
  blueText: { color: '#3498db', fontWeight: 'bold' },
  greenText: { color: '#2ecc71', fontWeight: 'bold' },
  emptyLabel: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});