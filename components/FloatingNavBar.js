import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Floating Navigation Bar
 * 
 * @param {Array} tabs - Array of tab objects: [{ key: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'Home' }]
 * @param {String} activeTab - The key of the currently active tab
 * @param {Function} onTabPress - Callback when a tab is pressed, passing the tab key
 */
export default function FloatingNavBar({ tabs, activeTab, onTabPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const iconName = isActive ? (tab.activeIcon || tab.icon) : tab.icon;
          
          return (
            <TouchableOpacity 
              key={tab.key}
              style={[styles.tabItem, isActive && styles.activeTabItem]}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                <Ionicons 
                  name={iconName} 
                  size={isActive ? 24 : 24} 
                  color={isActive ? '#FFFFFF' : '#9CA3AF'} 
                />
              </View>
              {isActive && tab.label && (
                <Text style={styles.tabLabel}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 65 : 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#8C1B2F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '70%',
    maxWidth: '90%',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  activeTabItem: {
    backgroundColor: '#8C1B2F',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    marginRight: 6,
  },
  tabLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
