import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '@/components/common/Button';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { RootStackParamList } from '@/types/navigation';
import { useTranslation } from 'react-i18next';

type DateSelectionRouteProp = RouteProp<RootStackParamList, 'DateSelection'>;
type DateSelectionNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DateSelection'
>;

const MAX_RANGE_DAYS = 5;

const DateSelectionScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DateSelectionNavigationProp>();
  const {
    params: { cityId },
  } = useRoute<DateSelectionRouteProp>();

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // Set header title with translation
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('dateSelection.title'),
    });
  }, [navigation, t]);

  // Bugünün tarixini YYYY-MM-DD formatında alırıq
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  const resetSelection = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
  }, []);

  const calculateDayDifference = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diff = Math.abs(endTime - startTime);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getDateRange = (start: string, end: string) => {
    const range: string[] = [];
    const current = new Date(start);
    const endDateObj = new Date(end);

    while (current <= endDateObj) {
      range.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return range;
  };

  const handleDayPress = useCallback(
    (day: DateData) => {
      const selectedDate = day.dateString;

      // Keçmiş tarixlərin seçilməsinin qarşısını alırıq
      if (selectedDate < today) {
        Alert.alert(
          t('dateSelection.pastDate'),
          t('dateSelection.pastDateMessage'),
        );
        return;
      }

      if (!startDate || (startDate && endDate)) {
        setStartDate(selectedDate);
        setEndDate(null);
        return;
      }

      if (selectedDate < startDate) {
        setStartDate(selectedDate);
        setEndDate(null);
        return;
      }

      const dayDiff = calculateDayDifference(startDate, selectedDate) + 1;

      if (dayDiff > MAX_RANGE_DAYS) {
        Alert.alert(
          t('dateSelection.rangeTooLong'),
          t('dateSelection.rangeTooLongMessage'),
        );
        resetSelection();
        return;
      }

      setEndDate(selectedDate);
    },
    [startDate, endDate, resetSelection, today],
  );

  const markedDates = useMemo(() => {
    if (!startDate) {
      return {};
    }

    const marks: Record<
      string,
      {
        startingDay?: boolean;
        endingDay?: boolean;
        color: string;
        textColor: string;
      }
    > = {};

    if (!endDate) {
      marks[startDate] = {
        startingDay: true,
        endingDay: true,
        color: COLORS.primary,
        textColor: COLORS.white,
      };
      return marks;
    }

    const range = getDateRange(startDate, endDate);
    range.forEach((date, index) => {
      const isFirst = index === 0;
      const isLast = index === range.length - 1;

      marks[date] = {
        startingDay: isFirst,
        endingDay: isLast,
        color: isFirst || isLast ? COLORS.primary : '#F4E3B0',
        textColor: COLORS.black,
      };
    });

    return marks;
  }, [startDate, endDate]);

  const handleContinue = useCallback(() => {
    if (!startDate || !endDate) {
      return;
    }

    navigation.navigate('PlaceSwipe', {
      cityId,
      startDate,
      endDate,
    });
  }, [navigation, cityId, startDate, endDate]);

  const isContinueDisabled = !startDate || !endDate;

  return (
    <View style={styles.container}>

      <Calendar
        onDayPress={handleDayPress}
        markingType="period"
        markedDates={markedDates}
        minDate={today}
        theme={{
          backgroundColor: COLORS.background,
          calendarBackground: COLORS.background,
          todayTextColor: COLORS.primary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.white,
          dayTextColor: COLORS.black,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.secondary,
          textSectionTitleColor: COLORS.secondary,
          disabledDayTextColor: COLORS.secondary,
        }}
        enableSwipeMonths
        firstDay={1}
        style={styles.calendar}
      />

      <View style={styles.footer}>
        <Button
          title={t('dateSelection.continue')}
          onPress={handleContinue}
          disabled={isContinueDisabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  calendar: {
    borderRadius: SIZES.radius,
    elevation: 2,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
});

export default DateSelectionScreen;
