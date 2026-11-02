import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
// import * as Sentry from '@sentry/react-native'; // Uncomment if Sentry is set up

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Sentry.captureException(error); // Uncomment if Sentry is set up
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <MaterialIcons name="error-outline" size={64} color={COLORS.error || '#FF5252'} />
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        We're sorry, but an unexpected error occurred. Please try again.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding * 2,
        backgroundColor: COLORS.background || '#FFFFFF',
    },
    title: {
        ...FONTS.h2,
        marginTop: SIZES.padding,
        marginBottom: SIZES.padding / 2,
        textAlign: 'center',
    },
    message: {
        ...FONTS.body3,
        color: COLORS.secondary || '#666',
        textAlign: 'center',
        marginBottom: SIZES.padding * 2,
    },
    button: {
        backgroundColor: COLORS.primary || '#007AFF',
        paddingHorizontal: SIZES.padding * 2,
        paddingVertical: SIZES.padding,
        borderRadius: SIZES.radius,
    },
    buttonText: {
        ...FONTS.h3,
        color: '#FFFFFF',
    },
});

export default ErrorBoundary;
