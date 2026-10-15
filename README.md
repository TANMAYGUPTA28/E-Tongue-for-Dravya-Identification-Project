# DRAVYA 6000: Intelligent Ayurvedic Electronic Tongue Workstation

DRAVYA 6000 is an automated chemometrics quality-control workstation designed for analytical chemists, AYUSH laboratory technicians, and regulatory inspectors. It transforms 6-channel lipid/conductive-polymer potentiometric sensor array readings into instant botanical authenticity certifications and flags adulterations before botanical raw materials reach drug formulations.

---

## Run Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 2. Environment Setup
Copy the example environment configuration to `.env`:
```bash
cp .env.example .env
```
Ensure the default configuration variables are set:
- `PORT=5000`
- `CLIENT_URL=http://localhost:5173`
- `JWT_ACCESS_SECRET=your_secure_hmac_secret_key`
- `VITE_API_BASE_URL=/api`

### 3. Install Dependencies
```bash
npm install
```

### 4. Train & Verify Machine Learning Artifacts
To train the Random Forest ensemble and generate reproducible evaluation metrics (`server/data/trained_forest.json` and `server/data/metrics.json`):
```bash
npm run model:train
```

### 5. Launch Full-Stack Application
Start both the Express backend API and the Vite frontend dev server concurrently:
```bash
npm run dev
```

### 6. Default Access URLs
- **Frontend Workstation**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5000`
- **Health Check Status**: `http://localhost:5000/health` or `http://localhost:5000/api/health`

---

## How It Works

- **Data Source & Reference Ranges**: Calibrated potentiostat response datasets derived from Ayurvedic Pharmacopoeia of India (API) monographs (`server/data/referenceRanges.json`) for 6 target specimens: Turmeric, Ashwagandha, Haritaki, Guduchi, Amalaki, and Tulsi.
- **Sensors**: 6-channel cross-reactive potentiostat array measuring equilibrium potentials (0.00V to 3.30V) across biomimetic transducers: S1 (Lipid / Neutral Glycosides), S2 (Conductive PANI / Organic Acids), S3 (Chitosan / Electrolytes), S4 (Phthalocyanine / Alkaloids), S5 (Crown Ether / Volatiles), and S6 (Ruthenium Oxide / Tannins).
- **Processing**: Test sessions ignore probe immersion settling time (first 3 samples), eliminate noise via Exponential Moving Average (EMA, $\alpha=0.35$), and filter spikes using Median Absolute Deviation (MAD, $3.0 \times 1.4826 \times \text{MAD}$). Baseline blank tare is subtracted per channel.
- **Scoring**: Transparent range-overlap metric compares cleaned potentials against API reference bands, yielding Pass ($\ge 85\%$), Borderline ($70-84\%$), or Fail ($< 70\%$). Evaluated Random Forest ensemble models provide verified multi-class classification and transparent plain-English factors.
- **Quality Flags & Limitations**: System flags "Sensor not connected" when all channels flatline, "Unstable reading, please retest" on excessive signal variance, and "Not enough data yet" if fewer than 8 post-warmup readings are recorded. Laboratory reference standards assume thermal equilibrium ($25^\circ\text{C}$).

---

## User Authentication & Domain Whitelisting

The workstation restricts registration to verified laboratory and academic domains:
- Allowed email providers: `@gmail.com`, `@yahoo.com`
- Academic / Institutional domains: `.edu`, `.edu.in`, `.ac.in`
- Internal lab testing: `@etongue.lab`
- Disposable / fake email domains (`mailinator.com`, `tempmail.com`, etc.) are blocked.
- One-Time Password (OTP) verification with 5-minute TTL and 4-attempt rate-limiting.
- Cryptographically signed HMAC-SHA256 JWT bearer tokens for secure session access.

---

## Architecture Overview

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     ESP32-S3 IoT Hardware       │       │    React 18 Laboratory UI       │
│  (6-channel Potentiostat SAR)   │       │  (Vite + Tailwind + Recharts)   │
└──────────────┬──────────────────┘       └──────────────┬──────────────────┘
               │                                         │
               │ POST /api/iot/telemetry                 │ REST / SSE
               ▼                                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        Express Node.js Backend Server                     │
│  - JWT Bearer Authentication & OTP Rate Limiter                           │
│  - Random Forest Chemometrics Inference (trained_forest.json)             │
│  - Mongoose / JSON Persistent Storage                                     │
│  - Real Held-out Metrics Service (/api/model/metrics)                     │
└───────────────────────────────────────────────────────────────────────────┘
```
