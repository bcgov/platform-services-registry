export interface PrivateProductCsvRecord {
  Name: string;
  Description: string;
  Ministry: string;
  Cluster: string;
  'Project Owner Email': string;
  'Project Owner Name': string;
  'Primary Technical Lead Email': string;
  'Primary Technical Lead Name': string;
  'Secondary Technical Lead Email': string;
  'Secondary Technical Lead Name': string;
  'Create Date': string;
  'Update Date': string;
  'Licence Plate': string;
  'Total Compute Quota (Cores)': string;
  'Total Memory Quota (Gb)': string;
  'Total Storage Quota (Gb)': string;
  Status: string;
}

export interface PublicProductCsvRecord {
  Name: string;
  Description: string;
  Ministry: string;
  Provider: string;
  'Description of Selected Reasons': string[];
  'Reasons for Selecting Cloud Provider': string;
  'Project Owner Email': string;
  'Project Owner Name': string;
  'Primary Technical Lead Email': string;
  'Primary Technical Lead Name': string;
  'Secondary Technical Lead Email': string;
  'Secondary Technical Lead Name': string;
  'Create Date': string;
  'Update Date': string;
  'Licence Plate': string;
  Status: string;
}
