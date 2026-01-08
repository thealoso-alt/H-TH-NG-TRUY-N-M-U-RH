
export type BloodTypeID = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export interface BloodType {
  id: BloodTypeID;
  label: string;
  rh: 'positive' | 'negative';
  abo: 'A' | 'B' | 'AB' | 'O';
}

export type InteractionMode = 'GIVE' | 'RECEIVE';

export interface Connection {
  from: BloodTypeID;
  to: BloodTypeID;
}
