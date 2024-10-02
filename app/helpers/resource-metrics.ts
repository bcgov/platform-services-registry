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
export const cpuCoreToMillicoreMultiplier = 1000;

// In Kubernetes, CPU resources can be specified in several units. The available units for CPU include:
//
// CPU cores: This is the standard unit, where 1 represents one full CPU core. For example:
//   1 = one full core
//   0.5 = half a core
//
// Millicores: This is a more granular unit, where 1000m (millicores) equals 1 core. For example:
//   500m = 0.5 cores
//   250m = 0.25 cores
//
// Converts CPU values to millicores
export function normalizeCpu(cpuValue: string | number) {
  if (typeof cpuValue === 'string') {
    if (cpuValue.endsWith('m')) {
      // Remove the 'm' suffix and parse as an integer
      const millicores = parseInt(cpuValue.slice(0, -1), 10);
      if (isNaN(millicores)) {
        return -1;
      }
      return millicores;
    }

    // Convert from cores or decimal to millicores
    const cores = parseFloat(cpuValue);
    if (isNaN(cores)) {
      return -1;
    }
    return Math.round(cores * cpuCoreToMillicoreMultiplier);
  }

  // Ensure the input number is valid
  if (typeof cpuValue === 'number') {
    return cpuValue;
  }

  return -1;
}

export const memoryUnitMultipliers = {
  Ti: 1024 * 1024 * 1024 * 1024, // 1 TiB = 1024 GiB = 1024^4 bytes
  Gi: 1024 * 1024 * 1024, // 1 GiB = 1024 MiB = 1024^3 bytes
  Mi: 1024 * 1024, // 1 MiB = 1024 KiB = 1024^2 bytes
  Ki: 1024, // 1 KiB = 1024 bytes
  '': 1, // bytes to bytes
};

// In Kubernetes, memory resources can be specified using several units. The available units for memory include:
//
// Bytes: The base unit for memory. You can specify memory in bytes (e.g., 1048576 for 1 MiB).
// Kilobytes (Ki): Represented as Ki, where 1 KiB = 1024 bytes. For example, 1Ki equals 1024 bytes.
// Megabytes (Mi): Represented as Mi, where 1 MiB = 1024 KiB = 1048576 bytes. For example, 1Mi equals 1,048,576 bytes.
// Gigabytes (Gi): Represented as Gi, where 1 GiB = 1024 MiB = 1073741824 bytes. For example, 1Gi equals 1,073,741,824 bytes.
// Terabytes (Ti): Represented as Ti, where 1 TiB = 1024 GiB = 1099511627776 bytes. For example, 1Ti equals 1,099,511,627,776 bytes.
//
// Mebibytes and Kibibytes: Though typically not used, these are sometimes referred to in terms of the IEC binary prefixes:
// Mebibyte (MiB): 1 MiB = 1024^2 bytes
// Kibibyte (KiB): 1 KiB = 1024 bytes
//
// Converts memory values to Ki units
export function normalizeMemory(memoryValue: string | number): number {
  if (typeof memoryValue === 'string') {
    const match = memoryValue.match(/^(\d+(?:\.\d+)?)([KMGTE]?i?)$/i); // Case-insensitive matching
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] || ''; // Default to empty string if no unit is provided

      // Normalize memory to bytes
      const multiplier = memoryUnitMultipliers[unit as keyof typeof memoryUnitMultipliers];
      if (multiplier !== undefined) {
        return Math.round(value * multiplier);
      }
    }

    // If the input string doesn't match, consider invalid
    return -1;
  }

  // Assuming input is already in bytes (number)
  return memoryValue;
}

export function formatMemory(bytes: number) {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let index = 0;

  // Handle zero case
  if (bytes === 0) return '0 B';

  // Convert to the most appropriate unit
  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index++;
  }

  // Return with 2 decimal precision except for 'B' where no decimal precision is needed
  const formattedValue = index === 0 ? Math.round(bytes) : bytes.toFixed(2);
  return `${formattedValue} ${units[index]}`;
}

export function formatCpu(millicores: number) {
  if (millicores >= 1000) {
    return `${(millicores / 1000).toFixed(2)} cores`;
  }

  return `${Math.round(millicores)} m`;
}

// Function to aggregate total usage and limits across all containers in a single pod
export const getTotalMetrics = (pods: Pod[], resource: ResourceType) => {
  let totalUsage = 0;
  let totalRequest = 0;
  let totalLimit = 0;

  // Iterate through each pod and each container
  pods.forEach((pod) => {
    pod.containers.forEach((container) => {
      totalUsage += container.usage[resource];
      totalRequest += container.requests[resource];
      totalLimit += container.limits[resource];
    });
  });

  return { totalUsage, totalRequest, totalLimit };
};
