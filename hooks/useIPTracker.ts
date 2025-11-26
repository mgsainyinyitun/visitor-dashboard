'use client';

import { useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VisitorData, IPApiResponse } from '@/lib/type';

interface IPApiConfig {
  url: string;
  parser: (data: IPApiResponse) => Promise<Omit<VisitorData, 'timestamp' | 'userAgent' | 'language' | 'screenResolution'>>;
}

// Function to try multiple IP APIs with fallback
const fetchIPData = async (): Promise<Omit<VisitorData, 'timestamp' | 'userAgent' | 'language' | 'screenResolution'>> => {
  const apis: IPApiConfig[] = [
    {
      url: 'http://ip-api.com/json/',
      parser: async (data: IPApiResponse) => ({
        ip: data.query || '',
        country: data.country || '',
        countryCode: data.countryCode || '',
        region: data.regionName || '',
        city: data.city || '',
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        timezone: data.timezone || '',
        isp: data.isp || '',
        postal: data.zip || ''
      })
    },
    {
      url: 'https://ipapi.co/json/',
      parser: async (data: IPApiResponse) => ({
        ip: data.ip || '',
        country: data.country_name || '',
        countryCode: data.country_code || '',
        region: data.region || '',
        city: data.city || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone || '',
        isp: data.org || '',
        postal: data.postal || ''
      })
    }
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url);
      if (response.ok) {
        const data: IPApiResponse = await response.json();
        return await api.parser(data);
      }
    } catch (error) {
      console.log(`Failed to fetch from ${api.url}, trying next...`);
      continue;
    }
  }
  
  throw new Error('All IP geolocation services failed');
};

export const trackVisitor = async (): Promise<void> => {
  try {
    const lastVisit = localStorage.getItem('lastVisitTracked');
    const now = Date.now();
    
    if (lastVisit && now - parseInt(lastVisit) < 24 * 60 * 60 * 1000) {
      console.log('Visitor already tracked within 24 hours');
      return;
    }

    const ipData = await fetchIPData();
    
    const visitorInfo: Omit<VisitorData, 'id'> = {
      ...ipData,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    };
    
    await addDoc(collection(db, 'visitors'), visitorInfo);
    
    localStorage.setItem('lastVisitTracked', now.toString());
    console.log('Visitor tracked successfully');
    
  } catch (error) {
    console.error('Error tracking visitor:', error);
  }
};

export const useIPTracker = (): void => {
  useEffect(() => {
    trackVisitor();
  }, []);
};