// Dummy data for MechAfrica Farmers
export interface Farmer {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
  };
  crops: string[];
  acres: number;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  phone: string;
  email: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
  };
  services: string[];
  rating: number;
  status: 'active' | 'inactive';
  phone: string;
  email: string;
}

export interface MapMarker {
  id: string;
  type: 'farmer' | 'service_provider';
  position: {
    lat: number;
    lng: number;
  };
  data: Farmer | ServiceProvider;
  cluster?: boolean;
}

// Ghana regions and their approximate coordinates
export const GHANA_REGIONS = {
  'Greater Accra': { lat: 5.6037, lng: -0.1870 },
  'Ashanti': { lat: 6.7470, lng: -1.5209 },
  'Western': { lat: 5.5000, lng: -2.5000 },
  'Central': { lat: 5.5000, lng: -1.0000 },
  'Volta': { lat: 6.5000, lng: 0.5000 },
  'Eastern': { lat: 6.5000, lng: -0.5000 },
  'Northern': { lat: 9.5000, lng: -1.0000 },
  'Upper East': { lat: 10.5000, lng: -0.5000 },
  'Upper West': { lat: 10.5000, lng: -2.5000 },
  'Brong-Ahafo': { lat: 7.5000, lng: -1.5000 },
};

// Dummy farmers data
export const DUMMY_FARMERS: Farmer[] = [
  {
    id: '1',
    name: 'Kwame Asante',
    location: {
      lat: 5.6037,
      lng: -0.1870,
      address: 'Accra, Greater Accra',
      region: 'Greater Accra'
    },
    crops: ['Maize', 'Rice'],
    acres: 15,
    status: 'active',
    joinDate: '2023-01-15',
    phone: '+233 24 123 4567',
    email: 'kwame@example.com'
  },
  {
    id: '2',
    name: 'Ama Osei',
    location: {
      lat: 6.7470,
      lng: -1.5209,
      address: 'Kumasi, Ashanti',
      region: 'Ashanti'
    },
    crops: ['Cocoa', 'Plantain'],
    acres: 25,
    status: 'active',
    joinDate: '2023-02-20',
    phone: '+233 20 987 6543',
    email: 'ama@example.com'
  },
  {
    id: '3',
    name: 'Kofi Mensah',
    location: {
      lat: 5.5000,
      lng: -2.5000,
      address: 'Takoradi, Western',
      region: 'Western'
    },
    crops: ['Oil Palm', 'Rubber'],
    acres: 40,
    status: 'active',
    joinDate: '2023-03-10',
    phone: '+233 26 555 1234',
    email: 'kofi@example.com'
  },
  {
    id: '4',
    name: 'Efua Boateng',
    location: {
      lat: 5.5000,
      lng: -1.0000,
      address: 'Cape Coast, Central',
      region: 'Central'
    },
    crops: ['Cassava', 'Yam'],
    acres: 12,
    status: 'active',
    joinDate: '2023-04-05',
    phone: '+233 24 777 8888',
    email: 'efua@example.com'
  },
  {
    id: '5',
    name: 'Yaw Adjei',
    location: {
      lat: 6.5000,
      lng: 0.5000,
      address: 'Ho, Volta',
      region: 'Volta'
    },
    crops: ['Rice', 'Vegetables'],
    acres: 18,
    status: 'active',
    joinDate: '2023-05-12',
    phone: '+233 20 333 4444',
    email: 'yaw@example.com'
  },
  {
    id: '6',
    name: 'Akosua Frimpong',
    location: {
      lat: 6.5000,
      lng: -0.5000,
      address: 'Koforidua, Eastern',
      region: 'Eastern'
    },
    crops: ['Cocoa', 'Coffee'],
    acres: 30,
    status: 'active',
    joinDate: '2023-06-18',
    phone: '+233 24 999 0000',
    email: 'akosua@example.com'
  },
  {
    id: '7',
    name: 'Ibrahim Mohammed',
    location: {
      lat: 9.5000,
      lng: -1.0000,
      address: 'Tamale, Northern',
      region: 'Northern'
    },
    crops: ['Sorghum', 'Millet'],
    acres: 22,
    status: 'active',
    joinDate: '2023-07-25',
    phone: '+233 20 111 2222',
    email: 'ibrahim@example.com'
  },
  {
    id: '8',
    name: 'Grace Tetteh',
    location: {
      lat: 10.5000,
      lng: -0.5000,
      address: 'Bolgatanga, Upper East',
      region: 'Upper East'
    },
    crops: ['Groundnut', 'Soybean'],
    acres: 16,
    status: 'active',
    joinDate: '2023-08-30',
    phone: '+233 24 666 7777',
    email: 'grace@example.com'
  }
];

