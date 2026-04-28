import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../../config/firebase';
// Replaced deleteDoc with updateDoc
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function DeliveredHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // LOGIC CHANGE: Only show Delivered items that the Admin hasn't hidden
    const q = query(
      collection(db, "orders"), 
      where("status", "==", "Delivered"),
      where("hiddenByAdmin", "!=", true)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  // --- UPDATED DELETION LOGIC (DECOUPLED) ---
  const handleHideHistory = (orderId) => {
    Alert.alert(
      "Clear Record", 
      "Hide this from your history? The user will still see it in their account.", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Hide", 
          style: "destructive", 
          onPress: async () => {
            try {
              await updateDoc(doc(db, "orders", orderId), { 
                hiddenByAdmin: true 
              });
            } catch (error) {
              Alert.alert("Error", "Failed to hide record.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivered Records</Text>
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.id}>ID: {item.id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.amount}>Total: Rs. {item.totalAmount || item.total}</Text>
              <Text style={styles.dateText}>{item.date || "Delivered Successfully"}</Text>
            </View>
            <TouchableOpacity onPress={() => handleHideHistory(item.id)}>
              <Ionicons name="trash-outline" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No delivered records found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2ecc71' },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2 },
  id: { fontWeight: 'bold', color: '#1e293b', fontSize: 16 },
  amount: { color: '#2ecc71', fontWeight: 'bold', marginTop: 4 },
  dateText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});