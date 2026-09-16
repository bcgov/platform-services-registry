import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';

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

const getLicencePlateFromRepoName = (repoName: string) => repoName.slice(gitOpsRepoPrefix.length);

const getGitOpsRepositoryUrl = (licencePlate: string) => `${gitOpsRepoUrlPrefix}${licencePlate}`;

export const POST = apiHandler(async ({ body, jwtData }) => {
  if (!jwtData) {
    return UnauthorizedResponse('GitOps service account authentication required');
  }

  const incomingLicencePlates = new Set(body.map((repoName) => getLicencePlateFromRepoName(repoName).toLowerCase()));

  const products = await prisma.privateCloudProduct.findMany({
    select: {
      id: true,
      licencePlate: true,
      repositories: true,
      gitOpsRepositories: true,
    },
  });

  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const product of products) {
    const licencePlate = product.licencePlate.toLowerCase();
    const shouldHaveGitOpsRepository = incomingLicencePlates.has(licencePlate);

    const gitOpsRepositories = shouldHaveGitOpsRepository ? [{ url: getGitOpsRepositoryUrl(licencePlate) }] : [];

    const existingGitOpsUrl = product.gitOpsRepositories[0]?.url;
    const newGitOpsUrl = gitOpsRepositories[0]?.url;

    if (existingGitOpsUrl === newGitOpsUrl && product.gitOpsRepositories.length === gitOpsRepositories.length) {
      unchanged += 1;
      continue;
    }

    if (shouldHaveGitOpsRepository) {
      added += 1;
    } else {
      removed += product.gitOpsRepositories.length;
    }

    await prisma.privateCloudProduct.update({
      where: {
        id: product.id,
      },
      data: {
        gitOpsRepositories,
        hasRepositories: product.repositories.length > 0 || gitOpsRepositories.length > 0,
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
