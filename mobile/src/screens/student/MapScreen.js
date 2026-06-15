import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import apiClient from '../../api/apiClient';

export default function MapScreen({ navigation }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default coordinate (e.g. Hyderabad)
  const initialRegion = {
    latitude: 17.3850,
    longitude: 78.4867,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  useEffect(() => {
    fetchNearbyHostels(initialRegion.latitude, initialRegion.longitude);
  }, []);

  const fetchNearbyHostels = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/hostels/nearby?lat=${lat}&lng=${lng}&maxDistance=5000`);
      if (res.data.success) {
        setHostels(res.data.hostels);
      }
    } catch (error) {
      console.error('Error fetching map hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChangeComplete = (region) => {
    // Re-fetch nearby hostels when map stops moving
    fetchNearbyHostels(region.latitude, region.longitude);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
      >
        {hostels.map((hostel, index) => (
          <Marker
            key={hostel._id || `marker-${index}`}
            coordinate={{
              latitude: Number(hostel.location?.coordinates?.[1]) || 17.3850,
              longitude: Number(hostel.location?.coordinates?.[0]) || 78.4867
            }}
            title={hostel.name}
            description={`Starting from ₹${hostel.rent?.single || hostel.rent?.sharing2 || 0}`}
            onPress={() => navigation.navigate('HostelDetail', { hostelId: hostel._id })}
            tracksViewChanges={false}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  markerBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff'
  },
  markerText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  calloutBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2dff0',
    minWidth: 150
  },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, color: '#1e1b29', marginBottom: 4 },
  calloutSub: { fontSize: 12, color: '#4F46E5' },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  backBtnText: { color: '#1e1b29', fontWeight: 'bold' },
  loadingOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  }
});
