import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Image, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { DataContext } from '../context/DataContext';
import StudentProfile from './StudentProfile';
import FloatingNavBar from '../components/FloatingNavBar';
const CATEGORIES = [
  { id: 'Cleanliness', icon: 'trash-outline', iconFamily: 'Ionicons', color: '#1A8C4E' },
  { id: 'Electrical', icon: 'flash', iconFamily: 'Ionicons', color: '#611624' },
  { id: 'Internet', icon: 'wifi-outline', iconFamily: 'Ionicons', color: '#B07D10' },
  { id: 'Furniture', icon: 'chair-rolling', iconFamily: 'MaterialCommunityIcons', color: '#611624' },
  { id: 'Equipment', icon: 'monitor', iconFamily: 'MaterialCommunityIcons', color: '#4B5563' },
  { id: 'Water', icon: 'water', iconFamily: 'Ionicons', color: '#1E659A' },
  { id: 'Safety', icon: 'shield-checkmark-outline', iconFamily: 'Ionicons', color: '#8C1B2F' },
  { id: 'Other', icon: 'ellipsis-horizontal', iconFamily: 'Ionicons', color: '#7A4050' },
];

const ZONE_DATA = [
  {
    id: 1,
    name: "Zone 01 - Anviksha",
    subZones: [
      { id: "1-1", name: "Sub-Zone 1: Anviksha - Ground Floor: Main Entrance, Lobby, Reception, Admission" },
      { id: "1-2", name: "Sub-Zone 1: Anviksha - Ground Floor: Admin Office, Conference Room" },
      { id: "1-3", name: "Sub-Zone 1: Anviksha - Ground Floor: FEHS Lab, PTC Lab, ATC Lab" },
      { id: "1-4", name: "Sub-Zone 1: Anviksha - Ground Floor: Garden" },
      { id: "1-5", name: "Sub-Zone 2: Anviksha - First Floor: Molecular Biology Lab" },
      { id: "1-6", name: "Sub-Zone 2: Anviksha - First Floor: All Chemistry Labs" },
      { id: "1-7", name: "Sub-Zone 2: Anviksha - First Floor: CRL and Microbiology Labs" },
      { id: "1-8", name: "Sub-Zone 2: Anviksha - First Floor: Data Science Classes" },
      { id: "1-9", name: "Sub-Zone 2: Anviksha - First Floor: Chemistry Instrumentation Lab, NABL Lab" },
      { id: "1-10", name: "Sub-Zone 2: Anviksha - First Floor: Store Rooms" },
      { id: "1-11", name: "Sub-Zone 3: Anviksha - Second Floor: GUIITAR Incubation Centre" },
      { id: "1-12", name: "Sub-Zone 3: Anviksha - Second Floor: Mentoring Labs" },
      { id: "1-13", name: "Sub-Zone 3: Anviksha - Second Floor: Administration" },
      { id: "1-14", name: "Sub-Zone 3: Anviksha - Second Floor: Data Science Classes" },
      { id: "1-15", name: "Sub-Zone 3: Anviksha - Second Floor: IOT Lab" },
      { id: "1-16", name: "Sub-Zone 3: Anviksha - Second Floor: Drone Lab" },
      { id: "1-17", name: "Sub-Zone 4: Anviksha - Third Floor: Classrooms 301-304" },
      { id: "1-18", name: "Sub-Zone 4: Anviksha - Third Floor: Classrooms 306-310" },
      { id: "1-19", name: "Sub-Zone 4: Anviksha - Third Floor: Corridor and Faculty Room" },
    ]
  },
  {
    id: 2,
    name: "Zone 02 - School of Technology",
    subZones: [
      { id: "2-1", name: "Sub-Zone 1: SOT - Ground Floor: All Labs" },
      { id: "2-2", name: "Sub-Zone 2: SOT - First Floor: IT Room and SM-IT office" },
      { id: "2-3", name: "Sub-Zone 3: SOT - Second Floor: Reading Room, Dean-SoT Office" },
      { id: "2-4", name: "Sub-Zone 4: SOT - Third Floor: Exam Control Office & Store Room" },
      { id: "2-5", name: "Sub-Zone 5: SOT - Fourth Floor: All Labs and Auditorium" },
      { id: "2-6", name: "Sub-Zone 6: SOT - Fifth Floor: Faculty Room, Classroom, Drinking Water Area" },
      { id: "2-7", name: "Sub-Zone 7: SOT - Sixth Floor: Faculty Room" },
      { id: "2-8", name: "Sub-Zone 8: SOT - Seventh Floor: All Classrooms IT related Infrastructure" },
      { id: "2-9", name: "Sub-Zone 9: SOT - Eighth Floor: All Classroom General Infrastructure" },
    ]
  },
  {
    id: 3,
    name: "Zone 03 - Common Amenities",
    subZones: [
      { id: "3-1", name: "Sub-Zone 1: Common Amenities: SOS to Anviksha Common Road" },
      { id: "3-2", name: "Sub-Zone 2: Common Amenities: Hang Out Area" },
      { id: "3-3", name: "Sub-Zone 3: Common Amenities: Aanganva" },
      { id: "3-4", name: "Sub-Zone 4: Common Amenities: Sarjan" },
      { id: "3-5", name: "Sub-Zone 5: Common Amenities: Multi Purpose Court" },
    ]
  },
  {
    id: 4,
    name: "Zone 04 - Kasturba Bhavan",
    subZones: [
      { id: "4-1", name: "Sub-Zone 1: Kasturba Bhavan - Ground Floor and outside open area" },
      { id: "4-2", name: "Sub-Zone 2: Kasturba Bhavan - First Floor" },
      { id: "4-3", name: "Sub-Zone 3: Kasturba Bhavan - Second Floor" },
      { id: "4-4", name: "Sub-Zone 4: Kasturba Bhavan - Third Floor" },
      { id: "4-5", name: "Sub-Zone 5: Kasturba Bhavan - Food Plex" },
    ]
  },
  {
    id: 5,
    name: "Zone 05 - Vikram Sarabhai Bhavan",
    subZones: [
      { id: "5-1", name: "Sub-Zone 1: Vikram Sarabhai - Ground Floor including parking and garden" },
      { id: "5-2", name: "Sub-Zone 2: Vikram Sarabhai - First Floor" },
      { id: "5-3", name: "Sub-Zone 3: Vikram Sarabhai - Second Floor" },
    ]
  },
  {
    id: 6,
    name: "Zone 06 - Swami Vivekananda Bhavan",
    subZones: [
      { id: "6-1", name: "Sub-Zone 1: Swami Vivekananda - Ground Floor and outside open area" },
      { id: "6-2", name: "Sub-Zone 2: Swami Vivekananda - First Floor" },
      { id: "6-3", name: "Sub-Zone 3: Swami Vivekananda - Second Floor" },
      { id: "6-4", name: "Sub-Zone 4: Swami Vivekananda - Third Floor" },
    ]
  },
  {
    id: 7,
    name: "Zone 07 - FirePlex",
    subZones: [
      { id: "7-1", name: "Sub-Zone 1: FirePlex: FireDrill ground / Hydrant system / Drill Tower / 7 rooms" },
    ]
  },
  {
    id: 8,
    name: "Zone 08 - School of Science & Management",
    subZones: [
      { id: "8-1", name: "Sub-Zone 1: SOS & Management - Ground Floor" },
      { id: "8-2", name: "Sub-Zone 2: SOS & Management - First Floor" },
      { id: "8-3", name: "Sub-Zone 3: SOS & Management - Second Floor" },
      { id: "8-4", name: "Sub-Zone 4: SOS & Management - Outside Open Area including Parking and Garden" },
    ]
  }
];

