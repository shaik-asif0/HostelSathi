import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  SafeAreaView, Modal, Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const roomTypes = ['Single Room', '2 Sharing Room', '3 Sharing Room', '4 Sharing Room', '5 Sharing Room'];
const amenitiesList = [
  'WiFi', 'AC', 'Laundry', 'Geyser', 'CCTV', 'Power Backup', 
  'Gym', 'Security Guard', 'Parking', 'Hot Water', 'Fridge', 'RO Water', 'TV', 'Attached Washroom', 'Balcony'
];

export default function AddNewRoomScreen({ navigation }) {
  const [roomType, setRoomType] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  const [isRoomTypeModalVisible, setRoomTypeModalVisible] = useState(false);
  const [isAmenitiesModalVisible, setAmenitiesModalVisible] = useState(false);

  const toggleAmenity = (a) => {
    if (selectedAmenities.includes(a)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== a));
    } else {
      setSelectedAmenities([...selectedAmenities, a]);
    }
  };

  const handleSave = () => {
    if (!roomType || !totalRooms || !rent || !deposit) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    
    // In a real app, this would dispatch to Redux or make an API call
    Alert.alert('Success', 'Room details saved successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
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
          <Text style={styles.title}>Add New Room</Text>
          <Text style={styles.subtitle}>Add details of the room</Text>
        </View>

        {/* Room Type Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Room Type</Text>
          <TouchableOpacity 
            style={styles.dropdownContainer} 
            onPress={() => setRoomTypeModalVisible(true)}
          >
            <Text style={roomType ? styles.dropdownTextActive : styles.dropdownText}>
              {roomType || 'Select room type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Total Rooms */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Total Rooms</Text>
          <TextInput
            placeholder="Enter total rooms"
            value={totalRooms}
            onChangeText={setTotalRooms}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Rent */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Rent (Per Month)</Text>
          <View style={styles.iconInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              placeholder="Enter rent amount"
              value={rent}
              onChangeText={setRent}
              keyboardType="numeric"
              style={styles.iconInput}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Security Deposit */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Security Deposit</Text>
          <View style={styles.iconInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              placeholder="Enter amount"
              value={deposit}
              onChangeText={setDeposit}
              keyboardType="numeric"
              style={styles.iconInput}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="Room description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Amenities Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Amenities</Text>
          <TouchableOpacity 
            style={styles.dropdownContainer} 
            onPress={() => setAmenitiesModalVisible(true)}
          >
            <Text style={selectedAmenities.length > 0 ? styles.dropdownTextActive : styles.dropdownText} numberOfLines={1}>
              {selectedAmenities.length > 0 ? selectedAmenities.join(', ') : 'Select amenities'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Sticky Bottom Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Room</Text>
        </TouchableOpacity>
      </View>

      {/* Room Type Modal */}
      <Modal visible={isRoomTypeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Room Type</Text>
            {roomTypes.map((type) => (
              <TouchableOpacity 
                key={type} 
                style={styles.modalListItem}
                onPress={() => {
                  setRoomType(type);
                  setRoomTypeModalVisible(false);
                }}
              >
                <Text style={[styles.modalListText, roomType === type && { color: '#4F46E5', fontWeight: 'bold' }]}>
                  {type}
                </Text>
                {roomType === type && <Ionicons name="checkmark" size={20} color="#4F46E5" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCancelBtn} 
              onPress={() => setRoomTypeModalVisible(false)}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  currencySymbol: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 6,
  },
  iconInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1e1b29' },

  dropdownContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 16
  },
  dropdownText: { fontSize: 15, color: '#9ca3af' },
  dropdownTextActive: { fontSize: 15, color: '#1e1b29', flex: 1, paddingRight: 10 },

  footer: {
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#ffffff',
  },
  saveBtn: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },

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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 16,
  },
  modalListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  modalListText: {
    fontSize: 16,
    color: '#1e1b29'
  },
  modalCancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelBtnText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600'
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
