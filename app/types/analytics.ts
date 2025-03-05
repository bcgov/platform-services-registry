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

export type QuotaChange = {
  date: string;
  'All quota requests': number;
  'Approved quota requests': number;
  'Rejected quota requests': number;
};

export type ActiveProduct = {
  date: string;
  'All Clusters': number;
} & Record<string, number>;

export type RequestDecisionTime = {
  time: string;
  Percentage: number;
};

export type MinistryDistribution = {
  _id: string;
  value: number;
};

export interface AnalyticsPrivateCloudResponse {
  contactsChange: ContactsChange[];
  allRequests: AllRequests[];
  quotaChange: QuotaChange[];
  activeProducts: ActiveProduct[];
  requestDecisionTime: RequestDecisionTime[];
  ministryDistributionData: RequestDecisionTime[][];
}
