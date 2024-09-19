import { Prisma } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';

export class PrivateCloudProjectZapResultService extends ModelService<Prisma.PrivateCloudProjectZapResultWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.permissions.viewZapscanResults) return true;

    const res = await prisma.privateCloudProject.findMany({
      select: { cluster: true, licencePlate: true },
      session: this.session as never,
    });

    if (res.length === 0) return false;

    const baseFilter: Prisma.PrivateCloudProjectZapResultWhereInput = {
      OR: res.map(({ cluster, licencePlate }) => ({ cluster, licencePlate })),
    };

    return baseFilter;
  }

  async writeFilter() {
    return false;
  }

  async decorate<T>(doc: { _permissions: { view: boolean; edit: boolean; delete: boolean } } & T) {
    doc._permissions = {
      view: true,
      edit: false,
      delete: false,
    };

    return doc;
  }
}
