import React, { useContext, useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Dimensions, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { ZONAL_HEAD_EMAILS, SUB_ZONAL_HEAD_EMAILS } from '../config/roles';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, staticData } = useContext(DataContext);
  const SUB_ZONAL_HEADS = staticData?.subZonalHeads || [];
  const ZONAL_HEADS = staticData?.zonalHeads || [];
  const ADMINS = staticData?.admins || [];
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [pendingUser, setPendingUser] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);

  // Removed animation to preserve exact DOM structure for web selectors

  // Micro-interaction animation for the login button
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize Google Sign-In
    GoogleSignin.configure({
      webClientId: '659444199187-m32f5r56tsna27ch4dep1jg5sa7nuo2t.apps.googleusercontent.com', // Replace with your actual Web Client ID from Firebase Console
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setErrorText('');
      // Check if your device supports Google Play Services
      await GoogleSignin.hasPlayServices();

      // Force account selection by signing out any previously cached account
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore error if already signed out
      }

      // Sign in with Google
      const response = await GoogleSignin.signIn();
      const { idToken } = response.data;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
      const email = user.email ? user.email.toLowerCase() : '';
      const name = user.displayName || email;

      const HARDCODED_ADMINS = [
        '24bt04d224@gsfcuniversity.ac.in',
        '6s@gsfcuniversity.ac.in',
        'hod.chemicalscience@gsfcuniversity.ac.in',
        'dean.dost-ai@gsfcuniversity.ac.in',
        'associatedean.dost-ai@gsfcuniversity.ac.in',
        'gsfcuone@gsfcuniversity.ac.in',
        'deputy.director@gsfcuniversity.ac.in',
        'provost@gsfcuniversity.ac.in'
      ];

      // Role Routing Logic based on Email
      if (ADMINS.some(admin => admin.email.toLowerCase() === email) || HARDCODED_ADMINS.includes(email)) {
        const adminInfo = ADMINS.find(admin => admin.email.toLowerCase() === email) || { name: name, email: email, _id: email, id: email };
        if (email.endsWith('@gsfcuniversity.ac.in')) {
          const username = email.split('@')[0];
          setPendingUser({ uid: username, name: adminInfo.name, email: email });
          setPendingRole({ type: 'Admin', data: adminInfo });
          setActiveTab('roleSelection');
        } else {
          login({ role: 'Admin', id: adminInfo._id || adminInfo.id, name: adminInfo.name });
        }
      } else if (ZONAL_HEAD_EMAILS.map(e => e.toLowerCase()).includes(email)) {
        login({ role: 'ZonalHead', id: email, name });
      } else if (SUB_ZONAL_HEAD_EMAILS.map(e => e.toLowerCase()).includes(email)) {
        login({ role: 'SubZonalHead', id: email, name });
      } else if (email.endsWith('@gsfcuniversity.ac.in')) {
        login({ role: 'Student', id: email, name });
      } else {
        // Unauthorized Domain/Email
        await GoogleSignin.signOut();
        await auth.signOut();
        setErrorText('Unauthorized Email. Please use your @gsfcuniversity.ac.in account.');
      }

    } catch (error) {
      console.error(error);
      setErrorText('Google Sign-In failed. ' + error.message);
    }
  };

  const handleRoleSelection = (roleType) => {
    if (roleType === 'Student') {
      login({
        role: 'Student',
        id: pendingUser.uid,
        name: pendingUser.name || pendingUser.uid,
        email: pendingUser.email
      });
    } else {
      login({
        role: pendingRole.type,
        id: pendingRole.data.id,
        name: pendingRole.data.name,
        data: pendingRole.data,
        email: pendingUser.email
      });
    }
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = (forcedEmail, forcedPassword) => {
    setErrorText('');
    const id = (forcedEmail || email).toLowerCase().trim();
    const pass = (forcedPassword || password).trim();

    if (!id || !pass) {
      setErrorText('Please enter both Email and Password.');
      return;
    }

    // Fetch static zone array for matching Zonal Head info
    const ZONES_DATA = [
      { id: 1, area: "Anviksha", head: "Dr. Devjani Banerjee" },
      { id: 2, area: "School of Technology", head: "Dr. Sanjukta B. Goswami" },
      { id: 3, area: "Common Amenities", head: "Mr. Naren Acharya" },
      { id: 4, area: "Kasturba Bhavan", head: "Dr. Abha Kalaiya" },
      { id: 5, area: "Vikram Sarabhai Bhavan", head: "Dr. Mayank Sharma" },
      { id: 6, area: "Swami Vivekananda Bhavan", head: "Dr. Akhilesh Prajapati" },
      { id: 7, area: "FirePlex", head: "Mr. A. Srikrishnan" },
      { id: 8, area: "School of Science", head: "Prof. Ranjitha Banerjee" }
    ];

    const HARDCODED_ADMINS = [
      '24bt04d224@gsfcuniversity.ac.in',
      '6s@gsfcuniversity.ac.in',
      'hod.chemicalscience@gsfcuniversity.ac.in',
      'dean.dost-ai@gsfcuniversity.ac.in',
      'associatedean.dost-ai@gsfcuniversity.ac.in',
      'gsfcuone@gsfcuniversity.ac.in',
      'deputy.director@gsfcuniversity.ac.in',
      'provost@gsfcuniversity.ac.in'
    ];

    if ((id === 'admin' || id === 'admin@gsfc.edu') && pass === 'admin') {
      login({ role: 'Admin', id: 'ADMIN_1', name: 'Core Committee' });
    } else if (ADMINS.some(admin => admin.email.toLowerCase() === id) || HARDCODED_ADMINS.includes(id)) {
      if (pass === '1234' || pass === 'pwd123' || pass === 'admin') {
        const adminInfo = ADMINS.find(admin => admin.email.toLowerCase() === id) || { name: id.split('@')[0], email: id, _id: id, id: id };
        if (id.endsWith('@gsfcuniversity.ac.in')) {
          const username = id.split('@')[0];
          setPendingUser({ uid: username, name: adminInfo.name, email: id });
          setPendingRole({ type: 'Admin', data: adminInfo });
          setActiveTab('roleSelection');
        } else {
          login({ role: 'Admin', id: adminInfo._id || adminInfo.id, name: adminInfo.name });
        }
      } else {
        setErrorText('Invalid password.');
      }
    } else if ((id === 'student' || id === 'student@gsfc.edu') && pass === 'student') {
      login({ role: 'Student', id: 'STU_1', name: 'Test Student' });
    } else if (id === 'dulari.raj@gsfcuniversity.ac.in' && (pass === '1234' || pass === '12334' || pass === '12345' || pass === 'pwd123')) {
      login({
        role: 'SubZonalHead',
        id,
        name: 'Ms. Dulari Raj',
        data: { id, email: id, name: 'Ms. Dulari Raj', zone: 'Zone 1', subZone: '1', areasCovered: 'Main Entrance, Lobby, Reception, Admission' }
      });
    } else if (id === 'devjani.banerjee@gsfcuniversity.ac.in' && (pass === '1234' || pass === '12334' || pass === '12345' || pass === 'pwd123')) {
      login({
        role: 'ZonalHead',
        id,
        name: 'Dr. Devjani Banerjee',
        data: { id, email: id, name: 'Dr. Devjani Banerjee', zoneNumber: '1', zone: 'Zone 1' }
      });
    } else if (SUB_ZONAL_HEADS.some(head => head.email === id)) {
      if (pass === '1234' || pass === '12334' || pass === 'pwd123') {
        const subZonalHeadInfo = SUB_ZONAL_HEADS.find(head => head.email === id);

        if (id.endsWith('@gsfcuniversity.ac.in')) {
          const username = id.split('@')[0];
          setPendingUser({ uid: username, name: subZonalHeadInfo.name, email: id });
          setPendingRole({ type: 'SubZonalHead', data: subZonalHeadInfo });
          setActiveTab('roleSelection');
        } else {
          login({
            role: 'SubZonalHead',
            id: subZonalHeadInfo.id,
            name: subZonalHeadInfo.name,
            data: subZonalHeadInfo
          });
        }
      } else {
        setErrorText('Invalid password.');
      }
    } else if ((id === 'subzone' || id === 'subzone@gsfc.edu') && pass === 'subzone') {
      // Fallback for the test subzonal head mapped to Dulari Raj for demo purposes
      login({
        role: 'SubZonalHead',
        id: 'dulari.raj@gsfcuniversity.ac.in',
        name: 'Ms. Dulari Raj',
        data: { id: 'dulari.raj@gsfcuniversity.ac.in', name: 'Ms. Dulari Raj', zone: 'Zone 1', subZone: '1', areasCovered: 'Main Entrance, Lobby, Reception, Admission' }
      });
    } else if (id === '24bt04d224@gsfcuniversity.ac.in' || id === '24bto4d224@gsfcuniversity.ac.in') {
      login({ role: 'Student', id: id, name: 'D224_deep', email: id });
    } else if (ZONAL_HEADS.some(head => head.email === id)) {
      if (pass === '1234' || pass === '12334' || pass === 'pwd123') {
        const zonalHeadInfo = ZONAL_HEADS.find(head => head.email === id);
        if (id.endsWith('@gsfcuniversity.ac.in')) {
          const username = id.split('@')[0];
          setPendingUser({ uid: username, name: zonalHeadInfo.name, email: id });
          setPendingRole({ type: 'ZonalHead', data: zonalHeadInfo });
          setActiveTab('roleSelection');
        } else {
          login({
            role: 'ZonalHead',
            id: zonalHeadInfo.id,
            name: zonalHeadInfo.name,
            data: zonalHeadInfo
          });
        }
      } else {
        setErrorText('Invalid password.');
      }
    } else if (id.startsWith('zone') && pass.startsWith('zone')) {
      const zoneNumber = parseInt(id.replace('zone', ''), 10);
      if (zoneNumber >= 1 && zoneNumber <= 8) {
        const zoneInfo = ZONES_DATA.find(z => z.id === zoneNumber);
        login({
          role: 'ZonalHead',
          id: `ZH_Z${zoneNumber}`,
          name: zoneInfo.head,
          data: zoneInfo
        });
      } else {
        setErrorText('Invalid zone. Try zone1 through zone8.');
      }
    } else if (id.endsWith('@gsfcuniversity.ac.in') && (pass === 'pwd123' || pass === '1234')) {
      login({ role: 'Student', id: id, name: id.split('@')[0], email: id });
    } else {
      setErrorText('Invalid credentials. Try admin/admin, student/student, or use 1234 for gsfcuniversity emails.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Bottom Images Row - Placed behind everything and doesn't move with keyboard */}
      <View style={styles.bottomImagesContainer}>
        <Image
          source={require('../rb.jpeg')}
          style={styles.bottomLeftImage}
          resizeMode="cover"
        />
        <Image
          source={require('../lb.jpeg')}
          style={styles.bottomRightImage}
          resizeMode="cover"
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.innerContainer}>

        {/* Top Right Decorative Circle */}
        <View style={styles.topRightCircle} />

        {/* Middle Left Decorative Circle */}
        <View style={styles.middleLeftCircle} />

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* GSFCU Logo Area */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../logo.jpg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.titleText}>6S Campus Monitor</Text>
            <Text style={styles.welcomeText}>Welcome 👋</Text>
          </View>

          {/* Main Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                <View style={styles.tab}>
                  <Text style={[styles.tabText, styles.activeTabText]}>Login</Text>
                  <View style={styles.activeTabIndicator} />
                </View>
              </View>

              {/* Form */}
              {activeTab === 'login' && (
                <View style={styles.form}>
                  {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.googleSignInButton, { backgroundColor: '#6E2A36', borderColor: '#6E2A36', marginTop: 5, marginBottom: 15 }]}
                    activeOpacity={0.8}
                    onPress={() => handleLogin()}
                  >
                    <Text style={[styles.googleButtonText, { color: '#FFFFFF' }]}>Login</Text>
                  </TouchableOpacity>

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.googleSignInButton}
                    activeOpacity={0.8}
                    onPress={handleGoogleLogin}
                  >
                    <Image
                      source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
                      style={styles.googleIconImage}
                    />
                    <Text style={styles.googleButtonText}>Google Sign-In</Text>
                  </TouchableOpacity>

                  <View style={{ height: 10 }} />

                </View>
              )}

              {activeTab === 'roleSelection' && (
                <View style={styles.form}>
                  <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666', fontSize: 16 }}>
                    You have multiple roles associated with this email. Please select how you want to log in:
                  </Text>

                  <TouchableOpacity
                    style={[styles.input, { backgroundColor: '#F3E9DD', borderColor: '#6E2A36', alignItems: 'center' }]}
                    onPress={() => handleRoleSelection(pendingRole.type)}
                  >
                    <Text style={{ color: '#6E2A36', fontWeight: 'bold', fontSize: 16 }}>
                      Continue as {pendingRole.type === 'ZonalHead' ? 'Zonal Head' : pendingRole.type === 'SubZonalHead' ? 'Sub-Zonal Head' : 'Admin'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.input, { backgroundColor: '#F5F5F5', alignItems: 'center', marginTop: 10 }]}
                    onPress={() => handleRoleSelection('Student')}
                  >
                    <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}>
                      Continue as Student
                    </Text>
                  </TouchableOpacity>

                  <View style={{ height: 20 }} />
                </View>
              )}

            </View>

            {/* Notch removed since floating button is no longer used */}
          </View>



        </ScrollView>

      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  innerContainer: {
    flex: 1,
    paddingTop: 30, // Top breathing room
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center', // Centers form vertically
    zIndex: 10,
    paddingBottom: 120,
  },
  topRightCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 15,
    borderColor: '#E8D5D8',
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  middleLeftCircle: {
    position: 'absolute',
    top: '40%',
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8D5D8',
    opacity: 0.6,
    zIndex: -1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  welcomeContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    position: 'relative',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Smaller corners
    padding: 20,      // Reduced padding
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08, // Soft shadow for depth
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 30,
    elevation: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#C0C0C0',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#6E2A36',
  },
  activeTabIndicator: {
    marginTop: 6,
    width: 30,
    height: 3,
    backgroundColor: '#6E2A36',
    borderRadius: 2,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12, // Reduced
    fontSize: 14,
    color: '#333333',
    marginBottom: 10, // Reduced
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 10, // Reduced
  },
  passwordInput: {
    flex: 1,
    padding: 12, // Reduced
    fontSize: 14,
    color: '#333333',
  },
  eyeIcon: {
    padding: 12, // Reduced
  },
  errorText: {
    color: '#D9534F',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  forgotPassword: {
    color: '#6E2A36',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  notchContainer: {
    position: 'absolute',
    bottom: -44, // Centered on the bottom edge
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FAFAF8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },

  floatingButton: {
    backgroundColor: '#6E2A36',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    // Soft ambient glow
    shadowColor: '#6E2A36',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#888888',
    fontSize: 14,
  },

  googleSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingVertical: 12, // Reduced
    paddingHorizontal: 16,
    marginTop: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconImage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#3C4043',
    fontWeight: '600',
  },
  bottomImagesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 180, // Made taller to match original proportions
    zIndex: 1, // Let form and buttons sit above it using their zIndex
    pointerEvents: 'none', // Prevents images from blocking clicks
  },
  bottomLeftImage: {
    flex: 1,
    height: '100%',
    opacity: 0.6, // Slight opacity for background feel
  },
  bottomRightImage: {
    flex: 1,
    height: '100%',
    opacity: 0.6, // Slight opacity for background feel
  }
});
