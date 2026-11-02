import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Easing } from 'react-native';

import { COLORS } from '@/constants/theme';

export interface LoadingScreenProps {
  text?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ text }) => {
  const compassRotation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Smooth continuous rotation for compass needle
    Animated.loop(
      Animated.timing(compassRotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = compassRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.compassContainer, { opacity: fadeAnim }]}>
        {/* Outer compass ring */}
        <View style={styles.compassRing} />

        {/* Inner compass ring */}
        <View style={styles.compassInnerRing} />

        {/* Compass directions (N, S, E, W markers) */}
        <View style={styles.directionMarkerN} />
        <View style={styles.directionMarkerS} />
        <View style={styles.directionMarkerE} />
        <View style={styles.directionMarkerW} />

        {/* Rotating needle */}
        <Animated.View
          style={[
            styles.needleContainer,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <View style={styles.needleNorth} />
          <View style={styles.needleSouth} />
        </Animated.View>

        {/* Center dot */}
        <View style={styles.centerDot} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    opacity: 0.4,
  },
  compassInnerRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primary,
    opacity: 0.3,
  },
  directionMarkerN: {
    position: 'absolute',
    top: 3,
    width: 2.5,
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  directionMarkerS: {
    position: 'absolute',
    bottom: 3,
    width: 2.5,
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    opacity: 0.5,
  },
  directionMarkerE: {
    position: 'absolute',
    right: 3,
    width: 10,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    opacity: 0.5,
  },
  directionMarkerW: {
    position: 'absolute',
    left: 3,
    width: 10,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    opacity: 0.5,
  },
  needleContainer: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleNorth: {
    position: 'absolute',
    top: 7,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.primary,
  },
  needleSouth: {
    position: 'absolute',
    bottom: 7,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.primary,
    opacity: 0.5,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default LoadingScreen;
