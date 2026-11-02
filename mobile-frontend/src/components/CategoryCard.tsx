import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

interface CategoryCardProps {
    coverImageUrl: string | null;
    name: string;
    description: string | null;
}

const CategoryCard: React.FC<CategoryCardProps> = React.memo(({
    coverImageUrl,
    name,
    description
}) => {
    return (
        <View style={styles.card}>
            <Image
                source={{ uri: coverImageUrl || 'https://placehold.co/800x1200' }}
                style={styles.categoryBackground}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                style={styles.gradient}
            >
                <View style={styles.categoryContent}>
                    <Text style={styles.categoryName}>{name}</Text>
                    {description && (
                        <Text style={styles.categoryDescription} numberOfLines={3}>
                            {description}
                        </Text>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
});

CategoryCard.displayName = 'CategoryCard';

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: SIZES.radius * 2,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 10,
    },
    categoryBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: SIZES.radius * 2,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        justifyContent: 'flex-end',
        borderRadius: SIZES.radius * 2,
    },
    categoryContent: {
        padding: SIZES.padding * 2,
        gap: SIZES.padding * 0.5,
    },
    categoryName: {
        fontSize: FONTS.h1.fontSize * 1.2,
        fontWeight: '800',
        color: COLORS.white,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    categoryDescription: {
        fontSize: SIZES.body,
        color: 'rgba(255,255,255,0.95)',
        lineHeight: SIZES.body * 1.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});

export default CategoryCard;
