import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  SafeAreaView, Modal, Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const amenitiesList = [
  'WiFi', 'AC', 'Laundry', 'Geyser', 'CCTV', 'Power Backup', 
  'Gym', 'Security Guard', 'Parking', 'Hot Water', 'Fridge', 'RO Water', 'TV'
];

export default function AddHostelScreen({ navigation }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  const [isAmenitiesModalVisible, setAmenitiesModalVisible] = useState(false);

  const toggleAmenity = (a) => {
    if (selectedAmenities.includes(a)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== a));
    } else {
      setSelectedAmenities([...selectedAmenities, a]);
    }
  };

  const handleNext = () => {
    if (!name.trim() || !address.trim() || !location.trim()) {
      Alert.alert('Missing Fields', 'Please fill in Name, Address, and Location.');
      return;
    }
    
    // Navigate to Gallery and pass the data forward
    navigation.navigate('HostelGallery', {
      hostelData: {
        name,
        address,
        location,
        description,
        amenities: selectedAmenities,
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.titleSection}>
          <Text style={styles.title}>Add New Hostel</Text>
          <Text style={styles.subtitle}>Fill in the details of your hostel</Text>
        </View>

        {/* Hostel Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Hostel Name</Text>
          <TextInput
            placeholder="Enter hostel name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            placeholder="Enter full address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Location */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.iconInputContainer}>
            <TextInput
              placeholder="Select location on map"
              value={location}
              onChangeText={setLocation}
              style={styles.iconInput}
              placeholderTextColor="#9ca3af"
            />
            <Ionicons name="location-outline" size={20} color="#1e1b29" />
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="Tell students about your hostel"
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Amenities Dropdown (Mockup) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Amenities</Text>
          <TouchableOpacity 
            style={styles.dropdownContainer} 
            onPress={() => setAmenitiesModalVisible(true)}
          >
            <Text style={selectedAmenities.length > 0 ? styles.dropdownTextActive : styles.dropdownText}>
              {selectedAmenities.length > 0 ? selectedAmenities.join(', ') : 'Select amenities'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Sticky Bottom Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Amenities Modal */}
      <Modal visible={isAmenitiesModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Amenities</Text>
            <ScrollView contentContainerStyle={styles.amenitiesGrid}>
              {amenitiesList.map(a => {
                const hasA = selectedAmenities.includes(a);
                return (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chipBtn, hasA ? styles.chipBtnActive : null]}
                    onPress={() => toggleAmenity(a)}
                  >
                    <Text style={[styles.chipText, hasA ? styles.chipTextActive : null]}>
                      {hasA ? '✓ ' : ''}{a}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalDoneBtn} 
              onPress={() => setAmenitiesModalVisible(false)}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, height: 60 },
  backBtn: { padding: 8, marginLeft: -8 },
  scrollContent: { paddingBottom: 40 },
  
  titleSection: { paddingHorizontal: 24, marginTop: 8, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  fieldContainer: { marginBottom: 20, paddingHorizontal: 24 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#1e1b29', marginBottom: 8 },
  
  input: { 
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 8, 
    padding: 14, 
    fontSize: 15, 
    color: '#1e1b29' 
  },
  
  iconInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 2
  },
  iconInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1e1b29' },

  dropdownContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 16
  },
  dropdownText: { fontSize: 15, color: '#9ca3af' },
  dropdownTextActive: { fontSize: 15, color: '#1e1b29', flex: 1 },

  footer: {
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#ffffff',
  },
  nextBtn: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 16,
  },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 20 },
  chipBtn: {
    backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginRight: 8, marginBottom: 8
  },
  chipBtnActive: { backgroundColor: '#4F46E5' },
  chipText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  chipTextActive: { color: '#ffffff' },
  modalDoneBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalDoneBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
