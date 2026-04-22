import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function DeliveredHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "==", "Delivered"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivered Records</Text>
      <FlatList
        data={history}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.id}>ID: {item.id.slice(-6)}</Text>
              <Text>Total: Rs. {item.totalAmount}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteDoc(doc(db, "orders", item.id))}>
              <Ionicons name="trash-outline" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2ecc71' },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 10, alignItems: 'center' },
  id: { fontWeight: 'bold' }
});