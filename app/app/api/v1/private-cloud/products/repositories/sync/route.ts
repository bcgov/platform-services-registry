import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';

const gitOpsRepoNameSchema = z.string().regex(/^tenant-gitops-[a-f0-9]{6}$/);

const bodySchema = z.array(gitOpsRepoNameSchema).min(1);

const apiHandler = createApiHandler({
  keycloakOauth2: {
    clientId: 'registry-gitops-ci',
  },
  validations: { body: bodySchema },
});

const gitOpsRepoPrefix = 'tenant-gitops-';
const gitOpsRepoUrlPrefix = 'https://github.com/bcgov-c/tenant-gitops-';

const normalizeRepositoryUrl = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();

const getLicencePlateFromRepoName = (repoName: string) => repoName.slice(gitOpsRepoPrefix.length);

const getGitOpsRepositoryUrl = (licencePlate: string) => `${gitOpsRepoUrlPrefix}${licencePlate}`;

const isProductGitOpsRepository = (url: string, licencePlate: string) =>
  normalizeRepositoryUrl(url) === normalizeRepositoryUrl(getGitOpsRepositoryUrl(licencePlate));

export const POST = apiHandler(async ({ body }) => {
  const incomingLicencePlates = new Set(body.map((repoName) => getLicencePlateFromRepoName(repoName).toLowerCase()));

  const products = await prisma.privateCloudProduct.findMany({
    select: {
      id: true,
      licencePlate: true,
      repositories: true,
      hasRepositories: true,
    },
  });

  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const product of products) {
    const shouldHaveGitOpsRepository = incomingLicencePlates.has(product.licencePlate.toLowerCase());

    const expectedGitOpsUrl = getGitOpsRepositoryUrl(product.licencePlate.toLowerCase());
    const normalizedExpectedUrl = normalizeRepositoryUrl(expectedGitOpsUrl);

    const existingManagedRepositories = product.repositories.filter((repository) =>
      isProductGitOpsRepository(repository.url, product.licencePlate),
    );

    const manualRepositories = product.repositories.filter(
      (repository) => !isProductGitOpsRepository(repository.url, product.licencePlate),
    );

    const expectedRepositoryAlreadyExists = existingManagedRepositories.some(
      (repository) => normalizeRepositoryUrl(repository.url) === normalizedExpectedUrl,
    );

    let repositories = product.repositories;

    if (shouldHaveGitOpsRepository) {
      repositories = [...manualRepositories, { url: expectedGitOpsUrl }];

      if (!expectedRepositoryAlreadyExists) {
        added += 1;
      }
    } else {
      repositories = manualRepositories;

      if (existingManagedRepositories.length > 0) {
        removed += existingManagedRepositories.length;
      }
    }

    const oldUrls = product.repositories.map((repository) => normalizeRepositoryUrl(repository.url)).sort();

    const newUrls = repositories.map((repository) => normalizeRepositoryUrl(repository.url)).sort();

    const changed = oldUrls.length !== newUrls.length || oldUrls.some((url, index) => url !== newUrls[index]);

    if (!changed) {
      unchanged += 1;
      continue;
    }

    await prisma.privateCloudProduct.update({
      where: {
        id: product.id,
      },
      data: {
        repositories,
        hasRepositories: repositories.length > 0,
      },
    });

    logger.info(`Synchronized GitOps repository for private cloud product '${product.licencePlate}'.`);
  }

  const existingLicencePlates = new Set(products.map((product) => product.licencePlate.toLowerCase()));

  const skipped = [...incomingLicencePlates].filter((licencePlate) => !existingLicencePlates.has(licencePlate));

  if (skipped.length > 0) {
    logger.warn(`GitOps repositories received for unknown licence plates: ${skipped.join(', ')}`);
  }

  return OkResponse({
    added,
    removed,
    unchanged,
    skipped,
  });
});
