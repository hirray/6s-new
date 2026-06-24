import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SubZonalHomeStack from './subzonal/SubZonalHomeStack';
import SubZonalConcerns from './subzonal/SubZonalConcerns';
import SubZonalHistory from './subzonal/SubZonalHistory';
import SubZonalProfile from './subzonal/SubZonalProfile';
import FloatingNavBar from '../components/FloatingNavBar';

export default function SubZonalMain() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch(activeTab) {
      case 'Home': return <SubZonalHomeStack />;
      case 'Concerns': return <SubZonalConcerns />;
      case 'History': return <SubZonalHistory />;
      case 'Profile': return <SubZonalProfile />;
      default: return <SubZonalHomeStack />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {renderContent()}
        </View>
        
        <FloatingNavBar 
          tabs={[
            { key: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
            { key: 'Concerns', icon: 'alert-circle-outline', activeIcon: 'alert-circle', label: 'Concerns' },
            { key: 'History', icon: 'calendar-outline', activeIcon: 'calendar', label: 'History' },
            { key: 'Profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' }
          ]}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  content: {
    flex: 1,
  },
  navWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
  },
  navBackground: {
    position: 'absolute',
    bottom: 0,
    left: 40, // Shifted right to make room for home button
    right: 0,
    height: 65,
    backgroundColor: '#8C1B2F', // Deep red
    borderTopLeftRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 40, // padding to push other items to the right
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#FCA5A5',
    marginTop: 4,
  },
  activeNavText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  homeTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAFAF8', // Match screen background
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  homeTabInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  homeNavText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  activeHomeNavText: {
    color: '#8C1B2F',
    fontWeight: 'bold',
  }
});
