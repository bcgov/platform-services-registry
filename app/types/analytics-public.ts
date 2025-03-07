export type ContactsChange = {
  date: string;
  'Contact changes': number;
};

export type AllRequests = {
  date: string;
  'All requests': number;
  'Edit requests': number;
  'Create requests': number;
  'Delete requests': number;
};

export type ActiveProduct = {
  date: string;
  'All Providers': number;
} & Record<string, number>;

export type RequestDecisionTime = {
  time: string;
  Percentage: number;
};

export type MinistryDistribution = {
  _id: string;
  value: number;
};

export interface AnalyticsPublicCloudResponse {
  contactsChange: ContactsChange[];
  allRequests: AllRequests[];
  activeProducts: ActiveProduct[];
  requestDecisionTime: RequestDecisionTime[];
  ministryDistributionData: MinistryDistribution[][];
}
