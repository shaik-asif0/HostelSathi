import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      icon: 'home',
      title: 'Welcome to HostelSathi',
      description: 'The #1 student hostel discovery app for Hyderabad. Built by students, for students.'
    },
    {
      icon: 'shield-checkmark',
      title: '100% Verified Profiles',
      description: 'We personally visit every hostel to verify food quality, WiFi speeds, safety details, and honest prices.'
    },
    {
      icon: 'call',
      title: 'Direct Connection',
      description: 'No middlemen. Book a physical visit or request owner details directly in one click.'
    }
  ];

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      navigation.replace('Auth'); // ✅ Fixed: matches new AuthStack navigator
    }
  };

  const handleSkip = () => {
    navigation.replace('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="home" size={20} color="#4F46E5" style={{ marginRight: 4 }} />
          <Text style={styles.logo}>HostelSathi</Text>
        </View>
        {activeSlide < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slide Content */}
      <View style={styles.slideContainer}>
        <Ionicons name={slides[activeSlide].icon} size={72} color="#4F46E5" style={{ marginBottom: 24 }} />
        <Text style={styles.slideTitle}>{slides[activeSlide].title}</Text>
        <Text style={styles.slideDesc}>{slides[activeSlide].description}</Text>
      </View>

      {/* Slide Indicators */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicatorDot,
              i === activeSlide ? styles.indicatorDotActive : null
            ]}
          />
        ))}
      </View>

      {/* Button footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {activeSlide === slides.length - 1 ? 'Get Started' : 'Next Screen'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  skipText: {
    color: '#8b85a3',
    fontWeight: '600',
  },
  slideContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1b29',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 15,
    color: '#5f5a75',
    textAlign: 'center',
    lineHeight: 22,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    width: 20,
    backgroundColor: '#4F46E5',
  },
  footer: {
    height: 80,
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
