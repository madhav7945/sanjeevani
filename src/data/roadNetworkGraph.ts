// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Road Network Graph for Dynamic Dijkstra Safe Evacuation Routing

export interface RoadNode {
  id: string;
  name: string;
  punjabiName: string;
  coords: [number, number];
  elevation: number;
}

export interface RoadEdge {
  id: string;
  name: string;
  punjabiName: string;
  from: string;
  to: string;
  distanceKm: number;
  baseElevation: number; // Low road vs elevated highway
  isElevatedHighway: boolean;
  path: [number, number][]; // coordinates for Leaflet polyline
}

export const ROAD_NODES: Record<string, RoadNode> = {
  node_lohian: {
    id: 'node_lohian',
    name: 'Lohian Khas Center',
    punjabiName: 'ਲੋਹੀਆਂ ਖਾਸ ਚੌਂਕ',
    coords: [31.1585, 75.2078],
    elevation: 211.5,
  },
  node_gidderpindi: {
    id: 'node_gidderpindi',
    name: 'Gidderpindi Village',
    punjabiName: 'ਗਿੱਦੜਪਿੰਡੀ ਪਿੰਡ',
    coords: [31.132, 75.161],
    elevation: 210.8,
  },
  node_mandala: {
    id: 'node_mandala',
    name: 'Mandala Channa Junction',
    punjabiName: 'ਮੰਡਾਲਾ ਛੰਨਾ ਜੰਕਸ਼ਨ',
    coords: [31.145, 75.185],
    elevation: 210.2,
  },
  node_sh25_junction: {
    id: 'node_sh25_junction',
    name: 'State Highway 25 High Junction',
    punjabiName: 'ਸਟੇਟ ਹਾਈਵੇ 25 ਉੱਚਾ ਮੋੜ',
    coords: [31.121, 75.25],
    elevation: 215.2,
  },
  node_shahkot_town: {
    id: 'node_shahkot_town',
    name: 'Shahkot Main Town',
    punjabiName: 'ਸ਼ਾਹਕੋਟ ਸ਼ਹਿਰ',
    coords: [31.0824, 75.3412],
    elevation: 216.5,
  },
  node_sultanpur_center: {
    id: 'node_sultanpur_center',
    name: 'Sultanpur Lodhi High Platform',
    punjabiName: 'ਸੁਲਤਾਨਪੁਰ ਲੋਧੀ ਉੱਚਾ ਪਲੇਟਫਾਰਮ',
    coords: [31.2146, 75.1972],
    elevation: 217.2,
  },
  node_phillaur_center: {
    id: 'node_phillaur_center',
    name: 'Phillaur GT Road High Junction',
    punjabiName: 'ਫਿਲੌਰ ਜੀ.ਟੀ. ਰੋਡ ਜੰਕਸ਼ਨ',
    coords: [31.0285, 75.792],
    elevation: 238.4,
  },
};

export const ROAD_EDGES: RoadEdge[] = [
  // Low-lying dangerous link roads (flood first)
  {
    id: 'road_lohian_makhu_low',
    name: 'Lohian–Makhu Low Link Road',
    punjabiName: 'ਲੋਹੀਆਂ-ਮੱਖੂ ਨੀਵਾਂ ਲਿੰਕ ਰੋਡ (ਹੜ੍ਹ ਖ਼ਤਰਾ)',
    from: 'node_lohian',
    to: 'node_mandala',
    distanceKm: 3.2,
    baseElevation: 209.8,
    isElevatedHighway: false,
    path: [
      [31.1585, 75.2078],
      [31.152, 75.196],
      [31.145, 75.185],
    ],
  },
  {
    id: 'road_mandala_channa_bundh',
    name: 'Mandala Dhussi Bundh Embankment Track',
    punjabiName: 'ਮੰਡਾਲਾ ਧੁੱਸੀ ਬੰਨ੍ਹ ਕੱਚਾ ਰਸਤਾ',
    from: 'node_mandala',
    to: 'node_gidderpindi',
    distanceKm: 2.8,
    baseElevation: 209.5,
    isElevatedHighway: false,
    path: [
      [31.145, 75.185],
      [31.138, 75.172],
      [31.132, 75.161],
    ],
  },
  {
    id: 'road_gidderpindi_causeway',
    name: 'Gidderpindi Low River Causeway',
    punjabiName: 'ਗਿੱਦੜਪਿੰਡੀ ਨੀਵਾਂ ਪੁਲੀ ਰਸਤਾ',
    from: 'node_gidderpindi',
    to: 'node_sh25_junction',
    distanceKm: 8.5,
    baseElevation: 210.1,
    isElevatedHighway: false,
    path: [
      [31.132, 75.161],
      [31.128, 75.2],
      [31.121, 75.25],
    ],
  },

  // Safe Elevated Highways & Embankment Bypass Corridors (Safe during flood)
  {
    id: 'road_lohian_sh25_safe',
    name: 'Lohian High Embankment Bypass to SH-25',
    punjabiName: 'ਲੋਹੀਆਂ ਉੱਚਾ ਬਾਈਪਾਸ ਸਟੇਟ ਹਾਈਵੇ-25 ਵੱਲ (ਸੁਰੱਖਿਅਤ)',
    from: 'node_lohian',
    to: 'node_sh25_junction',
    distanceKm: 5.8,
    baseElevation: 215.0,
    isElevatedHighway: true,
    path: [
      [31.1585, 75.2078],
      [31.142, 75.228],
      [31.121, 75.25],
    ],
  },
  {
    id: 'road_sh25_to_shahkot_safe',
    name: 'State Highway 25 Elevated Expressway to Shahkot Camp',
    punjabiName: 'ਸਟੇਟ ਹਾਈਵੇ 25 ਪੱਕੀ ਸੜਕ ਸ਼ਾਹਕੋਟ ਕੈਂਪ ਵੱਲ',
    from: 'node_sh25_junction',
    to: 'node_shahkot_town',
    distanceKm: 9.4,
    baseElevation: 216.5,
    isElevatedHighway: true,
    path: [
      [31.121, 75.25],
      [31.105, 75.295],
      [31.0824, 75.3412],
    ],
  },
  {
    id: 'road_lohian_to_sultanpur_safe',
    name: 'Lohian–Sultanpur Elevated Bundh Road to Ber Sahib',
    punjabiName: 'ਲੋਹੀਆਂ-ਸੁਲਤਾਨਪੁਰ ਉੱਚੀ ਪੱਕੀ ਸੜਕ ਬੇਰ ਸਾਹਿਬ ਵੱਲ',
    from: 'node_lohian',
    to: 'node_sultanpur_center',
    distanceKm: 6.8,
    baseElevation: 216.0,
    isElevatedHighway: true,
    path: [
      [31.1585, 75.2078],
      [31.185, 75.202],
      [31.2146, 75.1972],
    ],
  },
];
