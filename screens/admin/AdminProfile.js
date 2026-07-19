import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import ProfileLayout, { ProfileCard, ProfileRow } from '../../components/ProfileLayout';

export default function AdminProfile({ onNavigate }) {
  const { currentUser, logout } = useContext(DataContext);
  const data = currentUser?.data;

  return (
    <ProfileLayout
      name={currentUser?.name}
      role="System Administrator"
      onLogout={logout}
      onNavigate={onNavigate}
    >
      <ProfileCard title="Contact Info">
        <ProfileRow label="Email:" value={data?.email || currentUser?.email || 'admin@gsfc.edu'} />
      </ProfileCard>

      <ProfileCard title="Access Details">
        <ProfileRow label="Clearance Level:" value="Level 4 - Core Committee" />
      </ProfileCard>
    </ProfileLayout>
  );
}
