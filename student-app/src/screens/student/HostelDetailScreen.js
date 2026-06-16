import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Linking,
  Modal,
  TextInput
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import { hostelsAPI, enquiriesAPI } from "../../api/apiClient";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateUser } from "../../redux/authSlice";
import { addReceipt } from "../../redux/bookingsSlice";
import { addNotification } from "../../redux/notificationSlice";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HostelDetailScreen({ route, navigation }) {
  const { hostelId } = route.params;
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { hostels, savedHostels } = useSelector((state) => state.hostels);
  const dispatch = useDispatch();

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [bookVisitModalVisible, setBookVisitModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [activeReviewTab, setActiveReviewTab] = useState('All');
  
  const [selectedDate, setSelectedDate] = useState(12);
  const [messageToOwner, setMessageToOwner] = useState('');

  const [paywallModalVisible, setPaywallModalVisible] = useState(false);
  const [verifyingScreenshot, setVerifyingScreenshot] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchHostelData();
  }, [hostelId]);

  const fetchHostelData = async () => {
    setLoading(true);
    try {
      // Simulate backend fetch by getting from Redux
      const h = hostels.find(x => x._id === hostelId);
      if (h) {
        setHostel(h);
      }
    } catch (err) {
      console.log("Error fetching hostel details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLockedAction = (actionCallback) => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please log in first.");
      return;
    }
    if (user?.unlockedHostels?.includes(hostelId)) {
      actionCallback();
    } else {
      setPendingAction(() => actionCallback);
      setPaywallModalVisible(true);
    }
  };

  const handleUploadScreenshot = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.5 });
      if (result.didCancel) return;

      setVerifyingScreenshot(true);

      // Simulate ML Duplicate/Fake Check Delay
      setTimeout(async () => {
        setVerifyingScreenshot(false);

        // 20% chance to simulate a duplicate/fake screenshot rejection
        if (Math.random() < 0.2) {
          Alert.alert(
            "Verification Failed", 
            "Invalid or duplicate screenshot detected. Please upload a clear, unique UPI payment receipt."
          );
          return;
        }

        // Success Flow - Unlock specifically for this hostel
        const updatedUnlockedHostels = user?.unlockedHostels ? [...user.unlockedHostels, hostel._id] : [hostel._id];
        const updatedUser = { ...user, unlockedHostels: updatedUnlockedHostels };
        
        dispatch(updateUser({ unlockedHostels: updatedUnlockedHostels }));
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        
        // Add receipt to bookings history
        dispatch(addReceipt({
          _id: 'rec_' + Date.now(),
          hostelName: `${hostel.name} - Contact Fee`,
          month: 'One-time',
          amount: 1,
          paidOn: new Date().toISOString().split('T')[0],
          transactionId: 'TXN' + Math.floor(Math.random() * 1000000000),
          status: 'success'
        }));

        // Dispatch a real Notification
        dispatch(addNotification({
          _id: Date.now().toString(),
          icon: 'lock-open-outline',
          iconBg: '#ecfdf5',
          iconColor: '#10b981',
          title: 'Hostel Unlocked',
          subtitle: `Contact details for ${hostel.name} are now unlocked!`,
          time: 'Just now',
          read: false
        }));

        setPaywallModalVisible(false);
        Alert.alert("Success!", "Contact features unlocked successfully.");
        
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      }, 2500);

    } catch (error) {
      console.log('Error picking image: ', error);
    }
  };

  const handleCall = () => {
    handleLockedAction(() => Linking.openURL(`tel:${hostel?.phone || '9876543210'}`));
  };

  const handleMap = () => {
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(hostel?.address || 'Hostel')}`);
  };

  const handleShare = () => {
    Alert.alert("Share", `Share ${hostel?.name} with your friends!`);
  };

  const handleChat = () => {
    handleLockedAction(() => {
      navigation.navigate("Chat", {
        hostelId: hostel._id,
        hostelName: hostel.name,
        ownerId: hostel.owner,
        ownerName: hostel.ownerName,
      });
    });
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!hostel) {
    return (
      <View style={styles.centerBox}>
        <Text style={{ fontSize: 16, color: "#6b7280" }}>Hostel not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#4F46E5", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos = hostel.photos?.length > 0 
    ? hostel.photos 
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"];

  const fallbackReviews = hostel.reviews || [
    { id: 1, user: 'Ravi Teja', sub: 'NRI Institute of Technology', date: '2 days ago', text: 'Best hostel I have ever stayed in. Food is amazing and management is very friendly.', photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=100', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=100'] },
    { id: 2, user: 'Sita Ram', sub: 'NIT Warangal', date: '1 week ago', text: 'Very clean and peaceful. Internet could be slightly better but overall a great place.', photos: [] },
    { id: 3, user: 'Karthik', sub: 'CBIT', date: '3 weeks ago', text: 'Good security, gate closes at 10:30 which is standard. Food is mostly veg but decent quality.', photos: [], videos: ['dummy_video_link'] },
    { id: 4, user: 'Arjun', sub: 'Hyderabad University', date: '1 month ago', text: 'Really loved the amenities provided here. Totally worth the rent!', photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=100'] },
  ];

  const displayedReviews = fallbackReviews.filter(r => {
    if (activeReviewTab === 'Photos') return r.photos && r.photos.length > 0;
    if (activeReviewTab === 'Videos') return r.videos && r.videos.length > 0;
    return true;
  });

  const highlights = [
    { name: "WiFi", icon: "wifi-outline" },
    { name: "Housekeeping", icon: "color-wand-outline" },
    { name: "RO Water", icon: "water-outline" },
    { name: "Power Backup", icon: "flash-outline" },
    { name: "CCTV", icon: "videocam-outline" },
    { name: "Security", icon: "shield-checkmark-outline" },
    { name: "Laundry", icon: "shirt-outline" },
    { name: "Hot Water", icon: "thermometer-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhotoIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {photos.map((photo, index) => (
              <Image 
                key={index} 
                source={{ uri: photo.startsWith('http') ? photo : `http://192.168.1.37:5000${photo}` }} 
                style={styles.heroImage} 
              />
            ))}
          </ScrollView>

          {/* Top Actions */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            
            <View style={styles.topActionsRight}>
              <TouchableOpacity style={styles.iconCircle} onPress={handleMap}>
                <Ionicons name="map-outline" size={20} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle} onPress={() => Alert.alert("3D View", "3D Virtual Tour loading...")}>
                <Ionicons name="cube-outline" size={20} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconCircle, { backgroundColor: '#4F46E5' }]} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info Card Overlay */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.hostelName}>{hostel.name}</Text>
              <TouchableOpacity style={styles.ratingContainer} onPress={() => setReviewsModalVisible(true)} activeOpacity={0.7}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.ratingText}>{hostel.rating || 4.0}</Text>
                <Text style={styles.reviewCount}>({hostel.reviewCount || 56})</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond-outline" size={12} color="#92400e" style={{ marginRight: 4 }} />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          </View>

          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Co-living</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Non-veg food</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.addressText} numberOfLines={2}>
              {hostel.address || 'Plot 126, Near Main Road, Gachibowli, Hyderabad'}
            </Text>
          </View>

          <View style={styles.distanceRow}>
            <Ionicons name="locate-outline" size={16} color="#4F46E5" />
            <Text style={styles.distanceText}>8.3 km away</Text>
          </View>
        </View>

        {/* Highlights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlightsGrid}>
            {highlights.map((item, index) => (
              <View key={index} style={styles.highlightItem}>
                <View style={styles.highlightIconBox}>
                  <Ionicons name={item.icon} size={20} color="#4b5563" />
                </View>
                <Text style={styles.highlightText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {hostel.description || `${hostel.name} offers premium living with modern amenities, hygienic food and 24/7 security. It is located in a prime area making commute extremely easy.`}
          </Text>
        </View>

        {/* Rooms & Pricing Quick Access */}
        <View style={styles.section}>
          <View style={styles.pricingHeader}>
            <Text style={styles.sectionTitle}>Rooms & Pricing</Text>
            <TouchableOpacity onPress={() => setPricingModalVisible(true)}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.pricingCard}
            onPress={() => setPricingModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="bed-outline" size={24} color="#4F46E5" />
              <View style={{marginLeft: 12}}>
                <Text style={styles.pricingCardTitle}>Available Rooms</Text>
                <Text style={styles.pricingCardSub}>Starts from ₹{hostel.rent?.single || hostel.rent?.sharing2 || '5,900'}/mo</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* House Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>House Rules</Text>
          <View style={styles.rulesContainer}>
            <View style={styles.ruleItem}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.ruleText}>Gate closes at 10:30 PM</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="flame-outline" size={20} color="#6b7280" />
              <Text style={styles.ruleText}>No Smoking or Alcohol</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="people-outline" size={20} color="#6b7280" />
              <Text style={styles.ruleText}>No visitors allowed in rooms</Text>
            </View>
          </View>
        </View>

        {/* Food Menu */}
        {hostel.foodIncluded !== false && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Menu (Weekly)</Text>
            <View style={styles.foodContainer}>
              <View style={styles.foodItem}>
                <Text style={styles.foodTitle}>Breakfast</Text>
                <Text style={styles.foodDesc}>Idli, Dosa, Upma, Poha (Changes daily)</Text>
              </View>
              <View style={styles.foodItem}>
                <Text style={styles.foodTitle}>Lunch / Dinner</Text>
                <Text style={styles.foodDesc}>Rice, Dal, 2 Curries, Curd, Chapati</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomAction} onPress={handleCall}>
          <Ionicons name="call-outline" size={22} color="#6b7280" />
          <Text style={styles.bottomActionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomAction} onPress={handleChat}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#6b7280" />
          <Text style={styles.bottomActionText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bookBtn} onPress={() => handleLockedAction(() => setBookVisitModalVisible(true))}>
          <Ionicons name="calendar-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.bookBtnText}>Book Visit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomAction}
          onPress={() => dispatch({ type: 'hostels/toggleSaveHostel', payload: hostel._id })}
        >
          <Ionicons 
            name={savedHostels.includes(hostel._id) ? "heart" : "heart-outline"} 
            size={22} 
            color={savedHostels.includes(hostel._id) ? "#ef4444" : "#6b7280"} 
          />
          <Text style={[styles.bottomActionText, savedHostels.includes(hostel._id) && { color: "#ef4444" }]}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Pricing Modal */}
      <Modal visible={pricingModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setPricingModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="arrow-back" size={24} color="#1f2937" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Room Types & Pricing</Text>
              <TouchableOpacity onPress={() => setPricingModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            {/* Room List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {[
                { type: 'Single Room', price: '14,700', left: 1, id: 'single' },
                { type: '2 Sharing Room', price: '11,000', left: 5, id: 'sharing2' },
                { type: '3 Sharing Room', price: '8,800', left: 2, id: 'sharing3' },
                { type: '4 Sharing Room', price: '7,400', left: 4, id: 'sharing4' },
                { type: '5 Sharing Room', price: '5,900', left: 3, id: 'sharing5' },
              ].map((room, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.roomCard, selectedRoom === room.id && styles.roomCardSelected]}
                  onPress={() => setSelectedRoom(room.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.roomImageContainer}>
                    <Image 
                      source={{ uri: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=200&q=80" }} 
                      style={styles.roomImage} 
                    />
                  </View>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomType}>{room.type}</Text>
                    <View style={styles.roomPriceRow}>
                      <Text style={styles.roomPrice}>₹{room.price}</Text>
                      <Text style={styles.roomPriceUnit}>/mo</Text>
                    </View>
                  </View>
                  <Text style={styles.vacancyText}>{room.left} Left</Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.bookNowBtn} 
                onPress={() => {
                  setPricingModalVisible(false);
                  Alert.alert("Success", "Room Selected! You can proceed to Book Visit now.");
                }}
              >
                <Text style={styles.bookNowText}>Select Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reviews Modal */}
      <Modal visible={reviewsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reviews & Ratings</Text>
              <TouchableOpacity onPress={() => setReviewsModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.overallRatingBox}>
                <View style={styles.overallRatingLeft}>
                  <Text style={styles.bigRatingNum}>5.0</Text>
                  <Text style={styles.overallText}>Overall Rating</Text>
                  <Text style={styles.reviewCountText}>(56 Reviews)</Text>
                </View>
                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <View key={star} style={styles.ratingBarRow}>
                      <View style={styles.starsGroup}>
                        <Ionicons name="star" size={12} color="#f59e0b" />
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: star >= 4 ? '90%' : '10%' }]} />
                      </View>
                      <Text style={styles.barValue}>{star === 5 ? '5.0' : star === 4 ? '4.9' : '5.0'}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.categoryRatings}>
                {[
                  { name: 'Food', score: '5.0' },
                  { name: 'Safety', score: '5.0' },
                  { name: 'Cleanliness', score: '4.9' },
                  { name: 'Management', score: '5.0' },
                  { name: 'Internet', score: '4.8' },
                ].map(cat => (
                  <View key={cat.name} style={styles.categoryRow}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryScore}>{cat.score}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.segmentedControl}>
                {['All', 'Photos', 'Videos'].map(tab => (
                  <TouchableOpacity 
                    key={tab} 
                    style={[styles.segmentTab, activeReviewTab === tab && styles.segmentTabActive]}
                    onPress={() => setActiveReviewTab(tab)}
                  >
                    <Text style={[styles.segmentText, activeReviewTab === tab && styles.segmentTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Review Cards */}
              {displayedReviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{uri: `https://randomuser.me/api/portraits/men/${30 + review.id}.jpg`}} style={styles.reviewerAvatar} />
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.user}</Text>
                      <Text style={styles.reviewerSub}>{review.sub}</Text>
                      <Text style={styles.reviewerDate}>{review.date}</Text>
                    </View>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
                  </View>
                  <Text style={styles.reviewContent}>{review.text}</Text>
                  
                  {review.photos && review.photos.length > 0 && (
                    <View style={styles.reviewPhotos}>
                      {review.photos.map((photo, idx) => (
                        <Image key={idx} source={{uri: photo}} style={styles.reviewPhoto} />
                      ))}
                    </View>
                  )}
                  {review.videos && review.videos.length > 0 && (
                    <View style={styles.reviewPhotos}>
                      {review.videos.map((vid, idx) => (
                        <View key={idx} style={[styles.reviewPhoto, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb' }]}>
                          <Ionicons name="play-circle" size={24} color="#6b7280" />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {displayedReviews.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 20, marginBottom: 40 }}>No reviews found for this category.</Text>
              )}
              <View style={{height: 100}} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Book Visit Modal */}
      <Modal visible={bookVisitModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setBookVisitModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="arrow-back" size={24} color="#1f2937" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Book Visit</Text>
              <TouchableOpacity onPress={() => setBookVisitModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Text style={styles.formLabel}>Select Date</Text>
              
              <View style={styles.calendarMock}>
                <View style={styles.calendarHeader}>
                  <Text style={styles.calendarMonth}>May 2024</Text>
                  <Ionicons name="chevron-forward" size={20} color="#1f2937" />
                </View>
                <View style={styles.calendarWeek}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Text key={i} style={styles.calDayName}>{d}</Text>)}
                </View>
                <View style={styles.calendarGrid}>
                  {[
                    ['', '', 1, 2, 3, 4, 5],
                    [6, 7, 8, 9, 10, 11, 12],
                    [13, 14, 15, 16, 17, 18, 19],
                    [20, 21, 22, 23, 24, 25, 26],
                    [27, 28, 29, 30, 31, '', '']
                  ].map((row, rIdx) => (
                    <View key={rIdx} style={styles.calRow}>
                      {row.map((day, dIdx) => (
                        <TouchableOpacity 
                          key={dIdx} 
                          style={styles.calCell}
                          onPress={() => { if(day) setSelectedDate(day) }}
                          disabled={!day}
                        >
                          <View style={[styles.calDayOuter, selectedDate === day && styles.calDayActiveOuter]}>
                            <Text style={[styles.calDayNum, selectedDate === day && styles.calDayNumActive, (day === 3 || day === 11) && {color: '#4F46E5', fontWeight: 'bold'}]}>
                              {day}
                            </Text>
                          </View>
                          {(day === 3 || day === 11) && <View style={styles.calDot} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.formLabel}>Select Time Slot</Text>
              <View style={styles.timeSlotsRow}>
                {['10:00 AM', '12:00 PM', '04:00 PM', '06:00 PM'].map(time => (
                  <TouchableOpacity 
                    key={time}
                    style={[styles.timeSlot, selectedTimeSlot === time && styles.timeSlotActive]}
                    onPress={() => setSelectedTimeSlot(time)}
                  >
                    <Text style={[styles.timeSlotText, selectedTimeSlot === time && styles.timeSlotTextActive]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Message to Owner (Optional)</Text>
              <View style={[styles.textAreaContainer, { padding: 0 }]}>
                <TextInput
                  style={[{ flex: 1, padding: 16, color: '#1f2937', textAlignVertical: 'top' }]}
                  placeholder="I am interested in this hostel. Please share more details."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  value={messageToOwner}
                  onChangeText={setMessageToOwner}
                />
              </View>

              <View style={{height: 100}} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.bookNowBtn} 
                onPress={() => handleLockedAction(async () => {
                  let roomTypeStr = 'Not specified';
                  if (selectedRoom === 'single') roomTypeStr = 'Single Room';
                  else if (selectedRoom === 'sharing2') roomTypeStr = '2 Sharing Room';
                  else if (selectedRoom === 'sharing3') roomTypeStr = '3 Sharing Room';
                  else if (selectedRoom === 'sharing4') roomTypeStr = '4 Sharing Room';
                  else if (selectedRoom === 'sharing5') roomTypeStr = '5 Sharing Room';

                  // Send real enquiry to backend
                  try {
                    await enquiriesAPI.create({
                      hostelId: hostel._id,
                      message: `Visit Request on May ${selectedDate} at ${selectedTimeSlot}. ${messageToOwner}`,
                      moveInDate: `May ${selectedDate}, 2024`,
                      roomType: roomTypeStr,
                      studentCollege: user?.college || ''
                    });
                  } catch (e) {
                    console.log("Failed to send enquiry to backend:", e?.response?.data || e.message);
                  }

                  dispatch({ 
                    type: 'bookings/bookVisit', 
                    payload: { 
                      hostelId: hostel._id, 
                      hostelName: hostel.name, 
                      date: `May ${selectedDate}, 2024`, 
                      time: selectedTimeSlot, 
                      roomType: roomTypeStr,
                      message: messageToOwner
                    } 
                  });
                  
                  // Dispatch a real Notification
                  dispatch(addNotification({
                    _id: Date.now().toString(),
                    icon: 'calendar-outline',
                    iconBg: '#eff6ff',
                    iconColor: '#3b82f6',
                    title: 'Visit Booked',
                    subtitle: `Visit confirmed at ${hostel.name} on May ${selectedDate}`,
                    time: 'Just now',
                    read: false
                  }));

                  setBookVisitModalVisible(false);
                  Alert.alert("Visit Booked! 🎉", `Your visit to ${hostel.name} has been confirmed for May ${selectedDate} at ${selectedTimeSlot}`);
                })}
              >
                <Text style={styles.bookNowText}>Confirm Visit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Paywall Modal */}
      <Modal visible={paywallModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="lock-closed" size={30} color="#ef4444" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                Unlock Contact Details
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 }}>
                Pay a one-time fee of ₹1 to unlock Call, Chat, and Visit Booking for all hostels on HostelSathi.
              </Text>

              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg' }} 
                style={{ width: 200, height: 200, marginBottom: 16 }}
              />
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 30 }}>UPI: hostelsathi@ybl</Text>

              {verifyingScreenshot ? (
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={{ marginTop: 12, color: '#4F46E5', fontWeight: '500' }}>Checking for duplicate/fake receipt...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.bookNowBtn, { width: '100%', marginBottom: 12 }]} 
                    onPress={handleUploadScreenshot}
                  >
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.bookNowText}>Upload Screenshot</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ paddingVertical: 12, width: '100%', alignItems: 'center' }} 
                    onPress={() => {
                      setPaywallModalVisible(false);
                      setPendingAction(null);
                    }}
                  >
                    <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  topActionsRow: {
    position: 'absolute',
    top: 50, // To account for safe area
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topActionsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hostelName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 2,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 20,
  },
  addressText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    lineHeight: 18,
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  distanceText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 24,
    justifyContent: 'flex-start',
  },
  highlightItem: {
    width: '25%',
    alignItems: 'center',
  },
  highlightIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pricingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8faff',
    borderWidth: 1,
    borderColor: '#e0e7ff',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  pricingCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pricingCardSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  rulesContainer: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ruleText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 12,
    fontWeight: '500',
  },
  foodContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  foodItem: {
    flex: 1,
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  foodTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  foodDesc: {
    fontSize: 12,
    color: '#b45309',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActionText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  bookBtn: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8,
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roomCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#f8faff',
  },
  roomImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  roomInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  roomType: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  roomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  roomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  roomPriceUnit: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 2,
    fontWeight: '500',
  },
  vacancyText: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 13,
    color: '#10b981',
    fontWeight: 'bold',
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  bookNowBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  bookNowText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overallRatingBox: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  overallRatingLeft: {
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    paddingRight: 20,
    marginRight: 20,
  },
  bigRatingNum: { fontSize: 40, fontWeight: 'bold', color: '#1f2937' },
  overallText: { fontSize: 13, fontWeight: '600', color: '#4b5563', marginTop: 4 },
  reviewCountText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  ratingBars: { flex: 1, gap: 6 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  starsGroup: { width: 14, alignItems: 'center' },
  barTrack: { flex: 1, height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: 3 },
  barValue: { width: 20, fontSize: 11, color: '#6b7280', fontWeight: '500' },
  
  categoryRatings: { gap: 12, marginBottom: 24, paddingHorizontal: 4 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryName: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  categoryScore: { fontSize: 14, color: '#1f2937', fontWeight: 'bold' },

  segmentedControl: { flexDirection: 'row', backgroundColor: '#f5f3ff', borderRadius: 12, padding: 4, marginBottom: 24 },
  segmentTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentTabActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  segmentText: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  segmentTextActive: { color: '#4F46E5' },

  reviewCard: { marginBottom: 20 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewerAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewerInfo: { flex: 1, marginLeft: 12 },
  reviewerName: { fontSize: 15, fontWeight: 'bold', color: '#1f2937' },
  reviewerSub: { fontSize: 12, color: '#9ca3af' },
  reviewerDate: { fontSize: 11, color: '#d1d5db', marginTop: 2 },
  reviewContent: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 12 },
  reviewPhotos: { flexDirection: 'row', gap: 8 },
  reviewPhoto: { width: 60, height: 60, borderRadius: 8 },

  formLabel: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 12, marginTop: 4 },
  calendarMock: { marginBottom: 24 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  calendarMonth: { fontSize: 15, fontWeight: 'bold', color: '#1f2937' },
  calendarWeek: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  calDayName: { width: 40, textAlign: 'center', fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  calendarGrid: { gap: 8 },
  calRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calCell: { width: 40, alignItems: 'center' },
  calDayOuter: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  calDayActiveOuter: { backgroundColor: '#4F46E5' },
  calDayNum: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  calDayNumActive: { color: '#ffffff', fontWeight: 'bold' },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4F46E5', marginTop: 2 },

  timeSlotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  timeSlot: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff' },
  timeSlotActive: { borderColor: '#4F46E5', backgroundColor: '#f8faff' },
  timeSlotText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  timeSlotTextActive: { color: '#4F46E5' },

  dropdownMock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24 },
  dropdownText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  textAreaContainer: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, height: 100, backgroundColor: '#ffffff' },
  textAreaPlaceholder: { fontSize: 14, color: '#9ca3af' },
});
