import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

export default function HostelGalleryScreen({ navigation, route }) {
  // Try to pick up existing photos from route params, or default to empty
  const [photos, setPhotos] = useState(route.params?.existingPhotos || []);
  const [activeTab, setActiveTab] = useState('Photos'); // Photos, Videos, Virtual Tour

  const handlePickImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0, // allow multiple
        quality: 0.8
      });

      if (result.assets) {
        setPhotos([...photos, ...result.assets]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleNext = () => {
    // Navigate to Room Management and pass the data forward
    navigation.navigate('RoomManagement', {
      hostelData: {
        ...(route.params?.hostelData || {}),
        photos
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1e1b29" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Hostel Gallery</Text>
          <Text style={styles.subtitle}>Add photos and videos of your hostel</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['Photos', 'Videos', 'Virtual Tour'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab ? styles.tabBtnActive : null]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : null]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'Photos' ? (
            <>
              {/* Photo Grid */}
              <View style={styles.photoGrid}>
                {photos.map((photo, idx) => (
                  <View key={idx} style={styles.photoWrapper}>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                  </View>
                ))}
              </View>

              {/* Add More Photos Box */}
              <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImages}>
                <Ionicons name="add" size={20} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.uploadBtnText}>Add More Photos</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={48} color="#d1cbed" />
              <Text style={styles.emptyStateText}>{activeTab} upload coming soon!</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    height: 60,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  titleSection: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280', // grayish
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6', // Light gray/purple
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#4F46E5', // vibrant purple
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photoWrapper: {
    width: (width - 48 - 16) / 3, // 3 columns with gap
    aspectRatio: 1, // square
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#c7d2fe', // light purple dashed
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 20,
  },
  uploadBtnText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8b85a3',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  nextBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
