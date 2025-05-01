import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, LogBox, Platform, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CalendarScreen from './screens/CalendarScreen';
import TasksScreen from './screens/TasksScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import { COLORS, SIZES, LAYOUT } from './constants/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();

export default function App() {
  // Desktop-specific container for better layout
  const DesktopContainer = ({ children }) => {
    // Only apply desktop container styling on web
    if (Platform.OS === 'web') {
      return (
        <View style={styles.desktopContainer}>
          <View style={styles.desktopContent}>
            {children}
          </View>
        </View>
      );
    }
    
    // Return children directly on mobile platforms
    return children;
  };

  return (
    <DesktopContainer>
      <NavigationContainer>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <Stack.Navigator
          initialRouteName="Calendar"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Tasks" component={TasksScreen} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </DesktopContainer>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  desktopContent: {
    width: '100%',
    maxWidth: SIZES.maxContentWidth,
    height: '100%',
    maxHeight: 800,
    overflow: 'hidden',
    borderRadius: LAYOUT.desktop.borderRadius,
    backgroundColor: COLORS.background,
    ...Platform.select({
      web: {
        boxShadow: '0px 3px 15px rgba(0,0,0,0.1)',
      },
    }),
  },
}); 