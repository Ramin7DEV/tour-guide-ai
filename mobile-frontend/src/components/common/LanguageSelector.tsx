import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/i18n/config';
import { COLORS } from '@/constants/theme';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const currentLang = i18n.language;

  const handleLanguageChange = async (lang: 'az' | 'en') => {
    await changeLanguage(lang);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="language"
          size={24}
          color={COLORS.white}
        />
        <Text style={styles.buttonText}>
          {currentLang === 'az' ? 'AZ' : 'EN'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentLang === 'az' ? 'Dil Seçin' : 'Select Language'}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                currentLang === 'az' && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange('az')}
            >
              <Text
                style={[
                  styles.languageText,
                  currentLang === 'az' && styles.languageTextActive,
                ]}
              >
                Azərbaycan
              </Text>
              {currentLang === 'az' && (
                <MaterialIcons name="check" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                currentLang === 'en' && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text
                style={[
                  styles.languageText,
                  currentLang === 'en' && styles.languageTextActive,
                ]}
              >
                English
              </Text>
              {currentLang === 'en' && (
                <MaterialIcons name="check" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    backgroundColor: '#F0F7FF',
    borderColor: COLORS.primary,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  languageTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

