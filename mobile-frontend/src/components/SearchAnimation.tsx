import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const COLORS = {
  background: '#F8F9FA',
  gold: '#D4AF37',
  darkBlue: '#1a365d',
};

const MAP_POINTS = [
  { x: 50, y: 30 },
  { x: 70, y: 50 },
  { x: 40, y: 60 },
  { x: 60, y: 70 },
  { x: 30, y: 80 },
];

const TOURISM_ICONS = [
  { x: 50, y: 30, type: 'building', iconName: 'location-city' as const },
  { x: 70, y: 50, type: 'mountain', iconName: 'landscape' as const },
  { x: 40, y: 60, type: 'mountain', iconName: 'terrain' as const },
  { x: 60, y: 70, type: 'beach', iconName: 'beach-access' as const },
  { x: 30, y: 80, type: 'beach', iconName: 'pool' as const },
];

const SearchAnimation: React.FC = () => {
  const progress = useSharedValue(0);
  const pulseProgress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 5000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );

    pulseProgress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );
  }, []);

  // Böyüdücü şüşənin hərəkəti
  const magnifyingGlassStyle = useAnimatedStyle(() => {
    const pathProgress = progress.value;
    const totalPoints = MAP_POINTS.length;
    const rawProgress = pathProgress * totalPoints;
    const currentPointIndex = Math.min(
      Math.floor(rawProgress),
      totalPoints - 1
    );
    const nextPointIndex = (currentPointIndex + 1) % totalPoints;
    const localProgress = rawProgress - currentPointIndex;

    const currentPoint = MAP_POINTS[currentPointIndex];
    const nextPoint = MAP_POINTS[nextPointIndex];

    const x = interpolate(
      localProgress,
      [0, 1],
      [currentPoint.x, nextPoint.x],
      'clamp'
    );
    const y = interpolate(
      localProgress,
      [0, 1],
      [currentPoint.y, nextPoint.y],
      'clamp'
    );

    return {
      transform: [
        { translateX: (x / 100) * 250 - 20 },
        { translateY: (y / 100) * 250 - 20 },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pulseProgress.value, [0, 0.8, 1], [0.6, 0, 0]),
      transform: [
        { scale: interpolate(pulseProgress.value, [0, 1], [0.8, 2.5]) },
      ],
    };
  });

  // İkonlar üçün animasiya - hər bir icon üçün ayrı hook
  const icon0Style = useAnimatedStyle(() => {
    const pathProgress = progress.value;
    const totalPoints = MAP_POINTS.length;
    const rawProgress = pathProgress * totalPoints;
    const currentIndex = Math.min(Math.floor(rawProgress), totalPoints - 1);
    const iconProgress = rawProgress - currentIndex;
    const distance = Math.abs(currentIndex - 0);
    const shouldShow = distance <= 1 || (currentIndex === totalPoints - 1);
    if (!shouldShow) return { opacity: 0, transform: [{ scale: 0 }] };
    const opacity = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 1, 1, 1, 0], 'clamp');
    const scale = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 0.8, 1, 0.8, 0], 'clamp');
    return { opacity, transform: [{ scale }] };
  });

  const icon1Style = useAnimatedStyle(() => {
    const pathProgress = progress.value;
    const totalPoints = MAP_POINTS.length;
    const rawProgress = pathProgress * totalPoints;
    const currentIndex = Math.min(Math.floor(rawProgress), totalPoints - 1);
    const iconProgress = rawProgress - currentIndex;
    const distance = Math.abs(currentIndex - 1);
    const shouldShow = distance <= 1;
    if (!shouldShow) return { opacity: 0, transform: [{ scale: 0 }] };
    const opacity = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 1, 1, 1, 0], 'clamp');
    const scale = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 0.8, 1, 0.8, 0], 'clamp');
    return { opacity, transform: [{ scale }] };
  });

  const icon2Style = useAnimatedStyle(() => {
    const pathProgress = progress.value;
    const totalPoints = MAP_POINTS.length;
    const rawProgress = pathProgress * totalPoints;
    const currentIndex = Math.min(Math.floor(rawProgress), totalPoints - 1);
    const iconProgress = rawProgress - currentIndex;
    const distance = Math.abs(currentIndex - 2);
    const shouldShow = distance <= 1;
    if (!shouldShow) return { opacity: 0, transform: [{ scale: 0 }] };
    const opacity = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 1, 1, 1, 0], 'clamp');
    const scale = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 0.8, 1, 0.8, 0], 'clamp');
    return { opacity, transform: [{ scale }] };
  });

  const icon3Style = useAnimatedStyle(() => {
    const pathProgress = progress.value;
    const totalPoints = MAP_POINTS.length;
    const rawProgress = pathProgress * totalPoints;
    const currentIndex = Math.min(Math.floor(rawProgress), totalPoints - 1);
    const iconProgress = rawProgress - currentIndex;
    const distance = Math.abs(currentIndex - 3);
    const shouldShow = distance <= 1;
    if (!shouldShow) return { opacity: 0, transform: [{ scale: 0 }] };
    const opacity = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 1, 1, 1, 0], 'clamp');
    const scale = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 0.8, 1, 0.8, 0], 'clamp');
    return { opacity, transform: [{ scale }] };
  });

  const icon4Style = useAnimatedStyle(() => {
    const pathProgress = progress.value;
    const totalPoints = MAP_POINTS.length;
    const rawProgress = pathProgress * totalPoints;
    const currentIndex = Math.min(Math.floor(rawProgress), totalPoints - 1);
    const iconProgress = rawProgress - currentIndex;
    const distance = Math.abs(currentIndex - 4);
    const shouldShow = distance <= 1;
    if (!shouldShow) return { opacity: 0, transform: [{ scale: 0 }] };
    const opacity = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 1, 1, 1, 0], 'clamp');
    const scale = interpolate(iconProgress, [0, 0.2, 0.5, 0.8, 1], [0, 0.8, 1, 0.8, 0], 'clamp');
    return { opacity, transform: [{ scale }] };
  });

  const iconStyles = [icon0Style, icon1Style, icon2Style, icon3Style, icon4Style];

  const renderIcon = (icon: { x: number; y: number; type: string; iconName: string }, index: number) => {
    return (
      <Animated.View
        key={index}
        style={[
          styles.iconContainer,
          {
            left: (icon.x / 100) * 250 - 20,
            top: (icon.y / 100) * 250 - 20,
          },
          iconStyles[index],
        ]}
      >
        <MaterialIcons
          name={icon.iconName}
          size={28}
          color={icon.type === 'beach' || icon.type === 'food' ? COLORS.gold : COLORS.darkBlue}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <View style={styles.mapOutline}>
          {/* Map points are hidden but logic remains */}
        </View>

        {TOURISM_ICONS.map((icon, index) => renderIcon(icon, index))}

        <Animated.View style={[styles.magnifyingGlass, magnifyingGlassStyle]}>
          <Animated.View style={[styles.pulseCircle, pulseStyle]} />
          <View style={styles.glassCircle}>
            <View style={styles.glassHandle} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 250,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapOutline: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapPoint: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.darkBlue,
    opacity: 0.3,
  },
  magnifyingGlass: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glass effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  glassHandle: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 12,
    height: 3,
    backgroundColor: COLORS.gold,
    transform: [{ rotate: '45deg' }],
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  pulseCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.3)', // Gold pulse
    zIndex: -1,
  },
});

export default SearchAnimation;
