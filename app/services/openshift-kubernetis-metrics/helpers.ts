import _toNumber from 'lodash-es/toNumber';
import { extractNumbers } from '@/utils/string';

export type ResourceType = 'cpu' | 'memory';

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

// Conversion factors
export const GiToKi = 1024 * 1024;
export const MiToKi = 1024;
export const cpuToM = 1000;

export const convertCpu = (cpu: string): string => {
  if (cpu.includes('m')) {
    return cpu;
  }
  return `${parseFloat(cpu) * cpuToM}m`;
};

export const convertMemory = (memory: string): string => {
  if (memory.includes('Gi')) {
    return `${parseFloat(memory.replace('Gi', '')) * GiToKi}Ki`;
  } else if (memory.includes('Mi')) {
    return `${parseFloat(memory.replace('Mi', '')) * MiToKi}Ki`;
  }
  return memory;
};

// Convert CPU and memory values to millicores and Ki units
export const convertValues = (data: UsageObj[]): UsageObj[] =>
  data.map((entry) => ({
    ...entry,
    usage: {
      cpu: convertCpu(entry.usage.cpu),
      memory: convertMemory(entry.usage.memory),
    },
    limits: {
      cpu: convertCpu(entry.limits.cpu),
      memory: convertMemory(entry.limits.memory),
    },
    requests: {
      cpu: convertCpu(entry.requests.cpu),
      memory: convertMemory(entry.requests.memory),
    },
  }));

export const totalMetrics = (pods: UsageObj[], resource: ResourceType) => {
  if (!Array.isArray(pods) || pods.length === 0) {
    return { totalUsage: 0, totalLimit: 0 };
  }
  let totalUsage = 0;
  let totalLimit = 0;

  pods.forEach((pod) => {
    const usageNumbers = extractNumbers(pod.usage[resource]);
    const limitNumbers = extractNumbers(pod.limits[resource]);

    const usageValue = usageNumbers.length > 0 ? usageNumbers[0] : 0;
    const limitValue = limitNumbers.length > 0 ? limitNumbers[0] : 0;

    totalUsage += usageValue;
    totalLimit += limitValue;
  });

  return { totalUsage, totalLimit };
};