// Dummy service providers data
export const DUMMY_SERVICE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'sp1',
    name: 'AgriTech Solutions',
    location: {
      lat: 5.6037,
      lng: -0.1870,
      address: 'Accra, Greater Accra',
      region: 'Greater Accra'
    },
    services: ['Fertilizer Supply', 'Equipment Rental', 'Consultation'],
    rating: 4.8,
    status: 'active',
    phone: '+233 30 123 4567',
    email: 'contact@agritech.com'
  },
  {
    id: 'sp2',
    name: 'Farm Equipment Hub',
    location: {
      lat: 6.7470,
      lng: -1.5209,
      address: 'Kumasi, Ashanti',
      region: 'Ashanti'
    },
    services: ['Tractor Rental', 'Irrigation Systems', 'Maintenance'],
    rating: 4.6,
    status: 'active',
    phone: '+233 32 987 6543',
    email: 'info@farmhub.com'
  },
  {
    id: 'sp3',
    name: 'Crop Care Services',
    location: {
      lat: 5.5000,
      lng: -2.5000,
      address: 'Takoradi, Western',
      region: 'Western'
    },
    services: ['Pest Control', 'Fertilizer Application', 'Crop Monitoring'],
    rating: 4.9,
    status: 'active',
    phone: '+233 24 555 1234',
    email: 'service@cropcare.com'
  },
  {
    id: 'sp4',
    name: 'Irrigation Experts',
    location: {
      lat: 5.5000,
      lng: -1.0000,
      address: 'Cape Coast, Central',
      region: 'Central'
    },
    services: ['Irrigation Design', 'Water Management', 'System Installation'],
    rating: 4.7,
    status: 'active',
    phone: '+233 20 777 8888',
    email: 'contact@irrigation.com'
  }
];

// Generate map markers from farmers and service providers
export const generateMapMarkers = (): MapMarker[] => {
  const markers: MapMarker[] = [];
  
  // Add farmer markers
  DUMMY_FARMERS.forEach(farmer => {
    markers.push({
      id: `farmer-${farmer.id}`,
      type: 'farmer',
      position: farmer.location,
      data: farmer
    });
  });
  
  // Add service provider markers
  DUMMY_SERVICE_PROVIDERS.forEach(provider => {
    markers.push({
      id: `provider-${provider.id}`,
      type: 'service_provider',
      position: provider.location,
      data: provider
    });
  });
  
  return markers;
};

// Statistics data
export const getMapStatistics = () => {
  const farmers = DUMMY_FARMERS.filter(f => f.status === 'active');
  const serviceProviders = DUMMY_SERVICE_PROVIDERS.filter(sp => sp.status === 'active');
  const totalAcres = farmers.reduce((sum, farmer) => sum + farmer.acres, 0);
  
  return {
    totalFarmers: farmers.length,
    totalServiceProviders: serviceProviders.length,
    totalAcres,
    demandToSupply: `${(farmers.length / serviceProviders.length).toFixed(1)} : 1`,
    farmersGrowth: '+11.01%',
    providersGrowth: '-0.03%',
    acresGrowth: '+15.03%'
  };
};

// Farmers count over time data
export const getFarmersOverTime = () => [
  { month: 'Jan', value: 45 },
  { month: 'Feb', value: 35 },
  { month: 'Mar', value: 55 },
  { month: 'Apr', value: 70 },
  { month: 'May', value: 50 },
  { month: 'Jun', value: 75 },
  { month: 'Jul', value: 80 },
  { month: 'Aug', value: 85 },
  { month: 'Sep', value: 90 },
  { month: 'Oct', value: 95 },
  { month: 'Nov', value: 100 },
  { month: 'Dec', value: 105 }
];
