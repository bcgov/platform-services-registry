import type { RepositoryFormData } from '@/validation-schemas/shared';

const repositoryFields = new Set(['hasRepositories', 'repositories']);

export function areOnlyRepositoryFieldsDirty(dirtyFields: Record<string, unknown>) {
  const changedFields = Object.keys(dirtyFields);

  return changedFields.length > 0 && changedFields.every((field) => repositoryFields.has(field));
}

export function getRepositoryFormValues(data: RepositoryFormData): RepositoryFormData {
  const repositories = data.repositories ?? [];

  return {
    hasRepositories: data.hasRepositories ?? (repositories.length > 0 ? true : null),
    repositories,
  };
}
