import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      await signOut(auth);
    } catch (error) {
      console.log('Error during logout:', error);
    }
    setCurrentUser(null);
  };

  const [zones, setZones] = useState([
    { id: '1', name: 'Zone 1 – Anviksha', color: '#1A8C4E', top: '15%', left: '15%', width: 90, height: 80, status: 'Green', score: 92 },
    { id: '2', name: 'Zone 2 – School of Technology', color: '#B07D10', top: '10%', left: '45%', width: 120, height: 100, status: 'Yellow', score: 76 },
    { id: '3', name: 'Zone 3 – Common Amenities', color: '#1A8C4E', top: '45%', left: '30%', width: 90, height: 90, status: 'Green', score: 88 },
    { id: '4', name: 'Zone 4 – Kasturba Bhavan', color: '#1A8C4E', top: '30%', left: '65%', width: 100, height: 70, status: 'Green', score: 94 },
    { id: '5', name: 'Zone 5 – Vikram Sarabhai Bhavan', color: '#1A8C4E', top: '65%', left: '20%', width: 110, height: 80, status: 'Green', score: 95 },
    { id: '6', name: 'Zone 6 – Swami Vivekananda Bhavan', color: '#C0182A', top: '70%', left: '55%', width: 100, height: 90, status: 'Red', score: 54 },
    { id: '7', name: 'Zone 7 – FirePlex', color: '#B07D10', top: '85%', left: '35%', width: 80, height: 60, status: 'Yellow', score: 72 },
    { id: '8', name: 'Zone 8 – School of Science / Management', color: '#1A8C4E', top: '50%', left: '10%', width: 100, height: 80, status: 'Green', score: 91 },
  ]);

  const [subZones, setSubZones] = useState([
    { id: '101', zoneId: '1', subzone: 'Ground Floor', incharge: 'Dr. Sharma', status: 'Green' },
    { id: '102', zoneId: '1', subzone: 'First Floor', incharge: 'Prof. Mehta', status: 'Green' },
    { id: '201', zoneId: '2', subzone: 'Wing A', incharge: 'Warden Patel', status: 'Yellow' },
    { id: '202', zoneId: '2', subzone: 'Wing B', incharge: 'Warden Singh', status: 'Red' },
    { id: '301', zoneId: '3', subzone: 'Main Office', incharge: 'Mr. Gupta', status: 'Green' },
  ]);

  const [methodology, setMethodology] = useState([
    { id: '1', title: '1S - Sort (Seiri)', score: 88, color: '#1A8C4E', bg: '#F9F9F9' },
    { id: '2', title: '2S - Set in order', score: 76, color: '#B07D10', bg: '#F9F9F9' },
    { id: '3', title: '3S - Shine (Seiso)', score: 92, color: '#1A8C4E', bg: '#F9F9F9' },
    { id: '4', title: '4S - Standardize', score: 71, color: '#B07D10', bg: '#F9F9F9' },
    { id: '5', title: '5S - Sustain', score: 85, color: '#1A8C4E', bg: '#F9F9F9' },
    { id: '6', title: '6S - Safety', score: 95, color: '#1A8C4E', bg: '#F9F9F9' },
  ]);

  const SZH = [
    { id: "SZH_F1", name: "Mr. Rajesh Patel", floor: "Ground Floor / Block A", zone: 1 },
    { id: "SZH_F2", name: "Ms. Priya Sharma", floor: "First Floor / Block B", zone: 2 },
    { id: "SZH_F3", name: "Mr. Anil Verma", floor: "Second Floor / Block C", zone: 3 },
    { id: "SZH_F4", name: "Ms. Kavita Joshi", floor: "Ground Floor / Block D", zone: 4 },
    { id: "SZH_F5", name: "Mr. Suresh Mehta", floor: "First Floor / Block E", zone: 5 },
    { id: "SZH_F6", name: "Ms. Anita Singh", floor: "Second Floor / Block F", zone: 6 },
    { id: "SZH_F7", name: "Mr. Deepak Kumar", floor: "Ground Floor / FirePlex", zone: 7 },
    { id: "SZH_F8", name: "Ms. Ritu Gupta", floor: "First Floor / SoS", zone: 8 }
  ];

  const CL_TASKS = [
    "1S - Sort: Are unneeded items removed from the area?",
    "2S - Set in Order: Is everything in its designated place?",
    "3S - Shine: Is the area clean and free of debris?",
    "4S - Standardize: Are standard procedures visible and followed?",
    "5S - Sustain: Are audits being conducted regularly?",
    "6S - Safety: Are all safety hazards mitigated?",
    "Signage: Are 6S promotional posters visible?",
    "Waste Management: Are dustbins cleared and segregated?"
  ];

  const initialDbState = {
    complaints: [
      { id: '1', studentId: 'stu1', zone: 'Zone 1 – Anviksha', subZone: 'Ground Floor', desc: 'Broken dustbin on 2nd floor.', status: 'Pending', date: 'Today', remarks: [], imageUri: null }
    ],
    checklistSubmissions: [],
    remarks: [],
    advisories: [
      { id: '1', targetZone: 'All Zones', targetSubZone: 'All Sub-Zones', text: 'Ensure all fire extinguishers are inspected by Friday.', date: 'Today, 10:00 AM', author: 'Core Admin', replies: [] },
      { id: '2', targetZone: 'Zone 1 – Anviksha', targetSubZone: 'Ground Floor / Block A', text: 'Corridor lights need immediate replacement.', date: 'Yesterday, 2:30 PM', author: 'Zone Supervisor', replies: [{ author: 'Mr. Rajesh Patel', text: 'Lights replaced today morning.', date: 'Today, 9:00 AM' }] },
    ]
  };

  const [db, setDb] = useState(initialDbState);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  useEffect(() => {
    const loadDb = async () => {
      try {
        const savedDb = await AsyncStorage.getItem('@db_state');
        if (savedDb) {
          setDb(JSON.parse(savedDb));
        }
      } catch (error) {
        console.error('Failed to load db from storage', error);
      } finally {
        setIsDbLoaded(true);
      }
    };
    loadDb();
  }, []);

  useEffect(() => {
    if (isDbLoaded) {
      AsyncStorage.setItem('@db_state', JSON.stringify(db)).catch(err => console.error('Failed to save db to storage', err));
    }
  }, [db, isDbLoaded]);

  const publishAdvisory = (targetZone, targetSubZone, text) => {
    const newAdvisory = {
      id: Date.now().toString(),
      targetZone,
      targetSubZone,
      text,
      date: new Date().toLocaleString(),
      author: currentUser?.name || 'Core Admin',
      replies: []
    };
    setDb(prev => ({
      ...prev,
      advisories: [newAdvisory, ...prev.advisories]
    }));
  };

  const addAdvisoryReply = (advisoryId, replyText) => {
    setDb(prev => ({
      ...prev,
      advisories: prev.advisories.map(adv => 
        adv.id === advisoryId 
          ? { 
              ...adv, 
              replies: [...adv.replies, { author: currentUser?.name || 'User', text: replyText, date: new Date().toLocaleString() }]
            } 
          : adv
      )
    }));
  };

  const submitComplaint = (zone, subZone, desc, imageUri) => {
    const newComplaint = {
      id: Date.now().toString(),
      studentId: 'currentStudent',
      zone,
      subZone,
      desc,
      imageUri,
      status: 'Pending',
      date: new Date().toLocaleString(),
      remarks: []
    };
    setDb(prev => ({
      ...prev,
      complaints: [newComplaint, ...prev.complaints]
    }));
  };

  const resolveComplaint = (complaintId, resolutionText, photoProof) => {
    setDb(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => 
        c.id === complaintId 
          ? { 
              ...c, 
              status: 'Resolved',
              remarks: [...(c.remarks || []), { author: currentUser?.name || 'Admin', text: resolutionText, photoProof, date: new Date().toLocaleString() }]
            }
          : c
      )
    }));
  };

  const updateZoneScore = (zoneId, newScore) => {
    setZones(prevZones => prevZones.map(z => {
      if (z.id === zoneId) {
        let status = 'Green';
        let color = '#1A8C4E';
        if (newScore < 60) { status = 'Red'; color = '#C0182A'; }
        else if (newScore < 85) { status = 'Yellow'; color = '#B07D10'; }
        return { ...z, score: newScore, status, color };
      }
      return z;
    }));
  };

  return (
    <DataContext.Provider value={{
      currentUser,
      login,
      logout,
      zones,
      subZones,
      methodology,
      db,
      setDb,
      SZH,
      CL_TASKS,
      publishAdvisory,
      submitComplaint,
      resolveComplaint,
      updateZoneScore,
      addAdvisoryReply
    }}>
      {children}
    </DataContext.Provider>
  );
};
