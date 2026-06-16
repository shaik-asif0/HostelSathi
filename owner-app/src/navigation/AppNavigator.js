import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";

// Auth
import OnboardingScreen from "../screens/student/OnboardingScreen";
import AuthScreen from "../screens/student/AuthScreen";

// Shared Screens
import DashboardScreen from "../screens/owner/DashboardScreen";
import EnquiriesScreen from "../screens/owner/EnquiriesScreen";
import AddHostelScreen from "../screens/owner/AddHostelScreen";
import HostelGalleryScreen from "../screens/owner/HostelGalleryScreen";
import RoomManagementScreen from "../screens/owner/RoomManagementScreen";
import AddNewRoomScreen from "../screens/owner/AddNewRoomScreen";
import PricingManagementScreen from "../screens/owner/PricingManagementScreen";
import AvailabilityCalendarScreen from "../screens/owner/AvailabilityCalendarScreen";
import LeadDetailsScreen from "../screens/owner/LeadDetailsScreen";
import VisitRequestsScreen from "../screens/owner/VisitRequestsScreen";
import BookingManagementScreen from "../screens/owner/BookingManagementScreen";
import RevenueDashboardScreen from "../screens/owner/RevenueDashboardScreen";
import ReviewsManagementScreen from "../screens/owner/ReviewsManagementScreen";
import SubscriptionPlansScreen from "../screens/owner/SubscriptionPlansScreen";
import PremiumPromotionScreen from "../screens/owner/PremiumPromotionScreen";
import PaymentHistoryScreen from "../screens/owner/PaymentHistoryScreen";
import ConversationsScreen from "../screens/shared/ConversationsScreen";
import ChatScreen from "../screens/student/ChatScreen";
import NotificationsScreen from "../screens/student/NotificationsScreen";
import ProfileScreen from "../screens/student/ProfileScreen";
// removed duplicates
// Removed student specific imports

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

// Removed StudentTabs

// ─── 2. OWNER TAB NAVIGATOR ─────────────────────────────────────────────────
function OwnerTabs() {
  const { unreadCount } = useSelector((state) => state.notifications);
  return (
    <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "My PG Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="stats-chart" focused={focused} badgeCount={0} />
          ),
        }}
      />
      <Tab.Screen
        name="Enquiries"
        component={EnquiriesScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Enquiries",
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="mail" focused={focused} badgeCount={0} />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ConversationsScreen}
        options={{
          title: "Messages",
          tabBarLabel: "Chats",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="chatbubbles" focused={focused} badgeCount={0} />
          ),
        }}
      />

      <Tab.Screen
        name="Subscribe"
        component={SubscriptionPlansScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Subscribe",
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="diamond" focused={focused} badgeCount={0} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "My Account",
          tabBarLabel: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconName="person"
              focused={focused}
              badgeCount={unreadCount}
            />
          ),
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

// Removed StudentStack

// ─── 5. OWNER STACK (with nested tabs + modals) ─────────────────────────────
function OwnerStack() {
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
        name="OwnerTabs"
        component={OwnerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddHostel"
        component={AddHostelScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HostelGallery"
        component={HostelGalleryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoomManagement"
        component={RoomManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddNewRoom"
        component={AddNewRoomScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PricingManagement"
        component={PricingManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AvailabilityCalendar"
        component={AvailabilityCalendarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LeadDetails"
        component={LeadDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VisitRequests"
        component={VisitRequestsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingManagement"
        component={BookingManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RevenueDashboard"
        component={RevenueDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReviewsManagement"
        component={ReviewsManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubscriptionPlans"
        component={SubscriptionPlansScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PremiumPromotion"
        component={PremiumPromotionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "Chat" }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

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

  // ✅ Route directly to OwnerStack if authenticated
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  return <OwnerStack />;
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
