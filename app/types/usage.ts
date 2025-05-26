export interface Container {
  name: string;
  usage: {
    cpu: number;
    memory: number;
  };
  requests: {
    cpu: number;
    memory: number;
  };
}

export interface Pod {
  name: string;
  containers: Container[];
}

export interface PVC {
  name: string;
  pvName: string;
  storageClassName: string;
  usage: number;
  requests: number;
  freeInodes: number;
}

export interface UsageMetrics {
  podMetrics: Pod[];
  pvcMetrics: PVC[];
}
