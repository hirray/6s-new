import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SubZonalHomeStack from './subzonal/SubZonalHomeStack';
import SubZonalConcerns from './subzonal/SubZonalConcerns';
import SubZonalHistory from './subzonal/SubZonalHistory';
import SubZonalProfile from './subzonal/SubZonalProfile';

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
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.navWrapper}>
        <View style={styles.navBackground}>
          
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Concerns')}>
            <Ionicons name="alert-circle-outline" size={24} color={activeTab === 'Concerns' ? '#FFFFFF' : '#FCA5A5'} />
            <Text style={[styles.navText, activeTab === 'Concerns' && styles.activeNavText]}>Concerns</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('History')}>
            <Ionicons name="calendar-outline" size={24} color={activeTab === 'History' ? '#FFFFFF' : '#FCA5A5'} />
            <Text style={[styles.navText, activeTab === 'History' && styles.activeNavText]}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Profile')}>
            <Ionicons name="person-outline" size={24} color={activeTab === 'Profile' ? '#FFFFFF' : '#FCA5A5'} />
            <Text style={[styles.navText, activeTab === 'Profile' && styles.activeNavText]}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Protruding Home Tab (Left Aligned over the background) */}
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
