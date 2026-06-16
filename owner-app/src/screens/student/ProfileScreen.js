import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Image,
  Modal,
  StatusBar,
  TextInput
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk, updateUser } from "../../redux/authSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from 'react-native-image-picker';

const QUICK_LINKS_STUDENT = [
  { icon: "card", label: "Rent & Dues", screen: "DueManagement" },
  { icon: "document-text", label: "Payment Receipts", screen: "MyReceipts" },
];

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { visits } = useSelector((state) => state.bookings);
  const { hostels, savedHostels } = useSelector((state) => state.hostels);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  
  // Edit Profile State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg');

  if (!user) return null;

  const isOwner = user.role === "owner";

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of HostelSathi?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => dispatch(logoutThunk()),
        },
      ],
    );
  };

  const handleOpenEdit = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setEditAvatar(user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg');
    setEditModalVisible(true);
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    const updatedUser = { ...user, name: editName, email: editEmail, avatar: editAvatar };
    dispatch(updateUser(updatedUser));
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    setEditModalVisible(false);
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:+919000000000");
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Purple Header */}
      <View style={styles.purpleHeader}>
        <View style={styles.topHeaderIcons}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            activeOpacity={0.8}
            onPress={() => setFullImageVisible(true)}
          >
            <Image 
              source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.avatarImage} 
            />
          </TouchableOpacity>
          <View style={styles.profileTextInfo}>
            <Text style={styles.userName}>{user?.name || "Asif Shaik"}</Text>
            <Text style={styles.userEmail}>{user?.email || "asif@example.com"}</Text>
            <View style={styles.verifiedBadgeRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>
      </View>

      {/* White Rounded Body */}
      <View style={styles.whiteBodyContainer}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Menu List */}
        <View style={styles.menuList}>
          
          <TouchableOpacity style={styles.menuItemRow} onPress={() => navigation.navigate("Dashboard")} activeOpacity={0.6}>
            <Ionicons name="business-outline" size={22} color="#4b5563" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Hostel Information</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemRow} onPress={handleOpenEdit} activeOpacity={0.6}>
            <Ionicons name="person-circle-outline" size={22} color="#4b5563" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Business Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemRow} onPress={() => Alert.alert('Coming Soon', 'Bank details integration pending')} activeOpacity={0.6}>
            <Ionicons name="card-outline" size={22} color="#4b5563" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Bank Details</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemRow} onPress={() => navigation.navigate("SubscriptionPlans")} activeOpacity={0.6}>
            <Ionicons name="diamond-outline" size={22} color="#4b5563" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Subscription</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemRow} onPress={() => Alert.alert('Settings', 'Settings screen coming soon!')} activeOpacity={0.6}>
            <Ionicons name="settings-outline" size={22} color="#4b5563" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemRow} onPress={handleCallSupport} activeOpacity={0.6}>
            <Ionicons name="help-circle-outline" size={22} color="#4b5563" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" style={styles.menuIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
      </ScrollView>
      </View>

      {/* Referral System Modal */}
      <Modal visible={referralModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.referralHeader}>
              <TouchableOpacity onPress={() => setReferralModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReferralModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.referralScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.referralTitle}>Refer & Earn</Text>
              <Text style={styles.referralSubtitle}>Invite your friends and earn rewards</Text>

              {/* Code Box */}
              <View style={styles.referralCodeBox}>
                <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
                <Text style={styles.referralCodeValue}>
                  {user?._id ? `REF${user._id.substring(user._id.length - 5).toUpperCase()}` : 'ASIF123'}
                </Text>
                <TouchableOpacity style={styles.shareBtn}>
                  <Ionicons name="share-social-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.shareBtnText}>Share Now</Text>
                </TouchableOpacity>
              </View>

              {/* Earnings Row */}
              <View style={styles.referralStatsRow}>
                <View style={styles.referralStatCard}>
                  <Text style={styles.referralStatLabel}>Your Earnings</Text>
                  <Text style={styles.referralStatValue}>₹{user?.referralEarnings || 0}</Text>
                </View>
                <View style={styles.referralStatCard}>
                  <Text style={styles.referralStatLabel}>Total Referrals</Text>
                  <Text style={styles.referralStatValue}>{user?.totalReferrals || 0}</Text>
                </View>
              </View>

              {/* How it works */}
              <Text style={styles.howItWorksTitle}>How it works?</Text>
              <View style={styles.howItWorksRow}>
                
                <View style={styles.stepItem}>
                  <View style={[styles.stepIconBox, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="megaphone-outline" size={22} color="#3b82f6" />
                  </View>
                  <Text style={styles.stepText}>Invite friends</Text>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepIconBox, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="document-text-outline" size={22} color="#3b82f6" />
                  </View>
                  <Text style={styles.stepText}>They sign up</Text>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepIconBox, { backgroundColor: '#f5f3ff' }]}>
                    <Ionicons name="cash-outline" size={22} color="#8b5cf6" />
                  </View>
                  <Text style={styles.stepText}>You earn ₹50</Text>
                </View>

              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.referralHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>Edit Profile</Text>
              <TouchableOpacity onPress={handleSaveProfile}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4F46E5' }}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.referralScroll} showsVerticalScrollIndicator={false}>
              
              <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
                <TouchableOpacity onPress={handlePickImage}>
                  <Image source={{ uri: editAvatar }} style={[styles.avatarImage, { borderColor: '#4F46E5' }]} />
                  <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4F46E5', borderRadius: 15, padding: 6, borderWidth: 2, borderColor: '#fff' }}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.editLabel}>Full Name</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.editLabel}>Email Address</Text>
              <TextInput
                style={styles.editInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                placeholderTextColor="#9ca3af"
              />

            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Full Screen Image Modal */}
      <Modal visible={fullImageVisible} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
            onPress={() => setFullImageVisible(false)}
          >
            <Ionicons name="close" size={32} color="#ffffff" />
          </TouchableOpacity>
          <Image 
            source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={{ width: '100%', height: 400 }}
            resizeMode="contain"
          />
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#4F46E5" },
  purpleHeader: {
    backgroundColor: '#4F46E5',
    paddingTop: 50, // for safe area
    paddingBottom: 40,
  },
  topHeaderIcons: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  iconBtn: {
    padding: 4,
    alignSelf: 'flex-start',
    marginLeft: -4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#e5e7eb',
  },
  profileTextInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#c7d2fe',
    marginBottom: 6,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  whiteBodyContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  container: { 
    padding: 24, 
    paddingBottom: 40 
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f9fafb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  statNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  menuList: {
    marginBottom: 32,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  premiumBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  premiumBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 24, // added margin to replace divider spacing
  },
  logoutText: { 
    color: '#ef4444', 
    fontWeight: 'bold', 
    fontSize: 15 
  },
  // Referral Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '92%',
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  referralScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  referralTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  referralSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 32,
  },
  referralCodeBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  referralCodeLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  referralCodeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    letterSpacing: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    backgroundColor: '#5b21b6',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  referralStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  referralStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f9fafb',
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  referralStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  howItWorksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
    textAlign: 'center',
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
    marginTop: 16,
  },
  editInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  }
});
