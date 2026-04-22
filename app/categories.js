import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/CategoriesData';
import { Colors } from '../constants/Colors';

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  return (
    <View style={styles.container}>
      {/* Sidebar - Left */}
      <View style={styles.sidebar}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.sideItem,
                selectedCategory.id === item.id && styles.activeSideItem
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Ionicons 
                name={item.icon} 
                size={20} 
                color={selectedCategory.id === item.id ? Colors.darazOrange : '#666'} 
              />
              <Text style={[
                styles.sideText,
                selectedCategory.id === item.id && styles.activeSideText
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Main Content - Right */}
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>{selectedCategory.name}</Text>
        <View style={styles.grid}>
          {selectedCategory.subCategories.map((sub) => (
            <TouchableOpacity key={sub.id} style={styles.subCard}>
              <Image source={{ uri: sub.image }} style={styles.subImage} />
              <Text style={styles.subText}>{sub.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', paddingTop: 40 },
  sidebar: { width: 100, backgroundColor: '#f8f8f8', borderRightWidth: 1, borderRightColor: '#eee' },
  sideItem: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  activeSideItem: { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: Colors.darazOrange },
  sideText: { fontSize: 11, color: '#666', marginTop: 5, textAlign: 'center' },
  activeSideText: { color: Colors.darazOrange, fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  subCard: { width: '45%', marginBottom: 20, alignItems: 'center' },
  subImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#f4f4f4' },
  subText: { fontSize: 12, marginTop: 8, textAlign: 'center' },
});