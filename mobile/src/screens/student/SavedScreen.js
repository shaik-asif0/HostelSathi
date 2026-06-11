import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, TextInput, Modal, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import axios from 'axios';

const API_BASE = 'http://10.0.2.2:5000/api';
const SAVED_KEY = 'hs_saved_hostels';

export default function SavedScreen({ navigation }) {
  const { user, token, isAuthenticated } = useSelector(state => state.auth);
  const [savedIds, setSavedIds] = useState([]);
  const [savedHostels, setSavedHostels] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null); // null = All Saved
  const [loading, setLoading] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      setLoading(true);
      // Load locally saved hostel IDs
      const savedJson = await AsyncStorage.getItem(SAVED_KEY);
      const ids = savedJson ? JSON.parse(savedJson) : [];
      setSavedIds(ids);

      // Fetch collections from server if authenticated
      if (isAuthenticated && token) {
        const [hostelsRes, collectionsRes] = await Promise.all([
          // Fetch all saved hostel details
          Promise.all(ids.slice(0, 20).map(id =>
            axios.get(`${API_BASE}/hostels/${id}`).then(r => r.data.hostel).catch(() => null)
          )),
          axios.get(`${API_BASE}/collections`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { collections: [] } }))
        ]);

        setSavedHostels(hostelsRes.filter(Boolean));
        setCollections(collectionsRes.data.collections || []);
      } else {
        // Not authenticated - fetch hostel details locally
        const hostels = await Promise.all(
          ids.slice(0, 20).map(id =>
            axios.get(`${API_BASE}/hostels/${id}`).then(r => r.data.hostel).catch(() => null)
          )
        );
        setSavedHostels(hostels.filter(Boolean));
      }
    } catch (err) {
      console.error('Load saved error:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (hostelId) => {
    const updated = savedIds.filter(id => id !== hostelId);
    setSavedIds(updated);
    setSavedHostels(savedHostels.filter(h => h._id !== hostelId));
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  const handleCreateCollection = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to create collections');
      return;
    }
    if (!newCollectionName.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/collections`, {
        name: newCollectionName.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCollections(res.data.collections);
        setNewCollectionName('');
        setCreateModalVisible(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create collection');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    Alert.alert('Delete Collection', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await axios.delete(`${API_BASE}/collections/${collectionId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(res.data.collections);
            if (activeCollection === collectionId) setActiveCollection(null);
          } catch (err) {
            Alert.alert('Error', 'Failed to delete collection');
          }
        }
      }
    ]);
  };

  const handleAddToCollection = async (hostelId, collectionId) => {
    try {
      await axios.put(`${API_BASE}/collections/${collectionId}/add`, { hostelId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Added', 'Hostel added to collection!');
      loadSavedData();
    } catch (err) {
      Alert.alert('Error', 'Failed to add to collection');
    }
  };

  const showAddToCollection = (hostelId) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to use collections');
      return;
    }
    if (collections.length === 0) {
      Alert.alert('No Collections', 'Create a collection first!', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => setCreateModalVisible(true) }
      ]);
      return;
    }

    Alert.alert(
      'Add to Collection',
      'Choose a collection:',
      [
        ...collections.map(c => ({
          text: c.name,
          onPress: () => handleAddToCollection(hostelId, c._id)
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getMinRent = (h) => {
    const prices = [h.rent.single, h.rent.sharing2, h.rent.sharing3].filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Filter hostels by active collection
  const displayHostels = activeCollection
    ? savedHostels.filter(h => {
        const col = collections.find(c => c._id === activeCollection);
        return col?.hostels?.includes(h._id);
      })
    : savedHostels;

  const renderHostelCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('HostelDetail', { hostelId: item._id })}
      activeOpacity={0.9}
    >
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardImageIcon}>🏠</Text>
        {item.isPremium && (
          <View style={styles.premiumBadge}><Text style={styles.premiumText}>⭐ PREMIUM</Text></View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          {item.rating > 0 && (
            <Text style={styles.cardRating}>★ {item.rating.toFixed(1)}</Text>
          )}
        </View>
        <Text style={styles.cardAddr} numberOfLines={1}>📍 {item.address}</Text>
        <Text style={styles.cardRent}>₹{getMinRent(item).toLocaleString('en-IN')}/mo onwards</Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.cardActionBtn}
            onPress={() => showAddToCollection(item._id)}
          >
            <Text style={styles.cardActionBtnText}>📁 Add to Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => Alert.alert('Remove', 'Remove from saved?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => removeSaved(item._id) }
            ])}
          >
            <Text style={styles.removeBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Hostels</Text>
        {isAuthenticated && (
          <TouchableOpacity style={styles.createBtn} onPress={() => setCreateModalVisible(true)}>
            <Text style={styles.createBtnText}>+ Collection</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Collections Tabs */}
      {collections.length > 0 && (
        <View style={styles.collectionsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionsScroll}>
            <TouchableOpacity
              style={[styles.collectionTab, !activeCollection && styles.collectionTabActive]}
              onPress={() => setActiveCollection(null)}
            >
              <Text style={[styles.collectionTabText, !activeCollection && styles.collectionTabTextActive]}>
                🏠 All ({savedHostels.length})
              </Text>
            </TouchableOpacity>
            {collections.map(c => (
              <TouchableOpacity
                key={c._id}
                style={[styles.collectionTab, activeCollection === c._id && styles.collectionTabActive]}
                onPress={() => setActiveCollection(c._id)}
                onLongPress={() => handleDeleteCollection(c._id)}
              >
                <Text style={[styles.collectionTabText, activeCollection === c._id && styles.collectionTabTextActive]}>
                  📁 {c.name} ({c.hostels?.length || 0})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={displayHostels}
          renderItem={renderHostelCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={loadSavedData}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>❤️</Text>
              <Text style={styles.emptyTitle}>
                {activeCollection ? 'No hostels in this collection yet!' : 'No saved hostels yet!'}
              </Text>
              <Text style={styles.emptySub}>
                Tap the heart icon on any hostel to save it here.
              </Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Search')}>
                <Text style={styles.exploreBtnText}>Explore Hostels →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Create Collection Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Create New Collection</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Near JNTU, Budget Options..."
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
              placeholderTextColor="#a09abc"
              maxLength={40}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setCreateModalVisible(false); setNewCollectionName(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreateBtn, !newCollectionName.trim() && styles.modalCreateBtnDisabled]}
                onPress={handleCreateCollection}
                disabled={!newCollectionName.trim()}
              >
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6fc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.08)'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e1b29' },
  createBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20
  },
  createBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  collectionsBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.08)'
  },
  collectionsScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  collectionTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    backgroundColor: '#f8f6fc'
  },
  collectionTabActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  collectionTabText: { fontSize: 12, color: '#5f5a75', fontWeight: '600' },
  collectionTabTextActive: { color: '#ffffff' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  cardImagePlaceholder: {
    height: 100,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  cardImageIcon: { fontSize: 36 },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f59e0b',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  premiumText: { color: '#ffffff', fontSize: 9, fontWeight: 'bold' },
  cardBody: { padding: 14 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e1b29', flex: 1 },
  cardRating: { fontSize: 12, color: '#f59e0b', fontWeight: 'bold', marginLeft: 8 },
  cardAddr: { fontSize: 12, color: '#8b85a3', marginBottom: 4 },
  cardRent: { fontSize: 14, fontWeight: 'bold', color: '#7c3aed', marginBottom: 12 },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.08)'
  },
  cardActionBtn: {
    flex: 1,
    backgroundColor: '#f0ecfd',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  cardActionBtnText: { fontSize: 12, color: '#7c3aed', fontWeight: '600' },
  removeBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  removeBtnText: { fontSize: 16 },
  emptyBox: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#8b85a3', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  exploreBtn: { backgroundColor: '#7c3aed', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
  exploreBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e1b29',
    marginBottom: 20
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    alignItems: 'center'
  },
  modalCancelText: { color: '#5f5a75', fontWeight: 'bold', fontSize: 15 },
  modalCreateBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalCreateBtnDisabled: { backgroundColor: '#d1c7f0' },
  modalCreateText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 }
});
