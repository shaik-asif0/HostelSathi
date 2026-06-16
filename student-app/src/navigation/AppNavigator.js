import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";

// Auth
import OnboardingScreen from "../screens/student/OnboardingScreen";
import AuthScreen from "../screens/student/AuthScreen";

// Student Screens
import HomeScreen from "../screens/student/HomeScreen";
import SearchScreen from "../screens/student/SearchScreen";
import SavedScreen from "../screens/student/SavedScreen";

import FilterScreen from "../screens/student/FilterScreen";
// Shared Screens
import ConversationsScreen from "../screens/shared/ConversationsScreen";
import ChatScreen from "../screens/student/ChatScreen";

import ProfileScreen from "../screens/student/ProfileScreen";
import HostelDetailScreen from "../screens/student/HostelDetailScreen";
import CompareScreen from "../screens/student/CompareScreen";
import DueManagementScreen from "../screens/student/DueManagementScreen";
import MyReceiptsScreen from "../screens/student/MyReceiptsScreen";
import MapScreen from "../screens/student/MapScreen";
import NotificationsScreen from "../screens/student/NotificationsScreen";
import ScanAndPayScreen from "../screens/student/ScanAndPayScreen";
import RoommateFinderScreen from "../screens/student/RoommateFinderScreen";
import ChatInboxScreen from "../screens/student/ChatInboxScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Shared tab icon with badge support
function TabIcon({ iconName, focused, badgeCount }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Ionicons
        name={iconName}
        size={24}
        color={focused ? "#4F46E5" : "#b0aac3"}
      />
      {badgeCount > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>
            {badgeCount > 9 ? "9+" : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const TAB_SCREEN_OPTIONS = {
  tabBarHideOnKeyboard: true,
  tabBarActiveTintColor: "#4F46E5",
  tabBarInactiveTintColor: "#b0aac3",
  tabBarStyle: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "rgba(79, 70, 229, 0.1)",
    paddingBottom: 6,
    paddingTop: 4,
    height: 64,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  headerStyle: {
    backgroundColor: "#ffffff",
    elevation: 0,
    shadowColor: "transparent",
  },
  headerTintColor: "#4F46E5",
  headerTitleStyle: { fontWeight: "bold", fontSize: 17, color: "#212121" },
  tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
};

// ─── 1. STUDENT TAB NAVIGATOR ───────────────────────────────────────────────
function StudentTabs() {
  const { unreadCount } = useSelector((state) => state.notifications);
  return (
    <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen
        name="Discover"
        component={HomeScreen}
        options={{
          title: "HostelSathi",
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home" focused={focused} badgeCount={0} />
          ),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          title: "Search",
          tabBarLabel: "Search",
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="search" focused={focused} badgeCount={0} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedScreen}
        options={{
          title: "Saved",
          tabBarLabel: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="heart-outline" focused={focused} badgeCount={0} />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ConversationsScreen}
        options={{
          title: "Messages",
          tabBarLabel: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="chatbubble-outline" focused={focused} badgeCount={0} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "My Profile",
          tabBarLabel: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconName="person-outline"
              focused={focused}
              badgeCount={unreadCount}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Removed OwnerTabs

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
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#4F46E5",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 17,
          color: "#212121",
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="StudentTabs"
        component={StudentTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Saved"
        component={SavedScreen}
        options={{ title: "Wishlist" }}
      />

      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{ presentation: "fullScreenModal", headerShown: false }}
      />
      <Stack.Screen
        name="HostelDetail"
        component={HostelDetailScreen}
        options={{ title: "Hostel Details" }}
      />
      <Stack.Screen
        name="Compare"
        component={CompareScreen}
        options={{ title: "Compare Hostels" }}
      />
      <Stack.Screen
        name="DueManagement"
        component={DueManagementScreen}
        options={{ title: "My Dues" }}
      />
      <Stack.Screen
        name="MyReceipts"
        component={MyReceiptsScreen}
        options={{ title: "Payment Receipts" }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScanAndPay"
        component={ScanAndPayScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoommateFinder"
        component={RoommateFinderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatInbox"
        component={ChatInboxScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Removed OwnerStack

// ─── 6. ROOT NAVIGATOR ──────────────────────────────────────────────────────
import SplashScreen from "../screens/shared/SplashScreen";

export default function AppNavigator() {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Force the splash screen to display for exactly 5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Show premium splash screen while session is being restored from AsyncStorage
  // OR while the forced 5-second timer is still running
  if (loading || showSplash) {
    return <SplashScreen />;
  }

  // ✅ Route directly to StudentStack if authenticated
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  return <StudentStack />;
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
});
