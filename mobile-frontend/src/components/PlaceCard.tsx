import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Tables } from '@/types/supabase';
import OptimizedImage from './common/OptimizedImage';
import { useTranslation } from 'react-i18next';

export interface PlaceCardProps {
  place: Tables<'places'>;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const placeName = currentLang === 'en' ? (place.name_en ?? place.name_az ?? '') : (place.name_az ?? place.name_en ?? '');

  return (
    <View style={styles.container}>
      {/* Layer 1: The Image (Bottom) */}
      <OptimizedImage
        uri={place.image_url}
        style={StyleSheet.absoluteFillObject} // Fills the container
        contentFit="cover"
      />
      {/* Layer 2: The Gradient (Middle) */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject} // Fills the container
      />
      {/* Layer 3: The Content (Top) */}
      <View style={styles.content}>
        {place.category ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{place.category}</Text>
          </View>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.title}>{placeName}</Text>
          {place.average_visit_duration ? (
            <Text style={styles.subtitle}>
              Est. Visit: {place.average_visit_duration} min
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create<{
  container: ViewStyle;
  content: ViewStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  footer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
}>({
  container: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    borderRadius: SIZES.radius * 1.5,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary, // Fallback color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: SIZES.radius / 2,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.35,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.body - 2,
    fontWeight: '600',
  },
  footer: {
    gap: 6,
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.h1.fontSize,
    fontWeight: FONTS.h1.fontWeight as TextStyle['fontWeight'],
    flexWrap: 'wrap',
  },
  subtitle: {
    color: COLORS.white,
    fontSize: SIZES.body, // This should be 16px
    opacity: 0.9,
  },
});

export default PlaceCard;
