import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import ProductCard from '../components/ProductCard';
import { ALL_PRODUCTS } from '../constants/AllProducts'; // IMPORT THE BIG LIST

export default function SearchResults() {
  const { q } = useLocalSearchParams();

  // This filters based on the BIG list now
  const filteredProducts = ALL_PRODUCTS.filter(item => 
    item.title.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Results for "${q}"`, headerShown: true }} />
      
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <ProductCard item={item} fullWidth />
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No products found for "{q}"</Text>
          <Text style={{ color: '#888' }}>Try searching "Watch" or "Headphones"</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  list: { padding: 10 },
  cardContainer: { width: '48%', margin: '1%' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 }
});