export interface BasePerson {
  id: string;
  firstName: string;
  otherNames: string;
  gender: "Male" | "Female";
  phone: string;
  region: string;
  registrationDate: string;
  initials: string;
  profileImage?: string;
}

export interface Farmer extends BasePerson {
  type: "Farmer";
  farmName: string;
  farmSize: number;
  farmSizeUnit: "Acre" | "Hectare";
  crops: ("Maize" | "Wheat" | "Rice" | "Cassava")[];
  formLocation: string;
  district: string;
}

export interface Provider extends BasePerson {
  type: "Provider";
  services: string[];
  district: string;
}

export interface Agent extends BasePerson {
  type: "Agent";
  district: string;
  assignedRegion: string;
}

export type Contact = Farmer | Provider | Agent;
