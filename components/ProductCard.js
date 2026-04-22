import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2; // Matches your original spacing logic

export default function ProductCard({ item }) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: `/product/${item.id}`, 
      params: { 
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        discount: item.discount,
        description: item.description 
      }
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>Rs. {Number(item.price).toLocaleString()}</Text>
          {item.discount > 0 && (
            <Text style={styles.discountTag}>-{item.discount}%</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    width: cardWidth, 
    borderRadius: 8, 
    marginBottom: 12, 
    elevation: 2, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { 
    width: '100%', 
    height: 160, // Fixed height for consistency
    resizeMode: 'cover' 
  },
  info: { 
    padding: 8 
  },
  title: { 
    fontSize: 12, 
    color: '#333', 
    height: 32,
    lineHeight: 16
  },
  priceContainer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  price: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: Colors.darazOrange 
  },
  discountTag: { 
    color: '#ff4d4d', 
    fontSize: 10, 
    fontWeight: 'bold'
  }
});