import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SIZES } from '@/constants/theme';
import { Tables } from '@/types/supabase';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { useTranslation } from 'react-i18next';

export interface CityCardProps {
  city: Pick<Tables<'cities'>, 'name_az' | 'name_en' | 'thumbnail_url'>;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CityCard: React.FC<CityCardProps> = ({ city, onPress, style }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const cityName = currentLang === 'en' ? (city.name_en ?? city.name_az ?? '') : (city.name_az ?? city.name_en ?? '');

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <OptimizedImage
        uri={city.thumbnail_url}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <Text style={styles.title}>{cityName}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.black,
    height: 220,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZES.radius,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.75,
    borderRadius: SIZES.radius,
  },
  title: {
    color: COLORS.white,
    fontSize: SIZES.h1,
    fontWeight: '700',
  },
});

export default CityCard;
