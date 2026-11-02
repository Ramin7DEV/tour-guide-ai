import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  UIManager,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useDerivedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import MapView, { LatLng, Marker, Callout } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, SIZES } from '@/constants/theme';
import { RootStackParamList } from '@/types/navigation';
import { RoutePlace, RouteResponse } from '@/types/route';
import { useTranslation } from 'react-i18next';

type RouteDisplayRouteProp = RouteProp<RootStackParamList, 'RouteDisplay'>;

const DEFAULT_REGION = {
  latitude: 40.4093,
  longitude: 49.8671,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

interface OrderedPlace {
  place: RoutePlace;
  order: number;
  day: number;
}

interface DaySectionProps {
  day: {
    day: number;
    summary: string;
    places: RoutePlace[];
  };
  isExpanded: boolean;
  onToggle: () => void;
  onPlaceTap: (place: RoutePlace) => void;
  t: (key: string) => string;
}

const DaySection: React.FC<DaySectionProps> = ({
  day,
  isExpanded,
  onToggle,
  onPlaceTap,
  t,
}) => {
  const progress = useDerivedValue(() => {
    return withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  const bodyStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      maxHeight: isExpanded ? 2000 : 0, // Arbitrary large height, or use measure
      overflow: 'hidden',
    };
  });

  const arrowStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <View style={styles.dayCard}>
      <TouchableOpacity
        style={styles.dayHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.dayHeaderLeft}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>{day.day}</Text>
          </View>
          <View style={styles.dayHeaderTextContainer}>
            <Text style={styles.dayTitle}>
              {t('routeDisplay.day')} {day.day}
            </Text>
            <Text style={styles.daySummary} numberOfLines={1}>
              {day.summary}
            </Text>
          </View>
        </View>
        <Animated.View style={arrowStyle}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color={COLORS.gray}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={bodyStyle}>
        <View style={styles.placesContainer}>
          {day.places.map((place, index) => {
            return (
              <TouchableOpacity
                key={`${day.day}-${place.placeId}`}
                style={styles.placeCard}
                onPress={() => onPlaceTap(place)}
                activeOpacity={0.8}
              >
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>
                    {place.name ?? t('routeDisplay.unknownPlace')}
                  </Text>
                  <Text style={styles.placeNotes} numberOfLines={2}>
                    {place.notes}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const RouteDisplayScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    params: { route },
  } = useRoute<RouteDisplayRouteProp>();

  const routeData = route as RouteResponse | undefined;
  const routeDays = routeData?.days ?? [];
  const routeTips = routeData?.tips ?? [];
  const estimatedCost = routeData?.estimatedCost;

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // State for collapsible days (first day open by default)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(() => new Set([1]));

  // State for selected marker
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // State for map selection modal
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedMapPlace, setSelectedMapPlace] = useState<RoutePlace | null>(null);

  const snapPoints = useMemo(() => ['25%', '50%', '85%'], []);

  // Auto-save route on mount
  useEffect(() => {
    const saveRoute = async () => {
      try {
        if (routeData) {
          await AsyncStorage.setItem('@tour_app:saved_route', JSON.stringify(routeData));
        }
      } catch (error) {
        console.error('Failed to save route:', error);
      }
    };

    saveRoute();
  }, [routeData]);

  const orderedPlaces = useMemo<OrderedPlace[]>(() => {
    if (routeDays.length === 0) {
      return [];
    }

    let order = 0;
    return routeDays.flatMap((day) =>
      day.places.map((place) => ({
        place,
        order: ++order,
        day: day.day,
      })),
    );
  }, [routeDays]);

  const orderLookup = useMemo(() => {
    const map = new Map<string, number>();
    orderedPlaces.forEach(({ place, order }) => {
      map.set(place.placeId, order);
    });
    return map;
  }, [orderedPlaces]);

  const coordinates = useMemo<LatLng[]>(() => {
    return orderedPlaces
      .map(({ place }) => ({
        latitude:
          typeof place.latitude === 'number'
            ? place.latitude
            : place.latitude ?? undefined,
        longitude:
          typeof place.longitude === 'number'
            ? place.longitude
            : place.longitude ?? undefined,
      }))
      .filter(
        (coord): coord is LatLng =>
          typeof coord.latitude === 'number' &&
          typeof coord.longitude === 'number',
      );
  }, [orderedPlaces]);

  const initialRegion = useMemo(() => {
    if (coordinates.length === 0) {
      return DEFAULT_REGION;
    }

    const [first] = coordinates;
    return {
      ...first,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [coordinates]);

  const handleFitToMarkers = useCallback(() => {
    if (coordinates.length < 1) {
      return;
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 80, left: 40, right: 40, bottom: 320 },
      animated: true,
    });
  }, [coordinates]);

  const buildRouteSummary = useCallback(() => {
    const parts = routeDays.flatMap((day) =>
      day.places.map(
        (place) =>
          `${place.name ?? t('routeDisplay.unknownPlace')}`,
      ),
    );

    return parts.join(' → ');
  }, [routeDays, t]);

  const handleOpenInMaps = useCallback(() => {
    if (orderedPlaces.length < 1) {
      Alert.alert(t('routeDisplay.noMapData'), t('routeDisplay.noMapData'));
      return;
    }

    // Bütün məkanların koordinatlarını Google Maps formatına çevir
    // Ən yaxşı variant: bir neçə waypoint ilə directions API
    const places = orderedPlaces
      .filter(({ place }) =>
        typeof place.latitude === 'number' && typeof place.longitude === 'number'
      )
      .map(({ place }) => `${place.latitude},${place.longitude}`);

    if (places.length === 0) {
      Alert.alert(t('routeDisplay.noMapData'), t('routeDisplay.noMapData'));
      return;
    }

    if (places.length === 1) {
      // Tək məkan varsa
      const url = `https://www.google.com/maps/search/?api=1&query=${places[0]}`;
      Linking.openURL(url).catch(() => {
        Alert.alert(t('routeDisplay.mapError'), t('routeDisplay.mapError'));
      });
      return;
    }

    // Çoxlu məkan varsa - directions formatında göstər (bütün məkanlar görünəcək)
    const origin = places[0];
    const destination = places[places.length - 1];
    const waypoints = places.slice(1, -1).join('|');

    // Google Maps Directions URL - bütün məkanları göstərir
    const url = waypoints.length > 0
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    Linking.openURL(url).catch(() => {
      Alert.alert(t('routeDisplay.mapError'), t('routeDisplay.mapError'));
    });
  }, [orderedPlaces, t]);

  const toggleDay = useCallback((dayNumber: number) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayNumber)) {
        newSet.delete(dayNumber);
      } else {
        newSet.add(dayNumber);
      }
      return newSet;
    });
  }, []);

  const handlePlaceTap = useCallback((place: RoutePlace) => {
    if (typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
      return;
    }

    // Set selected marker
    setSelectedPlaceId(place.placeId);

    // Zoom to place on map
    mapRef.current?.animateToRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);
  }, []);

  const handleOpenInExternalMaps = useCallback((place: RoutePlace) => {
    if (typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
      Alert.alert(t('routeDisplay.noMapData'));
      return;
    }

    if (Platform.OS === 'ios') {
      setSelectedMapPlace(place);
      setMapModalVisible(true);
    } else {
      // Android: Direct to Google Maps
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
      Linking.openURL(googleMapsUrl).catch(() => {
        Alert.alert(t('routeDisplay.mapError'));
      });
    }
  }, [t]);

  const handleMapSelection = useCallback((type: 'google' | 'apple') => {
    if (!selectedMapPlace) return;

    const place = selectedMapPlace;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    const appleMapsUrl = `http://maps.apple.com/?ll=${place.latitude},${place.longitude}&q=${encodeURIComponent(place.name || 'Location')}`;

    if (type === 'google') {
      // Check if Google Maps app is installed
      Linking.canOpenURL('comgooglemaps://')
        .then((supported) => {
          if (supported) {
            Linking.openURL(`comgooglemaps://?q=${place.latitude},${place.longitude}`).catch(() => {
              // If app fails to open, try web
              Linking.openURL(googleMapsUrl);
            });
          } else {
            Linking.openURL(googleMapsUrl);
          }
        })
        .catch((err) => {
          // If check fails (e.g. missing Info.plist scheme), fallback to web
          console.warn('Google Maps check failed:', err);
          Linking.openURL(googleMapsUrl);
        });
    } else {
      Linking.openURL(appleMapsUrl);
    }

    setMapModalVisible(false);
    setSelectedMapPlace(null);
  }, [selectedMapPlace]);

  const handleShareRoute = useCallback(() => {
    Share.share({
      title: t('routeDisplay.shareRoute'),
      message: buildRouteSummary(),
    }).catch(() => {
      Alert.alert(t('routeDisplay.shareError'), t('routeDisplay.shareError'));
    });
  }, [buildRouteSummary, t]);



  const handleGoBack = useCallback(() => {
    Alert.alert(
      t('routeDisplay.confirmExit'),
      t('routeDisplay.confirmExitMessage'),
      [
        {
          text: t('routeDisplay.cancel'),
          style: 'cancel',
        },
        {
          text: t('routeDisplay.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@tour_app:saved_route');
            } catch (error) {
              console.error('Failed to clear saved route:', error);
            }
            // Reset navigation stack to prevent swipe back
            // @ts-ignore
            navigation.reset({
              index: 0,
              routes: [{ name: 'CitySelection' }],
            });
          },
        },
      ],
    );
  }, [navigation, t]);

  const getMarkerIcon = useCallback((category: string | undefined, place?: RoutePlace) => {
    if (!category) {
      // Əgər kateqoriya yoxdursa, adı yoxlayaq
      const nameLower = (place?.name || '').toLowerCase();
      if (nameLower.includes('məscid') || nameLower.includes('mosque')) {
        return { name: 'mosque' as const, color: '#0EA5E9' };
      }
      return { name: 'map-marker' as const, color: COLORS.primary };
    }

    const categoryLower = category.toLowerCase();

    // Parklar və təbiət
    if (categoryLower.includes('park') || categoryLower.includes('garden') ||
      categoryLower.includes('nature') || categoryLower.includes('təbiət')) {
      return { name: 'tree' as const, color: '#22C55E' }; // yaşıl
    }

    // Tarixi yerlər və muzeylər
    if (categoryLower.includes('museum') || categoryLower.includes('history') ||
      categoryLower.includes('historical') || categoryLower.includes('tarixi') ||
      categoryLower.includes('muzey')) {
      return { name: 'bank' as const, color: '#8B5CF6' }; // bənövşəyi
    }

    // Məscidlər və dini yerlər
    // Həm kateqoriyanı, həm də adı yoxlayırıq
    const nameLower = (place?.name || '').toLowerCase();
    if (categoryLower.includes('mosque') || categoryLower.includes('masjid') ||
      categoryLower.includes('məscid') || categoryLower.includes('cami') ||
      nameLower.includes('məscid') || nameLower.includes('mosque') || nameLower.includes('masjid')) {
      return { name: 'mosque' as const, color: '#0EA5E9' }; // mavi
    }

    // Default marker
    return { name: 'map-marker' as const, color: COLORS.primary };
  }, []);

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={handleGoBack}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
      </TouchableOpacity>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={handleFitToMarkers}
        showsUserLocation
      >
        {orderedPlaces.map(({ place, order }) => {
          if (
            typeof place.latitude !== 'number' ||
            typeof place.longitude !== 'number'
          ) {
            return null;
          }

          return (
            <Marker
              key={`${place.placeId}-${order}`}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={Platform.OS === 'android' ? place.name : undefined}
              description={Platform.OS === 'android' ? t('routeDisplay.tapToOpen') : undefined}
              onPress={() => setSelectedPlaceId(place.placeId)}
              onCalloutPress={() => {
                // Both Android and iOS will trigger this when callout is tapped
                Alert.alert(
                  place.name || t('routeDisplay.location'),
                  t('routeDisplay.openInMapsQuestion'),
                  [
                    {
                      text: t('routeDisplay.cancel'),
                      style: 'cancel',
                    },
                    {
                      text: t('routeDisplay.openInMaps'),
                      onPress: () => handleOpenInExternalMaps(place),
                    },
                  ]
                );
              }}
            >
              <View style={styles.markerContainer}>
                <MaterialCommunityIcons
                  name={getMarkerIcon(place.category, place).name}
                  size={32}
                  color={getMarkerIcon(place.category, place).color}
                />
              </View>
              {Platform.OS === 'ios' && (
                <Callout tooltip={true}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{place.name}</Text>
                    <View style={styles.calloutButton}>
                      <Text style={styles.calloutButtonText}>{t('routeDisplay.openInMaps')}</Text>
                    </View>
                  </View>
                </Callout>
              )}
            </Marker>
          );
        })}
      </MapView>

      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}
        >
          {routeDays.map((day) => (
            <DaySection
              key={day.day}
              day={day}
              isExpanded={expandedDays.has(day.day)}
              onToggle={() => toggleDay(day.day)}
              onPlaceTap={handlePlaceTap}
              t={t}
            />
          ))}

          {routeTips.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('routeDisplay.tips')}</Text>
              {routeTips.map((tip, index) => (
                <Text key={`tip-${index}`} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
          ) : null}

          {estimatedCost ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('routeDisplay.budget')}</Text>
              <Text style={styles.costText}>
                {estimatedCost.amount} {estimatedCost.currency}
              </Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareRoute}
            >
              <Text style={styles.actionButtonText}>{t('routeDisplay.shareRoute')}</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Map Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMapModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('routeDisplay.openInMaps')}</Text>
              <Text style={styles.modalSubtitle}>{selectedMapPlace?.name}</Text>
            </View>

            <TouchableOpacity
              style={styles.mapOption}
              onPress={() => handleMapSelection('google')}
            >
              <MaterialCommunityIcons name="google-maps" size={24} color="#4285F4" />
              <Text style={styles.mapOptionText}>Google Maps</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.mapOption}
              onPress={() => handleMapSelection('apple')}
            >
              <MaterialCommunityIcons name="map" size={24} color="#007AFF" />
              <Text style={styles.mapOptionText}>Apple Maps</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('routeDisplay.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 180,
    maxWidth: 220,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  calloutButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  mapOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  mapOptionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  dayCard: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dayBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  dayHeaderTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  dayTitle: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  daySummary: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
    lineHeight: 22,
  },
  placesContainer: {
    marginTop: 12,
    gap: 10,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  placeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeInfo: {
    flex: 1,
  },
  placeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 3,
  },
  placeNotes: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  map: {
    flex: 1,
  },
  bottomSheetContent: {
    padding: SIZES.padding,
    gap: SIZES.padding,
  },

  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 12,
  },
  tipText: {
    fontSize: SIZES.body,
    color: COLORS.black,
    marginBottom: 8,
    lineHeight: 20,
  },
  costText: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default RouteDisplayScreen;
