import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../constants/theme';

const AppHeader = () => {
  // Try to load the image logo, with text as fallback
  const [logoError, setLogoError] = React.useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {!logoError ? (
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            onError={() => setLogoError(true)}
            resizeMode="contain"
          />
        ) : (
          // Fallback to text if image fails to load
          <Text style={styles.logoText}>Memorable</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    width: '100%',
    paddingHorizontal: 16,
    zIndex: 100,
    ...SHADOWS.light,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  logo: {
    height: 32,
    width: 160,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc88f7',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    // These text shadow properties help simulate a slight 3D effect,
    // though for a true 3D metallic look, an image asset would be better
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default AppHeader; 