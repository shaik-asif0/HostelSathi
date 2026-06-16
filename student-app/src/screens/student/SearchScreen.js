import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Image, StatusBar, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hostelsAPI } from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

// Hardcoded MOCK_RESULTS removed. We now use Redux store mock data.

export default function SearchScreen({ navigation, route }) {
  const { hostels: reduxHostels } = useSelector((state) => state.hostels);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('hs_persisted_filters').then(res => {
      if (res) setAdvancedFilters(JSON.parse(res));
      else setAdvancedFilters(null);
    });
  }, [route?.params?.filtersUpdated]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search.trim().length > 0) {
        fetchHostels();
      } else {
        setHostels([]); 
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const res = await hostelsAPI.getAll({ search });
      if (res.data.success) {
        setHostels(res.data.hostels);
      }
    } catch (err) {
      console.error('Search fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Combine search and advanced filters
  const displayResults = reduxHostels.filter(h => {
    // 1. Search text
    if (search.trim() && !h.name.toLowerCase().includes(search.toLowerCase()) && !(h.address && h.address.toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }

    // 3. Advanced Filters
    if (advancedFilters) {
      const minRent = h.rent?.single || h.rent?.sharing2 || 999999;
      if (advancedFilters.maxRent && minRent > advancedFilters.maxRent) return false;
      if (advancedFilters.food && advancedFilters.food !== 'Both') {
        // Mock food logic
        if (advancedFilters.food === 'Veg' && !h.foodIncluded) return false;
      }
      // Mock sharing logic
      if (advancedFilters.sharing && advancedFilters.sharing !== 'Any') {
        if (advancedFilters.sharing === 'Single' && !h.rent?.single) return false;
        if (advancedFilters.sharing === '2 Sharing' && !h.rent?.sharing2) return false;
        if (advancedFilters.sharing === '3 Sharing' && !h.rent?.sharing3) return false;
      }
      // Mock amenities logic
      if (advancedFilters.selectedAmenities && advancedFilters.selectedAmenities.length > 0) {
        if (!h.amenities) return false;
        for (let am of advancedFilters.selectedAmenities) {
          if (!h.amenities.includes(am)) return false;
        }
      }
      
      // Gender logic
      if (advancedFilters.gender && advancedFilters.gender !== 'Any') {
        if (advancedFilters.gender === 'Boys' && h.gender !== 'boys') return false;
        if (advancedFilters.gender === 'Girls' && h.gender !== 'girls') return false;
        if (advancedFilters.gender === 'Co-living' && h.gender !== 'coliving' && h.gender !== 'both') return false;
      }

      // Rating logic
      if (advancedFilters.minRating) {
        if ((h.rating || 0) < advancedFilters.minRating) return false;
      }
    }

    return true;
  });

  const renderHostelCard = ({ item }) => {
    const minRent = item.rent?.single || 0;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('HostelDetail', { hostelId: item._id })}
      >
        <Image
          source={{ uri: (item.photos && item.photos.length > 0) ? item.photos[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80' }}
          style={styles.image}
        />
        {item.isPremium && <View style={styles.premiumBadge}><Text style={styles.premiumText}>PREMIUM</Text></View>}

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
            <Ionicons name="location" size={10} color="#8b85a3" style={{marginRight: 2}} />
            <Text style={styles.cardAddr} numberOfLines={1}>{item.address || 'Near Technology'}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#f59e0b" style={{marginRight: 2}} />
            <Text style={styles.ratingText}>{item.rating > 0 ? item.rating.toFixed(1) : '4.0'}</Text>
            <View style={styles.genderTag}>
              <Ionicons name={item.gender === 'boys' ? 'male' : item.gender === 'girls' ? 'female' : 'people'} size={10} color="#5f5a75" style={{marginRight: 2}} />
              <Text style={styles.genderText}>
                {item.gender === 'boys' ? 'Boys' : item.gender === 'girls' ? 'Girls' : 'Co-living'}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.rentPrice}>₹{minRent.toLocaleString('en-IN')}<Text style={styles.rentMo}>/mo</Text></Text>
            {item.foodIncluded && (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="restaurant" size={10} color="#10b981" style={{marginRight: 2}} />
                <Text style={styles.foodTag}>Food</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Search Header */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hostels, area, college..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('Filter')}>
            <Ionicons name="options-outline" size={22} color="#6b7280" />
            {advancedFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={displayResults}
            renderItem={renderHostelCard}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#ffffff'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: { 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 15, 
    color: '#1f2937' 
  },
  filterBtn: {
    position: 'relative',
    padding: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#e0e7ff',
  },
  chipInactive: {
    backgroundColor: '#f3e8ff',
  },
  chipTextActive: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextInactive: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
  },
  filterOutlineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginLeft: 'auto',
  },
  filterOutlineText: {
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: { 
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3
  },
  image: { width: '100%', height: 200, backgroundColor: '#e2dff0' },
  premiumBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#f59e0b', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  premiumText: { color: '#ffffff', fontSize: 9, fontWeight: 'bold' },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e1b29', marginBottom: 2 },
  cardAddr: { fontSize: 11, color: '#8b85a3' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#f59e0b', marginRight: 8 },
  genderTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0ecfd', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  genderText: { fontSize: 10, color: '#5f5a75' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f5f5f5', paddingTop: 8 },
  rentPrice: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5' },
  rentMo: { fontSize: 10, color: '#a09abc', fontWeight: 'normal' },
  foodTag: { fontSize: 10, color: '#10b981', fontWeight: 'bold' },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
