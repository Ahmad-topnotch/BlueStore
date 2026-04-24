import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Dimensions 
} from 'react-native';
import { db } from '../../config/firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar'; // Required to control battery/clock visibility

const { width } = Dimensions.get('window');
const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Health', 'Home', 'Gadgets', 'Groceries'];

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const stepCarousel = useRef(null);
  const router = useRouter();

  // Search logic remains in its own function as you had it
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(item => 
        item.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    if (banners.length > 0) {
      let index = 0;
      let slider = setInterval(() => {
        index = (index + 1) % banners.length;
        stepCarousel.current?.scrollTo({ x: index * width, animated: true });
      }, 3000);
      return () => clearInterval(slider);
    }
  }, [banners]);

  useEffect(() => {
    const unsubBanners = onSnapshot(collection(db, "banners"), (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    if (selectedCategory !== 'All') {
      q = query(collection(db, "products"), where("category", "==", selectedCategory));
    }

    const unsubProd = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(data);
      setFilteredProducts(data); 
      setLoading(false);
    });

    return () => { unsubBanners(); unsubProd(); };
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      {/* FIX: This makes the battery and clock icons (dark) visible on light background */}
      <StatusBar style="dark" />

      {/* --- BRANDING SECTION --- */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandName}>BlueStore</Text>
            <Text style={styles.brandTagline}>Quality you can trust</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color="#3498db" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#3498db" />
          <TextInput 
            placeholder="Search products..." 
            style={styles.searchInput} 
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#a0aec0"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView 
          ref={stepCarousel} horizontal pagingEnabled 
          showsHorizontalScrollIndicator={false} style={styles.bannerContainer}
        >
          {banners.map((b) => (
            <Image key={b.id} source={{ uri: b.imageUrl }} style={styles.bannerImage} />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryChip, selectedCategory === cat && styles.activeChip]}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.activeCatText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          {searchQuery ? `Results for "${searchQuery}"` : 'Recommended for You'}
        </Text>

        {loading ? <ActivityIndicator color="#3498db" size="large" style={{marginTop: 20}} /> : (
          <FlatList
            data={filteredProducts}
            scrollEnabled={false}
            numColumns={2}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.card} 
                onPress={() => router.push({ 
                  pathname: "/product/[id]", 
                  params: { id: item.id } 
                })}
              >
                {item.discountPercentage > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                  </View>
                )}

                <Image source={{ uri: item.image }} style={styles.cardImg} />
                <View style={styles.cardInfo}>
                  <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.cardPrice}>Rs. {item.price}</Text>
                    {item.discountPercentage > 0 && (
                      <Text style={styles.actualPrice}>Rs. {item.actualPrice}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No products found matching your search.</Text>
            }
          />
        )}
        <View style={{height: 100}} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  // FIX: Background changed to theme color, border removed to blend perfectly
  header: { 
    paddingTop: 60, // Increased to avoid overlapping with battery/clock
    paddingBottom: 15, 
    paddingHorizontal: 15, 
    backgroundColor: '#f0f7ff', 
    borderBottomWidth: 0 
  },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  brandName: { fontSize: 28, fontWeight: '900', color: '#3498db', letterSpacing: -1 },
  brandTagline: { fontSize: 11, color: '#94a3b8', marginTop: -4, fontWeight: '600' },
  notifBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 48, alignItems: 'center' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#2c3e50' },
  bannerContainer: { height: 180, marginTop: 15 },
  bannerImage: { width: width - 30, height: 180, marginHorizontal: 15, borderRadius: 15, resizeMode: 'cover' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 15, color: '#2c3e50' },
  catScroll: { paddingLeft: 15 },
  categoryChip: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#d1e9ff' },
  activeChip: { backgroundColor: '#3498db', borderColor: '#3498db' },
  catText: { color: '#5a7184' },
  activeCatText: { color: '#fff', fontWeight: 'bold' },
  card: { flex: 1, backgroundColor: '#fff', margin: 6, borderRadius: 12, overflow: 'hidden', elevation: 3, position: 'relative' },
  cardImg: { width: '100%', height: 145 },
  cardInfo: { padding: 10 }, 
  cardTitle: { fontSize: 13, color: '#333', height: 36, marginBottom: 4 }, 
  priceContainer: { flexDirection: 'column', justifyContent: 'flex-start' },
  cardPrice: { fontSize: 15, fontWeight: 'bold', color: '#2ecc71' },
  actualPrice: { fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#e74c3c', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 1 },
  discountText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8', fontSize: 15 }
});