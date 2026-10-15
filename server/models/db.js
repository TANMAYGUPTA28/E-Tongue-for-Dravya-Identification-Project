/**
 * MONGODB CONNECTION & MONGOOSE MODELS
 * E-Tongue MERN Stack Database Layer
 * 
 * Connects to MongoDB (local or Atlas). If connection fails,
 * the app still works via JSON file fallback in storage.js.
 * 
 * Set MONGO_URI in .env or it defaults to local mongodb://localhost:27017/etongue
 */
import 'dotenv/config';
import mongoose from 'mongoose';

// =========================================================================
// 1. CONNECTION (Supports MongoDB Atlas + Local MongoDB)
// =========================================================================

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/etongue';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return true;
  try {
    const isAtlas = MONGO_URI.includes('mongodb+srv://') || MONGO_URI.includes('cluster');
    const dbType = isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB Local';
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MONGODB] ✅ Connected to ${dbType}: ${MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
    return true;
  } catch (err) {
    console.warn(`[MONGODB] ⚠️ Connection warning: ${err.message}. Using JSON fallback.`);
    return false;
  }
}

export function getMongoStatus() {
  return {
    connected: isConnected,
    uri: MONGO_URI.replace(/\/\/.*@/, '//<credentials>@'),
    readyState: mongoose.connection.readyState, // 0=disconnected 1=connected 2=connecting 3=disconnecting
  };
}

// =========================================================================
// 2. SCHEMAS & MODELS
// =========================================================================

/** Analysis History — every classification run gets saved here */
const analysisSchema = new mongoose.Schema({
  analysisId:     { type: String, required: true, unique: true, index: true },
  sampleName:     { type: String, required: true },
  batchNumber:    String,
  category:       String,
  operator:       String,
  verdict:        { type: String, required: true },
  botanicalName:  String,
  confidence:     { type: Number, required: true },
  status:         { type: String, enum: ['VERIFIED_PURE', 'ADULTERATION_FLAG', 'HAZARD_ADULTERANT', 'AUTHENTIC_HIGH_GRADE', 'LOGGED_UNTESTED'], default: 'LOGGED_UNTESTED' },
  sensorPeak:     String,
  voltages:       { type: [Number], validate: v => v.length === 6 },
  radarScores:    {
    madhura: Number, amla: Number, lavana: Number,
    tikta: Number, katu: Number, kashaya: Number,
  },
  probabilities:  [{ label: String, percentage: Number }],
  featureWeights: [{ sensor: String, target: String, weight: Number }],
}, { timestamps: true });

analysisSchema.index({ createdAt: -1 });

/** Specimen Registry — botanical lots registered for testing */
const specimenSchema = new mongoose.Schema({
  lotId:       { type: String, required: true, unique: true, index: true },
  commonName:  { type: String, required: true },
  botanical:   { type: String, required: true },
  partUsed:    String,
  origin:      String,
  harvestDate: String,
  solvent:     String,
  status:      { type: String, default: 'LOGGED_UNTESTED' },
}, { timestamps: true });

specimenSchema.index({ createdAt: -1 });

/** User — analyst authentication */
const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true }, // In production: bcrypt hash
  role:        { type: String, default: 'Junior Analytical Chemist' },
  institution: { type: String, default: 'AYUSH Quality Control Division' },
}, { timestamps: true });

/** IoT Telemetry Log — raw packets from ESP32 hardware */
const telemetrySchema = new mongoose.Schema({
  deviceId:    { type: String, default: 'ESP32-S3-POTENTIOSTAT-REV3' },
  sampleName:  String,
  voltages:    { type: [Number], validate: v => v.length === 6 },
  rawADC:      [Number],
  temperatureC: Number,
  timestamp:   { type: Date, default: Date.now },
});

// TTL index: auto-delete telemetry older than 7 days to save space
telemetrySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

/** Agent Chat Log — AI agent conversation history */
const agentChatSchema = new mongoose.Schema({
  userId:     String,
  prompt:     { type: String, required: true },
  reply:      { type: String, required: true },
  agentAction: String,
  voltagesAtTime: [Number],
}, { timestamps: true });

// =========================================================================
// 3. EXPORT MODELS
// =========================================================================

export const Analysis  = mongoose.model('Analysis', analysisSchema);
export const Specimen  = mongoose.model('Specimen', specimenSchema);
export const User      = mongoose.model('User', userSchema);
export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
export const AgentChat = mongoose.model('AgentChat', agentChatSchema);
