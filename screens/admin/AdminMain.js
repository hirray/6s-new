import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AdminHome from './AdminHome';
import AdminZones from './AdminZones';
import AdminAdvisories from './AdminAdvisories';
import AdminAnalytics from './AdminAnalytics';
import AdminProfile from './AdminProfile';

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
      
      {/* 5-Tab Bottom Navigation */}
      <View style={styles.navBackgroundStandard}>
        <TouchableOpacity style={styles.navItemStandard} onPress={() => setActiveTab('Home')}>
          <Ionicons name={activeTab === 'Home' ? "home" : "home-outline"} size={22} color={activeTab === 'Home' ? '#FFFFFF' : '#FCA5A5'} />
          <Text style={[styles.navTextStandard, activeTab === 'Home' && styles.activeNavTextStandard]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemStandard} onPress={() => setActiveTab('Zones')}>
          <Ionicons name={activeTab === 'Zones' ? "business" : "business-outline"} size={22} color={activeTab === 'Zones' ? '#FFFFFF' : '#FCA5A5'} />
          <Text style={[styles.navTextStandard, activeTab === 'Zones' && styles.activeNavTextStandard]}>Zones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemStandard} onPress={() => setActiveTab('Advisory')}>
          <Ionicons name={activeTab === 'Advisory' ? "document-text" : "document-text-outline"} size={22} color={activeTab === 'Advisory' ? '#FFFFFF' : '#FCA5A5'} />
          <Text style={[styles.navTextStandard, activeTab === 'Advisory' && styles.activeNavTextStandard]}>Advisory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemStandard} onPress={() => setActiveTab('Analytics')}>
          <Ionicons name={activeTab === 'Analytics' ? "bar-chart" : "bar-chart-outline"} size={22} color={activeTab === 'Analytics' ? '#FFFFFF' : '#FCA5A5'} />
          <Text style={[styles.navTextStandard, activeTab === 'Analytics' && styles.activeNavTextStandard]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemStandard} onPress={() => setActiveTab('Profile')}>
          <Ionicons name={activeTab === 'Profile' ? "person" : "person-outline"} size={22} color={activeTab === 'Profile' ? '#FFFFFF' : '#FCA5A5'} />
          <Text style={[styles.navTextStandard, activeTab === 'Profile' && styles.activeNavTextStandard]}>Profile</Text>
        </TouchableOpacity>
      </View>
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
