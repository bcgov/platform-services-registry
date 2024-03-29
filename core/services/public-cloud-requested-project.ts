import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';

export class PublicCloudRequestedProjectService extends ModelService<Prisma.PublicCloudRequestedProjectWhereInput> {
  async readFilter() {
    return false;
  }

  async writeFilter() {
    return false;
  }

  async decorate<T>(doc: T & { _permissions: { view: boolean; edit: boolean; delete: boolean } }) {
    doc._permissions = {
      view: true,
      edit: true,
      delete: false,
    };

    return doc;
  }
}
