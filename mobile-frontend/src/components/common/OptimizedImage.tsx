import React, { useState } from 'react';
import { Image, ImageProps } from 'expo-image';
import { StyleSheet, View, ViewStyle } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

export interface OptimizedImageProps {
  uri?: string | null;
  style?: ViewStyle;
  contentFit?: ImageProps['contentFit'];
  transition?: number;
  blurhash?: string;
}

// Sadə blurhash placeholder (boz rəng)
const DEFAULT_BLURHASH = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  contentFit = 'cover',
  transition = 300,
  blurhash = DEFAULT_BLURHASH,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // If style is provided, use it directly. Otherwise use default style.
  const imageStyle = style !== undefined ? style : styles.image;

  return (
    <View style={[imageStyle, styles.container]}>
      <Image
        source={{ uri: uri ?? undefined }}
        style={[StyleSheet.absoluteFill, styles.image]}
        contentFit={contentFit}
        contentPosition="center"
        transition={transition}
        placeholder={blurhash}
        cachePolicy="memory-disk"
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={StyleSheet.absoluteFill}>
          <SkeletonLoader style={styles.skeleton} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F0F0F0', // Fallback background
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skeleton: {
    width: '100%',
    height: '100%',
  },
});

export default OptimizedImage;

