import { 
  masterChecklist, 
  hostelChecklist, 
  gymChecklist, 
  libraryChecklist, 
  commonCampusChecklist, 
  fireEhsChecklist 
} from '../data/checklists';

export const getChecklistForUser = (userData) => {
  if (!userData) return masterChecklist;

  const area = userData.areasCovered?.toLowerCase() || '';
  const zone = userData.zone?.toLowerCase() || '';

  if (area.includes('hostel') || area.includes('mess') || area.includes('canteen')) {
    return hostelChecklist;
  }
  if (area.includes('gym')) {
    return gymChecklist;
  }
  if (area.includes('library')) {
    return libraryChecklist;
  }
  if (zone.includes('zone 3') || area.includes('common amenities')) {
    return commonCampusChecklist;
  }
  if (zone.includes('zone 7') || area.includes('fireplex')) {
    return fireEhsChecklist;
  }

  // Default to the standard 33-item list for SOS, SOT, Anviksha, etc.
  return masterChecklist;
};
