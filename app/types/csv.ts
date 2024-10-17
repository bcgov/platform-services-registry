export interface PrivateProductCsvRecord {
  Name: string;
  Description: string;
  Ministry: string;
  Cluster: string;
  'Project Owner email': string;
  'Project Owner name': string;
  'Primary Technical Lead email': string;
  'Primary Technical Lead name': string;
  'Secondary Technical Lead email': string;
  'Secondary Technical Lead name': string;
  'Create date': string;
  'Update date': string;
  'Licence plate': string;
  'Total compute quota (cores)': string;
  'Total memory quota (GB)': string;
  'Total storage quota (GB)': string;
  Status: string;
}

export interface PublicProductCsvRecord {
  Name: string;
  Description: string;
  Ministry: string;
  Provider: string;
  'Description of selected reasons': string[];
  'Reasons for selecting cloud provider': string;
  'Project Owner email': string;
  'Project Owner name': string;
  'Primary Technical Lead email': string;
  'Primary Technical Lead name': string;
  'Secondary Technical Lead email': string;
  'Secondary Technical Lead name': string;
  'Create date': string;
  'Update date': string;
  'Licence plate': string;
  Status: string;
}
