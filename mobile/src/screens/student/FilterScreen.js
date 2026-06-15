import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = { FILTERS: 'hs_persisted_filters' };

export default function FilterScreen({ navigation }) {
  const [maxRent, setMaxRent] = useState(15000);
  const [distance, setDistance] = useState('5 km');
  const [food, setFood] = useState('Both');
  const [sharing, setSharing] = useState('Any');
  const [gender, setGender] = useState('Any');
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.FILTERS).then(res => {
      if (res) {
        const f = JSON.parse(res);
        if (f.maxRent) setMaxRent(f.maxRent);
        if (f.distance) setDistance(f.distance);
        if (f.food) setFood(f.food);
        if (f.sharing) setSharing(f.sharing);
        if (f.gender) setGender(f.gender);
        if (f.minRating !== undefined) setMinRating(f.minRating);
        if (f.selectedAmenities) setSelectedAmenities(f.selectedAmenities);
      }
    });
  }, []);

  const amenitiesList = [
    { name: 'WiFi', icon: 'wifi-outline' },
    { name: 'Laundry', icon: 'shirt-outline' },
    { name: 'RO Water', icon: 'water-outline' },
    { name: 'Gym', icon: 'barbell-outline' },
    { name: 'Parking', icon: 'car-outline' },
    { name: 'AC', icon: 'snow-outline' },
    { name: 'Power Backup', icon: 'flash-outline' },
    { name: 'CCTV', icon: 'videocam-outline' },
  ];

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = async () => {
    setMaxRent(15000);
    setDistance('5 km');
    setFood('Both');
    setSharing('Any');
    setGender('Any');
    setMinRating(0);
    setSelectedAmenities([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.FILTERS);
    navigation.navigate('Search', { filtersUpdated: Date.now() });
  };

  const applyFilters = async () => {
    const f = { maxRent, distance, food, sharing, gender, minRating, selectedAmenities };
    await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(f));
    navigation.navigate('Search', { filtersUpdated: Date.now() });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
        </View>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Max Rent per Month</Text>
          <View style={styles.chipsRow}>
            {[{label: 'Under ₹5k', val: 5000}, {label: 'Under ₹8k', val: 8000}, {label: 'Under ₹12k', val: 12000}, {label: 'Any', val: 15000}].map(item => (
              <TouchableOpacity
                key={item.label}
                style={[styles.chip, maxRent === item.val ? styles.chipActive : styles.chipInactive]}
                onPress={() => setMaxRent(item.val)}
              >
                <Text style={maxRent === item.val ? styles.chipTextActive : styles.chipTextInactive}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <View style={styles.chipsRow}>
            {['1 km', '3 km', '5 km', '10 km'].map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, distance === item ? styles.chipActive : styles.chipInactive]}
                onPress={() => setDistance(item)}
              >
                <Text style={distance === item ? styles.chipTextActive : styles.chipTextInactive}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Food */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food</Text>
          <View style={styles.chipsRow}>
            {['Veg', 'Non-Veg', 'Both'].map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, food === item ? styles.chipActive : styles.chipInactive, { paddingHorizontal: 24 }]}
                onPress={() => setFood(item)}
              >
                <Text style={food === item ? styles.chipTextActive : styles.chipTextInactive}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hostel Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hostel Type</Text>
          <View style={styles.chipsRow}>
            {['Any', 'Boys', 'Girls', 'Co-living'].map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, gender === item ? styles.chipActive : styles.chipInactive]}
                onPress={() => setGender(item)}
              >
                <Text style={gender === item ? styles.chipTextActive : styles.chipTextInactive}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sharing</Text>
          <View style={styles.chipsRow}>
            {['Any', 'Single', '2 Sharing', '3 Sharing', '4 Sharing', '5 Sharing'].map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, sharing === item ? styles.chipActive : styles.chipInactive]}
                onPress={() => setSharing(item)}
              >
                <Text style={sharing === item ? styles.chipTextActive : styles.chipTextInactive}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.chipsRow}>
            {[{label: 'Any', val: 0}, {label: '4.5+', val: 4.5}, {label: '4.0+', val: 4.0}, {label: '3.5+', val: 3.5}].map(item => (
              <TouchableOpacity
                key={item.label}
                style={[styles.chip, minRating === item.val ? styles.chipActive : styles.chipInactive]}
                onPress={() => setMinRating(item.val)}
              >
                <Text style={minRating === item.val ? styles.chipTextActive : styles.chipTextInactive}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {amenitiesList.map((item, index) => {
              const isSelected = selectedAmenities.includes(item.name);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.amenityItem}
                  onPress={() => handleAmenityToggle(item.name)}
                >
                  <View style={[styles.amenityIconContainer, isSelected && styles.amenityIconContainerActive]}>
                    <Ionicons 
                      name={item.icon} 
                      size={20} 
                      color={isSelected ? '#ffffff' : '#6b7280'} 
                    />
                  </View>
                  <Text style={[styles.amenityText, isSelected && styles.amenityTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.applyBtn} 
          onPress={applyFilters}
        >
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { 
    marginRight: 10 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1f2937' 
  },
  resetBtnText: { 
    fontSize: 16, 
    color: '#4F46E5', 
    fontWeight: '600' 
  },
  scrollContent: { 
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    marginBottom: 16 
  },
  
  // Slider Styles
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 10,
    marginTop: 10,
  },
  sliderTrackBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#e5e7eb',
    top: '50%',
    marginTop: -1.5,
  },
  sliderTrackActive: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#4F46E5',
    top: '50%',
    marginTop: -1.5,
  },
  sliderDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    top: '50%',
    marginTop: -3,
    marginLeft: -3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    top: '50%',
    marginTop: -8,
    marginLeft: -8,
  },
  priceLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '700',
  },
  
  // Chips
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  chipActive: { 
    backgroundColor: '#4F46E5',
  },
  chipInactive: { 
    backgroundColor: '#f3f4f6',
  },
  chipTextActive: { 
    color: '#ffffff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  chipTextInactive: { 
    color: '#4b5563', 
    fontSize: 14, 
    fontWeight: '500' 
  },

  // Amenities Grid
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
  amenityItem: {
    width: '23%',
    alignItems: 'center',
  },
  amenityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  amenityIconContainerActive: {
    backgroundColor: '#4F46E5',
  },
  amenityText: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    fontWeight: '500',
  },
  amenityTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },

  // Footer
  footer: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    backgroundColor: '#ffffff', 
    padding: 20,
    borderTopWidth: 1, 
    borderTopColor: '#f3f4f6',
  },
  applyBtn: { 
    backgroundColor: '#4F46E5', 
    borderRadius: 16, 
    paddingVertical: 18, 
    alignItems: 'center' 
  },
  applyBtnText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
