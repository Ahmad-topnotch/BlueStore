import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { db, auth } from '../../config/firebase'; 
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth'; 

export default function AccountScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const router = useRouter();

  // --- FIXED LOGOUT LOGIC ---
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          try {
            await signOut(auth);
            // Matches your folder: app/auth/login.js
            router.replace('/auth/login'); 
          } catch (error) {
            Alert.alert("Error", "Failed to sign out.");
          }
        } 
      }
    ]);
  };

  const fetchData = async (refresh = false) => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let displayName = user.displayName || "Guest User";
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        displayName = data.name || data.savedAddress?.name || displayName;
      }
      
      setUserData({ name: displayName, email: user.email });

      // INDEX FIX: Use a simple query to avoid the "Index Required" error
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      // JS FILTER: Filter out hidden orders locally
      const fetchedOrders = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(order => order.hiddenByUser !== true);

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching account data: ", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdminAccess = () => {
    router.push('/admin/login'); 
  };

  const deleteOrder = (orderId) => {
    Alert.alert(
      "Cancel Order",
      "Remove from history? (This will notify the store to cancel delivery)",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: async () => {
            try {
              // Hides order from user and updates status for Admin
              await updateDoc(doc(db, "orders", orderId), {
                hiddenByUser: true,
                status: "Cancelled by User" 
              });
              
              setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
            } catch (error) {
              Alert.alert("Error", "Could not remove order.");
            }
          } 
        }
      ]
    );
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{item.date || "Recently"}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.orderStatus, item.status === "Cancelled by User" && {color: '#e74c3c', backgroundColor: '#fff5f5'}]}>
            {item.status || "Pending"}
          </Text>
          <TouchableOpacity onPress={() => deleteOrder(item.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />
      {item.items && item.items.map((prod, index) => (
        <View key={index} style={styles.productRow}>
          <Image source={{ uri: prod.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{prod.title || prod.name}</Text>
            <View style={styles.qtyPriceRow}>
              <View style={styles.qtyBadge}><Text style={styles.qtyText}>x{prod.quantity || 1}</Text></View>
              <Text style={styles.productPrice}>Rs. {prod.price * (prod.quantity || 1)}</Text>
            </View>
          </View>
        </View>
      ))}
      <View style={styles.footerRow}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalAmount}>Rs. {item.totalAmount || item.total}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.profileHeader}>
        {/* Logout Button properly routed to /auth/login */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>

        <TouchableOpacity 
          onLongPress={handleAdminAccess} 
          delayLongPress={8000} 
          activeOpacity={0.7}
        >
          <Ionicons name="person-circle-outline" size={80} color="#3498db" />
        </TouchableOpacity>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>My Orders</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No order history found.</Text>}
          onRefresh={() => fetchData(true)}
          refreshing={isRefreshing}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  profileHeader: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', position: 'relative' },
  logoutBtn: { position: 'absolute', right: 20, top: 20, padding: 10 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginTop: 10 },
  userEmail: { color: '#64748b', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginTop: 20, color: '#1e293b' },
  orderCard: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderId: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  orderDate: { color: '#94a3b8', fontSize: 12 },
  orderStatus: { color: '#3498db', fontWeight: 'bold', fontSize: 12, backgroundColor: '#f0f9ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  deleteBtn: { padding: 5 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  productImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#f1f5f9' },
  productInfo: { flex: 1, marginLeft: 15 },
  productName: { fontSize: 15, fontWeight: '600', color: '#334155' },
  qtyPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 10 },
  qtyBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  qtyText: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  footerRow: { borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 5, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#64748b', fontSize: 14 },
  totalAmount: { color: '#2ecc71', fontWeight: 'bold', fontSize: 18 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});