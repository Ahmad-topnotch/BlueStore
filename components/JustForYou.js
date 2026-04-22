import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import ProductCard from './ProductCard';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const columnWidth = (width - 40) / 2; // Subtracting padding and gaps

const PRODUCTS = [
  { id: '101', price: '1,500', oldPrice: '2,000', discount: '25', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400', title: 'Red Nike Shoes' },
  { id: '102', price: '850', oldPrice: '1,200', discount: '30', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400', title: 'Luxury Watch' },
  { id: '103', price: '12,000', oldPrice: '18,000', discount: '33', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400', title: 'Premium Headphones' },
  { id: '104', price: '3,200', oldPrice: '4,500', discount: '28', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400', title: 'Stylish Sunglasses' },
  { id: '105', price: '999', oldPrice: '1,500', discount: '33', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400', title: 'Vintage Camera' },
  { id: '106', price: '2,100', oldPrice: '3,000', discount: '30', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400', title: 'Gaming Headset' },
];

export default function JustForYou() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Just For You</Text>
      
      <View style={styles.grid}>
        {PRODUCTS.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <ProductCard item={item} fullWidth />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    paddingLeft: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '49%', // Two columns with a small gap
    marginBottom: 10,
  }
});