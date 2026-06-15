import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hostelsAPI } from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STORAGE_KEYS = { FILTERS: 'hs_persisted_filters' };

export default function HostelListScreen({ navigation, route }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [sortBy, setSortBy] = useState('featured');

  // Trigger refetch when returning from FilterScreen
  useEffect(() => {
    fetchHostels();
  }, [route.params?.filtersUpdated, sortBy]);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const filtersJson = await AsyncStorage.getItem(STORAGE_KEYS.FILTERS);
      let queryParams = {};
      let count = 0;

      if (filtersJson) {
        const f = JSON.parse(filtersJson);
        if (f.gender && f.gender !== 'all') { queryParams.gender = f.gender; count++; }
        if (f.maxRent && f.maxRent !== 15000) { queryParams.maxRent = f.maxRent; count++; }
        if (f.foodIncluded) { queryParams.foodIncluded = true; count++; }
        if (f.foodType && f.foodType !== 'all') { queryParams.foodType = f.foodType; count++; }
        if (f.college) { queryParams.college = f.college; count++; }
        if (f.selectedAmenities && f.selectedAmenities.length > 0) {
          queryParams.amenities = f.selectedAmenities.join(',');
          count++;
        }
      }

      setActiveFilterCount(count);

      const res = await hostelsAPI.getAll(queryParams);
      if (res.data.success) {
        setHostels(res.data.hostels);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMinRent = (h) => {
    const prices = [h.rent?.single, h.rent?.sharing2, h.rent?.sharing3].filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 999999;
  };

  const sortedHostels = [...hostels].sort((a, b) => {
    if (sortBy === 'price-asc') return getMinRent(a) - getMinRent(b);
    if (sortBy === 'price-desc') return getMinRent(b) - getMinRent(a);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const renderItem = ({ item }) => {
    const minRent = getMinRent(item);
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
            <Text style={styles.cardAddr} numberOfLines={1}>{item.address}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#f59e0b" style={{marginRight: 2}} />
            <Text style={styles.ratingText}>{item.rating > 0 ? item.rating.toFixed(1) : 'New'}</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Hostels</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={{padding: 4}}>
          <Ionicons name="search" size={20} color="#1e1b29" />
        </TouchableOpacity>
      </View>

      {/* Action Bar (Sort & Filter) */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setSortBy(sortBy === 'price-asc' ? 'price-desc' : 'price-asc')}
        >
          <Ionicons name="swap-vertical" size={16} color="#1e1b29" />
          <Text style={styles.actionText}>Sort: {sortBy === 'price-asc' ? 'Low to High' : sortBy === 'price-desc' ? 'High to Low' : 'Featured'}</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Filter', { returnTo: 'HostelList' })}
        >
          <Ionicons name="options" size={16} color="#1e1b29" />
          <Text style={styles.actionText}>Filter</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={sortedHostels}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={48} color="#8b85a3" style={{marginBottom: 10}} />
              <Text style={styles.emptyText}>No hostels found.</Text>
              <Text style={styles.emptySub}>Try clearing your filters.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#ebebeb'
  },
  backBtn: { padding: 4 },
  backBtnIcon: { fontSize: 24, color: '#1e1b29', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29' },
  headerIcon: { fontSize: 20 },
  actionBar: {
    flexDirection: 'row', backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#ebebeb',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05
  },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  actionIcon: { fontSize: 16 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#1e1b29' },
  divider: { width: 1, backgroundColor: '#ebebeb', marginVertical: 8 },
  filterBadge: {
    backgroundColor: '#4F46E5', borderRadius: 10, width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', marginLeft: 4
  },
  filterBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  listContainer: { padding: 16, paddingBottom: 30 },
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29' },
  emptySub: { fontSize: 14, color: '#8b85a3', marginTop: 4 }
});
