import { Cluster } from '@prisma/client';
import { clusters } from '@/constants';
import { ministryKeyToName } from '@/helpers/product';

// ✅ Ensure function returns { label: string; value: number; }[]
export const transformMinistryData = (items: { _id: string; value: number }[]) =>
  items.map(({ _id, value }) => ({ label: ministryKeyToName(_id), value }));

// ✅ Filter out invalid clusters
export const validClusters = (clusters as string[]).filter((cluster): cluster is Cluster =>
  Object.values(Cluster).includes(cluster as Cluster),
);

// ✅ Map selected clusters to their respective ministry data
export const mapClusterData = (selectedClusters: Cluster[], ministryData: any[]) => {
  return selectedClusters.reduce<Record<Cluster, { label: string; value: number }[]>>(
    (acc, cluster) => {
      const clusterIndex = validClusters.indexOf(cluster); // ✅ Get correct index
      acc[cluster] =
        clusterIndex !== -1 && ministryData[clusterIndex + 1] // ✅ Ensure correct mapping
          ? transformMinistryData(ministryData[clusterIndex + 1])
          : [];
      return acc;
    },
    {} as Record<Cluster, { label: string; value: number }[]>,
  );
};
