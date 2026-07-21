import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';

// Import Screens & Context
import MasterDashboard from './screens/MasterDashboard';
import AllZones from './screens/AllZones';
import Advisories from './screens/Advisories';
import StudentReport from './screens/StudentReport';
import SubZonalAudit from './screens/SubZonalAudit';
import SubZonalMain from './screens/SubZonalMain';
import ZonalMain from './screens/zonal/ZonalMain';
import AdminMain from './screens/admin/AdminMain';
import ZonalDashboard from './screens/ZonalDashboard';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { DataProvider, DataContext } from './context/DataContext';

const Tab = createBottomTabNavigator();

function MainNavigator() {
  const { currentUser, logout } = useContext(DataContext);
  const [showSlides, setShowSlides] = useState(true);

  if (showSlides) {
    return <OnboardingScreen onFinish={() => setShowSlides(false)} />;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  if (currentUser.role === 'SubZonalHead') {
    return (
      <NavigationContainer>
        <SubZonalMain />
      </NavigationContainer>
    );
  }

  if (currentUser.role === 'ZonalHead') {
    return (
      <NavigationContainer>
        <ZonalDashboard />
      </NavigationContainer>
    );
  }

  if (currentUser.role === 'Admin') {
    return (
      <NavigationContainer>
        <AdminMain />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'ZonalDashboard') {
              iconName = focused ? 'business' : 'business-outline';
            } else if (route.name === 'AllZones') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'SubZonalAudit') {
              iconName = focused ? 'clipboard' : 'clipboard-outline';
            } else if (route.name === 'StudentReport') {
              iconName = focused ? 'megaphone' : 'megaphone-outline';
            } else if (route.name === 'Advisories') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: '#FBF7F2',
            borderTopColor: 'rgba(140,27,47,0.12)',
            paddingBottom: 5,
            paddingTop: 5,
            height: 65,
            shadowColor: '#1C0A0E',
            shadowOpacity: 0.1,
            elevation: 10,
          },
          tabBarActiveTintColor: '#8C1B2F',
          tabBarInactiveTintColor: '#7A4050',
          headerStyle: {
            backgroundColor: '#8C1B2F',
            borderBottomColor: '#6E1424',
            borderBottomWidth: 1,
          },
          headerTintColor: '#FBF7F2',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'System', 
          },
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color="#FBF7F2" />
            </TouchableOpacity>
          ),
        })}
      >
        {currentUser?.role === 'Admin' && (
          <Tab.Screen name="Dashboard" component={MasterDashboard} options={{ title: 'Admin' }} />
        )}
        
        {(currentUser?.role === 'Admin') && (
          <Tab.Screen name="AllZones" component={AllZones} options={{ title: 'Analysis' }} />
        )}

        {(currentUser?.role === 'Admin') && (
          <Tab.Screen name="SubZonalAudit" component={SubZonalAudit} options={{ title: 'Audit' }} />
        )}

        {(currentUser?.role === 'Admin' || currentUser?.role === 'Student') && (
          <Tab.Screen name="StudentReport" component={StudentReport} options={{ title: 'Concern', headerShown: false, tabBarStyle: { display: 'none' } }} />
        )}

        <Tab.Screen name="Advisories" component={Advisories} options={{ title: 'Alerts' }} />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <MainNavigator />
        <StatusBar style="light" />
      </DataProvider>
    </SafeAreaProvider>
  );
}
