declare module '../../services/randomForest.js' {
  export function classifySample(voltages: number[], metadata?: any): any;
  export function calculateDistance(v1: number[], v2: number[]): number;
  export const SENSOR_INFO: any[];
}

declare module '../../services/storage.js' {
  export const storage: {
    getTelemetryHistory: (limit?: number) => Promise<any[]>;
    getHistory: () => Promise<any[]>;
    addHistory: (record: any) => Promise<any>;
    logTelemetry: (data: any) => Promise<any>;
    initMongo: () => Promise<boolean>;
    getDBStatus: () => any;
  };
}
