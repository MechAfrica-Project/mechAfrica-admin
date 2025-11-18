import { Contact, Farmer, Provider } from "./types";

export type NewContactInput = Partial<
  Pick<
    Contact,
    | "firstName"
    | "otherNames"
    | "gender"
    | "phone"
    | "region"
    | "district"
    | "registrationDate"
    | "initials"
    | "profileImage"
  >
> & {
  name?: string;
  username?: string;
  type?: Contact["type"];
  assignedRegion?: string;
  // Farmer-specific optional fields
  farmName?: Farmer["farmName"];
  farmSize?: Farmer["farmSize"];
  farmSizeUnit?: Farmer["farmSizeUnit"];
  crops?: Farmer["crops"];
  formLocation?: Farmer["formLocation"];
  // Provider-specific optional fields
  services?: Provider["services"];
};

export type Metric = "farmer" | "provider" | "solved" | "escalated";

export interface ChartPoint {
  month: string;
  thisYear: number;
  lastYear: number;
  overTime: number;
}
