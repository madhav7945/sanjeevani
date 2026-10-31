# Sanjeevani (ਸੰਜੀਵਨੀ) — Zero-Trust Mesh Threat Model & Security Defense Sheet
**CT BuildFest 2.0 · QuickHeal Academy Cyber Defense Evaluation**  
**Document Classification:** Technical Architecture & Judge Defense Cheat Sheet  

---

## 1. Executive Security Posture: "Zero-Trust Mesh"

> **The Guiding Principle:**  
> *"In a disaster zone, we assume all mesh relays are untrusted, communication channels are hostile, and power/compute resources are asymmetric. We design for survivability, admitting physical constraints rather than claiming invulnerability."*

---

## 2. The 30-Second Polished Pitch (Word-for-Word for Judges)

> *"Yes, any open wireless mesh can be attacked, so Sanjeevani treats all intermediate relays as untrusted.*
> 
> *First, **official advisories** are signed using **Ed25519** and encapsulate a strict timestamp, sequence number, and expiry window inside the signed envelope—so tampering and stale replay attacks both fail.*
> 
> *Second, **civilian SOS payloads** use authenticated encryption (**X25519 with ChaCha20-Poly1305 / AES-GCM sealed box**) keyed to the rescue authority’s public key. Relays are blind couriers: they cannot inspect, deanonymize, or flip bits in the distress packet.*
> 
> *Against **spam and battery drain**, we don't claim PoW is a silver bullet; we combine proof-of-work with per-neighbor rate limits, an exact LRU packet-hash cache, and rescue-side spatial corroboration.*
> 
> *Our known limits are RF jamming and malicious relays silently dropping packets, which we mitigate with multi-path epidemic gossip, store-carry-forward routing, and signed delivery ACKs."*

---

## 3. Threat Matrix & Detailed Countermeasures

| Threat / Attack Vector | Naive / Vulnerable Claim | Real Sanjeevani Defense (QuickHeal Grade) |
| :--- | :--- | :--- |
| **1. Sybil & Mass Spam / Battery Drain** | *"PoW makes spam computationally impossible."* (False: GPUs easily out-compute phone PoW). | **Layered Friction:**<br>1. Micro-PoW raises baseline cost.<br>2. **Per-Neighbor Token Bucket Rate Limiting** (max $N$ pkts/min per physical peer).<br>3. **Rescue-Side Spatial Corroboration:** Clustered reports in a 500m radius corroborate urgency; isolated single reports get lower dispatch priority.<br>4. **Optional Identity Binding:** Pre-bound phone numbers/SIM hash when previously online. |
| **2. Stale Advisory Replay Attack** | *"Digital signatures prevent replay."* (False: An attacker can rebroadcast a valid 6h-old 'Bridge Safe' message). | **Payload-Enclosed Temporal Bounds:**<br>The Ed25519 signed payload strictly encapsulates: `{ seq_no: u64, issued_at: u64, expires_at: u64, payload }`.<br>Clients discard any advisory where `expires_at < now` or `seq_no <= last_seen_seq`. |
| **3. SOS Eavesdropping & Tampering** | *"We encrypt with Ed25519."* (Cryptographic mistake: Ed25519 is signatures only). | **Authenticated Sealed Box (AEAD):**<br>**X25519 Diffie-Hellman + ChaCha20-Poly1305** (or AES-256-GCM).<br>Relays are blind couriers. Bit-flipping causes AEAD tag verification failure, causing immediate drop before reaching dispatchers. |
| **4. Citizen Report Sybil Infiltration** | *"A signed SOS proves the citizen is authentic."* (False: Anyone can generate an asymmetric keypair). | **Integrity $\neq$ Identity:**<br>Citizen signatures prove *packet immutability*, not civilian truthfulness.<br>Anti-Sybil uses **3-Peer Spatial Consensus Quorum** (3 distinct device signatures within 500m in a 15-minute window) + Groq Vision physical feature extraction. |
| **5. Duplicate Storms & False Drops** | *"Bloom filters catch all duplicates."* (False: Bloom filters have false positives that can drop real SOS). | **Exact LRU Packet-Hash Cache:**<br>Packets are compact ($\approx 256$ bytes). Devices maintain an **LRU Cache of exact 32-byte Blake2b/SHA-256 packet hashes** for the active epoch ($0\%$ false positive rate, drops seen packets in $<0.002$ ms). |
| **6. Blackhole / Packet Dropping Attack** | *Assuming relays will honestly forward packets.* | **Multi-Path Epidemic Gossip + Store-Carry-Forward:**<br>Packets broadcast to $k$ random neighbors ($k=3$). If an area is disconnected, nodes store packets in local flash and forward when encountering a new peer (DTN). Reverse signed ACKs confirm receipt. |
| **7. BLE Stalking & Traffic Analysis** | *Static Bluetooth MAC addresses allow physical tracking.* | **Ephemeral Hardware Privacy:**<br>Uses standard OS-level **Resolving Private Addresses (RPA)** that rotate BLE MAC addresses every 15 minutes, with rolling ephemeral payload IDs. |

---

## 4. Rapid-Fire Judge Q&A Cheat Sheet

### Q1: *"How do villagers get the rescue team's public key if all internet and cellular towers are down?"*
> **Answer:**  
> *"Public keys are pre-provisioned directly inside the Sanjeevani PWA/application bundle during initial installation. For uninstalled users arriving at staging camps, keys and offline PWA assets are distributed locally via zero-data Wi-Fi Direct hotspots, QR codes printed on physical bulletin boards, and offline emergency SMS broadcast templates."*

### Q2: *"What happens if a rescue officer's phone is captured or stolen in the field?"*
> **Answer:**  
> *"First, rescue keys are stored in the device's hardware Secure Enclave / Android Keystore, requiring biometric/PIN authorization. Second, our key management includes a `Key-ID` header and an emergency **Key Revocation Certificate** signed by the District Magistrate's master authority key. The revocation packet is flooded across the mesh to immediately invalidate that key ID across all nodes."*

### Q3: *"Why not just rely on satellite internet (like Starlink) instead of peer-to-peer mesh?"*
> **Answer:**  
> *"Satellite terminals cost \$500+, require line-of-sight to the sky (which fails under heavy monsoon cloudbursts and dense village tree canopies), and draw 50–100W of continuous power. In rural Punjab floods, power grids fail for days. Sanjeevani works on existing \$80 smartphones using low-energy Bluetooth (BLE) and Wi-Fi Direct without requiring a single rupee of new infrastructure."*

### Q4: *"If nodes use store-carry-forward, how do you prevent local device storage from filling up?"*
> **Answer:**  
> *"Packets have a strict Time-To-Live (TTL = 6 hops or 3 hours). The local emergency buffer is capped at 5 MB (storing over 15,000 compressed SOS envelopes). When the buffer is full, an LRU eviction policy automatically drops expired packets, prioritizing unacknowledged SOS beacons over general telemetry."*

---

## 5. Summary Table for Presentation Slide / Appendix

```
[Citizen Phone] 
       │  (Encrypted via X25519 Sealed Box)
       ▼
 [Blind Relay 1]  ──(Multi-Path Gossip)──►  [Blind Relay 2] (Store-Carry-Forward)
       │                                           │
       ▼                                           ▼
[LRU Hash Deduplication]                  [LRU Hash Deduplication]
       │                                           │
       └───────────────────┬───────────────────────┘
                           ▼
               [Rescue Base Station / NDRF]
               - Unseals with Private Key
               - Verifies Spatial Corroboration
               - Broadcasts Ed25519 Signed ACK
```