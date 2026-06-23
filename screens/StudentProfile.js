import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import ProfileLayout, { ProfileCard, ProfileRow, ProfileStatsRow } from '../components/ProfileLayout';

export default function StudentProfile() {
  const { currentUser, logout, db } = useContext(DataContext);

  const studentComplaints = db.complaints.filter(c => c.studentId === currentUser?.id);
  const totalSubmitted = studentComplaints.length;
  const totalResolved = studentComplaints.filter(c => c.status === 'Resolved').length;
  const totalPending = totalSubmitted - totalResolved;

  const activityStats = [
    { label: 'Submitted', value: totalSubmitted, icon: 'document-text', color: '#3B82F6' },
    { label: 'Resolved', value: totalResolved, icon: 'checkmark-circle', color: '#10B981' },
    { label: 'Pending', value: totalPending, icon: 'time', color: '#F59E0B' },
  ];

  return (
    <ProfileLayout
      name={currentUser?.name}
      role="Student"
      onLogout={logout}
    >
      <ProfileStatsRow stats={activityStats} />

      <ProfileCard title="Contact Information">
        <ProfileRow icon="mail-outline" label="Email" value={currentUser?.email || 'student@gsfc.edu'} />
        <ProfileRow icon="id-card-outline" label="Student ID" value={currentUser?.id || 'N/A'} />
        <ProfileRow icon="person-outline" label="Role" value="Student" />
      </ProfileCard>
    </ProfileLayout>
  );
}
