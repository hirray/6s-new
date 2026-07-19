import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import axios from 'axios';

export const DataContext = createContext();

// Use https://six-7uud.onrender.com for production, or 10.0.2.2 for local emulator
const API_URL = 'https://six-7uud.onrender.com/api';

export const DataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (userData) => {
    try {
      let finalUserData = { ...userData };
      
      // If student, register/login them to backend
      if (userData.role === 'Student' && userData.email) {
        try {
          const res = await axios.post(`${API_URL}/students/login`, {
            email: userData.email,
            name: userData.name || userData.id
          });
          // Update id to match the MongoDB generated userId
          finalUserData.id = res.data.userId;
        } catch (err) {
          console.error("Failed to register student on backend", err);
        }
      }

      setCurrentUser(finalUserData);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Error during logout:', error);
    }
    setCurrentUser(null);
  };

  const [zones, setZones] = useState([
    { id: '1', name: 'Zone 1 – Anviksha', color: '#1A8C4E', top: '25%', left: '75%', width: 90, height: 80, status: 'Green', score: 92 },
    { id: '2', name: 'Zone 2 – School of Technology', color: '#B07D10', top: '40%', left: '60%', width: 120, height: 100, status: 'Yellow', score: 76 },
    { id: '3', name: 'Zone 3 – Common Amenities', color: '#1A8C4E', top: '52%', left: '68%', width: 90, height: 90, status: 'Green', score: 88 },
    { id: '4', name: 'Zone 4 – Kasturba Bhavan', color: '#1A8C4E', top: '45%', left: '45%', width: 100, height: 70, status: 'Green', score: 94 },
    { id: '5', name: 'Zone 5 – Vikram Sarabhai Bhavan', color: '#1A8C4E', top: '55%', left: '42%', width: 110, height: 80, status: 'Green', score: 95 },
    { id: '6', name: 'Zone 6 – Swami Vivekananda Bhavan', color: '#C0182A', top: '25%', left: '52%', width: 100, height: 90, status: 'Red', score: 54 },
    { id: '7', name: 'Zone 7 – FirePlex', color: '#B07D10', top: '40%', left: '22%', width: 80, height: 60, status: 'Yellow', score: 72 },
    { id: '8', name: 'Zone 8 – School of Science / Management', color: '#1A8C4E', top: '72%', left: '75%', width: 100, height: 80, status: 'Green', score: 91 },
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
  const [staticData, setStaticData] = useState({
    zonalHeads: [],
    subZonalHeads: [],
    checklists: []
  });

  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        const [complaintsRes, advisoriesRes, zhRes, szhRes, clRes, submissionsRes] = await Promise.all([
          axios.get(`${API_URL}/complaints`),
          axios.get(`${API_URL}/advisories`),
          axios.get(`${API_URL}/data/zonalheads`),
          axios.get(`${API_URL}/data/subzonalheads`),
          axios.get(`${API_URL}/data/checklists`),
          axios.get(`${API_URL}/submissions`)
        ]);
        
        setDb(prev => ({
          ...prev,
          complaints: complaintsRes.data.map(c => ({ ...c, id: c._id })),
          advisories: advisoriesRes.data.map(a => ({ ...a, id: a._id })),
          checklistSubmissions: submissionsRes.data.map(s => ({ ...s, id: s._id }))
        }));
        setStaticData({
          zonalHeads: zhRes.data,
          subZonalHeads: szhRes.data,
          checklists: clRes.data
        });
      } catch (error) {
        console.error('Failed to load db from API', error);
      } finally {
        setIsDbLoaded(true);
      }
    };
    fetchFromAPI();
  }, []);

  const publishAdvisory = async (targetZone, targetSubZone, text) => {
    try {
      const res = await axios.post(`${API_URL}/advisories`, {
        targetZone, targetSubZone, text, author: currentUser?.name
      });
      setDb(prev => ({
        ...prev,
        advisories: [res.data, ...prev.advisories]
      }));
    } catch (error) {
      console.error('Error publishing advisory', error);
    }
  };

  const addHead = async (type, data) => {
    try {
      const endpoint = type === 'zonal' ? 'zonalheads' : 'subzonalheads';
      const res = await axios.post(`${API_URL}/data/${endpoint}`, data);
      setStaticData(prev => ({
        ...prev,
        [type === 'zonal' ? 'zonalHeads' : 'subZonalHeads']: [...prev[type === 'zonal' ? 'zonalHeads' : 'subZonalHeads'], res.data]
      }));
      return { success: true };
    } catch (error) {
      console.error(`Error adding ${type} head`, error);
      return { success: false, error: error.message };
    }
  };

  const removeHead = async (type, id) => {
    try {
      const endpoint = type === 'zonal' ? 'zonalheads' : 'subzonalheads';
      await axios.delete(`${API_URL}/data/${endpoint}/${id}`);
      setStaticData(prev => ({
        ...prev,
        [type === 'zonal' ? 'zonalHeads' : 'subZonalHeads']: prev[type === 'zonal' ? 'zonalHeads' : 'subZonalHeads'].filter(h => h._id !== id)
      }));
      return { success: true };
    } catch (error) {
      console.error(`Error removing ${type} head`, error);
      return { success: false, error: error.message };
    }
  };

  const addAdvisoryReply = async (advisoryId, replyText) => {
    try {
      const res = await axios.post(`${API_URL}/advisories/${advisoryId}/reply`, {
        text: replyText, author: currentUser?.name
      });
      setDb(prev => ({
        ...prev,
        advisories: prev.advisories.map(adv => adv.id === advisoryId || adv._id === advisoryId ? res.data : adv)
      }));
    } catch (error) {
      console.error('Error replying to advisory', error);
    }
  };

  const submitComplaint = async (zone, subZone, desc, imageUri) => {
    try {
      const res = await axios.post(`${API_URL}/complaints`, {
        studentId: currentUser?.id || 'currentStudent',
        zone, subZone, desc, imageUri
      });
      setDb(prev => ({
        ...prev,
        complaints: [{ ...res.data, id: res.data._id }, ...prev.complaints]
      }));
    } catch (error) {
      console.error('Error submitting complaint', error);
    }
  };

  const resolveComplaint = async (complaintId, resolutionText, photoProof) => {
    try {
      const res = await axios.put(`${API_URL}/complaints/${complaintId}/resolve`, {
        resolutionText, photoProof, author: currentUser?.name
      });
      setDb(prev => ({
        ...prev,
        complaints: prev.complaints.map(c => (c.id === complaintId || c._id === complaintId) ? { ...res.data, id: res.data._id } : c)
      }));
    } catch (error) {
      console.error('Error resolving complaint', error);
    }
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

  const submitChecklist = async (subZonalHeadId, zone, score) => {
    try {
      const res = await axios.post(`${API_URL}/submissions`, {
        subZonalHeadId: subZonalHeadId || 'unknown_id',
        zone: zone ? zone.toString() : 'Unknown',
        score: score || 0
      });
      setDb(prev => ({
        ...prev,
        checklistSubmissions: [res.data, ...prev.checklistSubmissions]
      }));
    } catch (error) {
      console.error('Error submitting checklist', error);
      if (error.response) {
        console.error('Backend validation error:', error.response.data);
      }
    }
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
      submitChecklist,
      updateZoneScore,
      addAdvisoryReply,
      staticData,
      addHead,
      removeHead
    }}>
      {children}
    </DataContext.Provider>
  );
};
