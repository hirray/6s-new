import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ZonalHomeStack from './ZonalHomeStack';
import ZonalInspection from './ZonalInspection';
import ZonalProfile from './ZonalProfile';
import Advisories from '../Advisories';

export default function ZonalMain() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch(activeTab) {
      case 'Home': return <ZonalHomeStack />;
      case 'Inspection': return <ZonalInspection />;
      case 'Advisories': return <Advisories />;
      case 'Profile': return <ZonalProfile />;
      default: return <ZonalHomeStack />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.navWrapper}>
        <View style={styles.navBackground}>
          
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Inspection')}>
            <Ionicons name="clipboard-outline" size={24} color={activeTab === 'Inspection' ? '#FFFFFF' : '#FCA5A5'} />
            <Text style={[styles.navText, activeTab === 'Inspection' && styles.activeNavText]}>Inspection</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Advisories')}>
            <Ionicons name="notifications-outline" size={24} color={activeTab === 'Advisories' ? '#FFFFFF' : '#FCA5A5'} />
            <Text style={[styles.navText, activeTab === 'Advisories' && styles.activeNavText]}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Profile')}>
            <Ionicons name="person-outline" size={24} color={activeTab === 'Profile' ? '#FFFFFF' : '#FCA5A5'} />
            <Text style={[styles.navText, activeTab === 'Profile' && styles.activeNavText]}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Protruding Home Tab */}
        <View style={styles.homeTabContainer}>
          <TouchableOpacity 
            style={styles.homeTabInner}
            onPress={() => setActiveTab('Home')}
            activeOpacity={0.9}
          >
            <Ionicons name="home-outline" size={24} color={activeTab === 'Home' ? '#8C1B2F' : '#6B7280'} />
            <Text style={[styles.homeNavText, activeTab === 'Home' && styles.activeHomeNavText]}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    left: 40,
    right: 0,
    height: 65,
    backgroundColor: '#8C1B2F',
    borderTopLeftRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 40,
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
    backgroundColor: '#FAFAF8',
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
