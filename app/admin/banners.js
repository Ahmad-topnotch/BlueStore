import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, Image, Alert, ActivityIndicator 
} from 'react-native';
import { db } from '../../config/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ManageBanners() {
  const [bannerUrl, setBannerUrl] = useState('');
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 1. Fetch Banners
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "banners"), (snapshot) => {
      setBanners(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 2. Add New Banner
  const handleAddBanner = async () => {
    if (!bannerUrl.trim()) {
      Alert.alert("Error", "Please enter a valid Image URL");
      return;
    }

    setUploading(true);
    try {
      await addDoc(collection(db, "banners"), {
        imageUrl: bannerUrl.trim(),
        createdAt: serverTimestamp()
      });
      setBannerUrl('');
      Alert.alert("Success", "Banner added successfully!");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Delete Banner
  const handleDelete = (id) => {
    Alert.alert("Delete", "Remove this banner?", [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: () => deleteDoc(doc(db, "banners", id)) }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Home Banners</Text>

      {/* Input Section */}
      <View style={styles.inputCard}>
        <TextInput 
          style={styles.input}
          placeholder="Paste Banner Image URL here..."
          value={bannerUrl}
          onChangeText={setBannerUrl}
        />
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={handleAddBanner}
          disabled={uploading}
        >
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add Banner</Text>}
        </TouchableOpacity>
      </View>

      {/* List Section */}
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        <FlatList
          data={banners}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.bannerCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.bannerImg} />
              <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No banners found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  inputCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 3, marginBottom: 25 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10, marginBottom: 10 },
  addBtn: { backgroundColor: '#3498db', padding: 15, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  bannerCard: { marginBottom: 15, borderRadius: 15, overflow: 'hidden', elevation: 4, position: 'relative' },
  bannerImg: { width: '100%', height: 150, resizeMode: 'cover' },
  deleteIcon: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(231, 76, 60, 0.8)', padding: 8, borderRadius: 20 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 20 }
});