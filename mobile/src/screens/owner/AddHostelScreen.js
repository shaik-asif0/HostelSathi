import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Switch, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { hostelsAPI, uploadAPI } from '../../api/apiClient';

// Real Hyderabad colleges for selection
const HYD_COLLEGES = [
  'JNTU Hyderabad', 'Osmania University', 'GRIET', 'CBIT', 'VNR VJIET',
  'MGIT', 'BVRIT', 'Chaitanya Bharathi (CBIT)', 'Ameerpet IT Hub',
  'Aditya Degree College', 'Narayana College', 'SR Nagar Institutes',
  'Nizam College', 'St. Francis College', 'KVR College'
];

export default function AddHostelScreen({ route, navigation }) {
  const editHostel = route.params?.editHostel || null;
  const isEditMode = !!editHostel;

  const { token } = useSelector(state => state.auth);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lng, setLng] = useState('78.3912');
  const [lat, setLat] = useState('17.4935');
  const [nearbyColleges, setNearbyColleges] = useState('JNTU Hyderabad');
  const [rentSingle, setRentSingle] = useState('10000');
  const [rentSharing2, setRentSharing2] = useState('7500');
  const [rentSharing3, setRentSharing3] = useState('6000');
  const [rentSharing4, setRentSharing4] = useState('5000');
  const [rentSharing5, setRentSharing5] = useState('4000');
  const [foodIncluded, setFoodIncluded] = useState(true);
  const [foodType, setFoodType] = useState('both');
  const [gender, setGender] = useState('boys');
  const [isPremium, setIsPremium] = useState(false);

  // Vacancy counts for availability calendar (Feature 7)
  const [singleVacancy, setSingleVacancy] = useState('0');
  const [sharing2Vacancy, setSharing2Vacancy] = useState('0');
  const [sharing3Vacancy, setSharing3Vacancy] = useState('0');
  const [sharing4Vacancy, setSharing4Vacancy] = useState('0');
  const [sharing5Vacancy, setSharing5Vacancy] = useState('0');

  // Photo uploads
  const [localPhotos, setLocalPhotos] = useState([]);
  const [localFoodPhotos, setLocalFoodPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [existingFoodPhotos, setExistingFoodPhotos] = useState([]);

  const amenitiesList = ['WiFi', 'AC', 'Laundry', 'Geyser', 'CCTV', 'Power Backup', 'Gym', 'Security Guard', 'Parking', 'Hot Water', 'Fridge', 'RO Water', 'TV'];
  const [selectedAmenities, setSelectedAmenities] = useState(['WiFi', 'CCTV', 'Geyser']);
  const [selectedColleges, setSelectedColleges] = useState(['JNTU Hyderabad']);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && editHostel) {
      setName(editHostel.name);
      setAddress(editHostel.address);
      if (editHostel.location?.coordinates) {
        setLng(editHostel.location.coordinates[0].toString());
        setLat(editHostel.location.coordinates[1].toString());
      }
      setSelectedColleges(editHostel.nearbyColleges || []);
      setNearbyColleges((editHostel.nearbyColleges || []).join(', '));
      setRentSingle(editHostel.rent?.single?.toString() || '0');
      setRentSharing2(editHostel.rent?.sharing2?.toString() || '0');
      setRentSharing3(editHostel.rent?.sharing3?.toString() || '0');
      setRentSharing4(editHostel.rent?.sharing4?.toString() || '0');
      setRentSharing5(editHostel.rent?.sharing5?.toString() || '0');
      setFoodIncluded(!!editHostel.foodIncluded);
      setFoodType(editHostel.foodType || 'none');
      setGender(editHostel.gender || 'both');
      setIsPremium(!!editHostel.isPremium);
      setSelectedAmenities(editHostel.amenities || []);
      if (editHostel.photos) setExistingPhotos(editHostel.photos);
      if (editHostel.foodPhotos) setExistingFoodPhotos(editHostel.foodPhotos);
      if (editHostel.availability) {
        setSingleVacancy(editHostel.availability.singleVacancy?.toString() || '0');
        setSharing2Vacancy(editHostel.availability.sharing2Vacancy?.toString() || '0');
        setSharing3Vacancy(editHostel.availability.sharing3Vacancy?.toString() || '0');
        setSharing4Vacancy(editHostel.availability.sharing4Vacancy?.toString() || '0');
        setSharing5Vacancy(editHostel.availability.sharing5Vacancy?.toString() || '0');
      }
    }
  }, [editHostel]);

  const handleCollegeToggle = (college) => {
    setSelectedColleges(prev =>
      prev.includes(college)
        ? prev.filter(c => c !== college)
        : [...prev, college]
    );
  };

  const handleAmenityToggle = (a) => {
    if (selectedAmenities.includes(a)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== a));
    } else {
      setSelectedAmenities([...selectedAmenities, a]);
    }
  };

  const handlePickImages = async (isFood = false) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0, // 0 = multiple
        quality: 0.8
      });
      
      if (result.assets) {
        if (isFood) {
          setLocalFoodPhotos([...localFoodPhotos, ...result.assets]);
        } else {
          setLocalPhotos([...localPhotos, ...result.assets]);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Missing Fields', 'Hostel Name and Address are required.');
      return;
    }
    if (selectedColleges.length === 0) {
      Alert.alert('Missing Colleges', 'Please select at least one nearby college.');
      return;
    }

    setLoading(true);

    let finalPhotos = [...existingPhotos];
    let finalFoodPhotos = [...existingFoodPhotos];

    try {
      // 1. Upload Local Property Photos
      if (localPhotos.length > 0) {
        const formData = new FormData();
        localPhotos.forEach(photo => {
          formData.append('photos', {
            uri: photo.uri,
            type: photo.type || 'image/jpeg',
            name: photo.fileName || `photo-${Date.now()}.jpg`
          });
        });
        const uploadRes = await uploadAPI.uploadFiles(formData);
        if (uploadRes.data.success) {
          finalPhotos = [...finalPhotos, ...uploadRes.data.data];
        }
      }

      // 2. Upload Local Food Photos
      if (localFoodPhotos.length > 0) {
        const formData = new FormData();
        localFoodPhotos.forEach(photo => {
          formData.append('photos', {
            uri: photo.uri,
            type: photo.type || 'image/jpeg',
            name: photo.fileName || `food-${Date.now()}.jpg`
          });
        });
        const uploadRes = await uploadAPI.uploadFiles(formData);
        if (uploadRes.data.success) {
          finalFoodPhotos = [...finalFoodPhotos, ...uploadRes.data.data];
        }
      }

      const payload = {
        name: name.trim(),
        address: address.trim(),
        lng: parseFloat(lng),
        lat: parseFloat(lat),
        nearbyColleges: selectedColleges,
        rentSingle: parseInt(rentSingle) || 0,
        rentSharing2: parseInt(rentSharing2) || 0,
        rentSharing3: parseInt(rentSharing3) || 0,
        rentSharing4: parseInt(rentSharing4) || 0,
        rentSharing5: parseInt(rentSharing5) || 0,
        foodIncluded,
        foodType: foodIncluded ? foodType : 'none',
        amenities: selectedAmenities,
        photos: finalPhotos,
        foodPhotos: finalFoodPhotos,
        gender,
        isPremium,
        singleVacancy: parseInt(singleVacancy) || 0,
        sharing2Vacancy: parseInt(sharing2Vacancy) || 0,
        sharing3Vacancy: parseInt(sharing3Vacancy) || 0,
        sharing4Vacancy: parseInt(sharing4Vacancy) || 0,
        sharing5Vacancy: parseInt(sharing5Vacancy) || 0
      };

      const res = isEditMode
        ? await hostelsAPI.update(editHostel._id, payload)
        : await hostelsAPI.create(payload);

      if (res.data.success) {
        Alert.alert('✅ Success', isEditMode ? 'Hostel listing updated!' : 'New hostel listing created!');
        navigation.goBack();
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.friendlyMessage || 'Failed to save hostel. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.title}>{isEditMode ? 'Edit Hostel Profile' : 'Add New Hostel Profile'}</Text>

        <TextInput 
          placeholder="Hostel Name *"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#8b85a3"
        />
        <TextInput 
          placeholder="Hostel Address *"
          value={address}
          onChangeText={setAddress}
          multiline
          style={[styles.input, { height: 60 }]}
          placeholderTextColor="#8b85a3"
        />

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Longitude (lng)</Text>
            <TextInput 
              value={lng}
              onChangeText={setLng}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Latitude (lat)</Text>
            <TextInput 
              value={lat}
              onChangeText={setLat}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>

        <TextInput
          placeholder="Nearby Colleges (comma-separated)"
          value={nearbyColleges}
          onChangeText={setNearbyColleges}
          style={styles.input}
          placeholderTextColor="#8b85a3"
        />

        {/* College Quick-Select */}
        <Text style={styles.subTitle}>📍 Select Nearby Colleges</Text>
        <Text style={styles.hintText}>Tap to select — helps students filter by college</Text>
        <View style={styles.amenitiesGrid}>
          {HYD_COLLEGES.map(college => {
            const isSelected = selectedColleges.includes(college);
            return (
              <TouchableOpacity
                key={college}
                style={[styles.amenityBtn, isSelected && styles.amenityBtnActive]}
                onPress={() => handleCollegeToggle(college)}
              >
                <Text style={[styles.amenityText, isSelected && styles.amenityTextActive]}>
                  {isSelected ? '✓ ' : ''}{college}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pricing */}
        <Text style={styles.subTitle}>Monthly Pricing (₹)</Text>
        <View style={styles.row}>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>Single</Text>
            <TextInput 
              value={rentSingle}
              onChangeText={setRentSingle}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>2-Sharing</Text>
            <TextInput 
              value={rentSharing2}
              onChangeText={setRentSharing2}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>3-Sharing</Text>
            <TextInput 
              value={rentSharing3}
              onChangeText={setRentSharing3}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>4-Sharing</Text>
            <TextInput 
              value={rentSharing4}
              onChangeText={setRentSharing4}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>5-Sharing</Text>
            <TextInput 
              value={rentSharing5}
              onChangeText={setRentSharing5}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>

        {/* Vacancy / Availability */}
        <Text style={styles.subTitle}>🛏️ Available Vacancies</Text>
        <Text style={styles.hintText}>Set current vacancies to help students see what's available</Text>
        <View style={styles.row}>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>Single</Text>
            <TextInput
              value={singleVacancy}
              onChangeText={setSingleVacancy}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0"
            />
          </View>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>2-Sharing</Text>
            <TextInput
              value={sharing2Vacancy}
              onChangeText={setSharing2Vacancy}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0"
            />
          </View>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>3-Sharing</Text>
            <TextInput
              value={sharing3Vacancy}
              onChangeText={setSharing3Vacancy}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0"
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>4-Sharing</Text>
            <TextInput
              value={sharing4Vacancy}
              onChangeText={setSharing4Vacancy}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0"
            />
          </View>
          <View style={styles.thirdCol}>
            <Text style={styles.label}>5-Sharing</Text>
            <TextInput
              value={sharing5Vacancy}
              onChangeText={setSharing5Vacancy}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0"
            />
          </View>
        </View>
        <Text style={styles.label}>Gender Suitability</Text>
        <View style={styles.genderRow}>
          {['boys', 'girls', 'both'].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g ? styles.genderBtnActive : null]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderBtnText, gender === g ? styles.genderBtnTextActive : null]}>
                {g.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Food */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Homely Food Included</Text>
          <Switch 
            value={foodIncluded}
            onValueChange={setFoodIncluded}
            trackColor={{ false: '#eae6f5', true: '#7c3aed' }}
          />
        </View>

        {foodIncluded && (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Catering Food Type</Text>
            <View style={styles.genderRow}>
              {['veg', 'nonveg', 'both'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.genderBtn, foodType === f ? styles.genderBtnActive : null]}
                  onPress={() => setFoodType(f)}
                >
                  <Text style={[styles.genderBtnText, foodType === f ? styles.genderBtnTextActive : null]}>
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Food Photos */}
            <Text style={styles.label}>Food / Dining Area Photos</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickImages(true)}>
              <Text style={styles.uploadBtnText}>+ Add Food Photos</Text>
            </TouchableOpacity>
            <View style={styles.photoGrid}>
              {[...existingFoodPhotos, ...localFoodPhotos.map(p => p.uri)].map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.thumbImage} />
              ))}
            </View>
          </View>
        )}

        {/* Property Photos */}
        <Text style={styles.subTitle}>Property Photos</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickImages(false)}>
          <Text style={styles.uploadBtnText}>+ Add Rooms / Property Photos</Text>
        </TouchableOpacity>
        <View style={styles.photoGrid}>
          {[...existingPhotos, ...localPhotos.map(p => p.uri)].map((uri, idx) => (
            <Image key={idx} source={{ uri: uri.startsWith('http') ? uri : `http://192.168.1.37:5000${uri}` }} style={styles.thumbImage} />
          ))}
        </View>

        {/* Amenities */}
        <Text style={styles.subTitle}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {amenitiesList.map(a => {
            const hasA = selectedAmenities.includes(a);
            return (
              <TouchableOpacity
                key={a}
                style={[styles.amenityBtn, hasA ? styles.amenityBtnActive : null]}
                onPress={() => handleAmenityToggle(a)}
              >
                <Text style={[styles.amenityText, hasA ? styles.amenityTextActive : null]}>
                  {a}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Premium Upgrade switch */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Upgrade to Premium Listing</Text>
            <Text style={{ fontSize: 11, color: '#8b85a3' }}>Appear at top of search lists for ₹499/mo</Text>
          </View>
          <Switch 
            value={isPremium}
            onValueChange={setIsPremium}
            trackColor={{ false: '#eae6f5', true: '#7c3aed' }}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSubmitText}>Save Listing details</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6fc',
  },
  scrollContent: {
    padding: 20,
  },
  hintText: {
    fontSize: 12,
    color: '#a09abc',
    marginBottom: 10,
    fontStyle: 'italic'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e1b29',
    marginTop: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.08)',
    paddingBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5f5a75',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#2d2a3a',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCol: {
    width: '48%',
  },
  thirdCol: {
    width: '31%',
  },
  genderRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  genderBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  genderBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5f5a75',
  },
  genderBtnTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.08)',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e1b29',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenityBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  amenityBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  amenityText: {
    fontSize: 12,
    color: '#5f5a75',
  },
  amenityTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  btnSubmit: {
    backgroundColor: '#7c3aed',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  btnSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  uploadBtn: {
    backgroundColor: '#eae6f5',
    borderWidth: 1,
    borderColor: '#d1cbed',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadBtnText: {
    color: '#7c3aed',
    fontWeight: 'bold'
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  thumbImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8
  }
});
