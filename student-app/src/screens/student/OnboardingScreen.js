import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

export default function OnboardingScreen({ navigation }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Find Hostels\nNear Your College",
      description: "Discover verified hostels\nnear your college easily.",
      illustrationType: 1
    },
    {
      title: "Compare Food,\nFacilities & Prices",
      description: "Compare and choose the best\nhostel that fits your needs.",
      illustrationType: 2
    },
    {
      title: "Contact Owners\nInstantly",
      description: "Chat, call or visit hostel\nowners directly.",
      illustrationType: 3
    },
  ];

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      navigation.replace("Auth");
    }
  };

  const handleSkip = () => {
    navigation.replace("Auth");
  };

  const handleBack = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };

  const renderIllustration = (type) => {
    let source;
    if (type === 1) source = require('../../assets/onboarding1.png');
    else if (type === 2) source = require('../../assets/onboarding2.png');
    else if (type === 3) source = require('../../assets/onboarding3.png');

    return (
      <View style={styles.illContainer}>
        <Image source={source} style={styles.illustrationImage} resizeMode="contain" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          {activeSlide > 0 ? (
             <Ionicons name="arrow-back" size={24} color="#1f2937" />
          ) : (
             <View style={{ width: 24 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Slide Content */}
      <View style={styles.slideContainer}>
        <Text style={styles.titleText}>{slides[activeSlide].title}</Text>
        <Text style={styles.descText}>{slides[activeSlide].description}</Text>
        
        {/* Illustration Mockup */}
        {renderIllustration(slides[activeSlide].illustrationType)}
      </View>

      {/* Bottom Footer Navigation */}
      <View style={styles.footerContainer}>
        
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Pager Dots */}
        <View style={styles.pagerContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeSlide ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {activeSlide === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafafa", // Light background matching mockup
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  slideContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  titleText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e1b4b", // Dark bold blueish black
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
  },
  descText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 60,
    lineHeight: 24,
  },
  
  /* Illustration Mockups */
  illContainer: {
    width: width,
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  illustrationImage: {
    width: '90%',
    height: '100%',
  },

  /* Footer */
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  skipBtn: {
    width: 80,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  pagerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
  },
  activeDot: {
    width: 16,
    backgroundColor: "#4f46e5",
  },
  nextBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