const MOCK_REPORTS = [
  {
    id: 'GSFC-2026-00124',
    title: 'Electrical Concern',
    location: 'Robotic Lab , Anviksha',
    status: 'In Progress',
    date: '17 June 2026, 10:30 AM',
    categoryId: 'Electrical',
    reportedBy: 'Student',
    priority: 'Medium',
    description: 'Projector in Robotics Lab of Anviksha Building is not functioning properly.',
    image: 'https://images.unsplash.com/photo-1544413660-299165566b1d?q=80&w=600&auto=format&fit=crop', // Placeholder projector image
    timeline: [
      { title: 'Concern Submitted', time: '17 June 2026 , 10:30 AM', state: 'completed' },
      { title: 'Assigned to Maintenance', time: '17 June 2026 , 11:30 AM', state: 'completed' },
      { title: 'Work In Progress', time: '18 June 2026 , 9:30 AM', state: 'current' },
      { title: 'Resolved', time: 'Pending', state: 'pending' }
    ]
  },
  {
    id: 'GSFC-2026-00108',
    title: 'Water Leakage',
    location: '3rd Floor Washroom, SOT',
    status: 'Resolved',
    date: '15 June 2026, 09:30 AM',
    categoryId: 'Water',
    reportedBy: 'Faculty',
    priority: 'High',
    description: 'Continuous water leakage from the third sink tap. It has formed a puddle on the floor.',
    image: null,
    timeline: [
      { title: 'Concern Submitted', time: '15 June 2026 , 09:30 AM', state: 'completed' },
      { title: 'Assigned to Plumber', time: '15 June 2026 , 10:15 AM', state: 'completed' },
      { title: 'Work In Progress', time: '15 June 2026 , 01:00 PM', state: 'completed' },
      { title: 'Resolved', time: '15 June 2026 , 03:00 PM', state: 'completed' }
    ]
  },
  {
    id: 'GSFC-2026-00095',
    title: 'Broken Chair',
    location: 'Cr 201 , SOS',
    status: 'Closed',
    date: '10 June 2026, 02:45 PM',
    categoryId: 'Furniture',
    reportedBy: 'Admin',
    priority: 'Low',
    description: 'Two chairs in the back row are broken and need replacement.',
    image: null,
    timeline: [
      { title: 'Concern Submitted', time: '10 June 2026 , 02:45 PM', state: 'completed' },
      { title: 'Assigned to Maintenance', time: '11 June 2026 , 10:00 AM', state: 'completed' },
      { title: 'Resolved', time: '12 June 2026 , 04:00 PM', state: 'completed' }
    ]
  }
];

