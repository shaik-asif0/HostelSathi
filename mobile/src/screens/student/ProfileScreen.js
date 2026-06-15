import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Alert, Switch, Linking
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../../redux/authSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';

const QUICK_LINKS_STUDENT = [
  { icon: 'card', label: 'Rent & Dues', screen: 'DueManagement' },
  { icon: 'document-text', label: 'Payment Receipts', screen: 'MyReceipts' }
];

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!user) return null;

  const isOwner = user.role === 'owner';

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of HostelSathi?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(logoutThunk())
        }
      ]
    );
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+919000000000');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Profile Header Card */}
        <View style={styles.headerCard}>
          <View style={[styles.avatar, isOwner ? styles.avatarOwner : styles.avatarStudent]}>
            <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={[styles.roleBadge, isOwner ? styles.roleBadgeOwner : styles.roleBadgeStudent]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={isOwner ? "home" : "school"} size={12} color="#4F46E5" style={{ marginRight: 4 }} />
              <Text style={styles.roleBadgeText}>
                {isOwner ? 'Hostel Owner' : 'Student Account'}
              </Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="call" size={12} color="#5f5a75" style={{ marginRight: 4 }} />
              <Text style={styles.contactItem}>{user.phone || '—'}</Text>
            </View>
            <Text style={styles.contactDivider}>|</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="mail" size={12} color="#5f5a75" style={{ marginRight: 4 }} />
              <Text style={styles.contactItem}>{user.email || '—'}</Text>
            </View>
          </View>

          {/* Role-specific info */}
          {!isOwner && user.college ? (
            <View style={styles.collegeBadge}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="school" size={12} color="#312E81" style={{ marginRight: 4 }} />
                <Text style={styles.collegeBadgeText}>{user.college}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Student Stats */}
        {!isOwner && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="search" size={24} color="#4F46E5" style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>Exploring</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        )}

        {/* Quick Links — Student */}
        {!isOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            {QUICK_LINKS_STUDENT.map(link => (
              <TouchableOpacity
                key={link.screen}
                style={styles.menuItem}
                onPress={() => navigation.navigate(link.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={link.icon} size={20} color="#4F46E5" />
                </View>
                <Text style={styles.menuLabel}>{link.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#c4b5fd" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Links — Owner */}
        {isOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Tools</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name="stats-chart" size={20} color="#4F46E5" />
              </View>
              <Text style={styles.menuLabel}>My Dashboard</Text>
              <Ionicons name="chevron-forward" size={20} color="#c4b5fd" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AddHostel')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name="add-circle" size={20} color="#4F46E5" />
              </View>
              <Text style={styles.menuLabel}>Add / Edit PG Listing</Text>
              <Ionicons name="chevron-forward" size={20} color="#c4b5fd" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Enquiries')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name="mail-unread" size={20} color="#4F46E5" />
              </View>
              <Text style={styles.menuLabel}>Student Enquiries</Text>
              <Ionicons name="chevron-forward" size={20} color="#c4b5fd" />
            </TouchableOpacity>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="notifications" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e2dff0', true: '#c4b5fd' }}
              thumbColor={notificationsEnabled ? '#4F46E5' : '#f4f3f4'}
            />
          </View>
          <TouchableOpacity style={styles.menuItem} onPress={handleCallSupport} activeOpacity={0.7}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="help-circle" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.menuLabel}>Support & Help</Text>
            <Ionicons name="chevron-forward" size={20} color="#c4b5fd" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Terms', 'HostelSathi Terms of Service\n\nBuilt with ❤️ in Hyderabad for Telugu students.')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="document-text" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.menuLabel}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#c4b5fd" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
          <Text style={[styles.version, { marginTop: 0 }]}>HostelSathi v2.0 · Made in Hyderabad </Text>
          <Ionicons name="business" size={12} color="#c4b5fd" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  avatar: {
    width: 78, height: 78, borderRadius: 39,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12
  },
  avatarStudent: { backgroundColor: 'rgba(37,99,235,0.12)' },
  avatarOwner: { backgroundColor: 'rgba(124,58,237,0.12)' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#4F46E5' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  roleBadge: { paddingVertical: 4, paddingHorizontal: 14, borderRadius: 20, marginBottom: 12 },
  roleBadgeStudent: { backgroundColor: 'rgba(37,99,235,0.08)' },
  roleBadgeOwner: { backgroundColor: 'rgba(124,58,237,0.08)' },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  contactItem: { fontSize: 12, color: '#5f5a75' },
  contactDivider: { color: '#c4b5fd' },
  collegeBadge: {
    backgroundColor: '#EEF2FF', borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 12, marginTop: 4
  },
  collegeBadgeText: { fontSize: 12, color: '#312E81', fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.08)',
    alignItems: 'center'
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#4F46E5' },
  statLabel: { fontSize: 11, color: '#8b85a3', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(124,58,237,0.1)' },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.08)',
    overflow: 'hidden'
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#8b85a3',
    textTransform: 'uppercase', letterSpacing: 0.6,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
    backgroundColor: '#EEF2FF'
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(124,58,237,0.05)'
  },
  menuIconWrap: { width: 32, alignItems: 'flex-start' },
  menuLabel: { flex: 1, fontSize: 15, color: '#2d2a3a', fontWeight: '500' },
  signOutBtn: {
    borderWidth: 1.5, borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
    paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', marginBottom: 16
  },
  signOutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 15 },
  version: { textAlign: 'center', color: '#c4b5fd', fontSize: 11 }
});
