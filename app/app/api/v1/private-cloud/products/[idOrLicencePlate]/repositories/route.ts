import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { repositorySchema } from '@/validation-schemas/shared';

const pathParamSchema = z.object({
  idOrLicencePlate: z.string().max(24),
});

const postApiHandler = createApiHandler({
  roles: ['service-account private-admin'],
  useServiceAccount: true,
  validations: {
    pathParams: pathParamSchema,
    body: repositorySchema,
  },
});

const deleteApiHandler = createApiHandler({
  roles: ['service-account private-admin'],
  useServiceAccount: true,
  validations: {
    pathParams: pathParamSchema,
    queryParams: repositorySchema,
  },
});

const normalizeRepositoryUrl = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();

export const POST = postApiHandler(async ({ pathParams, body }) => {
  const { idOrLicencePlate } = pathParams;

  const where = idOrLicencePlate.length > 7 ? { id: idOrLicencePlate } : { licencePlate: idOrLicencePlate };

  const product = await prisma.privateCloudProduct.findUnique({
    where,
  });

  if (!product) {
    return NotFoundResponse(`There is no product associated with key '${idOrLicencePlate}'`);
  }

  const normalizedUrl = normalizeRepositoryUrl(body.url);

  const repositoryExists = product.repositories.some(
    (repository) => normalizeRepositoryUrl(repository.url) === normalizedUrl,
  );

  if (repositoryExists) {
    logger.info(`Repository '${body.url}' already exists for private cloud product '${product.licencePlate}'.`);

    return OkResponse(product);
  }

  const repositories = [
    ...product.repositories,
    {
      url: body.url,
    },
  ];

  const updatedProduct = await prisma.privateCloudProduct.update({
    where: {
      id: product.id,
    },
    data: {
      repositories,
      hasRepositories: true,
    },
  });

  logger.info(`Repository '${body.url}' added to private cloud product '${product.licencePlate}'.`);

  return OkResponse(updatedProduct);
});

export const DELETE = deleteApiHandler(async ({ pathParams, queryParams }) => {
  const { idOrLicencePlate } = pathParams;
  const { url } = queryParams;

  const where = idOrLicencePlate.length > 7 ? { id: idOrLicencePlate } : { licencePlate: idOrLicencePlate };

  const product = await prisma.privateCloudProduct.findUnique({
    where,
  });

  if (!product) {
    return NotFoundResponse(`There is no product associated with key '${idOrLicencePlate}'`);
  }

  const normalizedUrl = normalizeRepositoryUrl(url);

  const repositoryExists = product.repositories.some(
    (repository) => normalizeRepositoryUrl(repository.url) === normalizedUrl,
  );

  if (!repositoryExists) {
    logger.info(`Repository '${url}' does not exist for private cloud product '${product.licencePlate}'.`);

    return OkResponse(product);
  }

  const repositories = product.repositories.filter(
    (repository) => normalizeRepositoryUrl(repository.url) !== normalizedUrl,
  );

  const updatedProduct = await prisma.privateCloudProduct.update({
    where: {
      id: product.id,
    },
    data: {
      repositories,
      hasRepositories: repositories.length > 0,
    },
  });

  logger.info(`Repository '${url}' removed from private cloud product '${product.licencePlate}'.`);

  return OkResponse(updatedProduct);
});
