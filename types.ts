
export interface DataSource {
  name: string;
  description: string;
  accessMethod: string;
}

export interface DataSourceDetails {
  dataFormats: string[];
  updateFrequency: string;
  usageRestrictions: string;
  documentationUrl?: string;
}

export interface FollowUpResponse {
    answer: string;
}
