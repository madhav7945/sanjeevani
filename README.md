# Sanjeevani (ਸੰਜੀਵਨੀ) — Autonomous Flood Early-Warning & Village Evacuation Advisor

**Problem Statement:** CTBF-AI-12 · Flood Early-Warning and Village Evacuation Advisor  
**Track:** Theme 1 — AI & Intelligent Systems · **Category:** Software · **Theme:** Disaster Management & Climate Resilience  
**Hackathon:** CT BuildFest 2.0 (30-Hour Coding Hackathon · 30–31 October 2026 · CT Group of Institutions, Maqsudan, Jalandhar)  
**Organizer:** CT Group of Institutions, powered by QuickHeal Academy, in association with ISTE.

---

## 1. Problem Context & Purpose

Recent monsoonal floods along the **Sutlej, Beas, and Ghaggar rivers** in Punjab (particularly July–August 2023) devastated villages across Jalandhar, Kapurthala, Ferozepur, and Patiala (such as Lohian Khas, Gidderpindi, Shahkot Bet, and Moonak Bet). Evacuation orders often arrived after the *Dhussi Bandh* had already breached, trapping families, cattle, and tractors on rooftops.

**Sanjeevani (ਸੰਜੀਵਨੀ)** is a pure, mobile-first citizen evacuation advisor that predicts village inundation risk **24 to 72 hours in advance** by coupling Bhakra/Pong dam discharge logs, CWC river gauge benchmarks, and IMD catchment rainfall forecasts with a 30m Digital Elevation Model (DEM). It provides dynamic Dijkstra safe evacuation routing away from submerged roads, vernacular voice broadcasts in authentic Punjabi Gurmukhi via Groq Llama 3.3 70B, and AI vision verification of crowdsourced embankment breaches.

---

## 2. Core Capabilities & Architecture

1. **Hydrologic Lag-Time 24–72h Inundation Predictor:**
   - Incorporates transit lag time (~26 hours from Nangal/Bhakra spillway to the Lohian Khas basin).
   - Generates four distinct operational stages: 🟢 Safe $\to$ 🟡 72h Early Watch $\to$ 🟠 48h Preparation $\to$ 🔴 24h Mandatory Evacuation.

2. **Elevation-Aware Dijkstra Safe Route Pathfinder:**
   - Evaluates road networks across Jalandhar and Kapurthala.
   - Automatically excludes submerged link roads and dynamically reroutes villagers onto elevated state highways (e.g., State Highway 25).
   - Calculates travel times for tractors, walking, and light vehicles to designated relief camps (Govt Senior Secondary Schools, Gurdwaras).

3. **Hyper-Localized Vernacular Punjabi Audio Engine:**
   - Synthesizes situational, urgent advisories in Gurmukhi via Groq Llama 3.3 70B.
   - Speaks aloud via Web Speech API (`pa-IN`) with tactile audio controls for rural and elderly citizens.
   - Generates compressed <140 character SMS templates with one-tap WhatsApp sharing for 2G cellular connectivity.

4. **Crowdsourced Embankment Breach Verification with Groq Vision:**
   - Allows residents to snap or upload photos of broken bundhs or waterlogged roads.
   - Groq Llama 3.2 Vision inspects the image for physical indicators of flooding to prevent spam and automatically marks the affected road segment as impassable.

5. **2023 Historical Replay Proof (The Expected Solution):**
   - An interactive time-slider (July 8–11, 2023) demonstrating how Sanjeevani warned villages **+36 to +46 hours before the historical Dhussi Bandh breach**.

---

## 3. UI/UX Design System: Clean White & Emerald Neumorphism

