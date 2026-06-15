import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STORAGE_KEYS = { FILTERS: 'hs_persisted_filters' };
const AMENITIES_LIST = ['WiFi', 'AC', 'Laundry', 'Geyser', 'CCTV', 'Power Backup', 'Gym', 'Security Guard', 'Parking', 'Hot Water', 'RO Water', 'Fridge'];
const COLLEGE_LIST = [
  'JNTU Hyderabad', 'Osmania University', 'GRIET', 'CBIT', 'VNR VJIET',
  'MGIT', 'BVRIT', 'Ameerpet IT Hub', 'Narayana College', 'SR Nagar Institutes',
  'Nizam College', 'IIT Hyderabad', 'ISB Hyderabad', 'University of Hyderabad', 'KVR College'
];

export default function FilterScreen({ navigation, route }) {
  const [gender, setGender] = useState('all');
  const [maxRent, setMaxRent] = useState(15000);
  const [foodIncluded, setFoodIncluded] = useState(false);
  const [foodType, setFoodType] = useState('all');
  const [college, setCollege] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const filtersJson = await AsyncStorage.getItem(STORAGE_KEYS.FILTERS);
      if (filtersJson) {
        const f = JSON.parse(filtersJson);
        setGender(f.gender || 'all');
        setMaxRent(f.maxRent || 15000);
        setFoodIncluded(f.foodIncluded || false);
        setFoodType(f.foodType || 'all');
        setSelectedAmenities(f.selectedAmenities || []);
        setCollege(f.college || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const persistFiltersAndApply = async () => {
    try {
      const filters = { gender, maxRent, foodIncluded, foodType, selectedAmenities, college };
      await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
      // Pass a param back to let the previous screen know filters were applied
      navigation.navigate({
        name: route.params?.returnTo || 'HostelList',
        params: { filtersUpdated: Date.now() },
        merge: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const resetFilters = async () => {
    setGender('all');
    setMaxRent(15000);
    setFoodIncluded(false);
    setFoodType('all');
    setSelectedAmenities([]);
    setCollege('');
    await AsyncStorage.removeItem(STORAGE_KEYS.FILTERS);
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#1e1b29" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.resetBtn}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Gender */}
        <Text style={styles.filterLabel}>Who is this for?</Text>
        <View style={styles.filterOptions}>
          {['all', 'boys', 'girls', 'both'].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.optionBtn, gender === g && styles.optionBtnActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                {g === 'all' ? 'Anyone' : g === 'both' ? 'Co-living' : g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Budget */}
        <Text style={styles.filterLabel}>Max Monthly Rent: ₹{maxRent.toLocaleString('en-IN')}</Text>
        <View style={styles.budgetRow}>
          {[5000, 8000, 10000, 12000, 15000, 20000].map(b => (
            <TouchableOpacity
              key={b}
              style={[styles.budgetBtn, maxRent === b && styles.budgetBtnActive]}
              onPress={() => setMaxRent(b)}
            >
              <Text style={[styles.budgetText, maxRent === b && styles.budgetTextActive]}>
                ₹{(b / 1000).toFixed(0)}K
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Food */}
        <Text style={styles.filterLabel}>Food Preferences</Text>
        <TouchableOpacity
          style={[styles.toggleRow, foodIncluded && styles.toggleRowActive]}
          onPress={() => setFoodIncluded(!foodIncluded)}
        >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="restaurant" size={16} color={foodIncluded ? '#4F46E5' : '#5f5a75'} style={{marginRight: 6}} />
            <Text style={[styles.toggleText, foodIncluded && styles.toggleTextActive]}>
              Food Included in Rent
            </Text>
          </View>
          <View style={[styles.toggle, foodIncluded && styles.toggleOn]}>
            <View style={styles.toggleThumb} />
          </View>
        </TouchableOpacity>

        {foodIncluded && (
          <View style={[styles.filterOptions, { marginTop: 12 }]}>
            {['all', 'veg', 'nonveg', 'both'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.optionBtn, foodType === t && styles.optionBtnActive]}
                onPress={() => setFoodType(t)}
              >
                <Text style={[styles.optionText, foodType === t && styles.optionTextActive]}>
                  {t === 'all' ? 'Any Type' : t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* College Filter */}
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24}}>
          <Ionicons name="school" size={16} color="#1e1b29" style={{marginRight: 6}} />
          <Text style={[styles.filterLabel, {marginTop: 0, marginBottom: 0}]}>Nearby College / Landmark</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.optionBtn, !college && styles.optionBtnActive]}
              onPress={() => setCollege('')}
            >
              <Text style={[styles.optionText, !college && styles.optionTextActive]}>Anywhere</Text>
            </TouchableOpacity>
            {COLLEGE_LIST.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.optionBtn, college === c && styles.optionBtnActive]}
                onPress={() => setCollege(college === c ? '' : c)}
              >
                <Text style={[styles.optionText, college === c && styles.optionTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Amenities */}
        <Text style={styles.filterLabel}>Amenities Required</Text>
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
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={persistFiltersAndApply}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff'
  },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 20, color: '#1e1b29', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29' },
  resetBtn: { fontSize: 14, color: '#ef4444', fontWeight: '600' },
  scrollContent: { padding: 20 },
  filterLabel: { fontSize: 15, fontWeight: 'bold', color: '#1e1b29', marginBottom: 12, marginTop: 24 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionBtn: {
    paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 24, borderWidth: 1, borderColor: '#e2dff0', backgroundColor: '#ffffff'
  },
  optionBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  optionText: { fontSize: 14, color: '#5f5a75', fontWeight: '600' },
  optionTextActive: { color: '#ffffff' },
  budgetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  budgetBtn: {
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 24, borderWidth: 1, borderColor: '#e2dff0', backgroundColor: '#ffffff'
  },
  budgetBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  budgetText: { fontSize: 14, color: '#5f5a75', fontWeight: '600' },
  budgetTextActive: { color: '#ffffff' },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e2dff0'
  },
  toggleRowActive: { borderColor: '#4F46E5', backgroundColor: '#f0ecfd' },
  toggleText: { fontSize: 15, color: '#5f5a75', fontWeight: '600' },
  toggleTextActive: { color: '#4F46E5' },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#e5e0f8', padding: 2, justifyContent: 'center', alignItems: 'flex-start' },
  toggleOn: { backgroundColor: '#4F46E5', alignItems: 'flex-end' },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityOption: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 24, borderWidth: 1, borderColor: '#e2dff0', backgroundColor: '#ffffff' },
  amenityOptionActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  amenityOptionText: { fontSize: 13, color: '#5f5a75', fontWeight: '600' },
  amenityOptionTextActive: { color: '#ffffff' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff', padding: 16,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10
  },
  applyBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  applyBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
