import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

const OfflineBanner: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const [heightAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isConnected === false) {
      // Show banner
      Animated.timing(heightAnim, {
        toValue: 40 + insets.top,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Hide banner
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isConnected, insets.top]);

  if (isConnected === true) return null;

  return (
    <Animated.View style={[styles.container, { height: heightAnim }]}>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Text style={styles.text}>No Internet Connection</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.error || '#FF5252',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OfflineBanner;
