export interface VisitorData {
    id?: string;
    ip: string;
    country: string;
    countryCode: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isp: string;
    postal?: string;
    timestamp: Date | string;
    userAgent: string;
    language: string;
    screenResolution: string;
  }
  
  export interface IPApiResponse {
    query?: string;
    ip?: string;
    country?: string;
    country_name?: string;
    countryCode?: string;
    country_code?: string;
    regionName?: string;
    region?: string;
    city?: string;
    lat?: number;
    latitude?: number;
    lon?: number;
    longitude?: number;
    timezone?: string;
    isp?: string;
    org?: string;
    zip?: string;
    postal?: string;
  }
  
  export interface Stats {
    total: number;
    countries: number;
    today: number;
  }
  
  export interface MarkerPosition {
    x: number;
    y: number;
  }