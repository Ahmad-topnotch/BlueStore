import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Modal,
  SafeAreaView, FlatList, ActivityIndicator, TextInput, Vibration, Image 
} from 'react-native';
import { auth, db } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const user = auth.currentUser;
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleAdminAuth = () => {
    if (adminPass === "admin123") {
      setModalVisible(false);
      setAdminPass('');
      // Navigating to app/admin/dashboard.js
      router.push('/admin/dashboard'); 
    } else {
      Alert.alert("Access Denied", "Incorrect Password");
      setAdminPass('');
    }
  };

  const deleteOrder = (orderId) => {
    Alert.alert("Cancel Order", "Delete this order?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: async () => await deleteDoc(doc(db, "orders", orderId)) }
    ]);
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Image 
        source={{ uri: item.items?.[0]?.image || 'https://via.placeholder.com/150' }} 
        style={styles.orderImage} 
      />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
        <Text style={[styles.orderStatus, { color: item.status === 'Delivered' ? '#2ecc71' : '#f39c12' }]}>
          ● {item.status || 'Pending'}
        </Text>
        <Text style={styles.orderTotal}>Rs. {item.totalAmount || item.total}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteOrder(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        onLongPress={() => { Vibration.vibrate(100); setModalVisible(true); }} 
        delayLongPress={3000} 
        activeOpacity={1}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'A'}</Text>
          </View>
          <Text style={styles.nameText}>{user?.displayName || "Ahmad"}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>My Orders</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          <FlatList 
            data={orders} 
            keyExtractor={item => item.id} 
            renderItem={renderOrderItem} 
            ListEmptyComponent={<Text style={styles.emptyTxt}>No orders yet.</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut(auth)}>
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="shield-checkmark" size={40} color="#3498db" style={{marginBottom: 10}}/>
            <Text style={styles.modalTitle}>Admin Access</Text>
            <TextInput 
              style={styles.modalInput} 
              placeholder="Password" 
              secureTextEntry 
              value={adminPass} 
              onChangeText={setAdminPass} 
              autoFocus 
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{color: '#64748b'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdminAuth} style={styles.confirmBtn}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderBottomRightRadius: 30, borderBottomLeftRadius: 30, elevation: 3 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  nameText: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  emailText: { fontSize: 13, color: '#94a3b8' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  orderImage: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#f1f5f9' },
  orderId: { fontWeight: 'bold', fontSize: 14, color: '#1e293b' },
  orderStatus: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  orderTotal: { fontSize: 15, fontWeight: 'bold', color: '#2ecc71', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoutText: { marginLeft: 10, color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', padding: 25, borderRadius: 25, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#1e293b' },
  modalInput: { width: '100%', backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, marginBottom: 20, textAlign: 'center', fontSize: 16 },
  modalButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, alignItems: 'center', padding: 12 },
  confirmBtn: { flex: 1, backgroundColor: '#3498db', alignItems: 'center', padding: 12, borderRadius: 12 },
  emptyTxt: { textAlign: 'center', color: '#94a3b8', marginTop: 40 }
});