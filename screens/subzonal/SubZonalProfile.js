import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import ProfileLayout, { ProfileCard, ProfileRow } from '../../components/ProfileLayout';

export default function SubZonalProfile() {
  const { currentUser, logout, updateProfile, avatars } = useContext(DataContext);
  const data = currentUser?.data;
  const avatarUri = avatars[currentUser?.id];

  return (
    <ProfileLayout
      name={currentUser?.name}
      email={data?.email || currentUser?.email}
      role="Sub-Zonal Head"
      avatarUri={avatarUri}
      onLogout={logout}
      onUpdateProfile={(newData) => updateProfile(currentUser?.role, currentUser?.id, newData)}
    >
      <ProfileCard title="Contact Info">
        <ProfileRow label="Email:" value={data?.email || currentUser?.email} />
      </ProfileCard>

      <ProfileCard title="Assignment Details">
        <ProfileRow label="Zone:" value={data?.zone === 'Zone 1' || data?.zone === '1' ? 'Zone 1 - Anviksha' : data?.zone} />
        <ProfileRow label="Sub-Zone:" value={data?.subZone === '3' ? 'Sub-Zone 3 - Data Science' : `Sub-Zone ${data?.subZone}`} />
        <ProfileRow label="Areas Covered:" value={data?.areasCovered} isMulti={true} />
      </ProfileCard>
    </ProfileLayout>
  );
}
