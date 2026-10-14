# E-TONGUE: DRAVYA IDENTIFICATION SYSTEM
## Official REST & WebSocket API Specification (Contract v1.0)

**Base URL**: `http://localhost:5000/api`  
**WebSocket URL**: `ws://localhost:5000/live`  
**Content-Type**: `application/json`  
**Authentication**: Bearer JWT (`Authorization: Bearer <token>`)

---

### 1. Authentication Endpoints

#### `POST /api/auth/register`
Creates a new laboratory analyst or auditor account.

- **Request Body**:
  ```json
  {
    "name": "Dr. Tanmay Gupta",
    "email": "analyst@etongue.lab",
    "password": "StrongPassword#2026",
    "role": "Senior Chemometrician",
    "institution": "AYUSH Analytical QC Wing"
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "message": "Analyst registered successfully",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "670c5b3e18a9",
        "name": "Dr. Tanmay Gupta",
        "email": "analyst@etongue.lab",
        "role": "Senior Chemometrician",
        "institution": "AYUSH Analytical QC Wing"
      }
    }
    ```
  - `400 Bad Request`: Email already exists or missing required fields.

---

#### `POST /api/auth/login`
Authenticates analyst credentials and issues a JWT token.

- **Request Body**:
  ```json
  {
    "email": "analyst@etongue.lab",
    "password": "StrongPassword#2026"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "670c5b3e18a9",
        "name": "Dr. Tanmay Gupta",
        "email": "analyst@etongue.lab",
        "role": "Senior Chemometrician"
      }
    }
    ```
  - `401 Unauthorized`: Invalid email or password.

---

### 2. Sample Ingestion & History Endpoints

#### `POST /api/samples`
Saves fresh multi-channel sensor readings from the hardware AFE or virtual bench.

- **Request Body**:
  ```json
  {
    "dravyaId": "haritaki",
    "specimenName": "Haritaki (Terminalia chebula)",
    "batchNumber": "ET-2026-092",
    "readings": {
      "S1_lipid": 0.922,
      "S2_pani": 2.851,
      "S3_chitosan": 0.421,
      "S4_phthalocyanine": 2.180,
      "S5_crown_ether": 0.884,
      "S6_ruthenium_oxide": 3.220
    },
    "auxiliary": {
      "pH": 6.82,
      "tds": 412,
      "turbidity": 18.4,
      "temperature": 25.2,
      "orp": -142
    },
    "metadata": {
      "operator": "Dr. Tanmay Gupta",
      "lab": "IIT Delhi Bio-Instrumentation Core",
      "tareOffset": 0.0012
    }
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "sampleId": "670c5e9f21b4",
      "timestamp": "2026-10-14T05:45:00.000Z",
      "sha256": "8f4b2a9e7123c5d8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
      "message": "Sample readings persisted to MongoDB Atlas"
    }
    ```

---

#### `GET /api/samples?page=1&limit=10&dravya=tulsi`
Retrieves paginated sample records with optional filtering by botanical specimen name or category.

- **Query Parameters**:
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `10`, max: `100`)
  - `dravya`: Filter by Dravya key/name (e.g. `tulsi`, `haritaki`, `ashwagandha`)
  - `status`: Optional filter (`pure`, `adulterated`, `inconclusive`)
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalRecords": 389,
        "totalPages": 39
      },
      "samples": [
        {
          "_id": "670c5e9f21b4",
          "batchNumber": "ET-2026-092",
          "specimenName": "Haritaki (Terminalia chebula)",
          "predictedDravya": "Haritaki",
          "confidence": 98.4,
          "isAdulterated": false,
          "createdAt": "2026-10-14T05:45:00.000Z",
          "sha256": "8f4b2a9e7123..."
        }
      ]
    }
    ```

---

#### `GET /api/samples/:id`
Retrieves a single sample by its unique MongoDB Object ID with full potentiostatic vector curves.

- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "sample": {
        "_id": "670c5e9f21b4",
        "batchNumber": "ET-2026-092",
        "specimenName": "Haritaki (Terminalia chebula)",
        "readings": {
          "S1_lipid": 0.922,
          "S2_pani": 2.851,
          "S3_chitosan": 0.421,
          "S4_phthalocyanine": 2.180,
          "S5_crown_ether": 0.884,
          "S6_ruthenium_oxide": 3.220
        },
        "radarProfile": {
          "madhura": 25,
          "amla": 88,
          "lavana": 15,
          "tikta": 78,
          "katu": 35,
          "kashaya": 94
        },
        "mlInference": {
          "predictedClass": "Haritaki",
          "confidence": 98.4,
          "top3": [
            { "name": "Haritaki", "probability": 98.4 },
            { "name": "Bibhitaki", "probability": 1.2 },
            { "name": "Amalaki", "probability": 0.4 }
          ],
          "adulterantSignature": "None detected (<0.01% anomaly)"
        },
        "sha256": "8f4b2a...",
        "createdAt": "2026-10-14T05:45:00.000Z"
      }
    }
    ```
  - `404 Not Found`: Sample ID does not exist.

