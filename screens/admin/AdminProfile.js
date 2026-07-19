import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import ProfileLayout, { ProfileCard, ProfileRow } from '../../components/ProfileLayout';

export default function AdminProfile({ onNavigate }) {
  const { currentUser, logout, updateProfile, avatars } = useContext(DataContext);
  const data = currentUser?.data;
  const avatarUri = avatars[currentUser?.id];

  return (
    <ProfileLayout
      name={currentUser?.name}
      email={data?.email || currentUser?.email || 'admin@gsfc.edu'}
      role="System Administrator"
      avatarUri={avatarUri}
      onLogout={logout}
      onUpdateProfile={(newData) => updateProfile(currentUser?.role, currentUser?.id, newData)}
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
