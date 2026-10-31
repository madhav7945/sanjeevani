// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: July 8-11, 2023 Punjab Flood Replay Dataset (Sutlej/Beas/Ghaggar)

export interface FloodReplayStep {
  stepIndex: number;
  label: string; // e.g. "T-72h"
  dateFormatted: string; // e.g. "08 Jul 2023, 08:00 AM"
  hoursToHistoricalBreach: number;
  bhakraDamDischargeCusecs: number; // Normal: ~35,000, Peak: 1,95,000
  pongDamDischargeCusecs: number;
  kaushalyaDamDischargeCusecs: number;
  phillaurGaugeMeters: number; // Normal: 232.0m, Danger: 234.6m
  harikeDownstreamCusecs: number;
  catchmentRainfall24hMm: number; // IMD precipitation
  sutlejWaterLevelRelative: number; // Relative river rise in meters
  beasWaterLevelRelative: number;
  ghaggarWaterLevelRelative: number;
  systemAlertHeadline: {
    en: string;
    pa: string;
  };
  keyEventDescription: {
    en: string;
    pa: string;
  };
  blockedRoadSegments: string[]; // Segment IDs that become submerged at this step
  evacuationBroadcast?: boolean;
}

export const FLOOD_REPLAY_2023: FloodReplayStep[] = [
  {
    stepIndex: 0,
    label: 'T-72h (Early Watch)',
    dateFormatted: '08 Jul 2023, 08:00 AM',
    hoursToHistoricalBreach: 72,
    bhakraDamDischargeCusecs: 38000,
    pongDamDischargeCusecs: 28000,
    kaushalyaDamDischargeCusecs: 4500,
    phillaurGaugeMeters: 232.4,
    harikeDownstreamCusecs: 42000,
    catchmentRainfall24hMm: 185,
    sutlejWaterLevelRelative: 0.6,
    beasWaterLevelRelative: 0.4,
    ghaggarWaterLevelRelative: 0.8,
    systemAlertHeadline: {
      en: 'YELLOW ALERT: Heavy Upper Catchment Downpour & Inflow Spike',
      pa: 'ਪੀਲਾ ਅਲਰਟ: ਹਿਮਾਚਲ ਕੈਚਮੈਂਟ ਖੇਤਰ ਵਿੱਚ ਭਾਰੀ ਮੀਂਹ ਅਤੇ ਪਾਣੀ ਦੀ ਆਮਦ ਸ਼ੁਰੂ',
    },
    keyEventDescription: {
      en: 'BBMB notifies potential spillway opening. Inflow into Gobind Sagar reaches 2,80,000 cusecs. Sanjeevani flags low-lying floodplains.',
      pa: 'ਭਾਖੜਾ ਬਿਆਸ ਮੈਨੇਜਮੈਂਟ ਬੋਰਡ ਨੇ ਪਾਣੀ ਛੱਡਣ ਦੀ ਚੇਤਾਵਨੀ ਦਿੱਤੀ। ਸੰਜੀਵਨੀ ਨੇ ਹੇਠਲੇ ਇਲਾਕਿਆਂ ਲਈ ਚੌਕਸੀ ਜਾਰੀ ਕੀਤੀ।',
    },
    blockedRoadSegments: [],
  },
  {
    stepIndex: 1,
    label: 'T-48h (Prepare & Pack)',
    dateFormatted: '09 Jul 2023, 08:00 AM',
    hoursToHistoricalBreach: 48,
    bhakraDamDischargeCusecs: 112000,
    pongDamDischargeCusecs: 78000,
    kaushalyaDamDischargeCusecs: 12000,
    phillaurGaugeMeters: 233.8,
    harikeDownstreamCusecs: 115000,
    catchmentRainfall24hMm: 240,
    sutlejWaterLevelRelative: 1.8,
    beasWaterLevelRelative: 1.4,
    ghaggarWaterLevelRelative: 1.9,
    systemAlertHeadline: {
      en: 'ORANGE ADVISORY: 1.12 Lakh Cusecs Released from Bhakra',
      pa: 'ਸੰਤਰੀ ਚੇਤਾਵਨੀ: ਭਾਖੜਾ ਡੈਮ ਤੋਂ 1.12 ਲੱਖ ਕਿਊਸਿਕ ਪਾਣੀ ਛੱਡਿਆ ਗਿਆ',
    },
    keyEventDescription: {
      en: 'Spillway water transit reaches Ropar/Phillaur corridor. 46 hours before 2023 breach, Sanjeevani triggers village-level evacuation preparation for Lohian & Gidderpindi.',
      pa: 'ਸਤਲੁਜ ਵਿੱਚ ਪਾਣੀ ਦਾ ਪੱਧਰ ਤੇਜ਼ੀ ਨਾਲ ਵਧ ਰਿਹਾ ਹੈ। ਸੰਜੀਵਨੀ ਵੱਲੋਂ ਲੋਹੀਆਂ ਅਤੇ ਗਿੱਦੜਪਿੰਡੀ ਦੇ ਪਿੰਡ ਵਾਸੀਆਂ ਨੂੰ ਸੁਰੱਖਿਅਤ ਸਥਾਨਾਂ ਤੇ ਜਾਣ ਦੀ ਤਿਆਰੀ ਦੀ ਸਲਾਹ।',
    },
    blockedRoadSegments: ['road_lohian_makhu_low'],
  },
  {
    stepIndex: 2,
    label: 'T-24h (Mandatory Evacuation)',
    dateFormatted: '10 Jul 2023, 08:00 AM',
    hoursToHistoricalBreach: 24,
    bhakraDamDischargeCusecs: 195000,
    pongDamDischargeCusecs: 140000,
    kaushalyaDamDischargeCusecs: 26000,
    phillaurGaugeMeters: 235.2, // Exceeds danger mark (234.6m)
    harikeDownstreamCusecs: 245000,
    catchmentRainfall24hMm: 310,
    sutlejWaterLevelRelative: 3.1,
    beasWaterLevelRelative: 2.6,
    ghaggarWaterLevelRelative: 3.4,
    systemAlertHeadline: {
      en: 'RED EMERGENCY: Water Above Danger Mark — Immediate Evacuation',
      pa: 'ਲਾਲ ਸੰਕਟਕਾਲੀਨ ਚੇਤਾਵਨੀ: ਪਾਣੀ ਖ਼ਤਰੇ ਦੇ ਨਿਸ਼ਾਨ ਤੋਂ ਉੱਪਰ — ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਕੈਂਪਾਂ ਵਿੱਚ ਜਾਓ',
    },
    keyEventDescription: {
      en: 'Sutlej overtops banks near Phillaur. Water column moving toward Lohian Khas bowl. Voice alerts dispatched in Punjabi. Roads still dry for next 18 hours!',
      pa: 'ਫਿਲੌਰ ਕੋਲ ਪਾਣੀ ਖ਼ਤਰੇ ਦੇ ਨਿਸ਼ਾਨ ਤੋਂ ਪਾਰ। ਲੋਹੀਆਂ ਖਾਸ ਵੱਲ ਤੇਜ਼ ਵਹਾਅ। ਪਿੰਡਾਂ ਵਿੱਚ ਪੰਜਾਬੀ ਆਵਾਜ਼ੀ ਚੇਤਾਵਨੀਆਂ ਜਾਰੀ। ਸੜਕਾਂ ਸੁੱਕੀਆਂ ਹਨ, ਤੁਰੰਤ ਨਿਕਲੋ!',
    },
    blockedRoadSegments: ['road_lohian_makhu_low', 'road_gidderpindi_causeway'],
  },
  {
    stepIndex: 3,
    label: 'T-12h (Citizen Breach Report)',
    dateFormatted: '10 Jul 2023, 08:00 PM',
    hoursToHistoricalBreach: 12,
    bhakraDamDischargeCusecs: 185000,
    pongDamDischargeCusecs: 135000,
    kaushalyaDamDischargeCusecs: 21000,
    phillaurGaugeMeters: 235.4,
    harikeDownstreamCusecs: 260000,
    catchmentRainfall24hMm: 190,
    sutlejWaterLevelRelative: 3.4,
    beasWaterLevelRelative: 2.8,
    ghaggarWaterLevelRelative: 3.6,
    systemAlertHeadline: {
      en: 'CRITICAL ALERT: Advance Seepage & Road Cut Reported at Mandala',
      pa: 'ਨਾਜ਼ੁਕ ਚੇਤਾਵਨੀ: ਮੰਡਾਲਾ ਛੰਨਾ ਕੋਲ ਧੁੱਸੀ ਬੰਨ੍ਹ ਚੋਂ ਪਾਣੀ ਰਿਸਣ ਅਤੇ ਸੜਕ ਟੁੱਟਣ ਦੀ ਰਿਪੋਰਟ',
    },
    keyEventDescription: {
      en: 'Local resident uploads verified breach photo. Sanjeevani Vision validates 94% confidence hazard and reroutes all evacuation paths onto Elevated State Highway 25.',
      pa: 'ਸਥਾਨਕ ਨਾਗਰਿਕ ਵੱਲੋਂ ਧੁੱਸੀ ਬੰਨ੍ਹ ਦੀ ਫੋਟੋ ਅਪਲੋਡ। AI ਨੇ ਜਾਂਚ ਕਰਕੇ ਸੁਰੱਖਿਅਤ ਰੂਟ ਨੂੰ ਸਟੇਟ ਹਾਈਵੇ 25 ਵੱਲ ਬਦਲ ਦਿੱਤਾ।',
    },
    blockedRoadSegments: ['road_lohian_makhu_low', 'road_gidderpindi_causeway', 'road_mandala_channa_bundh'],
  },
  {
    stepIndex: 4,
    label: 'T-0h (Historical 2023 Breach)',
    dateFormatted: '11 Jul 2023, 06:00 AM',
    hoursToHistoricalBreach: 0,
    bhakraDamDischargeCusecs: 160000,
    pongDamDischargeCusecs: 120000,
    kaushalyaDamDischargeCusecs: 18000,
    phillaurGaugeMeters: 234.9,
    harikeDownstreamCusecs: 275000,
    catchmentRainfall24hMm: 60,
    sutlejWaterLevelRelative: 3.6,
    beasWaterLevelRelative: 3.0,
    ghaggarWaterLevelRelative: 3.8,
    systemAlertHeadline: {
      en: 'BREACH IMMINENT: Dhussi Bandh Breaks at Mandala Channa',
      pa: 'ਬੰਨ੍ਹ ਟੁੱਟਿਆ: ਮੰਡਾਲਾ ਛੰਨਾ ਨੇੜੇ ਧੁੱਸੀ ਬੰਨ੍ਹ ਵਿੱਚ ਪਾੜ ਪਿਆ — ਇਲਾਕਾ ਜਲਮਗਨ',
    },
    keyEventDescription: {
      en: 'Historical 2023 disaster event. Without Sanjeevani, villagers were caught stranded on rooftops. With Sanjeevani, all 14,000 residents were evacuated 46 hours ahead.',
      pa: '2023 ਦਾ ਇਤਿਹਾਸਕ ਹੜ੍ਹ। ਸੰਜੀਵਨੀ ਐਪ ਰਾਹੀਂ ਲੋਕ 46 ਘੰਟੇ ਪਹਿਲਾਂ ਹੀ ਰਾਹਤ ਕੈਂਪਾਂ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਪਹੁੰਚ ਚੁੱਕੇ ਸਨ।',
    },
    blockedRoadSegments: [
      'road_lohian_makhu_low',
      'road_gidderpindi_causeway',
      'road_mandala_channa_bundh',
      'road_sultanpur_mand_low',
    ],
  },
];
