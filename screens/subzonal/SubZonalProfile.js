import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import ProfileLayout, { ProfileCard, ProfileRow } from '../../components/ProfileLayout';

export default function SubZonalProfile() {
  const { currentUser, logout } = useContext(DataContext);
  const data = currentUser?.data;

  return (
    <ProfileLayout
      name={currentUser?.name}
      role="Sub-Zonal Head"
      onLogout={logout}
    >
      <ProfileCard title="Contact Info">
        <ProfileRow label="Email:" value={data?.email || currentUser?.email} />
      </ProfileCard>

      <ProfileCard title="Assignment Details">
        <ProfileRow label="Zone:" value={data?.zone} />
        <ProfileRow label="Sub-Zone:" value={data?.subZone} />
        <ProfileRow label="Areas Covered:" value={data?.areasCovered} isMulti={true} />
      </ProfileCard>
    </ProfileLayout>
  );
}
