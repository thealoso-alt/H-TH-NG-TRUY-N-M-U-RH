
import { BloodType, BloodTypeID } from './types';

export const BLOOD_TYPES: BloodType[] = [
  { id: 'O-', label: 'O-', rh: 'negative', abo: 'O' },
  { id: 'O+', label: 'O+', rh: 'positive', abo: 'O' },
  { id: 'A-', label: 'A-', rh: 'negative', abo: 'A' },
  { id: 'A+', label: 'A+', rh: 'positive', abo: 'A' },
  { id: 'B-', label: 'B-', rh: 'negative', abo: 'B' },
  { id: 'B+', label: 'B+', rh: 'positive', abo: 'B' },
  { id: 'AB-', label: 'AB-', rh: 'negative', abo: 'AB' },
  { id: 'AB+', label: 'AB+', rh: 'positive', abo: 'AB' },
];

export const canDonateTo = (donor: BloodTypeID, recipient: BloodTypeID): boolean => {
  const d = BLOOD_TYPES.find(t => t.id === donor)!;
  const r = BLOOD_TYPES.find(t => t.id === recipient)!;

  // Rh logic: Rh- can give to both Rh+ and Rh-, but Rh+ can only give to Rh+
  const rhCompatible = d.rh === 'negative' || r.rh === 'positive';

  // ABO logic
  let aboCompatible = false;
  if (d.abo === 'O') aboCompatible = true;
  else if (d.abo === 'A') aboCompatible = r.abo === 'A' || r.abo === 'AB';
  else if (d.abo === 'B') aboCompatible = r.abo === 'B' || r.abo === 'AB';
  else if (d.abo === 'AB') aboCompatible = r.abo === 'AB';

  return rhCompatible && aboCompatible;
};

export const getDonorsFor = (recipient: BloodTypeID): BloodTypeID[] => {
  return BLOOD_TYPES.filter(t => canDonateTo(t.id, recipient)).map(t => t.id);
};

export const getRecipientsFor = (donor: BloodTypeID): BloodTypeID[] => {
  return BLOOD_TYPES.filter(t => canDonateTo(donor, t.id)).map(t => t.id);
};
