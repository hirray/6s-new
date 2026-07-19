import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

/**
 * Reusable Profile Layout Component
 * 
 * @param {String} name - User's name
 * @param {String} role - User's role (e.g. "Student", "Zonal Head")
 * @param {Function} onLogout - Callback for log out button
 * @param {React.ReactNode} children - Role-specific cards and content
 */
export default function ProfileLayout({ name, email, role, avatarUri, onLogout, onUpdateProfile, children, onNavigate }) {
  const insets = useSafeAreaInsets();
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  
  const [editName, setEditName] = useState(name || '');
  const [editEmail, setEditEmail] = useState(email || '');
  const [editAvatar, setEditAvatar] = useState(avatarUri || null);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (onUpdateProfile) {
      await onUpdateProfile({
        name: editName,
        email: editEmail,
        avatarUri: editAvatar !== avatarUri ? editAvatar : null
      });
    }
    setEditModalVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Single Color Background is handled by container style */}

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar and Basic Info */}
        <View style={styles.profileHeader}>
          {onNavigate && (
            <TouchableOpacity onPress={() => onNavigate('Home')} style={{position: 'absolute', top: 0, left: 0}}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarInner}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={56} color="#8C1B2F" />
              )}
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={styles.nameText}>{name || 'Unknown User'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" style={{marginRight: 6}}/>
            <Text style={styles.roleText}>{role || 'User'}</Text>
          </View>

          {onUpdateProfile && (
            <TouchableOpacity 
              style={styles.editProfileBtn} 
              onPress={() => {
                setEditName(name || '');
                setEditEmail(email || '');
                setEditAvatar(avatarUri || null);
                setEditModalVisible(true);
              }}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Specific Profile Cards inserted here */}
        <View style={styles.bodyContent}>
          {children}

          {/* Unified Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={22} color="#8C1B2F" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom padding for FloatingNavBar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal (Instagram Style) */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editAvatarSection}>
              <TouchableOpacity onPress={handlePickImage} style={styles.editAvatarWrapper}>
                <View style={styles.editAvatarInner}>
                  {editAvatar ? (
                    <Image source={{ uri: editAvatar }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={60} color="#9CA3AF" />
                  )}
                </View>
                <View style={styles.editIconBadge}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickImage}>
                <Text style={styles.changePhotoText}>Change Profile Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.inputField}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your Name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.inputField, { color: '#9CA3AF' }]}
                  value={editEmail}
                  editable={false}
                  placeholder="Your Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8C1B2F',
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 55,
    backgroundColor: '#FDECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  nameText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bodyContent: {
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#8C1B2F',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editProfileBtn: {
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FAFAF8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cancelText: {
    fontSize: 16,
    color: '#111827',
  },
  doneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6', // iOS Blue
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  editAvatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  editAvatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  editAvatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FAFAF8',
  },
  changePhotoText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 15,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  inputLabel: {
    width: 80,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  }
});

// Helper component for Cards inside ProfileLayout
export const ProfileCard = ({ title, children }) => (
  <View style={cardStyles.card}>
    {title && <Text style={cardStyles.title}>{title}</Text>}
    {children}
  </View>
);

export const ProfileRow = ({ label, value, isMulti, icon }) => (
  <View style={isMulti ? cardStyles.col : cardStyles.row}>
    <View style={cardStyles.labelContainer}>
      {icon && <Ionicons name={icon} size={18} color="#6B7280" style={{marginRight: 8}} />}
      <Text style={cardStyles.label}>{label}</Text>
    </View>
    <View style={cardStyles.valueContainer}>
      <Text style={[cardStyles.value, isMulti && cardStyles.valueMulti]}>{value || 'N/A'}</Text>
    </View>
  </View>
);

// New component for stats rendering horizontally
export const ProfileStatsRow = ({ stats }) => (
  <View style={cardStyles.statsContainer}>
    {stats.map((stat, idx) => (
      <View key={idx} style={cardStyles.statBox}>
        <View style={[cardStyles.statIconWrapper, { backgroundColor: stat.color + '15' }]}>
          <Ionicons name={stat.icon} size={22} color={stat.color} />
        </View>
        <Text style={cardStyles.statValue}>{stat.value}</Text>
        <Text style={cardStyles.statLabel}>{stat.label}</Text>
      </View>
    ))}
  </View>
);

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
  },
  col: {
    flexDirection: 'column',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 1, // Align with icon if icon is present
  },
  valueContainer: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    textAlign: 'right',
  },
  valueMulti: {
    textAlign: 'left',
    marginTop: 8,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    textAlign: 'center',
  }
});
