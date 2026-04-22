import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Image, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Fetch Banners from Firebase
  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs.map(doc => doc.data().imageUrl);
      setBanners(images);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Auto-scroll Logic
  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        let nextIndex = active === banners.length - 1 ? 0 : active + 1;
        setActive(nextIndex);
        scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [active, banners]);

  if (loading) return <View style={styles.loader}><ActivityIndicator color="#f85606" /></View>;
  if (banners.length === 0) return null; // Don't show anything if no banners exist

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActive(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {banners.map((url, index) => (
          <Image key={index} source={{ uri: url }} style={styles.image} />
        ))}
      </ScrollView>
      
      <View style={styles.pagination}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, { opacity: i === active ? 1 : 0.4 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 160, width: width, backgroundColor: '#f0f0f0' },
  loader: { height: 160, justifyContent: 'center', alignItems: 'center' },
  image: { width: width, height: 160, resizeMode: 'stretch' },
  pagination: { position: 'absolute', bottom: 8, flexDirection: 'row', alignSelf: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginHorizontal: 3 },
});