import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, SafeAreaView, Modal, Dimensions, Linking
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hostelsAPI, reviewsAPI, enquiriesAPI, paymentsAPI, tenantsAPI } from '../../api/apiClient';

const PHYSICAL_SERVER_IP = '192.168.1.37';
const SCREEN_WIDTH = Dimensions.get('window').width;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ROOM_TYPES = [
  { id: 'any', label: 'Any Room' },
  { id: 'single', label: 'Single Room' },
  { id: 'sharing2', label: '2-Sharing' },
  { id: 'sharing3', label: '3-Sharing' }
];

export default function HostelDetailScreen({ route, navigation }) {
  const { hostelId } = route.params;
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector(state => state.auth);

  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Review states
  const [userRating, setUserRating] = useState(5);
  const [userSafetyScore, setUserSafetyScore] = useState(5);
  const [userFoodRating, setUserFoodRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Enquiry states
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Monetization states
  const [localUnlocked, setLocalUnlocked] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentStep, setPaymentStep] = useState('initial'); // 'initial' or 'qr'
  const [processingPayment, setProcessingPayment] = useState(false);

  // Tenant states
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinStep, setJoinStep] = useState('initial'); // 'initial', 'qr'
  const [processingJoin, setProcessingJoin] = useState(false);

  useEffect(() => {
    setLocalUnlocked(user?.role === 'owner' || (user?.unlockedHostels && user.unlockedHostels.includes(hostelId)));
  }, [user, hostelId]);

  // New: Move-in date & room type
  const [moveInDate, setMoveInDate] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState('any');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Date picker state
  const today = new Date();
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());
  const [pickerYear, setPickerYear] = useState(today.getFullYear());

  const fetchHostelData = async () => {
    setLoading(true);
    try {
      const hostelRes = await hostelsAPI.getById(hostelId);
      if (hostelRes.data.success) {
        const h = hostelRes.data.hostel;
        setHostel(h);
        setEnquiryMessage(`Hi ${h.ownerName} garu! I'm interested in visiting "${h.name}". Can you please share room availability and visiting time?`);
        // Track view silently
        hostelsAPI.trackView(hostelId).catch(() => { });
      }
      const reviewsRes = await reviewsAPI.getByHostelId(hostelId);
      if (reviewsRes.data.success) setReviews(reviewsRes.data.reviews);
    } catch (err) {
      console.log('Hostel detail load error (may be normal if server not running):', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHostelData(); }, [hostelId]);

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to submit a review');
      return;
    }
    if (user.role !== 'student') {
      Alert.alert('Error', 'Only student accounts can leave reviews');
      return;
    }
    if (!userComment.trim()) {
      Alert.alert('Error', 'Please write review comments');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await reviewsAPI.create({
        hostelId,
        rating: userRating,
        safetyScore: userSafetyScore,
        foodRating: userFoodRating,
        comment: userComment
      });
      if (res.data.success) {
        setUserComment('');
        Alert.alert('✅ Review Submitted!', 'Thank you for your feedback.');
        fetchHostelData();
      }
    } catch (err) {
      Alert.alert('Review Error', err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEnquirySubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to send an enquiry');
      return;
    }
    if (user.role !== 'student') {
      Alert.alert('Error', 'Only student accounts can send enquiries');
      return;
    }
    setEnquirySubmitting(true);
    try {
      const res = await enquiriesAPI.create({
        hostelId,
        message: enquiryMessage,
        moveInDate: moveInDate ? moveInDate.toISOString() : null,
        roomType: selectedRoomType
      });
      if (res.data.success) {
        setEnquirySuccess(true);
        Alert.alert('🎉 Request Sent!', `Owner will contact you soon.\n📞 ${hostel.phone}`);
      }
    } catch (err) {
      Alert.alert('Enquiry Error', err.response?.data?.error || 'Failed to submit');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleChatPress = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to chat with the owner');
      return;
    }
    if (!hostel) return;
    navigation.navigate('Chat', {
      hostelId: hostel._id,
      hostelName: hostel.name,
      ownerId: hostel.owner,
      ownerName: hostel.ownerName
    });
  };

  const requireUnlock = (actionFn) => {
    if (localUnlocked) return actionFn();
    setPaymentModalVisible(true);
    setPaymentStep('initial');
  };

  const handleInitialPayClick = () => {
    if (!isAuthenticated) {
      setPaymentModalVisible(false);
      return Alert.alert('Login Required', 'Please log in to unlock contact info.');
    }
    setPaymentStep('qr');
  };

  const handleUploadScreenshot = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      setProcessingPayment(true);

      const formData = new FormData();
      formData.append('hostelId', hostelId);
      formData.append('screenshot', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'screenshot.jpg'
      });

      const res = await paymentsAPI.verifyScreenshot(formData);
      if (res.data.success) {
        Alert.alert('✅ Verification Successful', 'You have unlocked all owner details for this hostel!');
        setPaymentModalVisible(false);
        setPaymentStep('initial');
        setLocalUnlocked(true);
        // FIX: Update redux state and AsyncStorage so unlocked hostels persist across app restarts!
        const updatedUser = { ...user, unlockedHostels: res.data.unlockedHostels };
        dispatch(updateUser({ unlockedHostels: res.data.unlockedHostels }));
        AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Verification Failed', err.response?.data?.error || 'Could not verify your screenshot. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleUploadJoinScreenshot = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const photo = result.assets[0];

      setProcessingJoin(true);

      const formData = new FormData();
      formData.append('screenshot', {
        uri: photo.uri,
        name: photo.fileName || 'rent_screenshot.jpg',
        type: photo.type || 'image/jpeg'
      });
      formData.append('hostelId', hostel._id);

      // Determine Rent Amount based on selectedRoomType
      let rentAmt = 0;
      if (selectedRoomType === 'single' || selectedRoomType === 'Single Room') rentAmt = hostel.rent.single;
      else if (selectedRoomType === 'sharing2' || selectedRoomType === '2-Sharing') rentAmt = hostel.rent.sharing2;
      else if (selectedRoomType === 'sharing3' || selectedRoomType === '3-Sharing') rentAmt = hostel.rent.sharing3;
      else rentAmt = hostel.rent.single || hostel.rent.sharing2 || hostel.rent.sharing3; // fallback

      formData.append('roomType', selectedRoomType === 'any' ? 'Single Room' : selectedRoomType);
      formData.append('rentAmount', rentAmt);

      const res = await tenantsAPI.joinHostel(formData);

      if (res.data.success) {
        Alert.alert('🎉 Welcome!', 'Your rent payment was verified and you have joined the hostel!');
        setJoinModalVisible(false);
        setJoinStep('initial');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Verification Failed', err.response?.data?.error || 'Could not verify your rent payment screenshot. Please ensure the 12-digit UTR is clearly visible.');
    } finally {
      setProcessingJoin(false);
    }
  };

  // ✅ Open location in Google Maps
  const handleOpenMap = () => {
    if (!hostel?.location?.coordinates) {
      Alert.alert('Location unavailable', 'This hostel has not set GPS coordinates.');
      return;
    }
    const [lng, lat] = hostel.location.coordinates;
    const label = encodeURIComponent(hostel.name);
    // Try Google Maps first, fallback to geo: URL
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
    const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    Linking.canOpenURL('comgooglemaps://')
      .then(canOpen => {
        if (canOpen) {
          return Linking.openURL(`comgooglemaps://?q=${lat},${lng}&zoom=17`);
        }
        return Linking.openURL(googleMapsUrl);
      })
      .catch(() => Linking.openURL(geoUrl));
  };

  const handleWhatsAppOwner = () => {
    if (!hostel) return;
    const msg = encodeURIComponent(`Hi ${hostel.ownerName} garu! I saw your PG "${hostel.name}" on HostelSathi. I am interested in visiting. Please let me know a convenient time.`);
    Linking.openURL(`https://wa.me/91${hostel.phone}?text=${msg}`)
      .catch(() => Alert.alert('WhatsApp not installed'));
  };

  // Calendar date picker helpers
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(pickerMonth, pickerYear);
    const firstDay = new Date(pickerYear, pickerMonth, 1).getDay();
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(pickerYear, pickerMonth, d);
      const isPast = date < today;
      const isSelected = moveInDate &&
        date.toDateString() === moveInDate.toDateString();

      days.push(
        <TouchableOpacity
          key={d}
          style={[styles.dayCell, isSelected && styles.dayCellSelected, isPast && styles.dayCellPast]}
          onPress={() => {
            if (!isPast) {
              setMoveInDate(date);
              setDatePickerVisible(false);
            }
          }}
          disabled={isPast}
        >
          <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isPast && styles.dayTextPast]}>
            {d}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#2874f0" />
        <Text style={styles.loadingText}>Loading hostel details...</Text>
      </View>
    );
  }

  if (!hostel) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Hostel not found.</Text>
      </View>
    );
  }

  const getDistanceKm = () => {
    if (!hostel.location?.coordinates) return 0.5;
    const [lng, lat] = hostel.location.coordinates;
    const dLng = lng - 78.3888;
    const dLat = lat - 17.4950;
    return Math.round(Math.sqrt(dLng * dLng + dLat * dLat) * 111 * 10) / 10;
  };

  const SERVER_BASE = `http://${PHYSICAL_SERVER_IP}:5000`;
  const allPhotos = hostel.photos?.length > 0
    ? hostel.photos.map(p => p.startsWith('http') ? p : `${SERVER_BASE}${p}`)
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'];

  const allFoodPhotos = hostel.foodPhotos?.length > 0
    ? hostel.foodPhotos.map(p => p.startsWith('http') ? p : `${SERVER_BASE}${p}`)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Photo Gallery Hero */}
        <View style={styles.galleryHero}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhotoIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {allPhotos.map((photo, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.95}
                onPress={() => { setGalleryIndex(i); setGalleryVisible(true); }}
              >
                <Image source={{ uri: photo }} style={styles.heroImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Photo indicators */}
          <View style={styles.photoIndicators}>
            {allPhotos.map((_, i) => (
              <View key={i} style={[styles.photoIndicatorDot, i === activePhotoIndex && styles.photoIndicatorDotActive]} />
            ))}
          </View>

          {/* Photo count badge */}
          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountText}>📷 {allPhotos.length} photos</Text>
          </View>

          {/* Badges overlay */}
          <View style={styles.heroBadges}>
            {hostel.isPremium && (
              <View style={styles.heroBadgePremium}>
                <Text style={styles.heroBadgeText}>⭐ PREMIUM</Text>
              </View>
            )}
            {hostel.isVerified && (
              <View style={styles.heroBadgeVerified}>
                <Text style={styles.heroBadgeText}>✓ VERIFIED</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contentCard}>
          {/* Title + Rating */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hostelName}>{hostel.name}</Text>
              <Text style={styles.hostelAddress}>📍 {hostel.address}</Text>
            </View>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingStarIcon}>★</Text>
              <Text style={styles.ratingValue}>{hostel.rating > 0 ? hostel.rating.toFixed(1) : 'New'}</Text>
              <Text style={styles.ratingCount}>({hostel.reviewCount})</Text>
            </View>
            {hostel.safetyScore > 0 && (
              <View style={styles.ratingPill}>
                <Text style={styles.ratingStarIcon}>🛡️</Text>
                <Text style={styles.ratingValue}>{hostel.safetyScore}</Text>
              </View>
            )}
            {hostel.foodRating > 0 && (
              <View style={styles.ratingPill}>
                <Text style={styles.ratingStarIcon}>🍽️</Text>
                <Text style={styles.ratingValue}>{hostel.foodRating}</Text>
              </View>
            )}
          </View>

          {/* Quick Info Pills */}
          <View style={styles.infoPillsRow}>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>
                {hostel.gender === 'boys' ? '👦 Boys PG' : hostel.gender === 'girls' ? '👧 Girls PG' : '👫 Co-living'}
              </Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>
                {hostel.foodIncluded ? `🍽️ ${hostel.foodType} food` : '🚫 No Food'}
              </Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>📏 {getDistanceKm()} km away</Text>
            </View>
          </View>

          {/* Nearby Colleges */}
          {hostel.nearbyColleges?.length > 0 && (
            <View style={styles.collegesRow}>
              <Text style={styles.collegesLabel}>🎓 Nearby:</Text>
              <Text style={styles.collegesText}>{hostel.nearbyColleges.join(' • ')}</Text>
            </View>
          )}

          {/* Quick Action Buttons */}
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionBtnChat} onPress={() => requireUnlock(handleChatPress)}>
              <Text style={styles.actionBtnChatText}>{localUnlocked ? '💬 Chat' : '🔒 Chat'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnMap} onPress={() => requireUnlock(handleOpenMap)}>
              <Text style={styles.actionBtnMapText}>{localUnlocked ? '🗺 Map' : '🔒 Map'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnCall}
              onPress={() => requireUnlock(() => Linking.openURL(`tel:${hostel.phone}`))}
            >
              <Text style={styles.actionBtnCallText}>{localUnlocked ? '📞 Call' : '🔒 Call'}</Text>
            </TouchableOpacity>
          </View>

          {/* WhatsApp Row */}
          <TouchableOpacity style={styles.whatsappBtn} onPress={() => requireUnlock(handleWhatsAppOwner)}>
            <Text style={styles.whatsappBtnText}>{localUnlocked ? '💬 WhatsApp Owner' : '🔒 WhatsApp Owner (Pay ₹5 to Unlock)'}</Text>
          </TouchableOpacity>

          {hostel.paymentUpiId && (
            <TouchableOpacity
              style={[styles.btnBook, { backgroundColor: '#10b981', marginTop: 16 }]}
              onPress={() => {
                if (!isAuthenticated) {
                  Alert.alert('Login Required', 'Please log in to join hostel');
                  return;
                }
                if (user?.role !== 'student') {
                  Alert.alert('Error', 'Only students can join hostels');
                  return;
                }
                setJoinModalVisible(true);
              }}
            >
              <Text style={styles.btnBookText}>🎉 Join Hostel & Pay Rent Direct</Text>
            </TouchableOpacity>
          )}

          {/* Premium Room Pricing */}
          <Text style={styles.sectionTitle}>🏷️ Room Pricing</Text>
          <View style={styles.pricingList}>
            {[
              { label: 'Single Room', icon: '🛏️', val: hostel.rent.single, vacancies: hostel.availability?.singleVacancy },
              { label: '2-Sharing', icon: '🛏️🛏️', val: hostel.rent.sharing2, vacancies: hostel.availability?.sharing2Vacancy },
              { label: '3-Sharing', icon: '🛏️🛏️🛏️', val: hostel.rent.sharing3, vacancies: hostel.availability?.sharing3Vacancy },
              { label: '4-Sharing', icon: '🛏️x4', val: hostel.rent.sharing4, vacancies: hostel.availability?.sharing4Vacancy },
              { label: '5-Sharing', icon: '🛏️x5', val: hostel.rent.sharing5, vacancies: hostel.availability?.sharing5Vacancy }
            ].filter(p => p.val > 0).map(p => (
              <TouchableOpacity
                key={p.label}
                style={[styles.premiumPriceCard, selectedRoomType === p.label && styles.premiumPriceCardSelected]}
                onPress={() => setSelectedRoomType(p.label)}
                activeOpacity={0.8}
              >
                <View style={styles.premiumPriceTop}>
                  <Text style={styles.premiumPriceIcon}>{p.icon}</Text>
                  {p.vacancies !== undefined && (
                    <View style={[styles.vacancyPill, p.vacancies > 0 ? styles.vacancyPillAvailable : styles.vacancyPillFull]}>
                      <Text style={[styles.vacancyPillText, p.vacancies > 0 ? styles.vacancyPillTextAvailable : styles.vacancyPillTextFull]}>
                        {p.vacancies > 0 ? `${p.vacancies} Left` : 'Full'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.premiumPriceLabel} numberOfLines={1} adjustsFontSizeToFit>{p.label}</Text>
                <View style={styles.premiumPriceBottom}>
                  <Text style={styles.premiumPriceVal} numberOfLines={1} adjustsFontSizeToFit>₹{p.val.toLocaleString('en-IN')}</Text>
                  <Text style={styles.premiumPriceUnit}>/mo</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Financials & Fees */}
          {(hostel.fees?.depositAmount > 0 || hostel.fees?.maintenanceFee > 0 || hostel.fees?.noticePeriodDays > 0) && (
            <>
              <Text style={styles.sectionTitle}>💰 Financials & Fees</Text>
              <View style={styles.feesCard}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Security Deposit</Text>
                  <Text style={styles.feeVal}>
                    {hostel.fees.depositAmount > 0 ? `₹${hostel.fees.depositAmount.toLocaleString('en-IN')}` : 'None'}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Maintenance Fee (per month)</Text>
                  <Text style={styles.feeVal}>
                    {hostel.fees.maintenanceFee > 0 ? `₹${hostel.fees.maintenanceFee.toLocaleString('en-IN')}` : 'Included'}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Notice Period</Text>
                  <Text style={styles.feeVal}>
                    {hostel.fees.noticePeriodDays > 0 ? `${hostel.fees.noticePeriodDays} Days` : 'N/A'}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Distance Card */}
          <View style={styles.distanceCard}>
            <Text style={styles.distanceTitle}>🏫 Campus Distance</Text>
            <Text style={styles.distanceKm}>{getDistanceKm()} km from nearby campus</Text>
            <View style={styles.distanceRow}>
              <View style={styles.distanceItem}>
                <Text style={styles.distanceIcon}>🚶</Text>
                <Text style={styles.distanceName}>Walk</Text>
                <Text style={styles.distanceDuration}>{Math.max(1, Math.round(getDistanceKm() * 12))} min</Text>
              </View>
              <View style={styles.distanceDivider} />
              <View style={styles.distanceItem}>
                <Text style={styles.distanceIcon}>🛺</Text>
                <Text style={styles.distanceName}>Auto</Text>
                <Text style={styles.distanceDuration}>{Math.max(2, Math.round(getDistanceKm() * 3))} min</Text>
              </View>
              <View style={styles.distanceDivider} />
              <View style={styles.distanceItem}>
                <Text style={styles.distanceIcon}>🚌</Text>
                <Text style={styles.distanceName}>Bus</Text>
                <Text style={styles.distanceDuration}>{Math.max(5, Math.round(getDistanceKm() * 5))} min</Text>
              </View>
            </View>
          </View>

          {/* Food Gallery */}
          {allFoodPhotos.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🍽️ Food & Dining Area</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {allFoodPhotos.map((photo, i) => (
                  <TouchableOpacity key={i} onPress={() => { /* Option to expand if needed */ }}>
                    <Image source={{ uri: photo }} style={{ width: 120, height: 100, borderRadius: 12, marginRight: 10 }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* House Rules */}
          {hostel.rules && (
            <>
              <Text style={styles.sectionTitle}>📜 House Rules & Policies</Text>
              <View style={styles.rulesGrid}>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleIcon}>🕒</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleLabel}>Curfew Time</Text>
                    <Text style={styles.ruleVal} numberOfLines={1}>{hostel.rules.curfewTime || 'No curfew'}</Text>
                  </View>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleIcon}>{hostel.rules.visitorsAllowed ? '✅' : '🚫'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleLabel}>Visitors</Text>
                    <Text style={[styles.ruleVal, !hostel.rules.visitorsAllowed && styles.ruleValDisabled]} numberOfLines={1}>
                      {hostel.rules.visitorsAllowed ? 'Allowed' : 'Not Allowed'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleIcon}>{hostel.rules.smokingAllowed ? '🚬' : '🚭'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleLabel}>Smoking</Text>
                    <Text style={[styles.ruleVal, !hostel.rules.smokingAllowed && styles.ruleValDisabled]} numberOfLines={1}>
                      {hostel.rules.smokingAllowed ? 'Allowed' : 'Not Allowed'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleIcon}>{hostel.rules.drinkingAllowed ? '🍻' : '🚱'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleLabel}>Drinking</Text>
                    <Text style={[styles.ruleVal, !hostel.rules.drinkingAllowed && styles.ruleValDisabled]} numberOfLines={1}>
                      {hostel.rules.drinkingAllowed ? 'Allowed' : 'Not Allowed'}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Amenities */}
          <Text style={styles.sectionTitle}>✅ Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {hostel.amenities?.length > 0 ? hostel.amenities.map((a, i) => (
              <View key={i} style={styles.amenityPill}>
                <Text style={styles.amenityCheck}>✓</Text>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            )) : (
              <Text style={styles.noDataText}>No amenities listed.</Text>
            )}
          </View>

          {/* Booking Enquiry Box */}
          <View style={styles.bookingBox}>
            <Text style={styles.bookingTitle}>📋 Book a Visit</Text>
            {enquirySuccess ? (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={styles.successTitle}>Visit Request Sent!</Text>
                <Text style={styles.successText}>Owner: {hostel.ownerName}</Text>
                <Text style={styles.successText}>Phone: {hostel.phone}</Text>
                <TouchableOpacity style={styles.chatSuccessBtn} onPress={handleChatPress}>
                  <Text style={styles.chatSuccessBtnText}>💬 Continue Chat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Room Type Selector */}
                <Text style={styles.bookingLabel}>Room Type</Text>
                <View style={styles.roomTypeRow}>
                  {ROOM_TYPES.map(rt => (
                    <TouchableOpacity
                      key={rt.id}
                      style={[styles.roomTypeBtn, selectedRoomType === rt.id && styles.roomTypeBtnActive]}
                      onPress={() => setSelectedRoomType(rt.id)}
                    >
                      <Text style={[styles.roomTypeBtnText, selectedRoomType === rt.id && styles.roomTypeBtnTextActive]}>
                        {rt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Move-in Date */}
                <Text style={styles.bookingLabel}>Preferred Move-in Date</Text>
                <TouchableOpacity style={styles.datePickerBtn} onPress={() => setDatePickerVisible(true)}>
                  <Text style={styles.datePickerIcon}>📅</Text>
                  <Text style={styles.datePickerText}>
                    {moveInDate
                      ? `${moveInDate.getDate()} ${MONTHS[moveInDate.getMonth()]} ${moveInDate.getFullYear()}`
                      : 'Select a date (optional)'
                    }
                  </Text>
                  {moveInDate && (
                    <TouchableOpacity onPress={() => setMoveInDate(null)}>
                      <Text style={styles.dateClearBtn}>✕</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {/* Message */}
                <Text style={styles.bookingLabel}>Message to Owner</Text>
                <TextInput
                  value={enquiryMessage}
                  onChangeText={setEnquiryMessage}
                  multiline
                  numberOfLines={3}
                  style={styles.messageInput}
                  placeholderTextColor="#878787"
                />

                <TouchableOpacity
                  style={styles.btnBook}
                  onPress={() => requireUnlock(handleEnquirySubmit)}
                  disabled={enquirySubmitting}
                >
                  {enquirySubmitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnBookText}>{localUnlocked ? '✅ Submit Visit Request' : '🔒 Pay ₹5 to Unlock & Submit'}</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Reviews Section */}
          <Text style={styles.sectionTitle}>⭐ Student Reviews ({reviews.length})</Text>

          {isAuthenticated && user?.role === 'student' && (
            <View style={styles.writeReviewBox}>
              <Text style={styles.writeReviewTitle}>Write a Review</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setUserRating(s)}>
                    <Text style={[styles.starIcon, s <= userRating && styles.starIconActive]}>★</Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingLabel}>{userRating}/5 Overall</Text>
              </View>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setUserSafetyScore(s)}>
                    <Text style={[styles.starIcon, s <= userSafetyScore && { color: '#10b981' }]}>🛡️</Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingLabel}>{userSafetyScore}/5 Safety</Text>
              </View>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setUserFoodRating(s)}>
                    <Text style={[styles.starIcon, s <= userFoodRating && { color: '#f59e0b' }]}>🍽️</Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingLabel}>{userFoodRating}/5 Food</Text>
              </View>

              <TextInput
                placeholder="Share your experience — food, safety, management..."
                value={userComment}
                onChangeText={setUserComment}
                style={styles.commentInput}
                multiline
                placeholderTextColor="#878787"
              />
              <TouchableOpacity
                style={styles.btnSubmitReview}
                onPress={handleReviewSubmit}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnSubmitReviewText}>Submit Review</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {reviews.length > 0 ? reviews.map(r => (
            <View key={r._id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{r.userName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewUser}>{r.userName}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.reviewStarsBox}>
                  <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          )) : (
            <View style={styles.noReviewsBox}>
              <Text style={styles.noReviewsText}>Be the first to review this hostel!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Full-screen Photo Gallery Modal */}
      <Modal visible={galleryVisible} transparent animationType="fade">
        <View style={styles.galleryModal}>
          <TouchableOpacity style={styles.galleryClose} onPress={() => setGalleryVisible(false)}>
            <Text style={styles.galleryCloseText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.galleryCounter}>{galleryIndex + 1} / {allPhotos.length}</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: galleryIndex * SCREEN_WIDTH, y: 0 }}
            onScroll={e => {
              const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setGalleryIndex(i);
            }}
            scrollEventThrottle={16}
          >
            {allPhotos.map((photo, i) => (
              <View key={i} style={styles.gallerySlide}>
                <Image source={{ uri: photo }} style={styles.galleryImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Payment Paywall Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!processingPayment) {
            setPaymentModalVisible(false);
            setPaymentStep('initial');
          }
        }}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModal}>
            {paymentStep === 'initial' ? (
              <>
                <Text style={styles.paymentModalIcon}>💳</Text>
                <Text style={styles.paymentModalTitle}>Unlock Contact Details</Text>
                <Text style={styles.paymentModalDesc}>
                  Pay just <Text style={{ fontWeight: 'bold', color: '#2874f0' }}>₹5</Text> to instantly unlock the owner's phone number, WhatsApp, Map location, and Chat feature.
                </Text>
                <View style={styles.paymentActionRow}>
                  <TouchableOpacity style={styles.payBtn} onPress={handleInitialPayClick}>
                    <Text style={styles.payBtnText}>Pay ₹5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.payCancelBtn} onPress={() => { setPaymentModalVisible(false); setPaymentStep('initial'); }}>
                    <Text style={styles.payCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.paymentModalTitle}>Scan to Unlock</Text>
                <Text style={styles.paymentModalDesc}>
                  Scan and pay exactly <Text style={{ fontWeight: 'bold', color: '#2874f0' }}>₹5.00</Text>. Then upload the payment success screenshot.
                </Text>

                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('upi://pay?pa=hostelsathi@ybl&pn=HostelSathi&am=5.00&cu=INR')}` }}
                  style={styles.qrCodeImage}
                />

                {processingPayment ? (
                  <View style={styles.paymentProcessing}>
                    <ActivityIndicator size="large" color="#2874f0" />
                    <Text style={styles.paymentProcessingText}>AI is verifying your screenshot...</Text>
                  </View>
                ) : (
                  <View style={styles.paymentActionRow}>
                    <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadScreenshot}>
                      <Text style={styles.payBtnText}>Upload Screenshot</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.payCancelBtn} onPress={() => { setPaymentModalVisible(false); setPaymentStep('initial'); }}>
                      <Text style={styles.payCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={datePickerVisible} transparent animationType="slide">
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModal}>
            <Text style={styles.dateModalTitle}>Select Move-in Date</Text>
            {/* Month Navigator */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={() => {
                  if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(pickerYear - 1); }
                  else setPickerMonth(pickerMonth - 1);
                }}
              >
                <Text style={styles.monthNavArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[pickerMonth]} {pickerYear}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(pickerYear + 1); }
                  else setPickerMonth(pickerMonth + 1);
                }}
              >
                <Text style={styles.monthNavArrow}>›</Text>
              </TouchableOpacity>
            </View>
            {/* Day Headers */}
            <View style={styles.dayHeaders}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>
            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
            <TouchableOpacity
              style={styles.dateModalClose}
              onPress={() => setDatePickerVisible(false)}
            >
              <Text style={styles.dateModalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join & Pay Rent Modal */}
      <Modal
        visible={joinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!processingJoin) {
            setJoinModalVisible(false);
            setJoinStep('initial');
          }
        }}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModal}>
            {processingJoin ? (
              <View style={styles.paymentProcessing}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={[styles.paymentProcessingText, { color: '#10b981' }]}>Verifying rent payment with AI...</Text>
              </View>
            ) : joinStep === 'initial' ? (
              <>
                <Text style={styles.paymentModalIcon}>🏠</Text>
                <Text style={styles.paymentModalTitle}>Join {hostel?.name}</Text>
                <Text style={styles.paymentModalDesc}>
                  Secure your room by paying the rent directly to the owner via UPI. We will automatically verify your payment!
                </Text>
                <View style={styles.paymentActionRow}>
                  <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#10b981' }]} onPress={() => setJoinStep('qr')}>
                    <Text style={styles.payBtnText}>Proceed to Pay Rent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.payCancelBtn} onPress={() => setJoinModalVisible(false)}>
                    <Text style={styles.payCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.paymentModalTitle, { fontSize: 18, marginBottom: 5 }]}>Owner's UPI QR Code</Text>
                <Text style={[styles.paymentModalDesc, { marginBottom: 15 }]}>
                  Scan this code to pay the rent to: {hostel?.paymentUpiId}
                </Text>
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${hostel?.paymentUpiId}&pn=${hostel?.ownerName}&cu=INR` }}
                  style={styles.qrCodeImage}
                />
                <View style={styles.paymentActionRow}>
                  <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadJoinScreenshot}>
                    <Text style={styles.payBtnText}>📸 Upload Success Screenshot</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.payCancelBtn} onPress={() => setJoinStep('initial')}>
                    <Text style={styles.payCancelText}>Go Back</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f3f6' },
  scrollContent: { paddingBottom: 40 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#878787', fontSize: 14 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#878787', fontSize: 14 },
  // Gallery
  galleryHero: { position: 'relative' },
  heroImage: { width: SCREEN_WIDTH, height: 260 },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6
  },
  photoIndicatorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  photoIndicatorDotActive: { backgroundColor: '#ffffff', width: 18 },
  photoCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  photoCountText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  heroBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6
  },
  heroBadgePremium: {
    backgroundColor: '#f59e0b',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  heroBadgeVerified: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  heroBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  // Content
  contentCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  hostelName: { fontSize: 22, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  hostelAddress: { fontSize: 13, color: '#878787', lineHeight: 18 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 3,
    alignSelf: 'flex-start'
  },
  ratingStarIcon: { color: '#f59e0b', fontSize: 14 },
  ratingValue: { color: '#d97706', fontSize: 14, fontWeight: 'bold' },
  ratingCount: { color: '#d97706', fontSize: 11 },
  infoPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  infoPill: {
    backgroundColor: '#f0ecfd',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.12)'
  },
  infoPillText: { fontSize: 12, color: '#5f5a75', fontWeight: '600' },
  collegesRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(124,58,237,0.08)' },
  collegesLabel: { fontSize: 12, color: '#2874f0', fontWeight: 'bold', flexShrink: 0 },
  collegesText: { fontSize: 12, color: '#5f5a75', flex: 1, lineHeight: 18 },
  actionBtns: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtnChat: {
    flex: 1,
    backgroundColor: '#2874f0',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center'
  },
  actionBtnChatText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  actionBtnMap: {
    width: 68,
    backgroundColor: '#ede9fe',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c4b5fd'
  },
  actionBtnMapText: { color: '#2874f0', fontWeight: 'bold', fontSize: 13 },
  actionBtnCall: {
    width: 68,
    backgroundColor: '#ecfdf5',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981'
  },
  actionBtnCallText: { color: '#059669', fontWeight: 'bold', fontSize: 14 },
  whatsappBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#4ade80',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  whatsappBtnText: { color: '#15803d', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginTop: 20, marginBottom: 12 },

  // Premium Pricing Cards
  pricingList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginBottom: 16 },
  premiumPriceCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.06)',
    shadowColor: '#2874f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4
  },
  premiumPriceCardSelected: { borderColor: '#2874f0', backgroundColor: '#faf8ff' },
  premiumPriceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  premiumPriceIcon: { fontSize: 20 },
  premiumPriceLabel: { fontSize: 13, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  vacancyPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  vacancyPillAvailable: { backgroundColor: '#d1fae5' },
  vacancyPillFull: { backgroundColor: '#fee2e2' },
  vacancyPillText: { fontSize: 9, fontWeight: 'bold' },
  vacancyPillTextAvailable: { color: '#059669' },
  vacancyPillTextFull: { color: '#dc2626' },
  premiumPriceBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  premiumPriceVal: { fontSize: 16, fontWeight: '900', color: '#2874f0' },
  premiumPriceUnit: { fontSize: 11, color: '#878787', marginBottom: 2 },

  distanceCard: {
    backgroundColor: 'rgba(124,58,237,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  distanceTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  distanceKm: { fontSize: 12, color: '#878787', marginBottom: 12 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  distanceItem: { alignItems: 'center', flex: 1 },
  distanceIcon: { fontSize: 20, marginBottom: 4 },
  distanceName: { fontSize: 11, color: '#5f5a75', fontWeight: '600' },
  distanceDuration: { fontSize: 10, color: '#878787', marginTop: 2 },
  distanceDivider: { width: 1, height: 30, backgroundColor: 'rgba(124,58,237,0.1)' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  amenityPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f3f6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(124,58,237,0.08)' },
  amenityCheck: { color: '#10b981', fontWeight: 'bold', fontSize: 12 },
  amenityText: { fontSize: 12, color: '#212121', fontWeight: '500' },
  noDataText: { fontSize: 13, color: '#878787', fontStyle: 'italic' },
  // Fees
  feesCard: {
    backgroundColor: '#faf8ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    marginBottom: 16
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  feeLabel: { fontSize: 13, color: '#5f5a75' },
  feeVal: { fontSize: 14, fontWeight: 'bold', color: '#212121' },
  // Rules
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  ruleItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.08)',
    gap: 10
  },
  ruleIcon: { fontSize: 20 },
  ruleLabel: { fontSize: 11, color: '#878787' },
  ruleVal: { fontSize: 13, fontWeight: 'bold', color: '#212121' },
  ruleValDisabled: { color: '#ef4444' },
  bookingBox: {
    borderColor: 'rgba(124,58,237,0.15)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16
  },
  distanceTitle: { fontSize: 13, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  distanceKm: { fontSize: 11, color: '#5f5a75', marginBottom: 12 },
  distanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  distanceItem: { alignItems: 'center', flex: 1 },
  distanceIcon: { fontSize: 22, marginBottom: 4 },
  distanceName: { fontSize: 11, color: '#878787' },
  distanceDuration: { fontSize: 13, fontWeight: 'bold', color: '#2874f0' },
  distanceDivider: { width: 1, backgroundColor: 'rgba(124,58,237,0.15)' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fcf6',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 5
  },
  amenityCheck: { color: '#10b981', fontWeight: 'bold', fontSize: 12 },
  amenityText: { fontSize: 12, color: '#059669', fontWeight: '600' },
  noDataText: { color: '#878787', fontSize: 13, paddingVertical: 8 },
  bookingBox: {
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    backgroundColor: 'rgba(124,58,237,0.01)'
  },
  bookingTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 14 },
  bookingLabel: { fontSize: 12, fontWeight: 'bold', color: '#5f5a75', marginBottom: 8, marginTop: 12 },
  roomTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomTypeBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    backgroundColor: '#f1f3f6'
  },
  roomTypeBtnActive: { backgroundColor: '#2874f0', borderColor: '#2874f0' },
  roomTypeBtnText: { fontSize: 12, color: '#5f5a75', fontWeight: '600' },
  roomTypeBtnTextActive: { color: '#ffffff' },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f6',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10
  },
  datePickerIcon: { fontSize: 16 },
  datePickerText: { flex: 1, fontSize: 14, color: '#5f5a75' },
  dateClearBtn: { color: '#878787', fontSize: 14, fontWeight: 'bold' },
  messageInput: {
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    backgroundColor: '#f1f3f6',
    padding: 12,
    fontSize: 13,
    color: '#2d2a3a',
    borderRadius: 10,
    textAlignVertical: 'top',
    minHeight: 70
  },
  btnBook: {
    backgroundColor: '#2874f0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12
  },
  btnBookText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  successBox: { alignItems: 'center', paddingVertical: 16 },
  successIcon: { fontSize: 40, marginBottom: 8 },
  successTitle: { fontSize: 18, color: '#10b981', fontWeight: 'bold', marginBottom: 6 },
  successText: { fontSize: 14, color: '#2d2a3a', marginTop: 3 },
  chatSuccessBtn: {
    marginTop: 14,
    backgroundColor: '#2874f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50
  },
  chatSuccessBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  writeReviewBox: {
    backgroundColor: '#f1f3f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)'
  },
  writeReviewTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 10 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  starIcon: { fontSize: 26, color: '#d1c7f0' },
  starIconActive: { color: '#f59e0b' },
  ratingLabel: { fontSize: 12, color: '#878787', marginLeft: 4 },
  commentInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#2d2a3a',
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top'
  },
  btnSubmitReview: {
    backgroundColor: '#2874f0',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: 'flex-end'
  },
  btnSubmitReviewText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  reviewItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.08)'
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2874f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewAvatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  reviewUser: { fontWeight: 'bold', color: '#212121', fontSize: 13 },
  reviewDate: { fontSize: 11, color: '#878787', marginTop: 1 },
  reviewStarsBox: {},
  reviewStars: { color: '#f59e0b', fontSize: 14 },
  reviewComment: { fontSize: 13, color: '#5f5a75', lineHeight: 20 },
  noReviewsBox: { paddingVertical: 20, alignItems: 'center' },
  noReviewsText: { color: '#878787', fontSize: 13 },
  // Full-screen Gallery Modal
  galleryModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center'
  },
  galleryClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  galleryCloseText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  galleryCounter: {
    position: 'absolute',
    top: 55,
    left: 20,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    zIndex: 10
  },
  gallerySlide: { width: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center' },
  galleryImage: { width: SCREEN_WIDTH, height: '80%' },
  // Date Picker Modal
  dateModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  dateModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36
  },
  dateModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', textAlign: 'center', marginBottom: 16 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthNavArrow: { fontSize: 28, color: '#2874f0', fontWeight: 'bold', paddingHorizontal: 12 },
  monthLabel: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 12, color: '#878787', fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCellSelected: { backgroundColor: '#2874f0', borderRadius: 50 },
  dayCellPast: { opacity: 0.3 },
  dayText: { fontSize: 14, color: '#212121', fontWeight: '500' },
  dayTextSelected: { color: '#ffffff', fontWeight: 'bold' },
  dayTextPast: { color: '#c4b5fd' },
  dateModalClose: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.1)'
  },
  dateModalCloseText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },

  // Payment Modal
  paymentModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  paymentModal: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  paymentModalIcon: { fontSize: 48, marginBottom: 16 },
  paymentModalTitle: { fontSize: 20, fontWeight: '900', color: '#212121', marginBottom: 10 },
  paymentModalDesc: { fontSize: 14, color: '#5f5a75', textAlign: 'center', lineHeight: 22, marginBottom: 20, paddingHorizontal: 10 },
  paymentProcessing: { alignItems: 'center', paddingVertical: 20 },
  paymentProcessingText: { fontSize: 14, color: '#2874f0', fontWeight: '600', marginTop: 12 },
  paymentActionRow: { width: '100%', gap: 12 },
  payBtn: { backgroundColor: '#2874f0', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%' },
  payBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  uploadBtn: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', width: '100%' },
  payCancelBtn: { paddingVertical: 12, alignItems: 'center', width: '100%' },
  payCancelText: { color: '#878787', fontSize: 14, fontWeight: 'bold' },
  qrCodeImage: { width: 160, height: 160, marginBottom: 20 }
});
