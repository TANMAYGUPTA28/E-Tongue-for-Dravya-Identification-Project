/**
 * HYBRID PERSISTENCE ENGINE (MONGODB + JSON FALLBACK)
 * 
 * Tries MongoDB first for all CRUD. If MongoDB is not connected,
 * falls back to local JSON file (server/data/store.json).
 * 
 * This gives you the "M" in MERN when MongoDB is available,
 * but the app still works 100% offline for hackathon demos.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  connectDB,
  getMongoStatus,
  Analysis,
  Specimen,
  User,
  Telemetry,
  AgentChat,
} from '../models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/store.json');

// Default initial assay history
const INITIAL_HISTORY = [
  {
    id: 'ET-90421', sampleName: 'Haritaki Kashayam Lot 04', batchNumber: 'BATCH-HAR-2026-A',
    category: 'Triphala / Kashayam', operator: 'Tanmay Gupta', verdict: 'Haritaki (Terminalia chebula)',
    botanicalName: 'Terminalia chebula Retz.', confidence: 96.4, status: 'VERIFIED_PURE',
    date: 'Oct 12, 2026 11:34 AM', sensorPeak: '3.22V (S6)', voltages: [0.92, 2.85, 0.42, 2.18, 0.88, 3.22],
  },
  {
    id: 'ET-90420', sampleName: 'Ashwagandha Extract Grade A', batchNumber: 'BATCH-ASH-409',
    category: 'Balya / Powder', operator: 'Dr. V. Sharma', verdict: 'Pure Ashwagandha Root',
    botanicalName: 'Withania somnifera (L.) Dunal', confidence: 97.8, status: 'VERIFIED_PURE',
    date: 'Oct 12, 2026 10:15 AM', sensorPeak: '2.78V (S4)', voltages: [0.72, 0.38, 0.45, 2.78, 1.15, 2.35],
  },
  {
    id: 'ET-90419', sampleName: 'Market Ashwagandha Sample B', batchNumber: 'BATCH-ASH-RAW-2',
    category: 'Commercial Root Powder', operator: 'Tanmay Gupta', verdict: 'Adulterated Ashwagandha (Starch Cut)',
    botanicalName: 'Commercial Adulterant', confidence: 95.2, status: 'ADULTERATION_FLAG',
    date: 'Oct 12, 2026 09:40 AM', sensorPeak: '1.85V (S1 Spike)', voltages: [1.85, 0.82, 1.65, 0.75, 0.45, 0.65],
  },
  {
    id: 'ET-90418', sampleName: 'Guduchi Stem Decoction', batchNumber: 'BATCH-GIL-118',
    category: 'Jvaraghna / Fresh Stem', operator: 'K. Patel', verdict: 'Authentic Guduchi / Giloy',
    botanicalName: 'Tinospora cordifolia (Willd.)', confidence: 99.1, status: 'VERIFIED_PURE',
    date: 'Oct 11, 2026 04:20 PM', sensorPeak: '3.12V (S4)', voltages: [0.35, 0.28, 0.42, 3.12, 1.40, 1.85],
  },
  {
    id: 'ET-90417', sampleName: 'Lakadong Turmeric Powder', batchNumber: 'BATCH-TUR-88',
    category: 'Varnya / Rhizome', operator: 'Tanmay Gupta', verdict: 'Lakadong Turmeric (Haridra)',
    botanicalName: 'Curcuma longa L.', confidence: 96.5, status: 'VERIFIED_PURE',
    date: 'Oct 11, 2026 02:10 PM', sensorPeak: '3.05V (S5)', voltages: [0.48, 0.52, 0.36, 2.45, 3.05, 1.55],
  },
  {
    id: 'ET-90416', sampleName: 'Market Turmeric Lot #9', batchNumber: 'BATCH-TUR-MKT',
    category: 'Commercial Spice', operator: 'Dr. V. Sharma', verdict: 'Adulterated Turmeric (Metanil Yellow)',
    botanicalName: 'Synthetic Azo Dye', confidence: 98.8, status: 'HAZARD_ADULTERANT',
    date: 'Oct 10, 2026 11:05 AM', sensorPeak: '3.10V (S3 Spike)', voltages: [0.32, 2.45, 3.10, 0.62, 0.85, 0.40],
  },
  {
    id: 'ET-90415', sampleName: 'Wild Forest Raw Honey', batchNumber: 'BATCH-HON-55',
    category: 'Sandhaniya / Nectar', operator: 'Tanmay Gupta', verdict: 'Natural Forest Honey (Madhu)',
    botanicalName: 'Apis dorsata Nectar', confidence: 98.2, status: 'VERIFIED_PURE',
    date: 'Oct 10, 2026 09:15 AM', sensorPeak: '2.92V (S1)', voltages: [2.92, 0.88, 0.25, 0.18, 0.35, 1.75],
  },
];

const INITIAL_SPECIMENS = [
  { lotId: 'LOT-2026-ASH-01', commonName: 'Ashwagandha', botanical: 'Withania somnifera', partUsed: 'Dry Root', origin: 'Nagaur, Rajasthan', harvestDate: '2026-09-15', solvent: 'Distilled Water (1:10)', status: 'VERIFIED' },
  { lotId: 'LOT-2026-GIL-04', commonName: 'Guduchi / Giloy', botanical: 'Tinospora cordifolia', partUsed: 'Fresh Stem', origin: 'Western Ghats, Kerala', harvestDate: '2026-09-28', solvent: 'Ethanol Decoction', status: 'VERIFIED' },
  { lotId: 'LOT-2026-TRP-08', commonName: 'Triphala Blend', botanical: 'Amalaki + Bibhitaki + Haritaki', partUsed: 'Pericarp', origin: 'Dehradun, Uttarakhand', harvestDate: '2026-08-10', solvent: 'Kashayam Decoction', status: 'VERIFIED' },
  { lotId: 'LOT-2026-TUR-12', commonName: 'Lakadong Turmeric', botanical: 'Curcuma longa', partUsed: 'Rhizome', origin: 'Jaintia Hills, Meghalaya', harvestDate: '2026-07-22', solvent: 'Hydro-alcoholic', status: 'VERIFIED' },
];

class StorageEngine {
  constructor() {
    this.history = [];
    this.specimens = [];
    this.users = [
      {
        id: 'usr_default',
        email: 'tanmay@etongue.lab',
        password: 'DravyaLab#2026!',
        name: 'Tanmay Gupta',
        role: 'Lead ML Systems Engineer',
        institution: 'Biomimetic Olfactory & Gustatory AI Lab',
        createdAt: new Date().toISOString(),
      },
    ];
    this.useMongo = false;
    this._loadJSON();
  }

  /** Try connecting to MongoDB. If success, seed initial data if empty. */
  async initMongo() {
    const connected = await connectDB();
    if (!connected) return false;
    this.useMongo = true;

    // Seed default user if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create(this.users[0]);
      console.log('[STORAGE] Seeded default analyst user to MongoDB');
    }

    // Seed history if empty
    const histCount = await Analysis.countDocuments();
    if (histCount === 0) {
      for (const h of INITIAL_HISTORY) {
        await Analysis.create({ analysisId: h.id, ...h });
      }
      console.log(`[STORAGE] Seeded ${INITIAL_HISTORY.length} initial analysis records to MongoDB`);
    }

    // Seed specimens if empty
    const specCount = await Specimen.countDocuments();
    if (specCount === 0) {
      await Specimen.insertMany(INITIAL_SPECIMENS);
      console.log(`[STORAGE] Seeded ${INITIAL_SPECIMENS.length} initial specimens to MongoDB`);
    }

    return true;
  }

  // === JSON FILE FALLBACK ===
  _loadJSON() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.history = parsed.history || INITIAL_HISTORY;
        this.specimens = parsed.specimens || INITIAL_SPECIMENS;
        if (parsed.users?.length) this.users = parsed.users;
      } else {
        this.history = [...INITIAL_HISTORY];
        this.specimens = [...INITIAL_SPECIMENS];
        this._saveJSON();
      }
    } catch {
      this.history = [...INITIAL_HISTORY];
      this.specimens = [...INITIAL_SPECIMENS];
    }
  }

  _saveJSON() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify({ history: this.history, specimens: this.specimens, users: this.users }, null, 2), 'utf-8');
    } catch (err) {
      console.error('[STORAGE] JSON save error:', err.message);
    }
  }

  // =======================================================================
  // HISTORY CRUD
  // =======================================================================
  async getHistory() {
    if (this.useMongo) {
      try {
        const docs = await Analysis.find().sort({ createdAt: -1 }).limit(200).lean();
        return docs.map(d => ({
          id: d.analysisId, sampleName: d.sampleName, batchNumber: d.batchNumber,
          category: d.category, operator: d.operator, verdict: d.verdict,
          botanicalName: d.botanicalName, confidence: d.confidence, status: d.status,
          sensorPeak: d.sensorPeak, voltages: d.voltages,
          date: d.createdAt ? new Date(d.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
        }));
      } catch (err) {
        console.error('[MONGO] getHistory error:', err.message);
      }
    }
    return this.history;
  }

  async addHistory(entry) {
    if (this.useMongo) {
      try {
        await Analysis.create({
          analysisId: entry.id || `ET-${Date.now().toString().slice(-6)}`,
          sampleName: entry.sampleName,
          batchNumber: entry.batchNumber,
          category: entry.category,
          operator: entry.operator,
          verdict: entry.verdict,
          botanicalName: entry.botanicalName,
          confidence: entry.confidence,
          status: entry.status,
          sensorPeak: entry.sensorPeak,
          voltages: entry.voltages,
          radarScores: entry.radarScores,
          probabilities: entry.probabilities,
          featureWeights: entry.featureWeights,
        });
        return entry;
      } catch (err) {
        console.error('[MONGO] addHistory error:', err.message);
      }
    }
    // JSON fallback
    this.history.unshift(entry);
    if (this.history.length > 200) this.history.pop();
    this._saveJSON();
    return entry;
  }

  // =======================================================================
  // SPECIMENS CRUD
  // =======================================================================
  async getSpecimens() {
    if (this.useMongo) {
      try {
        return await Specimen.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.error('[MONGO] getSpecimens error:', err.message);
      }
    }
    return this.specimens;
  }

  async addSpecimen(specimen) {
    if (this.useMongo) {
      try {
        await Specimen.create(specimen);
        return specimen;
      } catch (err) {
        console.error('[MONGO] addSpecimen error:', err.message);
      }
    }
    this.specimens.unshift(specimen);
    this._saveJSON();
    return specimen;
  }

  async removeSpecimen(lotId) {
    if (this.useMongo) {
      try {
        const result = await Specimen.deleteOne({ lotId });
        return result.deletedCount > 0;
      } catch (err) {
        console.error('[MONGO] removeSpecimen error:', err.message);
      }
    }
    const prevLen = this.specimens.length;
    this.specimens = this.specimens.filter((s) => s.lotId !== lotId);
    if (this.specimens.length !== prevLen) {
      this._saveJSON();
      return true;
    }
    return false;
  }

  // =======================================================================
  // USER AUTH CRUD
  // =======================================================================
  async findUserByEmail(email) {
    if (this.useMongo) {
      try {
        return await User.findOne({ email: (email || '').toLowerCase() }).lean();
      } catch (err) {
        console.error('[MONGO] findUser error:', err.message);
      }
    }
    return this.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  }

  async createUser(userData) {
    const newUser = {
      id: `usr_${Date.now().toString().slice(-6)}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    if (this.useMongo) {
      try {
        const doc = await User.create(newUser);
        return doc.toObject();
      } catch (err) {
        console.error('[MONGO] createUser error:', err.message);
      }
    }
    this.users.push(newUser);
    this._saveJSON();
    return newUser;
  }

  // =======================================================================
  // TELEMETRY LOG (MongoDB only — too high-volume for JSON)
  // =======================================================================
  async logTelemetry(packet) {
    if (!this.useMongo) return null;
    try {
      return await Telemetry.create(packet);
    } catch (err) {
      console.error('[MONGO] logTelemetry error:', err.message);
      return null;
    }
  }

  async getTelemetryHistory(limit = 100) {
    if (!this.useMongo) return [];
    try {
      return await Telemetry.find().sort({ timestamp: -1 }).limit(limit).lean();
    } catch (err) {
      console.error('[MONGO] getTelemetryHistory error:', err.message);
      return [];
    }
  }

  // =======================================================================
  // AGENT CHAT LOG
  // =======================================================================
  async logAgentChat(chatEntry) {
    if (!this.useMongo) return chatEntry;
    try {
      return await AgentChat.create(chatEntry);
    } catch (err) {
      console.error('[MONGO] logAgentChat error:', err.message);
      return chatEntry;
    }
  }

  async getAgentChatHistory(userId, limit = 50) {
    if (!this.useMongo) return [];
    try {
      const query = userId ? { userId } : {};
      return await AgentChat.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    } catch (err) {
      console.error('[MONGO] getAgentChatHistory error:', err.message);
      return [];
    }
  }

  // =======================================================================
  // DATABASE STATUS
  // =======================================================================
  getDBStatus() {
    return {
      engine: this.useMongo ? 'MongoDB (Mongoose)' : 'JSON File (Offline Fallback)',
      mongo: getMongoStatus(),
    };
  }
}

export const storage = new StorageEngine();