Built according to strict enterprise & clinical UI standards:
- **Base Canvas:** Soft matte off-white (`#F8FAFC`).
- **Elevated Surfaces:** Pure white (`#FFFFFF`) with subtle 1px borders (`#E2E8F0`) and ultra-diffuse dual drop shadows.
- **Accents:** Muted clinical emerald (`#059669`) and soft mint pills (`#ECFDF5`).
- **Zero Vibe-Coding:** Strictly bans neon glows, emojis as button icons, and cartoon animations.
- **Desktop Simulator:** Centered in an ergonomic 420px mobile viewport frame with an interactive QR code widget allowing hackathon judges to scan and run the app on their personal smartphones.

---

## 4. AI and Open-Source Attribution (Mandatory Page 23 Policy)

| Type | Official Citation (Name, Version/Model, Licence, Link, How Used) |
| :--- | :--- |
| **Open-source library** | Next.js (Vercel), v14.2, MIT, https://github.com/vercel/next.js: Frontend mobile PWA architecture and Next.js serverless API routes. |
| **Open-source library** | React-Leaflet & Leaflet, v4.2.1 / v1.9.4, BSD-2-Clause, https://github.com/PaulLeCam/react-leaflet: Interactive GIS flood mapping, risk boundary buffers, and dynamic Dijkstra routing polylines. |
| **Open-source library** | Lucide React, v0.453, ISC, https://github.com/lucide-icons/lucide: Accessible, calibrated SVG icon primitives with 2px stroke width. |
| **AI model in product** | Llama 3.3 70B (`llama-3.3-70b-versatile`, Meta via Groq Cloud API), Llama 3.3 Community Licence, console.groq.com: Generates village-specific vernacular Punjabi Gurmukhi emergency voice scripts and 140-character 2G SMS advisories. |
| **AI model in product** | Llama 3.2 11B Vision (`meta-llama/llama-3.2-11b-vision-preview`, Meta via Groq Cloud API), Llama 3.2 Licence, console.groq.com: Multimodal verification of citizen-submitted floodwater and embankment breach photos against spam. |
| **AI tool used to build** | Gemini & Antigravity (Google), accessed via IDE/Web: Assisted in mobile app architecture, Next.js component scaffolding, and Punjabi translation templates; reviewed and modified by the team. |
| **Dataset** | CWC India-WRIS & BBMB July 2023 Flood Historical Benchmark & NASA SRTM 30m Digital Elevation Model (DEM), Open Government Data India (data.gov.in) / NASA: Hydrological discharge logs, river gauge thresholds, and village elevation benchmarks. |

---

## 6. Cybersecurity & Zero-Trust Mesh Defense (QuickHeal Track Evaluation)

In disaster scenarios with zero cellular or electrical infrastructure, Sanjeevani deploys a **Zero-Trust Delay-Tolerant Mesh Protocol** (BLE & Wi-Fi Direct) audited against adversarial interference:
- **Official Authority Authenticity:** Official dam alerts and dynamic road closures are cryptographically signed using **Ed25519**, strictly encapsulating monotonically increasing sequence numbers and expiry timestamps inside the signed payload to defeat stale replay attacks.
- **SOS Confidentiality & Integrity:** Civilian distress beacons are sealed using **authenticated encryption (X25519 + ChaCha20-Poly1305 / AES-256-GCM)** targeted to rescue authority public keys. Intermediate relay nodes act as blind couriers with zero read or bit-flipping capabilities.
- **Denial-of-Service & Battery Protection:** Multi-layered defense pairing micro Proof-of-Work, per-neighbor token bucket rate limits, exact 32-byte Blake2b hash LRU deduplication caches (zero false positives), and rescue-side spatial corroboration.
- **Resilience to Dropping & Partitions:** Multi-path epidemic gossip ($k=3$), store-carry-forward delay-tolerant routing, rotating ephemeral BLE MAC addresses, and signed delivery ACKs.
- *Detailed Threat Model & QuickHeal Judge Defense Matrix:* see [SECURITY_DEFENSE_CHEAT_SHEET.md](file:///E:/sanjeevani-app/SECURITY_DEFENSE_CHEAT_SHEET.md).

---

## 7. Local Setup & Testing

```bash
# 1. Navigate to directory
cd E:\sanjeevani-app

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```
