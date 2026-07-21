import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import axios from 'axios';
import { APP_ZONES, APP_SUBZONES, APP_METHODOLOGY, APP_SZH, APP_CL_TASKS } from '../config/appConfig';

export const DataContext = createContext();

// Use https://six-7uud.onrender.com for production, or 10.0.2.2 for local emulator
const API_URL = 'https://six-7uud.onrender.com/api'; // Live backend URL

export const DataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [avatars, setAvatars] = useState({});

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedAvatars = await AsyncStorage.getItem('@avatars');
        if (storedAvatars) setAvatars(JSON.parse(storedAvatars));

        const storedUser = await AsyncStorage.getItem('@currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        // Silently ignore load errors
      }
    };
    loadPersistedData();
  }, []);

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
      await AsyncStorage.setItem('@currentUser', JSON.stringify(finalUserData));
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
    await AsyncStorage.removeItem('@currentUser');
  };

  const [zones, setZones] = useState(APP_ZONES);
  const [subZones, setSubZones] = useState(APP_SUBZONES);
  const [methodology, setMethodology] = useState(APP_METHODOLOGY);
  const SZH = APP_SZH;
  const CL_TASKS = APP_CL_TASKS;

  const initialDbState = {
    complaints: [],
    checklistSubmissions: [],
    remarks: [],
    advisories: [],
    zonalReports: []
  };

  const [db, setDb] = useState(initialDbState);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [staticData, setStaticData] = useState({
    zonalHeads: [],
    subZonalHeads: [],
    checklists: [],
    admins: []
  });

  const fetchFromAPI = async () => {
    try {
      const [complaintsRes, advisoriesRes, zhRes, szhRes, clRes, submissionsRes, zonalReportsRes, adminsRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`),
        axios.get(`${API_URL}/advisories`),
        axios.get(`${API_URL}/data/zonalheads`),
        axios.get(`${API_URL}/data/subzonalheads`),
        axios.get(`${API_URL}/data/checklists`),
        axios.get(`${API_URL}/submissions`),
        axios.get(`${API_URL}/submissions/zonal-reports`),
        axios.get(`${API_URL}/data/admins`).catch(() => ({ data: [] }))
      ]);
      
      setDb(prev => ({
        ...prev,
        complaints: complaintsRes.data.map(c => ({ ...c, id: c._id })),
        advisories: advisoriesRes.data.map(a => ({ ...a, id: a._id })),
        checklistSubmissions: submissionsRes.data.map(s => ({ ...s, id: s._id })),
        zonalReports: zonalReportsRes.data.map(r => ({ ...r, id: r._id }))
      }));
      setStaticData({
        zonalHeads: zhRes.data,
        subZonalHeads: szhRes.data,
        checklists: clRes.data,
        admins: adminsRes.data
      });
    } catch (error) {
      console.error('Failed to load db from API', error);
    } finally {
      setIsDbLoaded(true);
    }
  };

  useEffect(() => {
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

  const replaceHead = async (type, id, updatedData) => {
    try {
      const endpoint = type === 'zonal' ? 'zonalheads' : 'subzonalheads';
      const res = await axios.put(`${API_URL}/data/${endpoint}/${id}`, updatedData);
      setStaticData(prev => ({
        ...prev,
        [type === 'zonal' ? 'zonalHeads' : 'subZonalHeads']: prev[type === 'zonal' ? 'zonalHeads' : 'subZonalHeads'].map(h => h._id === id ? res.data : h)
      }));
      return { success: true };
    } catch (error) {
      console.error(`Error replacing ${type} head`, error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (role, id, newData) => {
    try {
      if (newData.avatarUri) {
        const newAvatars = { ...avatars, [id]: newData.avatarUri };
        setAvatars(newAvatars);
        await AsyncStorage.setItem('@avatars', JSON.stringify(newAvatars));
      }
      
      let updatedUser = { ...currentUser };
      if (newData.name) {
        updatedUser.name = newData.name;
        if (updatedUser.data) updatedUser.data.name = newData.name;
      }
      if (newData.email && updatedUser.data) updatedUser.data.email = newData.email;

      // Update backend if it's a known database role (not local Admin)
      if (role === 'ZonalHead' || role === 'SubZonalHead') {
        const endpoint = role === 'ZonalHead' ? 'zonalheads' : 'subzonalheads';
        // id here can be MongoDB _id. We check if the id passed is valid.
        const dbId = currentUser?.data?._id || id;
        
        const res = await axios.put(`${API_URL}/data/${endpoint}/${dbId}`, {
          name: newData.name,
          email: newData.email
        });
        
        setStaticData(prev => ({
          ...prev,
          [role === 'ZonalHead' ? 'zonalHeads' : 'subZonalHeads']: prev[role === 'ZonalHead' ? 'zonalHeads' : 'subZonalHeads'].map(h => h._id === dbId ? res.data : h)
        }));
        
        updatedUser.data = res.data;
      }

      setCurrentUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error("Error updating profile", error);
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

  const submitChecklist = async (subZonalHeadId, zone, score, remarks = []) => {
    try {
      const res = await axios.post(`${API_URL}/submissions`, {
        subZonalHeadId: subZonalHeadId || 'unknown_id',
        zone: zone ? zone.toString() : 'Unknown',
        score: score || 0,
        date: new Date().toISOString(),
        remarks: remarks
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

  const approveChecklist = async (submissionId) => {
    try {
      const res = await axios.put(`${API_URL}/submissions/${submissionId}/approve`, {
        approvedBy: currentUser?.name || 'Zonal Head'
      });
      setDb(prev => ({
        ...prev,
        checklistSubmissions: prev.checklistSubmissions.map(sub => 
          (sub.id === submissionId || sub._id === submissionId) ? { ...res.data, id: res.data._id } : sub
        )
      }));
      return true;
    } catch (error) {
      console.error('Error approving checklist', error);
      return false;
    }
  };

  const submitZonalReport = async (zoneName, comments) => {
    try {
      const res = await axios.post(`${API_URL}/submissions/zonal-reports`, {
        zoneName,
        comments,
        submittedBy: currentUser?.name || 'Zonal Head'
      });
      setDb(prev => ({
        ...prev,
        zonalReports: [res.data, ...prev.zonalReports]
      }));
      return true;
    } catch (error) {
      console.error('Error submitting zonal report', error);
      return false;
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
      fetchFromAPI,
      SZH,
      CL_TASKS,
      publishAdvisory,
      submitComplaint,
      resolveComplaint,
      submitChecklist,
      approveChecklist,
      submitZonalReport,
      updateZoneScore,
      addAdvisoryReply,
      staticData,
      addHead,
      removeHead,
      replaceHead,
      updateProfile,
      avatars
    }}>
      {children}
    </DataContext.Provider>
  );
};
