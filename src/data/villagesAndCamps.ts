// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Punjab River Basin Villages, Elevation Benchmarks, and Relief Shelters

export interface ReliefCamp {
  id: string;
  name: string;
  punjabiName: string;
  type: 'school' | 'gurdwara' | 'college' | 'mandi';
  coords: [number, number];
  elevation: number; // in meters (high ground)
  capacity: number;
  contactNumber: string;
  hasMedical: boolean;
  hasLangar: boolean;
  availableBeds: number;
}

export interface VillageData {
  id: string;
  name: string;
  punjabiName: string;
  basin: 'Sutlej' | 'Beas' | 'Ghaggar';
  district: string;
  coords: [number, number]; // [lat, lng]
  elevation: number; // Embankment elevation E_village in meters
  dangerLevel: number; // Threshold at which water spills into fields
  population: number;
  nearestCampId: string;
  historicalBreachDate: string; // e.g. "11 Jul 2023 06:00"
  sanjeevaniAlertDate: string; // e.g. "09 Jul 2023 08:00"
  hoursSaved: number; // e.g. +46h
}

export const RELIEF_CAMPS: Record<string, ReliefCamp> = {
  camp_shahkot_school: {
    id: 'camp_shahkot_school',
    name: 'Govt Sr. Sec. School, Shahkot',
    punjabiName: 'ਸਰਕਾਰੀ ਸੀਨੀਅਰ ਸੈਕੰਡਰੀ ਸਕੂਲ, ਸ਼ਾਹਕੋਟ',
    type: 'school',
    coords: [31.0824, 75.3412],
    elevation: 216.5,
    capacity: 1200,
    contactNumber: '+91-1821-260123',
    hasMedical: true,
    hasLangar: true,
    availableBeds: 450,
  },
  camp_ber_sahib: {
    id: 'camp_ber_sahib',
    name: 'Gurdwara Sri Ber Sahib High Ground, Sultanpur Lodhi',
    punjabiName: 'ਗੁਰਦੁਆਰਾ ਸ੍ਰੀ ਬੇਰ ਸਾਹਿਬ ਰਾਹਤ ਕੈਂਪ, ਸੁਲਤਾਨਪੁਰ ਲੋਧੀ',
    type: 'gurdwara',
    coords: [31.2146, 75.1972],
    elevation: 217.2,
    capacity: 2500,
    contactNumber: '+91-1828-222345',
    hasMedical: true,
    hasLangar: true,
    availableBeds: 820,
  },
  camp_khalsa_college: {
    id: 'camp_khalsa_college',
    name: 'Guru Nanak Khalsa College Relief Center, Shahkot',
    punjabiName: 'ਗੁਰੂ ਨਾਨਕ ਖਾਲਸਾ ਕਾਲਜ ਰਾਹਤ ਕੇਂਦਰ, ਸ਼ਾਹਕੋਟ',
    type: 'college',
    coords: [31.0792, 75.3465],
    elevation: 216.8,
    capacity: 1800,
    contactNumber: '+91-1821-261456',
    hasMedical: true,
    hasLangar: true,
    availableBeds: 600,
  },
  camp_phillaur_police: {
    id: 'camp_phillaur_police',
    name: 'Police Academy High Ground Shelter, Phillaur',
    punjabiName: 'ਪੁਲਿਸ ਅਕੈਡਮੀ ਹਾਈ ਗਰਾਊਂਡ ਸ਼ੈਲਟਰ, ਫਿਲੌਰ',
    type: 'school',
    coords: [31.0285, 75.792],
    elevation: 238.4,
    capacity: 1500,
    contactNumber: '+91-1826-222100',
    hasMedical: true,
    hasLangar: true,
    availableBeds: 510,
  },
  camp_sultanpur_bdpo: {
    id: 'camp_sultanpur_bdpo',
    name: 'BDPO Office & Grain Market Shelter, Sultanpur Lodhi',
    punjabiName: 'ਬੀ.ਡੀ.ਪੀ.ਓ ਦਫ਼ਤਰ ਅਤੇ ਦਾਣਾ ਮੰਡੀ ਸ਼ੈਲਟਰ, ਸੁਲਤਾਨਪੁਰ ਲੋਧੀ',
    type: 'mandi',
    coords: [31.219, 75.205],
    elevation: 215.8,
    capacity: 2000,
    contactNumber: '+91-1828-223112',
    hasMedical: true,
    hasLangar: true,
    availableBeds: 750,
  },
  camp_moonak_mandi: {
    id: 'camp_moonak_mandi',
    name: 'Anaj Mandi High-Platform Shelter, Moonak',
    punjabiName: 'ਅਨਾਜ ਮੰਡੀ ਉੱਚਾ ਪਲੇਟਫਾਰਮ ਸ਼ੈਲਟਰ, ਮੂਨਕ',
    type: 'mandi',
    coords: [29.835, 75.901],
    elevation: 224.0,
    capacity: 2200,
    contactNumber: '+91-1676-276050',
    hasMedical: true,
    hasLangar: true,
    availableBeds: 920,
  },
};