export default function StudentReport({ navigation }) {
  const { currentUser, submitComplaint, logout, db } = useContext(DataContext);

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'reports', 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [selectedZone, setSelectedZone] = useState(null);
  const [showZonePicker, setShowZonePicker] = useState(false);

  const [selectedSubZone, setSelectedSubZone] = useState(null);
  const [showSubZonePicker, setShowSubZonePicker] = useState(false);

  const [issueText, setIssueText] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const availableSubZones = selectedZone ? ZONE_DATA.find(z => z.id === selectedZone.id)?.subZones || [] : [];

  const pickImage = async () => {
    Alert.alert(
      "Upload Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.3,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              setImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
          }
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.3,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              setImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    if (!selectedZone) {
      Alert.alert('Error', 'Please select a Zone.');
      return;
    }
    if (!selectedSubZone) {
      Alert.alert('Error', 'Please select a Sub-Zone.');
      return;
    }
    if (!issueText.trim()) {
      Alert.alert('Error', 'Please describe the concern.');
      return;
    }

    submitComplaint(selectedZone.name, selectedCategory, `[${selectedSubZone.name}] ` + issueText, imageUri);
    Alert.alert('Concern Submitted', `Your concern has been submitted successfully.`);
    setIssueText('');
    setImageUri(null);
    setSelectedZone(null);
    setSelectedSubZone(null);
    setSelectedCategory(null);
  };

  const renderIcon = (item, color, size = 28) => {
    if (item.iconFamily === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={item.icon} size={size} color={color} />;
    }
    return <Ionicons name={item.icon} size={size} color={color} />;
  };

  const renderStatusBadge = (status) => {
    let bgColor = '#F3F4F6';
    let textColor = '#6B7280';
    if (status === 'In Progress') {
      bgColor = '#FFF7ED';
      textColor = '#D97706';
    } else if (status === 'Resolved') {
      bgColor = '#ECFDF5';
      textColor = '#059669';
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  const renderTimeline = (timeline) => {
    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.detailsSectionTitle}>Project Timeline</Text>
        <View style={styles.timelineList}>
          {timeline.map((step, index) => {
            const isLast = index === timeline.length - 1;
            let iconColor = '#D1D5DB';
            let iconInner = null;
            let titleColor = '#6B7280';

            if (step.state === 'completed') {
              iconColor = '#611624';
              iconInner = <Ionicons name="checkmark" size={14} color="#FFF" />;
              titleColor = '#111827';
            } else if (step.state === 'current') {
              iconColor = '#D97706';
              iconInner = <View style={styles.timelineIconInnerCurrent} />;
              titleColor = '#111827';
            }

            return (
              <View key={index} style={styles.timelineRow}>
                <View style={styles.timelineIconColumn}>
                  <View style={[
                    styles.timelineIcon,
                    { borderColor: iconColor, backgroundColor: step.state === 'completed' ? '#611624' : '#FFFFFF' }
                  ]}>
                    {iconInner}
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: step.state === 'completed' ? '#611624' : (step.state === 'current' ? '#FDE68A' : '#E5E7EB') }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: titleColor }]}>{step.title}</Text>
                  <Text style={styles.timelineTime}>{step.time}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderReportDetails = () => {
    const categoryObj = CATEGORIES.find(c => c.id === selectedReport.categoryId) || CATEGORIES[7];

    return (
      <View style={styles.reportsContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setSelectedReport(null)}>
            <Ionicons name="arrow-back" size={28} color="#8C1B2F" />
          </TouchableOpacity>
          <Text style={styles.reportsHeaderTitle}>My Concerns</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-horizontal" size={28} color="#8C1B2F" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          {/* Main Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailsCardHeader}>
              <View style={styles.reportIconTitle}>
                <View style={[styles.reportIconCircle, { backgroundColor: categoryObj.color }]}>
                  {renderIcon(categoryObj, '#FFFFFF', 20)}
                </View>
                <View style={styles.reportTitleWrapper}>
                  <Text style={styles.reportTitle}>{selectedReport.title}</Text>
                  <Text style={styles.reportLocation}>{selectedReport.location}</Text>
                </View>
              </View>
              {renderStatusBadge(selectedReport.status)}
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailsGridItem}>
                <Text style={styles.detailsGridLabel}>Reported By</Text>
                <Text style={styles.detailsGridValue}>{selectedReport.reportedBy}</Text>
              </View>
              <View style={styles.detailsGridItem}>
                <Text style={styles.detailsGridLabel}>Submitted On</Text>
                <Text style={styles.detailsGridValue}>{selectedReport.date}</Text>
              </View>
              <View style={styles.detailsGridItem}>
                <Text style={styles.detailsGridLabel}>Concern ID</Text>
                <Text style={styles.detailsGridValueId}>{selectedReport.id}</Text>
              </View>
              <View style={styles.detailsGridItem}>
                <Text style={styles.detailsGridLabel}>Priority</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.priorityDot, { backgroundColor: selectedReport.priority === 'High' ? '#EF4444' : selectedReport.priority === 'Medium' ? '#D97706' : '#10B981' }]} />
                  <Text style={styles.detailsGridValue}>{selectedReport.priority}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Issue Description */}
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionTextWrapper}>
              <Text style={styles.detailsSectionTitle}>Concern Description</Text>
              <Text style={styles.descriptionText}>{selectedReport.description}</Text>
            </View>
            {selectedReport.image && (
              <Image source={{ uri: selectedReport.image }} style={styles.descriptionImage} />
            )}
          </View>

          {/* Divider */}
          <View style={styles.detailsDivider} />

          {/* Timeline */}
          {selectedReport.timeline && renderTimeline(selectedReport.timeline)}

          {/* Add Follow-Up Button */}
          <TouchableOpacity style={styles.followUpButton}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            <Text style={styles.followUpButtonText}>Add Follow-Up</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    );
  };

  const renderReportsList = () => (
    <View style={styles.reportsContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu" size={28} color="#8C1B2F" />
        </TouchableOpacity>
        <Text style={styles.reportsHeaderTitle}>My Concerns</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={logout}>
          <Ionicons name="log-out-outline" size={26} color="#8C1B2F" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search concerns..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#8C1B2F" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {db.complaints.filter(c => c.studentId === currentUser?.id).map(c => ({
          id: c.id || c._id,
          title: c.subZone || 'Campus Concern',
          location: c.zone,
          status: c.status,
          date: c.date,
          categoryId: c.subZone || 'Other',
          reportedBy: 'Student',
          priority: 'Medium',
          description: c.desc,
          image: c.imageUri || null,
          timeline: [
            { title: 'Concern Submitted', time: c.date, state: 'completed' },
            ...(c.status === 'Resolved' ? [{ title: 'Resolved', time: (c.remarks && c.remarks.length > 0) ? c.remarks[c.remarks.length - 1].date : c.date, state: 'completed' }] : [{ title: 'Under Review', time: 'Pending', state: 'current' }])
          ]
        })).filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((report) => {
          const categoryObj = CATEGORIES.find(c => c.id === report.categoryId) || CATEGORIES[7];
          return (
            <TouchableOpacity key={report.id} style={styles.reportCard} onPress={() => setSelectedReport(report)}>
              <View style={styles.reportCardHeader}>
                <View style={styles.reportIconTitle}>
                  <View style={[styles.reportIconCircle, { backgroundColor: categoryObj.color }]}>
                    {renderIcon(categoryObj, '#FFFFFF', 20)}
                  </View>
                  <View style={styles.reportTitleWrapper}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportLocation}>{report.location}</Text>
                  </View>
                </View>
                {renderStatusBadge(report.status)}
              </View>

              <View style={styles.reportCardFooter}>
                <View style={styles.reportMeta}>
                  <Text style={styles.reportMetaLabel}>Submitted On</Text>
                  <Text style={styles.reportMetaValue}>{report.date}</Text>
                </View>
                <View style={styles.reportMetaRight}>
                  <View>
                    <Text style={styles.reportMetaLabel}>Concern ID</Text>
                    <Text style={styles.reportMetaValueId}>{report.id}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#000" style={{ marginLeft: 16 }} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderProfile = () => {
    return (
      <ScrollView style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={40} color="#8C1B2F" />
          </View>
          <Text style={styles.profileName}>{currentUser?.name || 'Student'}</Text>
          <Text style={styles.profileRole}>Student</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Contact Info</Text>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Email:</Text>
            <Text style={styles.profileValue}>{currentUser?.email || 'student@gsfc.edu'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderHomeForm = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#8C1B2F" />
        </TouchableOpacity>
        <Image source={require('../assets/gsfc_logo_new.jpg')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={26} color="#8C1B2F" />
        </TouchableOpacity>
      </View>

      {/* Title and Illustration */}
      <View style={styles.titleSection}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.mainTitle}>Campus Concerns</Text>
          <Text style={styles.subTitle}>Report and track campus concerns</Text>
        </View>
        <View style={styles.illustrationContainer}>
          <Image source={require('../assets/student_reporting_issue.png')} style={styles.illustration} resizeMode="contain" />
        </View>
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Select Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              {renderIcon(cat, isSelected ? '#8C1B2F' : '#7A4050')}
              <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                {cat.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Compound Location Selector */}
      <View style={styles.locationCard}>
        {/* Zone Input */}
        <View style={styles.locationInputWrapper}>
          <Text style={styles.locationLabel}>
            <Ionicons name="location-outline" size={14} color="#7A4050" /> ZONE
          </Text>
          <TouchableOpacity style={styles.locationInputBox} onPress={() => setShowZonePicker(true)}>
            <Text style={[styles.locationInputText, !selectedZone && styles.locationPlaceholder]}>
              {selectedZone ? selectedZone.name : 'Select Zone'}
            </Text>
            <View style={styles.locationInputIcons}>
              {selectedZone && (
                <TouchableOpacity onPress={() => { setSelectedZone(null); setSelectedSubZone(null); }} style={{ paddingHorizontal: 4 }}>
                  <Ionicons name="close" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              <Ionicons name="chevron-down" size={18} color="#9CA3AF" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>THEN</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sub-Zone Input */}
        <View style={styles.locationInputWrapper}>
          <Text style={styles.locationLabel}>
            <MaterialCommunityIcons name="layers-outline" size={14} color="#7A4050" /> SUB-ZONE AREA
          </Text>
          <TouchableOpacity
            style={[styles.locationInputBox, !selectedZone && styles.locationInputDisabled]}
            onPress={() => selectedZone ? setShowSubZonePicker(true) : null}
          >
            <Text style={[styles.locationInputText, !selectedSubZone && styles.locationPlaceholder]}>
              {selectedSubZone ? selectedSubZone.name : 'Type to search...'}
            </Text>
            <Ionicons name="chevron-up" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone Modal */}
      <Modal visible={showZonePicker} transparent={true} animationType="fade" onRequestClose={() => setShowZonePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowZonePicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Zone</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              {ZONE_DATA.map(z => (
                <TouchableOpacity key={z.id} style={styles.modalItem} onPress={() => {
                  setSelectedZone(z);
                  setSelectedSubZone(null); // Reset sub-zone
                  setShowZonePicker(false);
                }}>
                  <Text style={[styles.modalItemText, selectedZone?.id === z.id && styles.modalItemTextSelected]}>{z.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sub-Zone Modal */}
      <Modal visible={showSubZonePicker} transparent={true} animationType="fade" onRequestClose={() => setShowSubZonePicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSubZonePicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Sub-Zone Area</Text>
            <ScrollView style={{ maxHeight: 200, minHeight: 150 }} showsVerticalScrollIndicator={true}>
              {availableSubZones.map(sz => (
                <TouchableOpacity key={sz.id} style={styles.modalItem} onPress={() => {
                  setSelectedSubZone(sz);
                  setShowSubZonePicker(false);
                }}>
                  <Text style={[styles.modalItemText, selectedSubZone?.id === sz.id && styles.modalItemTextSelected]}>{sz.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Issue Description */}
      <Text style={styles.sectionTitle}>Concern Description</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the concern detail"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          value={issueText}
          onChangeText={(text) => {
            if (text.length <= 500) setIssueText(text);
          }}
        />
        <Text style={styles.charCount}>{issueText.length}/500</Text>
      </View>

      {/* Upload Photo */}
      <Text style={styles.sectionTitle}>Upload Photo(Optional)</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Ionicons name="camera" size={24} color="#8C1B2F" />
        <Text style={styles.uploadButtonText}>
          {imageUri ? 'Photo Added' : 'Add Photo Text'}
        </Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Request</Text>
        <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>

    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>

      {activeTab === 'home' && renderHomeForm()}
      {activeTab === 'reports' && (selectedReport ? renderReportDetails() : renderReportsList())}
      {activeTab === 'profile' && <StudentProfile />}

      <FloatingNavBar
        tabs={[
          { key: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
          { key: 'reports', icon: 'document-text-outline', activeIcon: 'document-text', label: 'Concerns' },
          { key: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' }
        ]}
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          setSelectedReport(null);
        }}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F2',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    padding: 8,
  },
  logo: {
    height: 50,
    width: 160,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleTextContainer: {
    flex: 1,
    paddingRight: 10,
    zIndex: 2,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#611624',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  illustrationContainer: {
    width: 140,
    height: 140,
    backgroundColor: '#F3E9DD',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  illustration: {
    width: 120,
    height: 120,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardSelected: {
    borderColor: '#8C1B2F',
    backgroundColor: '#FFF0F2',
  },
  categoryText: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#8C1B2F',
    fontWeight: '700',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    marginTop: 8,
  },
  locationInputWrapper: {
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A4050',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  locationInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  locationInputDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  locationInputText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  locationPlaceholder: {
    color: '#9CA3AF',
  },
  locationInputIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    height: 120,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#8C1B2F',
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: '#8C1B2F',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#8C1B2F',
  },
  radioText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#611624',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  modalItemTextSelected: {
    color: '#8C1B2F',
    fontWeight: 'bold',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#611624',
    borderRadius: 35,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    elevation: 10,
    paddingHorizontal: 10,
  },
  bottomBarBackground: {
    display: 'none',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    zIndex: 10,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28, // Pops out of the top of the floating bar
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
  },
  fabButtonActive: {
    backgroundColor: '#F3E9DD',
  },
  reportsContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  reportsHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#611624',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportTitleWrapper: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  reportMeta: {
    flex: 1,
  },
  reportMetaLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  reportMetaValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  reportMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportMetaValueId: {
    fontSize: 12,
    color: '#8C1B2F',
    fontWeight: '600',
  },

  /* Details Screen Styles */
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  detailsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  detailsGridItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailsGridLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailsGridValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  detailsGridValueId: {
    fontSize: 13,
    color: '#8C1B2F',
    fontWeight: '600',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  descriptionTextWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  descriptionImage: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  timelineContainer: {
    marginBottom: 30,
  },
  timelineList: {
    paddingLeft: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineIconColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  timelineIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineIconInnerCurrent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
  },
  timelineLine: {
    width: 2,
    height: 40,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  followUpButton: {
    backgroundColor: '#611624',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  followUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  profileContainer: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  profileHeader: { alignItems: 'center', marginBottom: 30, paddingTop: 40 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3E8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  profileRole: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  profileCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  profileSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#8C1B2F', marginBottom: 16 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  profileLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  profileValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#8C1B2F', padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 100 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
