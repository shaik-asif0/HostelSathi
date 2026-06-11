import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Alert, Switch, Linking
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../../redux/authSlice';

const QUICK_LINKS_STUDENT = [
  { emoji: '❤️', label: 'Saved Hostels', screen: 'Saved' },
  { emoji: '🔔', label: 'Notifications', screen: 'Notifications' },
];

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, savedHostels } = useSelector(state => state.auth);
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
            <Text style={styles.roleBadgeText}>
              {isOwner ? '🏠 Hostel Owner' : '🎓 Student Account'}
            </Text>
          </View>

          {/* Contact Info */}
          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>📞 {user.phone || '—'}</Text>
            <Text style={styles.contactDivider}>|</Text>
            <Text style={styles.contactItem}>✉ {user.email || '—'}</Text>
          </View>

          {/* Role-specific info */}
          {!isOwner && user.college ? (
            <View style={styles.collegeBadge}>
              <Text style={styles.collegeBadgeText}>🎓 {user.college}</Text>
            </View>
          ) : null}
        </View>

        {/* Student Stats */}
        {!isOwner && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{savedHostels?.length || 0}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>🔍</Text>
              <Text style={styles.statLabel}>Exploring</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>✓</Text>
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
                <Text style={styles.menuEmoji}>{link.emoji}</Text>
                <Text style={styles.menuLabel}>{link.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
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
              <Text style={styles.menuEmoji}>📊</Text>
              <Text style={styles.menuLabel}>My Dashboard</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AddHostel')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuEmoji}>➕</Text>
              <Text style={styles.menuLabel}>Add / Edit PG Listing</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Enquiries')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuEmoji}>📩</Text>
              <Text style={styles.menuLabel}>Student Enquiries</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuItem}>
            <Text style={styles.menuEmoji}>🔔</Text>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e2dff0', true: '#c4b5fd' }}
              thumbColor={notificationsEnabled ? '#7c3aed' : '#f4f3f4'}
            />
          </View>
          <TouchableOpacity style={styles.menuItem} onPress={handleCallSupport} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>🆘</Text>
            <Text style={styles.menuLabel}>Support & Help</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Terms', 'HostelSathi Terms of Service\n\nBuilt with ❤️ in Hyderabad for Telugu students.')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuEmoji}>📄</Text>
            <Text style={styles.menuLabel}>Terms & Privacy</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.version}>HostelSathi v2.0 · Made in Hyderabad 🏙️</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f6fc' },
  container: { padding: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.1)',
    shadowColor: '#7c3aed',
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
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#7c3aed' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  roleBadge: { paddingVertical: 4, paddingHorizontal: 14, borderRadius: 20, marginBottom: 12 },
  roleBadgeStudent: { backgroundColor: 'rgba(37,99,235,0.08)' },
  roleBadgeOwner: { backgroundColor: 'rgba(124,58,237,0.08)' },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: '#7c3aed' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  contactItem: { fontSize: 12, color: '#5f5a75' },
  contactDivider: { color: '#c4b5fd' },
  collegeBadge: {
    backgroundColor: '#ede9fe', borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 12, marginTop: 4
  },
  collegeBadgeText: { fontSize: 12, color: '#5b21b6', fontWeight: '600' },
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
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#7c3aed' },
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
    backgroundColor: '#faf8ff'
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(124,58,237,0.05)'
  },
  menuEmoji: { fontSize: 18, width: 26 },
  menuLabel: { flex: 1, fontSize: 15, color: '#2d2a3a', fontWeight: '500' },
  menuArrow: { fontSize: 22, color: '#c4b5fd' },
  signOutBtn: {
    borderWidth: 1.5, borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
    paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', marginBottom: 16
  },
  signOutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 15 },
  version: { textAlign: 'center', color: '#c4b5fd', fontSize: 11 }
});
