import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AdminHome from './AdminHome';
import AdminZones from './AdminZones';
import AdminAdvisories from './AdminAdvisories';
import AdminAnalytics from './AdminAnalytics';
import AdminProfile from './AdminProfile';
import FloatingNavBar from '../../components/FloatingNavBar';

export default function AdminMain() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch(activeTab) {
      case 'Home': return <AdminHome />;
      case 'Zones': return <AdminZones />;
      case 'Advisory': return <AdminAdvisories />;
      case 'Analytics': return <AdminAnalytics />;
      case 'Profile': return <AdminProfile />;
      default: return <AdminHome />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <FloatingNavBar 
        tabs={[
          { key: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
          { key: 'Zones', icon: 'business-outline', activeIcon: 'business', label: 'Zones' },
          { key: 'Advisory', icon: 'document-text-outline', activeIcon: 'document-text', label: 'Advisory' },
          { key: 'Analytics', icon: 'bar-chart-outline', activeIcon: 'bar-chart', label: 'Analytics' },
          { key: 'Profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' }
        ]}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
}

// We will use AdminMainStandard since it strictly matches the 5 items the user requested in text.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  content: {
    flex: 1,
  },
  navBackgroundStandard: {
    height: 70,
    backgroundColor: '#8C1B2F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10, // For safe area on some devices
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItemStandard: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navTextStandard: {
    fontSize: 10,
    color: '#FCA5A5',
    marginTop: 4,
  },
  activeNavTextStandard: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});