export const PUNJAB_VILLAGES: VillageData[] = [
  {
    id: 'lohian_khas',
    name: 'Lohian Khas',
    punjabiName: 'ਲੋਹੀਆਂ ਖਾਸ',
    basin: 'Sutlej',
    district: 'Jalandhar',
    coords: [31.1585, 75.2078],
    elevation: 211.5,
    dangerLevel: 211.8,
    population: 8500,
    nearestCampId: 'camp_shahkot_school',
    historicalBreachDate: '11 Jul 2023 06:00',
    sanjeevaniAlertDate: '09 Jul 2023 08:00',
    hoursSaved: 46,
  },
  {
    id: 'gidderpindi',
    name: 'Gidderpindi',
    punjabiName: 'ਗਿੱਦੜਪਿੰਡੀ',
    basin: 'Sutlej',
    district: 'Jalandhar',
    coords: [31.132, 75.161],
    elevation: 210.8,
    dangerLevel: 211.2,
    population: 4200,
    nearestCampId: 'camp_ber_sahib',
    historicalBreachDate: '10 Jul 2023 22:00',
    sanjeevaniAlertDate: '09 Jul 2023 04:00',
    hoursSaved: 42,
  },
  {
    id: 'shahkot_bet',
    name: 'Shahkot Bet',
    punjabiName: 'ਸ਼ਾਹਕੋਟ ਬੇਟ',
    basin: 'Sutlej',
    district: 'Jalandhar',
    coords: [31.114, 75.289],
    elevation: 212.2,
    dangerLevel: 212.8,
    population: 6800,
    nearestCampId: 'camp_khalsa_college',
    historicalBreachDate: '11 Jul 2023 09:00',
    sanjeevaniAlertDate: '09 Jul 2023 19:00',
    hoursSaved: 38,
  },
  {
    id: 'phillaur_bet',
    name: 'Phillaur Bet',
    punjabiName: 'ਫਿਲੌਰ ਬੇਟ',
    basin: 'Sutlej',
    district: 'Jalandhar',
    coords: [31.0154, 75.7872],
    elevation: 234.0,
    dangerLevel: 234.6,
    population: 5900,
    nearestCampId: 'camp_phillaur_police',
    historicalBreachDate: '10 Jul 2023 14:00',
    sanjeevaniAlertDate: '09 Jul 2023 02:00',
    hoursSaved: 36,
  },
  {
    id: 'mand_sultanpur',
    name: 'Mand Sultanpur Lodhi',
    punjabiName: 'ਮੰਡ ਸੁਲਤਾਨਪੁਰ ਲੋਧੀ',
    basin: 'Beas',
    district: 'Kapurthala',
    coords: [31.238, 75.142],
    elevation: 211.0,
    dangerLevel: 211.5,
    population: 5400,
    nearestCampId: 'camp_sultanpur_bdpo',
    historicalBreachDate: '11 Jul 2023 12:00',
    sanjeevaniAlertDate: '09 Jul 2023 16:00',
    hoursSaved: 44,
  },
  {
    id: 'moonak_bet',
    name: 'Moonak Bet',
    punjabiName: 'ਮੂਨਕ ਬੇਟ',
    basin: 'Ghaggar',
    district: 'Sangrur',
    coords: [29.821, 75.892],
    elevation: 219.5,
    dangerLevel: 220.1,
    population: 7100,
    nearestCampId: 'camp_moonak_mandi',
    historicalBreachDate: '12 Jul 2023 08:00',
    sanjeevaniAlertDate: '10 Jul 2023 12:00',
    hoursSaved: 44,
  },
];
