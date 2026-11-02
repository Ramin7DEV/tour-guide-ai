import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Onboarding from 'react-native-onboarding-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/constants/theme';
import { RootStackParamList } from '@/types/navigation';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/common/LanguageSelector';

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

const { width, height } = Dimensions.get('window');
const VIDEO_SIZE = Math.min(width * 0.85, 360);
const BOTTOM_BAR_HEIGHT = 90;

type SlideConfig = {
  key: string;
  title: string;
  subtitle: string;
  video: any;
  accentColor: string;
  videoBackgroundColor: string;
  resizeMode: 'contain' | 'cover' | 'fill';
  canvasColor: string;
};

// SLIDES will be created dynamically using i18n in the component
const getSlides = (t: (key: string) => string): SlideConfig[] => [
  {
    key: 'welcome',
    title: t('welcome.title1'),
    subtitle: t('welcome.subtitle1'),
    video: require('@/assets/images/onboarding_1.mp4'),
    accentColor: '#5AA8FF',
    videoBackgroundColor: '#000',
    resizeMode: 'cover',
    canvasColor: '#F3F7FF',
  },
  {
    key: 'ai-route',
    title: t('welcome.title2'),
    subtitle: t('welcome.subtitle2'),
    video: require('@/assets/images/onboarding_2.mp4'),
    accentColor: '#DC0000',
    videoBackgroundColor: '#FFF7F7',
    resizeMode: 'contain',
    canvasColor: '#FFF5F6',
  },
  {
    key: 'adventure',
    title: t('welcome.title3'),
    subtitle: t('welcome.subtitle3'),
    video: require('@/assets/images/onboarding_3.mp4'),
    accentColor: '#4ED6A1',
    videoBackgroundColor: '#001F16',
    resizeMode: 'cover',
    canvasColor: '#F0FFF7',
  },
];

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const isShort = sanitized.length === 3;
  const value = parseInt(
    isShort
      ? sanitized
        .split('')
        .map((char) => char + char)
        .join('')
      : sanitized,
    16
  );

  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const lightenHex = (hex: string, amount: number = 0.4) => {
  const sanitized = hex.replace('#', '');
  const isShort = sanitized.length === 3;
  const normalized = isShort
    ? sanitized
      .split('')
      .map((char) => char + char)
      .join('')
    : sanitized;
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  const lightenChannel = (channel: number) =>
    Math.round(channel + (255 - channel) * amount);

  const lr = lightenChannel(r);
  const lg = lightenChannel(g);
  const lb = lightenChannel(b);

  return `rgb(${lr}, ${lg}, ${lb})`;
};

const DOT_BASE_SIZE = 8;
const DOT_ACTIVE_SIZE = 18;
const DOT_SPACING = 28;
const DOT_CONTAINER_HEIGHT = DOT_ACTIVE_SIZE;
const DOT_SLOT_TOP_OFFSET = (DOT_ACTIVE_SIZE - DOT_BASE_SIZE) / 2;

const HiddenDot = () => <View style={styles.hiddenDot} />;

const AnimatedBackdrop = ({
  progress,
  slides,
}: {
  progress: SharedValue<number>;
  slides: SlideConfig[];
}) => {
  const indices = useMemo(() => slides.map((_, idx) => idx), [slides]);
  const accentAuras = useMemo(
    () => slides.map((slide) => hexToRgba(slide.accentColor, 0.28)),
    [slides]
  );
  const accentHalos = useMemo(
    () => slides.map((slide) => hexToRgba(slide.accentColor, 0.12)),
    [slides]
  );

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      indices,
      slides.map((slide) => slide.canvasColor)
    ),
  }));

  const topBlobStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      indices,
      accentAuras
    ),
    transform: [
      { translateX: interpolate(progress.value, [0, 1, 2], [-50, 0, 45]) },
      { translateY: interpolate(progress.value, [0, 1, 2], [-10, -30, -5]) },
      { scale: interpolate(progress.value, [0, 1, 2], [1, 1.15, 0.95]) },
    ],
  }));

  const bottomBlobStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      indices,
      accentHalos
    ),
    transform: [
      { translateX: interpolate(progress.value, [0, 1, 2], [40, -10, -50]) },
      { translateY: interpolate(progress.value, [0, 1, 2], [20, 40, 30]) },
      { scale: interpolate(progress.value, [0, 1, 2], [0.9, 1.05, 1.2]) },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1, 2], [0.7, 0.9, 0.5]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1, 2], [-80, 0, 60]) },
    ],
  }));

  return (
    <Animated.View style={[styles.backdrop, backgroundStyle]} pointerEvents="none">
      <Animated.View style={[styles.backdropBlob, styles.topBlob, topBlobStyle]} />
      <Animated.View
        style={[styles.backdropBlob, styles.bottomBlob, bottomBlobStyle]}
      />
      <Animated.View style={[styles.backdropBeam, shimmerStyle]} />
    </Animated.View>
  );
};

