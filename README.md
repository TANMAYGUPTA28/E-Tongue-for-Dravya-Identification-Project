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

- **Data Source**: Calibrated potentiostat response dataset derived from Ayurvedic Pharmacopoeia of India (API) reference monographs and laboratory standards (n=240 reference profiles across 8 botanical classes).
- **Features**: 6 cross-sensitive electrochemical potentiometric potentials (0.00V to 3.30V) mapped to Ayurvedic Shad-Rasa channels: S1 (Madhura / Lipid Membrane), S2 (Amla / Polyaniline), S3 (Lavana / Chitosan Matrix), S4 (Tikta / Phthalocyanine), S5 (Katu / Crown Ether), and S6 (Kashaya / Ruthenium Oxide).
- **Algorithm**: Supervised Random Forest Classifier with ensemble bagging (24 estimators, maximum tree depth of 4, subspace feature selection $m = \sqrt{6} \approx 2$).
- **Evaluation Method**: Stratified 75% train / 25% test split paired with 5-fold cross-validation. The held-out test evaluation achieved 100% test accuracy and a macro F1-score of 1.0 on calibrated reference standards, persisted to `server/data/metrics.json`.
- **Limitations**: The current training dataset represents calibrated laboratory reference standards under controlled thermal conditions ($25^\circ\text{C}$). Extreme room temperature fluctuations or uncalibrated electrode drift will require automated zeroing (Tare) prior to sample insertion.

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
