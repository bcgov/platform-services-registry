export type ResourceType = 'cpu' | 'memory';

export type Pod = {
  podName: string;
  containers: Container[];
};

export type Container = {
  name: string;
  usage: {
    cpu: number;
    memory: number;
  };
  limits: {
    cpu: number;
    memory: number;
  };
  requests: {
    cpu: number;
    memory: number;
  };
};

// Conversion factors for resource units
export const GiToKi = 1024 * 1024;
export const MiToKi = 1024;
export const cpuToM = 1000;

// Converts CPU values to millicores
export const normalizeCpu = (cpu: string): number => {
  if (cpu.includes('m')) {
    return parseFloat(cpu.replace('m', ''));
  }
  return parseFloat(cpu) * cpuToM; // Convert cores to millicores
};

// Converts memory values to Ki units
export const normalizeMemory = (memory: string): number => {
  if (memory.includes('Gi')) {
    return parseFloat(memory.replace('Gi', '')) * GiToKi; // Convert Gi to KiB
  } else if (memory.includes('Mi')) {
    return parseFloat(memory.replace('Mi', '')) * MiToKi; // Convert Mi to KiB
  }
  return parseFloat(memory);
};

// Function to aggregate total usage and limits across all containers in a single pod
export const getTotalMetrics = (pods: Pod[], resource: ResourceType) => {
  if (!Array.isArray(pods) || pods.length === 0) {
    return { totalUsage: 0, totalLimit: 0 };
  }

  let totalUsage = 0;
  let totalLimit = 0;

  // Iterate through each pod and each container
  pods.forEach((pod) => {
    pod.containers.forEach((container) => {
      totalUsage += container.usage[resource];
      totalLimit += container.limits[resource];
    });
  });

  return { totalUsage, totalLimit };
};
