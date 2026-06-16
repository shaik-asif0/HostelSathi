import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SubscriptionPlansScreen({ navigation }) {
  const handleUpgrade = (planName) => {
    Alert.alert("Upgrade Plan", `You have selected the ${planName}. Proceed to payment?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Pay Now", onPress: () => Alert.alert("Success", "Welcome to " + planName + "!") }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e1b29" />
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Subscription Plans</Text>
          <Text style={styles.subtitle}>Choose the best plan for your business</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plansContainer}>
          
          {/* Free Plan */}
          <View style={[styles.planCard, styles.freeCard]}>
            <Text style={styles.planNameDark}>Free Plan</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceDark}>₹0</Text>
              <Text style={styles.priceDuration}> /month</Text>
            </View>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>• Basic Listing</Text>
              <Text style={styles.featureItem}>• Limited Leads</Text>
              <Text style={styles.featureItem}>• Basic Support</Text>
            </View>
            <View style={styles.spacer} />
            <TouchableOpacity style={[styles.actionBtn, styles.btnOutline]}>
              <Text style={[styles.btnText, styles.btnTextOutline]}>Current Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Premium Plan */}
          <View style={[styles.planCard, styles.premiumCard]}>
            <Text style={styles.planNameOrange}>Premium Plan</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceDark}>₹999</Text>
              <Text style={styles.priceDuration}> /month</Text>
            </View>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>• Unlimited Leads</Text>
              <Text style={styles.featureItem}>• Premium Listing</Text>
              <Text style={styles.featureItem}>• Featured Profile</Text>
              <Text style={styles.featureItem}>• Excellent Support</Text>
              <Text style={styles.featureItem}>• Priority Support</Text>
            </View>
            <View style={styles.spacer} />
            <TouchableOpacity style={[styles.actionBtn, styles.btnSolid]} onPress={() => handleUpgrade('Premium Plan')}>
              <Text style={styles.btnTextSolid}>Upgrade</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Plan */}
          <View style={[styles.planCard, styles.featuredCard]}>
            <Text style={styles.planNamePurple}>Featured Plan</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceDark}>₹1,999</Text>
              <Text style={styles.priceDuration}> /month</Text>
            </View>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>• Everything in Premium</Text>
              <Text style={styles.featureItem}>• Featured Listing</Text>
              <Text style={styles.featureItem}>• Top Placement</Text>
              <Text style={styles.featureItem}>• Dedicated Support</Text>
            </View>
            <View style={styles.spacer} />
            <TouchableOpacity style={[styles.actionBtn, styles.btnSolid]} onPress={() => handleUpgrade('Featured Plan')}>
              <Text style={styles.btnTextSolid}>Upgrade</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.compareBtn}>
          <Text style={styles.compareBtnText}>Compare Plans</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: 24,
  },
  backBtn: { marginBottom: 16, marginLeft: -8 },
  titleSection: {},
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1b29', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280' },

  scrollContent: {
    paddingBottom: 40,
  },
  plansContainer: {
    paddingHorizontal: 16,
    gap: 16,
    flexDirection: 'row',
  },
  
  planCard: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    minHeight: 400,
  },
  freeCard: {
    borderColor: '#f3f4f6',
  },
  premiumCard: {
    borderColor: '#fed7aa', // orange/amber
    backgroundColor: '#fffbeb', // slight warm tint
  },
  featuredCard: {
    borderColor: '#c7d2fe', // purple
    backgroundColor: '#f5f3ff', // slight cool tint
  },

  planNameDark: { fontSize: 18, fontWeight: 'bold', color: '#1e1b29', marginBottom: 16 },
  planNameOrange: { fontSize: 18, fontWeight: 'bold', color: '#d97706', marginBottom: 16 },
  planNamePurple: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5', marginBottom: 16 },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceDark: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e1b29',
  },
  priceDuration: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
    fontWeight: '500',
  },

  spacer: {
    flex: 1,
  },

  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: '#4F46E5',
    backgroundColor: 'transparent',
  },
  btnSolid: {
    backgroundColor: '#4F46E5',
  },
  btnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnTextOutline: {
    color: '#4F46E5',
  },
  btnTextSolid: {
    color: '#ffffff',
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  compareBtn: {
    backgroundColor: '#EEF2FF', // light purple
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  compareBtnText: {
    color: '#4F46E5', // vibrant purple
    fontWeight: 'bold',
    fontSize: 16,
  },
});
