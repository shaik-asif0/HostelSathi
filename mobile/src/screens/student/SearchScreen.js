import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hostelsAPI } from '../../api/apiClient';

const STORAGE_KEYS = { FILTERS: 'hs_persisted_filters', HISTORY: 'hs_search_history' };
const MAX_HISTORY = 8;
const AMENITIES_LIST = ['WiFi', 'AC', 'Laundry', 'Geyser', 'CCTV', 'Power Backup', 'Gym', 'Security Guard', 'Parking', 'Hot Water', 'RO Water', 'Fridge'];

// Real Hyderabad colleges for the filter
const COLLEGE_LIST = [
  'JNTU Hyderabad', 'Osmania University', 'GRIET', 'CBIT', 'VNR VJIET',
  'MGIT', 'BVRIT', 'Ameerpet IT Hub', 'Narayana College', 'SR Nagar Institutes',
  'Nizam College', 'IIT Hyderabad', 'ISB Hyderabad', 'University of Hyderabad', 'KVR College'
];

export default function SearchScreen({ navigation }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Filters
  const [gender, setGender] = useState('all');
  const [maxRent, setMaxRent] = useState(15000);
  const [foodIncluded, setFoodIncluded] = useState(false);
  const [foodType, setFoodType] = useState('all');
  const [search, setSearch] = useState('');
  const [college, setCollege] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('featured');

  // Search history
  const [searchHistory, setSearchHistory] = useState([]);

  // Compare
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    loadPersistedData();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(fetchHostels, 400);
    return () => clearTimeout(debounce);
  }, [gender, maxRent, foodIncluded, foodType, college, selectedAmenities]);

  const loadPersistedData = async () => {
    try {
      const [filtersJson, historyJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FILTERS),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY)
      ]);

      if (filtersJson) {
        const f = JSON.parse(filtersJson);
        setGender(f.gender || 'all');
        setMaxRent(f.maxRent || 15000);
        setFoodIncluded(f.foodIncluded || false);
        setFoodType(f.foodType || 'all');
        setSelectedAmenities(f.selectedAmenities || []);
      }

      if (historyJson) {
        setSearchHistory(JSON.parse(historyJson));
      }
    } catch (err) {
      console.error('Load persisted data error:', err);
    }
  };

  const persistFilters = async (overrides = {}) => {
    try {
      const filters = {
        gender, maxRent, foodIncluded, foodType, selectedAmenities,
        ...overrides
      };
      await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
    } catch (err) {
      console.error('Persist filters error:', err);
    }
  };

  const addToHistory = async (term) => {
    if (!term.trim()) return;
    try {
      const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, MAX_HISTORY);
      setSearchHistory(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (err) {
      console.error('Save history error:', err);
    }
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hostelsAPI.getAll({
        gender: gender !== 'all' ? gender : undefined,
        maxRent,
        foodIncluded: foodIncluded || undefined,
        foodType: foodType !== 'all' ? foodType : undefined,
        search: search || undefined,
        college: college || undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities.join(',') : undefined
      });
      if (res.data.success) setHostels(res.data.hostels);
    } catch (err) {
      console.log('Search fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [gender, maxRent, foodIncluded, foodType, search, college, selectedAmenities]);

  const handleSearch = () => {
    addToHistory(search);
    fetchHostels();
  };

  const handleAmenityToggle = (amenity) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(updated);
    persistFilters({ selectedAmenities: updated });
  };

  const handleCompareToggle = (hostel) => {
    if (compareList.some(item => item._id === hostel._id)) {
      setCompareList(compareList.filter(item => item._id !== hostel._id));
    } else {
      if (compareList.length >= 3) {
        Alert.alert('Limit Reached', 'You can compare up to 3 hostels at once.');
        return;
      }
      setCompareList([...compareList, hostel]);
    }
  };

  const resetFilters = () => {
    setGender('all');
    setMaxRent(15000);
    setFoodIncluded(false);
    setFoodType('all');
    setSelectedAmenities([]);
    persistFilters({ gender: 'all', maxRent: 15000, foodIncluded: false, foodType: 'all', selectedAmenities: [] });
  };

  const activeFilterCount = [
    gender !== 'all',
    maxRent !== 15000,
    foodIncluded,
    foodType !== 'all',
    selectedAmenities.length > 0
  ].filter(Boolean).length;

  const getMinRent = (h) => {
    const prices = [h.rent.single, h.rent.sharing2, h.rent.sharing3].filter(p => p > 0);
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

  const renderHostelCard = ({ item }) => {
    const minRent = getMinRent(item);
    const inCompare = compareList.some(c => c._id === item._id);

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => navigation.navigate('HostelDetail', { hostelId: item._id })}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                {item.isPremium && (
                  <View style={styles.premiumPill}><Text style={styles.premiumText}>⭐ PREMIUM</Text></View>
                )}
              </View>
              <Text style={styles.cardAddr} numberOfLines={1}>📍 {item.address}</Text>
              {item.nearbyColleges?.length > 0 && (
                <Text style={styles.cardColleges}>🎓 {item.nearbyColleges.slice(0, 2).join(', ')}</Text>
              )}
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>★</Text>
              <Text style={styles.ratingVal}>{item.rating > 0 ? item.rating.toFixed(1) : 'New'}</Text>
            </View>
          </View>

          <View style={styles.amenityRow}>
            {item.amenities?.slice(0, 4).map(a => (
              <View key={a} style={styles.amenityPill}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
            {(item.amenities?.length || 0) > 4 && (
              <Text style={styles.moreAmenities}>+{item.amenities.length - 4} more</Text>
            )}
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.rentLabel}>Starting from</Text>
              <Text style={styles.rentVal}>₹{minRent.toLocaleString('en-IN')}/mo</Text>
            </View>
            <View style={styles.cardChips}>
              {item.foodIncluded && (
                <View style={styles.foodChip}><Text style={styles.foodChipText}>🍽️ Food</Text></View>
              )}
              <View style={styles.genderChip}>
                <Text style={styles.genderChipText}>
                  {item.gender === 'boys' ? '👦' : item.gender === 'girls' ? '👧' : '👫'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Compare toggle */}
        <TouchableOpacity
          style={[styles.compareBtn, inCompare && styles.compareBtnActive]}
          onPress={() => handleCompareToggle(item)}
        >
          <Text style={[styles.compareBtnText, inCompare && styles.compareBtnTextActive]}>
            {inCompare ? '✓ In Compare' : '+ Compare'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Text style={styles.searchInputIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search hostels, area, college..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              placeholderTextColor="#a09abc"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setFiltersVisible(true)}
          >
            <Text style={styles.filterBtnIcon}>⚙️</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search History Chips */}
        {search.length === 0 && searchHistory.length > 0 && (
          <View style={styles.historyRow}>
            <Text style={styles.historyLabel}>Recent:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
              {searchHistory.map((h, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.historyChip}
                  onPress={() => { setSearch(h); }}
                >
                  <Text style={styles.historyChipText}>🕐 {h}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearHistoryBtn}>Clear</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultsCount}>{sortedHostels.length} hostels</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          {[
            { id: 'featured', label: 'Featured' },
            { id: 'price-asc', label: '₹ Low→High' },
            { id: 'price-desc', label: '₹ High→Low' },
            { id: 'rating', label: '⭐ Rating' }
          ].map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sortBtn, sortBy === s.id && styles.sortBtnActive]}
              onPress={() => setSortBy(s.id)}
            >
              <Text style={[styles.sortBtnText, sortBy === s.id && styles.sortBtnTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedHostels}
          renderItem={renderHostelCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🏚️</Text>
              <Text style={styles.emptyTitle}>No hostels found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}

      {/* Compare Tray */}
      {compareList.length > 0 && (
        <View style={styles.compareTray}>
          <Text style={styles.compareTrayText}>{compareList.length}/3 selected</Text>
          <TouchableOpacity
            style={styles.compareTrayBtn}
            onPress={() => navigation.navigate('Compare', { hostels: compareList })}
          >
            <Text style={styles.compareTrayBtnText}>Compare →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filters Modal */}
      <Modal
        visible={filtersVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetBtn}>Reset All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Gender */}
              <Text style={styles.filterLabel}>Gender</Text>
              <View style={styles.filterOptions}>
                {['all', 'boys', 'girls', 'both'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.optionBtn, gender === g && styles.optionBtnActive]}
                    onPress={() => { setGender(g); persistFilters({ gender: g }); }}
                  >
                    <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                      {g === 'all' ? 'All' : g === 'both' ? 'Co-living' : g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Budget */}
              <Text style={styles.filterLabel}>Max Budget: ₹{maxRent.toLocaleString('en-IN')}/mo</Text>
              <View style={styles.budgetRow}>
                {[5000, 8000, 10000, 12000, 15000, 20000].map(b => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.budgetBtn, maxRent === b && styles.budgetBtnActive]}
                    onPress={() => { setMaxRent(b); persistFilters({ maxRent: b }); }}
                  >
                    <Text style={[styles.budgetText, maxRent === b && styles.budgetTextActive]}>
                      ₹{(b/1000).toFixed(0)}K
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Food */}
              <Text style={styles.filterLabel}>Food</Text>
              <TouchableOpacity
                style={[styles.toggleRow, foodIncluded && styles.toggleRowActive]}
                onPress={() => { setFoodIncluded(!foodIncluded); persistFilters({ foodIncluded: !foodIncluded }); }}
              >
                <Text style={[styles.toggleText, foodIncluded && styles.toggleTextActive]}>
                  🍽️ Food Included
                </Text>
                <View style={[styles.toggle, foodIncluded && styles.toggleOn]}>
                  <View style={styles.toggleThumb} />
                </View>
              </TouchableOpacity>

              {foodIncluded && (
                <>
                  <Text style={styles.filterLabelSm}>Food Type</Text>
                  <View style={styles.filterOptions}>
                    {['all', 'veg', 'nonveg', 'both'].map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.optionBtn, foodType === t && styles.optionBtnActive]}
                        onPress={() => { setFoodType(t); persistFilters({ foodType: t }); }}
                      >
                        <Text style={[styles.optionText, foodType === t && styles.optionTextActive]}>
                          {t === 'all' ? 'Any' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* College Filter */}
              <Text style={styles.filterLabel}>🎓 College / Institute Nearby</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.optionBtn, !college && styles.optionBtnActive]}
                    onPress={() => setCollege('')}
                  >
                    <Text style={[styles.optionText, !college && styles.optionTextActive]}>All Areas</Text>
                  </TouchableOpacity>
                  {COLLEGE_LIST.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.optionBtn, college === c && styles.optionBtnActive]}
                      onPress={() => setCollege(college === c ? '' : c)}
                    >
                      <Text style={[styles.optionText, college === c && styles.optionTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Amenities */}
              <Text style={styles.filterLabel}>Amenities</Text>
              <View style={styles.amenityGrid}>
                {AMENITIES_LIST.map(a => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.amenityOption, selectedAmenities.includes(a) && styles.amenityOptionActive]}
                    onPress={() => handleAmenityToggle(a)}
                  >
                    <Text style={[styles.amenityOptionText, selectedAmenities.includes(a) && styles.amenityOptionTextActive]}>
                      {a}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => { setFiltersVisible(false); fetchHostels(); }}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6fc' },
  searchHeader: {
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.08)'
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f6fc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    paddingHorizontal: 12,
    height: 44,
    gap: 8
  },
  searchInputIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e1b29'
  },
  clearBtn: { fontSize: 14, color: '#a09abc' },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f8f6fc',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  filterBtnActive: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderColor: '#7c3aed'
  },
  filterBtnIcon: { fontSize: 18 },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4
  },
  historyLabel: { fontSize: 11, color: '#a09abc', fontWeight: '600' },
  historyScroll: { gap: 6, paddingVertical: 2 },
  historyChip: {
    backgroundColor: '#f0ecfd',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)'
  },
  historyChipText: { fontSize: 12, color: '#7c3aed' },
  clearHistoryBtn: { fontSize: 12, color: '#ef4444', fontWeight: '600', paddingHorizontal: 6 },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.08)',
    gap: 12
  },
  resultsCount: { fontSize: 12, color: '#8b85a3', fontWeight: 'bold', minWidth: 70 },
  sortScroll: { gap: 8 },
  sortBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  sortBtnActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.06)' },
  sortBtnText: { fontSize: 12, color: '#5f5a75', fontWeight: '600' },
  sortBtnTextActive: { color: '#7c3aed', fontWeight: 'bold' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { color: '#8b85a3', fontSize: 14 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e1b29', flex: 1 },
  premiumPill: { backgroundColor: '#fef3c7', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  premiumText: { fontSize: 9, color: '#d97706', fontWeight: 'bold' },
  cardAddr: { fontSize: 12, color: '#8b85a3', marginBottom: 2 },
  cardColleges: { fontSize: 11, color: '#7c3aed', fontWeight: '600' },
  ratingBox: { alignItems: 'center', justifyContent: 'center' },
  ratingText: { fontSize: 16, color: '#f59e0b' },
  ratingVal: { fontSize: 12, color: '#f59e0b', fontWeight: 'bold' },
  amenityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  amenityPill: {
    backgroundColor: '#f0ecfd',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  amenityText: { fontSize: 10, color: '#5f5a75', fontWeight: '600' },
  moreAmenities: { fontSize: 10, color: '#a09abc', alignSelf: 'center' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.08)'
  },
  rentLabel: { fontSize: 10, color: '#a09abc' },
  rentVal: { fontSize: 15, fontWeight: 'bold', color: '#7c3aed' },
  cardChips: { flexDirection: 'row', gap: 6 },
  foodChip: {
    backgroundColor: '#ecfdf5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  foodChipText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  genderChip: {
    backgroundColor: '#f0ecfd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  genderChipText: { fontSize: 14 },
  compareBtn: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    alignItems: 'center'
  },
  compareBtnActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.06)' },
  compareBtnText: { fontSize: 12, color: '#8b85a3', fontWeight: '600' },
  compareBtnTextActive: { color: '#7c3aed', fontWeight: 'bold' },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#8b85a3' },
  compareTray: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  compareTrayText: { fontWeight: 'bold', fontSize: 14, color: '#1e1b29' },
  compareTrayBtn: { backgroundColor: '#7c3aed', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 50 },
  compareTrayBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%'
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e0f8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29' },
  resetBtn: { fontSize: 13, color: '#ef4444', fontWeight: '600' },
  filterLabel: { fontSize: 13, fontWeight: 'bold', color: '#1e1b29', marginBottom: 10, marginTop: 16 },
  filterLabelSm: { fontSize: 12, fontWeight: '600', color: '#5f5a75', marginBottom: 8, marginTop: 12 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    backgroundColor: '#f8f6fc'
  },
  optionBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  optionText: { fontSize: 13, color: '#5f5a75', fontWeight: '600' },
  optionTextActive: { color: '#ffffff' },
  budgetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  budgetBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    backgroundColor: '#f8f6fc'
  },
  budgetBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  budgetText: { fontSize: 13, color: '#5f5a75', fontWeight: '600' },
  budgetTextActive: { color: '#ffffff' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f6fc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)'
  },
  toggleRowActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.04)' },
  toggleText: { fontSize: 14, color: '#5f5a75', fontWeight: '600' },
  toggleTextActive: { color: '#7c3aed' },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e0f8',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  toggleOn: { backgroundColor: '#7c3aed', alignItems: 'flex-end' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff' },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityOption: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    backgroundColor: '#f8f6fc'
  },
  amenityOptionActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  amenityOptionText: { fontSize: 12, color: '#5f5a75', fontWeight: '600' },
  amenityOptionTextActive: { color: '#ffffff' },
  applyBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20
  },
  applyBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});
