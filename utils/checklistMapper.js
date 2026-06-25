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

  // Filter items belonging to the selected checklist type
  let checklistItems = dbChecklists.filter(c => c.item === selectedName);
  
  // If data is nested under 'name' and 'items'
  if (checklistItems.length === 0) {
    const matchedChecklist = dbChecklists.find(c => c.name === selectedName);
    if (matchedChecklist && matchedChecklist.items) {
      checklistItems = matchedChecklist.items;
    }
  }
  
  if (!checklistItems || checklistItems.length === 0) return {};

  // Group items: { Sort: ["c1", "c2"], SetInOrder: ["c3"] }
  const grouped = {};
  checklistItems.forEach(item => {
    // Some db entries have aspect as "1S - Sort", some just "Sort"
    let aspect = item.aspect;
    if (aspect.includes('-')) {
      aspect = aspect.split('-')[1].trim();
    }
    
    // Map SetInOrder from DB to Set In Order to match UI 
    if (aspect === 'SetInOrder') {
      aspect = 'Set In Order';
    }

    if (!grouped[aspect]) {
      grouped[aspect] = [];
    }
    grouped[aspect].push(item.criteria);
  });

  return grouped;
};
