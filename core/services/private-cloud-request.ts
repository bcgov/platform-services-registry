import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';
import { PrivateCloudProjectService } from './private-cloud-project';

export class PrivateCloudRequestService extends ModelService<Prisma.PrivateCloudRequestWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.permissions.viewAllPrivateCloudProducts) return true;

    const res = await prisma.privateCloudProject.findMany({
      select: { licencePlate: true },
      session: this.session as never,
    });

    const licencePlates = res.map(({ licencePlate }) => licencePlate);

    const baseFilter: Prisma.PrivateCloudRequestWhereInput = {
      licencePlate: { in: licencePlates },
    };

    return baseFilter;
  }

  async writeFilter() {
    if (!this.session) return false;
    if (this.session.permissions.editAllPrivateCloudProducts) return true;

    const privateCloudProjectService = new PrivateCloudProjectService(this.session);
    const writeFilter = await privateCloudProjectService.writeFilter();
    if (writeFilter) return true;
    if (!writeFilter) return false;

    const res = await prisma.privateCloudProject.findMany({
      where: writeFilter,
      select: { licencePlate: true },
    });

    const licencePlates = res.map(({ licencePlate }) => licencePlate);

    const baseFilter: Prisma.PrivateCloudRequestWhereInput = {
      licencePlate: { in: licencePlates },
    };

    return baseFilter;
  }

  async decorate<T>(
    doc: { _permissions: { view: boolean; edit: boolean; delete: boolean } } & T & Record<string, any>,
  ) {
    const res = await prisma.privateCloudProject.findFirst({
      where: { licencePlate: doc.license },
      select: { projectOwnerId: true, primaryTechnicalLeadId: true, secondaryTechnicalLeadId: true, ministry: true },
      session: this.session as never,
    });

    const docWithPermissions = res as typeof res & { _permissions: { view: boolean; edit: boolean; delete: boolean } };

    doc._permissions = {
      view: docWithPermissions._permissions.view,
      edit: docWithPermissions._permissions.edit,
      delete: false,
    };

    return doc;
  }
}
