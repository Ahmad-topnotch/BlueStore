import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import ProductCard from './ProductCard';
import { Colors } from '../constants/Colors';

// Mock Data for now
const FLASH_DATA = [
  { id: '1', price: '45,999', oldPrice: '60,000', discount: '23', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300' },
  { id: '2', price: '2,500', oldPrice: '5,000', discount: '50', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300' },
  { id: '3', price: '12,000', oldPrice: '15,000', discount: '20', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300' },
];

export default function FlashSale() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flash Sale</Text>
        <TouchableOpacity>
          <Text style={styles.shopMore}>SHOP MORE {'>'}</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={FLASH_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={styles.listPadding}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.darazOrange,
  },
  shopMore: {
    fontSize: 12,
    color: Colors.darazOrange,
    fontWeight: '600',
  },
  listPadding: {
    paddingLeft: 15,
  }
});