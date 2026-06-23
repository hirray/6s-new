export const getChecklistForUser = (userData, dbChecklists = []) => {
  if (!dbChecklists || dbChecklists.length === 0) return {};

  const area = userData?.areasCovered?.toLowerCase() || '';
  const zone = userData?.zone?.toLowerCase() || '';

  let selectedName = 'masterChecklist';

  if (area.includes('hostel') || area.includes('mess') || area.includes('canteen')) {
    selectedName = 'hostelChecklist';
  } else if (area.includes('gym')) {
    selectedName = 'gymChecklist';
  } else if (area.includes('library')) {
    selectedName = 'libraryChecklist';
  } else if (zone.includes('zone 3') || area.includes('common amenities')) {
    selectedName = 'commonCampusChecklist';
  } else if (zone.includes('zone 7') || area.includes('fireplex')) {
    selectedName = 'fireEhsChecklist';
  }

  const selectedChecklist = dbChecklists.find(c => c.name === selectedName);
  
  if (!selectedChecklist) return {};

  // Group items back into the old format: { Sort: ["c1", "c2"], SetInOrder: ["c3"] }
  const grouped = {};
  selectedChecklist.items.forEach(item => {
    if (!grouped[item.aspect]) {
      grouped[item.aspect] = [];
    }
    grouped[item.aspect].push(item.criteria);
  });

  return grouped;
};