---

### 3. Machine Learning Inference Endpoint

#### `POST /api/predict`
Feeds raw 6-channel potential vectors to the Random Forest ensemble and returns the predicted Dravya, confidence, and top-3 candidates.

- **Request Body**:
  ```json
  {
    "voltages": [0.722, 0.384, 0.450, 2.777, 1.151, 2.352],
    "auxiliary": {
      "pH": 6.82,
      "tds": 412,
      "temperature": 25.0
    }
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "dravya": "Ashwagandha",
      "botanicalName": "Withania somnifera (L.) Dunal",
      "confidence": 97.8,
      "top3": [
        { "name": "Ashwagandha", "confidence": 97.8 },
        { "name": "Shatavari", "confidence": 1.4 },
        { "name": "Bala", "confidence": 0.8 }
      ],
      "radarScores": [22, 12, 14, 86, 38, 76],
      "adulterationFlag": false,
      "anomalyScore": 0.014,
      "inferenceTimeMs": 8.4
    }
    ```

---

### 4. Dravya Pharmacopoeia Knowledge Base

#### `GET /api/dravya`
Retrieves the list of all 42+ standardized Ayurvedic Dravya reference monographs.

- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "count": 42,
      "dravyas": [
        {
          "id": "ashwagandha",
          "sanskrit": "अश्वगंधा",
          "hindi": "अश्वगंधा",
          "english": "Winter Cherry / Indian Ginseng",
          "botanical": "Withania somnifera (L.) Dunal",
          "category": "Balya / Rasayana",
          "primaryRasa": "Tikta (Bitter), Kashaya (Astringent)",
          "purityBenchmark": 97.8
        }
      ]
    }
    ```

---

#### `GET /api/dravya/:id`
Retrieves detailed pharmacopoeial specs, active phytochemicals, Rasa-Guna profile, and standard voltammogram for a specific Dravya.

- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "dravya": {
        "id": "haritaki",
        "sanskrit": "हरीतकी",
        "botanical": "Terminalia chebula Retz.",
        "activeMolecules": ["Chebulagic acid", "Chebulinic acid", "Ellagic acid"],
        "nominalVoltages": [0.92, 2.85, 0.42, 2.18, 0.88, 3.22],
        "standardRadar": [25, 88, 15, 78, 35, 94],
        "typicalAdulterants": ["Immature galls", "Exhausted tannin marc"],
        "doshaEffect": "Tridosha Shamaka"
      }
    }
    ```

---

### 5. Regulatory Report Export

#### `GET /api/reports/:id/pdf`
Generates and streams an ISO-17025 compliant analytical assay certificate in PDF format.

- **Response Headers**:
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename="E-Tongue_Assay_ET-2026-092.pdf"`

---

### 6. Real-Time Streaming (WebSocket)

#### `WS /live`
High-speed bi-directional WebSocket stream for live potentiostat readings (250 S/s).

- **Client Connection**: `ws://localhost:5000/live`
- **Server Broadcast Message (JSON)**:
  ```json
  {
    "type": "TELEMETRY_FRAME",
    "timestamp": 1728884700123,
    "channels": {
      "WE1": 0.722,
      "WE2": 0.384,
      "WE3": 0.450,
      "WE4": 2.777,
      "WE5": 1.151,
      "WE6": 2.352
    },
    "status": "STREAMING",
    "tare": 0.001
  }
  ```
- **Client Control Messages**:
  - `{ "action": "TARE" }` -> Resets baseline offset to 0.000V.
  - `{ "action": "SET_SAMPLE", "dravyaId": "haritaki" }` -> Ingests reference profile.
