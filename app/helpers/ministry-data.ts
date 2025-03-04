import { Cluster } from '@prisma/client';
import { clusters } from '@/constants';
import { ministryKeyToName } from '@/helpers/product';

export const transformMinistryData = (items: { _id: string; value: number }[]) =>
  items.map(({ _id, value }) => ({ label: ministryKeyToName(_id), value }));

export const validClusters = (clusters as string[]).filter((cluster): cluster is Cluster =>
  Object.values(Cluster).includes(cluster as Cluster),
);

export const mapClusterData = (selectedClusters: Cluster[], ministryData: any[]) => {
  return selectedClusters.reduce<Record<Cluster, { label: string; value: number }[]>>(
    (acc, cluster) => {
      const clusterIndex = validClusters.indexOf(cluster);
      acc[cluster] =
        clusterIndex !== -1 && ministryData[clusterIndex + 1]
          ? transformMinistryData(ministryData[clusterIndex + 1])
          : [];
      return acc;
    },
    {} as Record<Cluster, { label: string; value: number }[]>,
  );
};
