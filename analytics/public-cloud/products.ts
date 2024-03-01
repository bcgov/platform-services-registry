import prisma from '@/core/prisma';
import _isEqual from 'lodash-es/isEqual';

export type DataPoint = {
  date: string;
  Products: number;
};

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function createMonthKey(date: Date) {
  return formatter.format(date);
}

export async function productsCreatedPerMonth() {
  const projects = await prisma.publicCloudProject.findMany({
    select: {
      created: true,
    },
  });

  const projectsOverTime = projects.reduce(
    (acc, project) => {
      const key = createMonthKey(project.created);

      if (acc[key]) {
        acc[key] += 1;
      } else {
        acc[key] = 1;
      }

      return acc;
    },
    {} as { [key: string]: number },
  );

  return projectsOverTime;
}

export async function numberOfProductsOverTime() {
  const projectsOverTime = await productsCreatedPerMonth();

  // Calculate cumulative products over time
  let cumulativeProducts = 0;
  const cumulativeProductsOverTime = Object.entries(projectsOverTime).reduce(
    (acc, [key, value]) => {
      cumulativeProducts += value;
      acc[key] = cumulativeProducts;
      return acc;
    },
    {} as { [key: string]: number },
  );

  const result: DataPoint[] = Object.entries(cumulativeProductsOverTime).map((item) => ({
    date: item[0],
    Products: item[1],
  }));

  return result;
}
