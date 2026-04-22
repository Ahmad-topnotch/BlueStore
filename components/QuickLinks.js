import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const LINKS = [
  { id: '1', title: 'Mart', icon: 'https://img.icons8.com/color/96/shop.png' },
  { id: '2', title: 'Fashion', icon: 'https://img.icons8.com/color/96/clothes.png' },
  { id: '3', title: 'Beauty', icon: 'https://img.icons8.com/color/96/lipstick.png' },
  { id: '4', title: 'Home', icon: 'https://img.icons8.com/color/96/armchair.png' },
  { id: '5', title: 'Coins', icon: 'https://img.icons8.com/color/96/coins.png' },
];

export default function QuickLinks() {
  return (
    <View style={styles.container}>
      <FlatList
        data={LINKS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <View style={styles.iconCircle}>
              <Image source={{ uri: item.icon }} style={styles.icon} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 15,
  },
  list: {
    paddingHorizontal: 10,
  },
  item: {
    alignItems: 'center',
    width: 75,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 11,
    color: '#333',
  },
});