import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ScrollView, TextInput, ActivityIndicator, StatusBar, RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHostelsStart, fetchHostelsSuccess, fetchHostelsFailure } from '../../redux/hostelSlice';
import apiClient from '../../api/apiClient';

const QUICK_FILTERS = [
  { label: '🏠 All', value: null },
  { label: '👦 Boys', value: 'boys' },
  { label: '👧 Girls', value: 'girls' },
  { label: '🍽️ Food Incl.', value: 'food' },
  { label: '⭐ Premium', value: 'premium' }
];

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { hostels, loading } = useSelector(state => state.hostels);
  const { token, user } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notifications);

  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeatured();
    fetchRecommended();
  }, []);

  const fetchFeatured = () => {
    dispatch(fetchHostelsStart());
    apiClient.get('/hostels')
      .then(res => dispatch(fetchHostelsSuccess(res.data.hostels || [])))
      .catch(err => dispatch(fetchHostelsFailure(err.message)));
  };

  const fetchRecommended = async () => {
    try {
      setRecLoading(true);
      const res = await apiClient.get('/hostels/recommended');
      if (res.data.success) setRecommended(res.data.hostels);
    } catch (err) {
      console.error('Recommendations error:', err.message);
    } finally {
      setRecLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchFeatured(), fetchRecommended()]).finally(() => setRefreshing(false));
  }, []);

  const filteredHostels = (recommended.length > 0 ? recommended : hostels).filter(h => {
    if (!activeFilter) return true;
    if (activeFilter === 'boys') return h.gender === 'boys' || h.gender === 'both';
    if (activeFilter === 'girls') return h.gender === 'girls' || h.gender === 'both';
    if (activeFilter === 'food') return h.foodIncluded;
    if (activeFilter === 'premium') return h.isPremium;
    return true;
  }).filter(h =>
    searchText.length === 0 ||
    h.name.toLowerCase().includes(searchText.toLowerCase()) ||
    h.address.toLowerCase().includes(searchText.toLowerCase())
  );

  const getMinRent = (h) => {
    const prices = [h.rent.single, h.rent.sharing2, h.rent.sharing3].filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const renderFeaturedCard = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate('HostelDetail', { hostelId: item._id })}
      activeOpacity={0.85}
    >
      {/* Card image area */}
      <View style={styles.cardImagePlaceholder}>
        <Image 
          source={{ uri: (item.photos && item.photos.length > 0) ? item.photos[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80' }} 
          style={styles.cardCoverImage} 
        />
        {item.isPremium && <View style={styles.premiumBadge}><Text style={styles.premiumText}>PREMIUM</Text></View>}
        {item.isVerified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Verified</Text></View>}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingChip}>
            <Text style={styles.ratingText}>★ {item.rating > 0 ? item.rating.toFixed(1) : 'New'}</Text>
          </View>
        </View>
        <Text style={styles.cardAddr} numberOfLines={1}>📍 {item.address}</Text>
        {item.nearbyColleges?.length > 0 && (
          <Text style={styles.cardColleges} numberOfLines={1}>
            🎓 Near {item.nearbyColleges.slice(0, 2).join(', ')}
          </Text>
        )}
        <View style={styles.cardFooterRow}>
          <View>
            <Text style={styles.cardRentLabel}>Starts from</Text>
            <Text style={styles.cardRent}>₹{getMinRent(item).toLocaleString('en-IN')}/mo</Text>
          </View>
          <View style={styles.genderChip}>
            <Text style={styles.genderText}>
              {item.gender === 'boys' ? '👦 Boys' : item.gender === 'girls' ? '👧 Girls' : '👫 Co-living'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCompactCard = ({ item }) => (
    <TouchableOpacity
      style={styles.compactCard}
      onPress={() => navigation.navigate('HostelDetail', { hostelId: item._id })}
      activeOpacity={0.85}
    >
      <View style={styles.compactLeft}>
        <View style={styles.compactIcon}>
          <Image 
            source={{ uri: (item.photos && item.photos.length > 0) ? item.photos[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=80' }} 
            style={{ width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' }} 
          />
        </View>
      </View>
      <View style={styles.compactBody}>
        <Text style={styles.compactTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.compactAddr} numberOfLines={1}>{item.address}</Text>
        <Text style={styles.compactRent}>₹{getMinRent(item).toLocaleString('en-IN')}/mo</Text>
      </View>
      <View style={styles.compactRight}>
        {item.rating > 0 && (
          <Text style={styles.compactRating}>★ {item.rating.toFixed(1)}</Text>
        )}
        <Text style={styles.compactArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7c3aed" />
        }
      >
        {/* Hero Banner */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>
                Namaste{user ? `, ${user.name.split(' ')[0]}` : ''} 👋
              </Text>
              <Text style={styles.heroTitle}>Find Your Perfect{'\n'}Student Home</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.notifIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <TouchableOpacity
            style={styles.searchBarBtn}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.9}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search hostels, college, area...</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Banner */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{hostels.length + recommended.length}</Text>
            <Text style={styles.statLabel}>Hostels Listed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Verified Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>₹Free</Text>
            <Text style={styles.statLabel}>To Browse</Text>
          </View>
        </View>

        {/* Recommended For You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤖 Recommended For You</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {recLoading ? (
            <View style={styles.recLoadingBox}>
              <ActivityIndicator color="#7c3aed" />
              <Text style={styles.recLoadingText}>Personalizing picks...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredHostels.slice(0, 6)}
              renderItem={renderFeaturedCard}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ListEmptyComponent={
                <View style={styles.emptyHorizontal}>
                  <Text style={styles.emptyText}>🏚️ No hostels yet. Run the seeder!</Text>
                </View>
              }
            />
          )}
        </View>

        {/* All Hostels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏠 All Hostels</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>Filter →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredHostels}
              renderItem={renderCompactCard}
              keyExtractor={item => item._id + '_compact'}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hostels matching filters.</Text>
              }
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6fc'
  },
  hero: {
    backgroundColor: '#7c3aed',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  heroGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 30
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  notifIcon: {
    fontSize: 20
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  notifBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  searchBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4
  },
  searchIcon: {
    fontSize: 16
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#a09abc'
  },
  filterSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.08)'
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    backgroundColor: '#f8f6fc'
  },
  filterPillActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
  filterPillText: {
    fontSize: 12,
    color: '#5f5a75',
    fontWeight: '600'
  },
  filterPillTextActive: {
    color: '#ffffff'
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed'
  },
  statLabel: {
    fontSize: 11,
    color: '#8b85a3',
    marginTop: 2,
    textAlign: 'center'
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(124,58,237,0.12)'
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e1b29'
  },
  seeAll: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '600'
  },
  horizontalList: {
    paddingRight: 8,
    gap: 12
  },
  recLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20
  },
  recLoadingText: {
    fontSize: 14,
    color: '#8b85a3'
  },
  emptyHorizontal: {
    padding: 20
  },
  emptyText: {
    color: '#8b85a3',
    fontSize: 14
  },
  // Featured card (horizontal)
  featuredCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  cardImagePlaceholder: {
    height: 110,
    backgroundColor: 'linear-gradient(135deg, #ede9fe, #c4b5fd)',
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  cardImageIcon: {
    fontSize: 40
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f59e0b',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  premiumText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold'
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#10b981',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold'
  },
  cardBody: {
    padding: 12
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e1b29',
    flex: 1
  },
  ratingChip: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 6
  },
  ratingText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: 'bold'
  },
  cardAddr: {
    fontSize: 11,
    color: '#8b85a3',
    marginBottom: 2
  },
  cardColleges: {
    fontSize: 11,
    color: '#7c3aed',
    marginBottom: 8
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.08)'
  },
  cardRentLabel: {
    fontSize: 10,
    color: '#a09abc',
    marginBottom: 2
  },
  cardRent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7c3aed'
  },
  genderChip: {
    backgroundColor: '#f0ecfd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  genderText: {
    fontSize: 10,
    color: '#5f5a75',
    fontWeight: '600'
  },
  // Compact card (vertical list)
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.08)',
    gap: 12
  },
  compactLeft: {},
  compactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0ecfd',
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactBody: {
    flex: 1
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 3
  },
  compactAddr: {
    fontSize: 12,
    color: '#8b85a3',
    marginBottom: 4
  },
  compactRent: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7c3aed'
  },
  compactRight: {
    alignItems: 'center',
    gap: 4
  },
  compactRating: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: 'bold'
  },
  compactArrow: {
    fontSize: 20,
    color: '#c4b5fd'
  }
});
