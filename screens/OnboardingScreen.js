import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Animated, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const slides = [
  { id: '1', image: require('../assets/images/onboarding/cover1.png') },
  { id: '2', image: require('../assets/images/onboarding/cover2.png') },
  { id: '3', image: require('../assets/images/onboarding/cover3.png') },
  { id: '4', image: require('../assets/images/onboarding/cover4.png') },
  { id: '5', image: require('../assets/images/onboarding/cover5.png') },
  { id: '6', image: require('../assets/images/onboarding/cover6.png') },
];

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const insets = useSafeAreaInsets();

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      onFinish();
    } catch (e) {
      console.log('Error saving onboarding status', e);
      onFinish();
    }
  };

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={slidesRef}
        data={slides}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item, index }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            
            {/* Real React Native button perfectly covering the one in the image */}
            {index === slides.length - 1 && (
              <TouchableOpacity 
                style={styles.lastSlideOverlayButton} 
                onPress={completeOnboarding}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-forward-outline" size={38} color="#6E2A36" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Skip Button (Shown only on the last page) */}
      {currentIndex === slides.length - 1 && (
        <TouchableOpacity 
          style={[styles.skipButton, { top: insets.top > 0 ? insets.top + 10 : 40 }]} 
          onPress={completeOnboarding}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Paginator */}
      <View style={[styles.paginatorContainer, { bottom: insets.bottom > 0 ? insets.bottom + 40 : 50 }]}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i.toString()}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    alignSelf: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginHorizontal: 4,
  },
  lastSlideOverlayButton: {
    position: 'absolute',
    bottom: height * 0.085, // Adjusted to perfectly overlay the button in the image
    alignSelf: 'center',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  }
});
