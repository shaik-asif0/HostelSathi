import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView, StatusBar, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        
        {/* Top Content */}
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="home-outline" size={80} color="#ffffff" />
            <Ionicons name="business" size={30} color="#ffffff" style={styles.subLogoIcon} />
          </View>
          <Text style={styles.title}>HostelSathi</Text>
          <Text style={styles.subtitle}>
            Find Your Perfect{'\n'}Student Home
          </Text>
        </View>

        {/* Illustration Area */}
        <View style={styles.illustrationSection}>
          {/* Purple Moon/Circle Background */}
          <View style={styles.purpleCircle} />
          <View style={styles.smallStar1} />
          <View style={styles.smallStar2} />

          {/* Building Mockup */}
          <View style={styles.buildingContainer}>
            {/* Left Wing */}
            <View style={styles.buildingLeft}>
              <View style={styles.window} />
              <View style={styles.window} />
            </View>
            
            {/* Center Main Building */}
            <View style={styles.buildingCenter}>
              <View style={styles.windowRow}>
                <View style={[styles.window, styles.windowLit]} />
                <View style={[styles.window, styles.windowLit]} />
              </View>
              <View style={styles.windowRow}>
                <View style={[styles.window, styles.windowLit]} />
                <View style={[styles.window, styles.windowLit]} />
              </View>
              <View style={styles.windowRow}>
                <View style={[styles.window, styles.windowLit]} />
                <View style={[styles.window, styles.windowLit]} />
              </View>
              {/* Door */}
              <View style={styles.door} />
            </View>

            {/* Right Wing */}
            <View style={styles.buildingRight}>
              <View style={styles.window} />
            </View>
          </View>

          {/* Character / Luggage mockup using icons */}
          <View style={styles.characterContainer}>
            <Ionicons name="person" size={40} color="#fca5a5" style={styles.character} />
            <Ionicons name="briefcase" size={30} color="#4c1d95" style={styles.luggage1} />
            <Ionicons name="briefcase" size={24} color="#4c1d95" style={styles.luggage2} />
          </View>

          {/* Ground */}
          <View style={styles.groundLine} />
        </View>

        {/* Pager Dots */}
        <View style={styles.pagerContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1e1b4b', // Deep dark blue background
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subLogoIcon: {
    position: 'absolute',
    bottom: -5,
    right: -10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  illustrationSection: {
    width: '100%',
    height: 350,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20, // ground space
  },
  purpleCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#7c3aed', // vibrant purple
    bottom: 20,
    right: 10,
    zIndex: 0,
  },
  smallStar1: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#a78bfa',
    borderRadius: 3,
    top: 50,
    left: 80,
    opacity: 0.8,
  },
  smallStar2: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#a78bfa',
    borderRadius: 4,
    top: 80,
    right: 100,
    opacity: 0.6,
  },
  buildingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 10,
    marginBottom: -1, // touch the ground
  },
  buildingCenter: {
    width: 120,
    height: 160,
    backgroundColor: '#8b5cf6', // lighter than bg, darker than windows
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buildingLeft: {
    width: 60,
    height: 120,
    backgroundColor: '#6d28d9',
    borderTopLeftRadius: 8,
    marginRight: -5,
    paddingTop: 20,
    alignItems: 'center',
  },
  buildingRight: {
    width: 80,
    height: 90,
    backgroundColor: '#5b21b6',
    borderTopRightRadius: 8,
    marginLeft: -5,
    paddingTop: 15,
    alignItems: 'center',
  },
  windowRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  window: {
    width: 16,
    height: 20,
    backgroundColor: '#4c1d95',
    borderRadius: 2,
    marginBottom: 10,
  },
  windowLit: {
    backgroundColor: '#fde047', // Glowing yellow
    shadowColor: '#fef08a',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  door: {
    width: 30,
    height: 35,
    backgroundColor: '#f59e0b',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  characterContainer: {
    position: 'absolute',
    bottom: 20,
    right: 50,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 20,
  },
  character: {
    marginRight: 5,
    zIndex: 2,
  },
  luggage1: {
    marginRight: -10,
    marginBottom: -5,
  },
  luggage2: {
    marginBottom: -5,
  },
  groundLine: {
    position: 'absolute',
    bottom: 20,
    width: '80%',
    height: 2,
    backgroundColor: '#4c1d95',
    borderRadius: 2,
  },
  pagerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4c1d95',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#ffffff',
  },
});
