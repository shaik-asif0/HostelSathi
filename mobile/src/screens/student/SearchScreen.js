import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hostelsAPI } from '../../api/apiClient';

const STORAGE_KEYS = { HISTORY: 'hs_search_history' };
const MAX_HISTORY = 8;

export default function SearchScreen({ navigation }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    loadHistory();
    // Auto focus search bar
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search.trim().length > 0) {
        fetchHostels();
      } else {
        setHostels([]); // Clear results if search is empty
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const loadHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (historyJson) setSearchHistory(JSON.parse(historyJson));
    } catch (err) {
      console.error(err);
    }
  };

  const addToHistory = async (term) => {
    if (!term.trim()) return;
    try {
      const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, MAX_HISTORY);
      setSearchHistory(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

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

  const handleSearchSubmit = () => {
    addToHistory(search);
    fetchHostels();
  };

  const getMinRent = (h) => {
    const prices = [h.rent?.single, h.rent?.sharing2, h.rent?.sharing3].filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 999999;
  };

  const renderHostelCard = ({ item }) => {
    const minRent = getMinRent(item);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          addToHistory(search);
          navigation.navigate('HostelDetail', { hostelId: item._id });
        }}
      >
        <Image
          source={{ uri: (item.photos && item.photos.length > 0) ? item.photos[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80' }}
          style={styles.cardImg}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardAddr} numberOfLines={1}>📍 {item.address}</Text>
          <Text style={styles.rentVal}>₹{minRent.toLocaleString('en-IN')}/mo</Text>
        </View>
        <View style={styles.arrowWrap}>
          <Text style={styles.arrowIcon}>↗</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchInputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search by name, area, or college..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            placeholderTextColor="#a09abc"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 4 }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {search.length === 0 ? (
          /* Recent History View */
          <View style={styles.historyContainer}>
            {searchHistory.length > 0 ? (
              <>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={styles.historyClear}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {searchHistory.map((h, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.historyItem}
                    onPress={() => { setSearch(h); addToHistory(h); }}
                  >
                    <Text style={styles.historyClock}>🕐</Text>
                    <Text style={styles.historyText}>{h}</Text>
                    <Text style={styles.historyArrow}>↖</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Find your perfect stay</Text>
                <Text style={styles.emptySub}>Start typing to search across all hostels.</Text>
              </View>
            )}
          </View>
        ) : (
          /* Search Results */
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          ) : (
            <FlatList
              data={hostels}
              renderItem={renderHostelCard}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🙈</Text>
                  <Text style={styles.emptyTitle}>No matches found</Text>
                  <Text style={styles.emptySub}>Try searching for a different area or name.</Text>
                </View>
              }
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff'
  },
  backBtn: { padding: 8, marginRight: 4 },
  backBtnIcon: { fontSize: 24, color: '#1e1b29', fontWeight: 'bold' },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 12,
    paddingHorizontal: 12, height: 44
  },
  searchIcon: { fontSize: 16, marginRight: 8, color: '#8b85a3' },
  searchInput: { flex: 1, fontSize: 16, color: '#1e1b29' },
  clearBtn: { fontSize: 16, color: '#8b85a3' },
  historyContainer: { padding: 20 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e1b29' },
  historyClear: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  historyClock: { fontSize: 16, marginRight: 12 },
  historyText: { flex: 1, fontSize: 16, color: '#5f5a75' },
  historyArrow: { fontSize: 18, color: '#c4b5fd' },
  listContent: { padding: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', padding: 12, marginBottom: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2
  },
  cardImg: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0ecfd' },
  cardInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e1b29', marginBottom: 4 },
  cardAddr: { fontSize: 12, color: '#8b85a3', marginBottom: 4 },
  rentVal: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5' },
  arrowWrap: { padding: 10 },
  arrowIcon: { fontSize: 18, color: '#a09abc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#8b85a3' }
});
