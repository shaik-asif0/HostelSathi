import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';

// Auth
import OnboardingScreen from '../screens/student/OnboardingScreen';
import AuthScreen from '../screens/student/AuthScreen';

// Student Screens
import HomeScreen from '../screens/student/HomeScreen';
import SearchScreen from '../screens/student/SearchScreen';
import SavedScreen from '../screens/student/SavedScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import HostelDetailScreen from '../screens/student/HostelDetailScreen';
import CompareScreen from '../screens/student/CompareScreen';
import ChatScreen from '../screens/student/ChatScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';

// Owner Screens
import DashboardScreen from '../screens/owner/DashboardScreen';
import EnquiriesScreen from '../screens/owner/EnquiriesScreen';
import AddHostelScreen from '../screens/owner/AddHostelScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Shared tab icon with badge support
function TabIcon({ emoji, focused, badgeCount }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.iconEmoji, focused && tabStyles.iconEmojiActive]}>{emoji}</Text>
      {badgeCount > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

const TAB_SCREEN_OPTIONS = {
  tabBarActiveTintColor: '#7c3aed',
  tabBarInactiveTintColor: '#b0aac3',
  tabBarStyle: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(124, 58, 237, 0.1)',
    paddingBottom: 6,
    paddingTop: 4,
    height: 64,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8
  },
  headerStyle: { backgroundColor: '#ffffff', elevation: 0, shadowColor: 'transparent' },
  headerTintColor: '#7c3aed',
  headerTitleStyle: { fontWeight: 'bold', fontSize: 17, color: '#1e1b29' },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 }
};

// ─── 1. STUDENT TAB NAVIGATOR ───────────────────────────────────────────────
function StudentTabs() {
  const { unreadCount } = useSelector(state => state.notifications);
  return (
    <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen
        name="Discover"
        component={HomeScreen}
        options={{
          title: 'HostelSathi',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} badgeCount={0} />
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search Hostels',
          tabBarLabel: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} badgeCount={0} />
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          title: 'Saved Hostels',
          tabBarLabel: 'Saved',
          tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" focused={focused} badgeCount={0} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} badgeCount={unreadCount} />
        }}
      />
    </Tab.Navigator>
  );
}

// ─── 2. OWNER TAB NAVIGATOR ─────────────────────────────────────────────────
function OwnerTabs() {
  const { unreadCount } = useSelector(state => state.notifications);
  return (
    <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'My PG Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} badgeCount={0} />
        }}
      />
      <Tab.Screen
        name="Enquiries"
        component={EnquiriesScreen}
        options={{
          title: 'Leads & Visits',
          tabBarLabel: 'Enquiries',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📩" focused={focused} badgeCount={0} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Account',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} badgeCount={unreadCount} />
        }}
      />
    </Tab.Navigator>
  );
}

// ─── 3. UNAUTHENTICATED STACK ────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

// ─── 4. STUDENT STACK (with nested tabs + modals) ───────────────────────────
function StudentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#7c3aed',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 17, color: '#1e1b29' },
        headerBackTitleVisible: false
      }}
    >
      <Stack.Screen name="StudentTabs" component={StudentTabs} options={{ headerShown: false }} />
      <Stack.Screen name="HostelDetail" component={HostelDetailScreen} options={{ title: 'Hostel Details' }} />
      <Stack.Screen name="Compare" component={CompareScreen} options={{ title: 'Compare Hostels' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ─── 5. OWNER STACK (with nested tabs + modals) ─────────────────────────────
function OwnerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#7c3aed',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 17, color: '#1e1b29' },
        headerBackTitleVisible: false
      }}
    >
      <Stack.Screen name="OwnerTabs" component={OwnerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="AddHostel" component={AddHostelScreen} options={{ title: 'Hostel Listing Form' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ─── 6. ROOT NAVIGATOR ──────────────────────────────────────────────────────
export default function AppNavigator() {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);

  // Show loading spinner while session is being restored from AsyncStorage
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0ebfc' }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🏠</Text>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{ color: '#8b85a3', marginTop: 12, fontSize: 13 }}>Loading HostelSathi...</Text>
      </View>
    );
  }

  // ✅ Route based on auth state + user role
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  if (user?.role === 'owner') {
    return <OwnerStack />;
  }

  return <StudentStack />;
}

const tabStyles = StyleSheet.create({
  iconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 },
  iconEmoji: { fontSize: 20, opacity: 0.6 },
  iconEmojiActive: { opacity: 1 },
  badge: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#ef4444', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 2
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' }
});