type AnimatedMediaProps = {
  index: number;
  progress: SharedValue<number>;
  videoSource: any;
  resizeMode: 'contain' | 'cover' | 'fill';
  accentColor: string;
  videoBackgroundColor: string;
};

const AnimatedMedia: React.FC<AnimatedMediaProps> = ({
  index,
  progress,
  videoSource,
  resizeMode,
  accentColor,
  videoBackgroundColor,
}) => {
  const containerStyle = useAnimatedStyle(() => {
    const distance = Math.min(Math.abs(progress.value - index), 1);
    const direction = progress.value - index;
    return {
      transform: [
        {
          translateY: interpolate(distance, [0, 1], [0, 26]),
        },
        {
          scale: interpolate(distance, [0, 1], [1, 0.88]),
        },
        {
          rotate: `${interpolate(direction, [-1, 0, 1], [-6, 0, 6])}deg`,
        },
      ],
      opacity: interpolate(distance, [0, 1], [1, 0.55]),
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const distance = Math.min(Math.abs(progress.value - index), 1);
    return {
      opacity: interpolate(distance, [0, 1], [0.9, 0]),
    };
  });

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  return (
    <Animated.View style={[styles.mediaContainer, containerStyle]}>
      <Animated.View
        style={[
          styles.mediaGlow,
          { backgroundColor: hexToRgba(accentColor, 0.35) },
          glowStyle,
        ]}
      />
      <View
        style={[
          styles.videoWrapper,
          { backgroundColor: videoBackgroundColor },
        ]}
      >
        <VideoView
          player={player}
          style={styles.video}
          contentFit={resizeMode}
          nativeControls={false}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)']}
          style={styles.videoOverlay}
        />
      </View>
    </Animated.View>
  );
};

const SimplePagination = ({
  progress,
  slides,
}: {
  progress: SharedValue<number>;
  slides: SlideConfig[];
}) => {
  const insets = useSafeAreaInsets();
  const dotOffsets = useMemo(() => {
    return slides.map((_, index) => index * DOT_SPACING);
  }, [slides]);

  const dotColors = useMemo(() => {
    return slides.map((slide) => lightenHex(slide.accentColor, 0.45));
  }, [slides]);

  const accentColors = useMemo(
    () => slides.map((slide) => slide.accentColor),
    [slides]
  );

  const bottomOffset = useMemo(() => {
    const baseOffset = BOTTOM_BAR_HEIGHT / 2 - DOT_CONTAINER_HEIGHT / 2;
    return Math.max(baseOffset, 0) + insets.bottom;
  }, [insets.bottom]);

  const indicatorStyle = useAnimatedStyle(() => {
    'worklet';
    const roundedIndex = Math.round(progress.value);
    const clampedIndex = Math.max(0, Math.min(slides.length - 1, roundedIndex));
    return {
      transform: [
        {
          translateX: dotOffsets[clampedIndex],
        },
      ],
      backgroundColor: dotColors[clampedIndex],
      shadowColor: accentColors[clampedIndex],
    };
  });

  return (
    <View
      pointerEvents="none"
      style={[styles.paginationWrapper, { bottom: bottomOffset }]}
    >
      <View style={[styles.dotsTrack, { width: DOT_ACTIVE_SIZE + DOT_SPACING * (slides.length - 1) }]}>
        {slides.map((slide, index) => (
          <View
            key={slide.key || index.toString()}
            style={[
              styles.dotSlot,
              { left: dotOffsets[index] + DOT_ACTIVE_SIZE / 2 - DOT_BASE_SIZE / 2 },
            ]}
          />
        ))}
        <Animated.View style={[styles.dotActive, indicatorStyle]} />
      </View>
    </View>
  );
};

const WelcomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const pageProgress = useSharedValue(0);
  const slides = useMemo(() => getSlides(t), [t]);
  const insets = useSafeAreaInsets();

  const navigateToCities = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CitySelection' }],
    });
  }, [navigation]);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
    } catch (error) {
      console.warn('Unable to persist onboarding flag', error);
    } finally {
      navigateToCities();
    }
  }, [navigateToCities]);

  const CustomTitle = ({ title }: { title: string }) => (
    <Text style={styles.customTitle}>{title}</Text>
  );

  const CustomSubtitle = ({ subtitle }: { subtitle: string }) => (
    <Text style={styles.customSubtitle}>{subtitle}</Text>
  );

  const handlePageChange = useCallback(
    (index: number) => {
      pageProgress.value = withTiming(index, {
        duration: 650,
        easing: Easing.bezier(0.45, 0, 0.1, 1),
      });
    },
    [pageProgress]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.languageSelectorContainer, { top: insets.top + 10 }]}>
        <LanguageSelector />
      </View>
      <AnimatedBackdrop progress={pageProgress} slides={slides} />
      <Onboarding
        onDone={completeOnboarding}
        onSkip={completeOnboarding}
        pageIndexCallback={handlePageChange}
        containerStyles={styles.onboardingContainer}
        imageContainerStyles={styles.imageContainer}
        bottomBarHeight={BOTTOM_BAR_HEIGHT}
        bottomBarColor="transparent"
        showSkip={true}
        skipLabel={t('common.skip')}
        nextLabel={t('common.next')}
        DoneButtonComponent={({ ...props }) => (
          <TouchableOpacity {...props}>
            <View style={styles.doneButton}>
              <Text style={styles.doneButtonText}>{t('common.start')}</Text>
            </View>
          </TouchableOpacity>
        )}
        SkipButtonComponent={({ ...props }) => (
          <TouchableOpacity {...props}>
            <Text style={styles.skipButton}>{t('common.skip')}</Text>
          </TouchableOpacity>
        )}
        NextButtonComponent={({ ...props }) => (
          <TouchableOpacity {...props}>
            <View style={styles.nextButton}>
              <Ionicons name="arrow-forward" size={30} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
        DotComponent={HiddenDot}
        pages={slides.map((slide, index) => ({
          backgroundColor: 'transparent',
          image: (
            <AnimatedMedia
              key={slide.key}
              index={index}
              progress={pageProgress}
              videoSource={slide.video}
              resizeMode={slide.resizeMode}
              accentColor={slide.accentColor}
              videoBackgroundColor={slide.videoBackgroundColor}
            />
          ),
          title: <CustomTitle title={slide.title} />,
          subtitle: <CustomSubtitle subtitle={slide.subtitle} />,
        }))}
      />
      <SimplePagination progress={pageProgress} slides={slides} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  languageSelectorContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  onboardingContainer: {
    paddingHorizontal: 0,
    flex: 1,
  },
  imageContainer: {
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backdropBlob: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
  },
  topBlob: {
    top: -width * 0.3,
    right: -width * 0.2,
  },
  bottomBlob: {
    bottom: -width * 0.35,
    left: -width * 0.3,
  },
  backdropBeam: {
    position: 'absolute',
    width: width * 1.2,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.35)',
    top: height * 0.25,
    left: -width * 0.1,
    transform: [{ rotate: '-8deg' }],
  },
  mediaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mediaGlow: {
    position: 'absolute',
    width: VIDEO_SIZE * 0.95,
    height: VIDEO_SIZE * 0.95,
    borderRadius: VIDEO_SIZE * 0.55,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    opacity: 0.65,
  },
  videoWrapper: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },

  customTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
    letterSpacing: -0.5,
  },
  customSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    marginRight: 16,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipButton: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  nextButton: {
    backgroundColor: COLORS.primary || '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: COLORS.primary || '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    ...Platform.select({
      android: {
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 28,
        includeFontPadding: false,
      },
    }),
  },
  hiddenDot: {
    width: 0,
    height: 0,
  },
  paginationWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsTrack: {
    height: DOT_CONTAINER_HEIGHT,
    borderRadius: DOT_CONTAINER_HEIGHT / 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    position: 'relative',
  },
  dotSlot: {
    position: 'absolute',
    width: DOT_BASE_SIZE,
    height: DOT_BASE_SIZE,
    borderRadius: DOT_BASE_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    top: DOT_SLOT_TOP_OFFSET,
  },
  dotActive: {
    position: 'absolute',
    width: DOT_ACTIVE_SIZE,
    height: DOT_ACTIVE_SIZE,
    borderRadius: DOT_ACTIVE_SIZE / 2,
    top: 0,
    left: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
});

export default WelcomeScreen;
