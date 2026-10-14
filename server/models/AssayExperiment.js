/**
 * MongoDB Mongoose Schema for E-Tongue Assay Experiments (MERN Stack)
 */

export const AssayExperimentSchemaDefinition = {
  experimentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sampleName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Dairy Products', 'Tea & Beverages', 'Wine & Spirits', 'Water Quality', 'Pharmaceuticals'],
    required: true,
  },
  sensorVoltages: {
    s1_sweet: Number,
    s2_salty: Number,
    s3_sour: Number,
    s4_bitter: Number,
    s5_umami: Number,
    s6_astringent: Number,
  },
  modelPrediction: {
    predictedClass: String,
    confidencePercentage: Number,
    ensembleVotes: [
      {
        className: String,
        votes: Number,
        percentage: Number,
      },
    ],
  },
  pcaCoordinates: {
    pc1: Number,
    pc2: Number,
  },
  tasteProfile: {
    sweetness: Number,
    saltiness: Number,
    sourness: Number,
    bitterness: Number,
    umami: Number,
    astringency: Number,
  },
  environmentalConditions: {
    temperatureCelsius: Number,
    phLevel: Number,
    dilutionRatio: String,
  },
  operator: {
    name: String,
    role: String,
  },
  status: {
    type: String,
    enum: ['PASS', 'ALERT', 'CONTAMINATED'],
    default: 'PASS',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};
