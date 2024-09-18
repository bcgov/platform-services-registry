import _toNumber from 'lodash-es/toNumber';
import { extractNumbers } from '@/utils/string';

export type ResourceType = 'cpu' | 'memory';
export type podObj = {
  podName: string;
  containers: UsageObj[];
};

export type UsageObj = {
  name: string;
  usage: {
    cpu: string;
    memory: string;
  };
  limits: {
    cpu: string;
    memory: string;
  };
  requests: {
    cpu: string;
    memory: string;
  };
};

// Conversion factors for resource units
export const GiToKi = 1024 * 1024;
export const MiToKi = 1024;
export const cpuToM = 1000;

// Converts CPU values to millicores
export const convertCpu = (cpu: string): string => {
  if (cpu.includes('m')) {
    return cpu;
  }
  return `${parseFloat(cpu) * cpuToM}m`;
};

// Converts memory values to Ki units
export const convertMemory = (memory: string): string => {
  if (memory.includes('Gi')) {
    return `${parseFloat(memory.replace('Gi', '')) * GiToKi}Ki`;
  } else if (memory.includes('Mi')) {
    return `${parseFloat(memory.replace('Mi', '')) * MiToKi}Ki`;
  }
  return memory;
};

// Convert CPU and memory values for all containers in the pod
export const convertValues = (data: podObj[]): podObj[] =>
  data.map((pod) => ({
    ...pod,
    containers: pod.containers.map((container) => ({
      ...container,
      usage: {
        cpu: convertCpu(container.usage.cpu),
        memory: convertMemory(container.usage.memory),
      },
      limits: {
        cpu: convertCpu(container.limits.cpu),
        memory: convertMemory(container.limits.memory),
      },
      requests: {
        cpu: convertCpu(container.requests.cpu),
        memory: convertMemory(container.requests.memory),
      },
    })),
  }));

// Function to aggregate total usage and limits across all containers in a single pod
export const totalMetrics = (pods: podObj[], resource: ResourceType) => {
  if (!Array.isArray(pods) || pods.length === 0) {
    return { totalUsage: 0, totalLimit: 0 };
  }

  let totalUsage = 0;
  let totalLimit = 0;

  // Iterate through each pod and each container
  pods.forEach((pod) => {
    pod.containers.forEach((container) => {
      const usageNumbers = extractNumbers(container.usage[resource]);
      const limitNumbers = extractNumbers(container.limits[resource]);

      const usageValue = usageNumbers.length > 0 ? usageNumbers[0] : 0;
      const limitValue = limitNumbers.length > 0 ? limitNumbers[0] : 0;

      totalUsage += usageValue;
      totalLimit += limitValue;
    });
  });

  return { totalUsage, totalLimit };
};
