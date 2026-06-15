import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SavedScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      const res = await apiClient.get('/collections');
      if (res.data.success) {
        setCollections(res.data.collections || []);
      }
    } catch (err) {
      console.error('Fetch collections error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
    const unsubscribe = navigation.addListener('focus', fetchCollections);
    return unsubscribe;
  }, [navigation]);

  const renderHostel = (hostel) => (
    <TouchableOpacity
      key={hostel._id}
      style={styles.hostelCard}
      onPress={() => navigation.navigate('HostelDetail', { hostelId: hostel._id })}
    >
      <Image source={{ uri: hostel.photos?.[0] || 'https://via.placeholder.com/150' }} style={styles.hostelImage} />
      <View style={styles.hostelInfo}>
        <Text style={styles.hostelName} numberOfLines={1}>{hostel.name}</Text>
        <Text style={styles.hostelPrice}>₹{hostel.rent?.single || hostel.rent?.sharing2}/mo</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCollection = ({ item }) => (
    <View style={styles.collectionCard}>
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.collectionCount}>{item.hostels?.length || 0} saved</Text>
      </View>
      {item.hostels && item.hostels.length > 0 ? (
        <View style={styles.hostelsList}>
          {item.hostels.map(h => renderHostel(h))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No hostels saved in this collection yet.</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Saved Hostels </Text>
          <Ionicons name="heart" size={24} color="#ef4444" />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={item => item._id}
          renderItem={renderCollection}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Ionicons name="heart-outline" size={48} color="#8b85a3" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>No saved hostels</Text>
              <Text style={styles.emptySub}>Tap the heart icon on any hostel to save it for later.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29' },
  listContainer: { padding: 16, paddingBottom: 30 },
  collectionCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#f1f1f1'
  },
  collectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  collectionName: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29' },
  collectionCount: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  hostelsList: { gap: 12 },
  hostelCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 12, padding: 8, alignItems: 'center' },
  hostelImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  hostelInfo: { flex: 1, justifyContent: 'center' },
  hostelName: { fontSize: 15, fontWeight: '600', color: '#1e1b29', marginBottom: 4 },
  hostelPrice: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5' },
  emptyText: { fontSize: 13, color: '#8b85a3', fontStyle: 'italic' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 5 },
  emptySub: { fontSize: 14, color: '#8b85a3', textAlign: 'center', paddingHorizontal: 40 }
});
