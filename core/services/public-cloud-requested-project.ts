import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';
import { PublicCloudProjectService } from './public-cloud-project';

export class PublicCloudRequestedProjectService extends ModelService<Prisma.PublicCloudRequestedProjectWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.permissions.viewAllPublicCloudProducts) return true;

    const res = await prisma.publicCloudRequestedProject.findMany({
      select: { licencePlate: true },
      session: this.session as never,
    });

    const licencePlates = res.map(({ licencePlate }) => licencePlate);

    const baseFilter: Prisma.PublicCloudRequestedProjectWhereInput = {
      licencePlate: { in: licencePlates },
    };

    return baseFilter;
  }

  async writeFilter() {
    if (!this.session) return false;
    if (this.session.permissions.editAllPublicCloudProducts) return true;

    const publicCloudProjectService = new PublicCloudProjectService(this.session);
    const writeFilter = await publicCloudProjectService.writeFilter();
    if (writeFilter) return true;
    if (!writeFilter) return false;

    const res = await prisma.publicCloudRequestedProject.findMany({
      where: writeFilter,
      select: { licencePlate: true },
    });

    const licencePlates = res.map(({ licencePlate }) => licencePlate);

    const baseFilter: Prisma.PublicCloudRequestedProjectWhereInput = {
      licencePlate: { in: licencePlates },
    };

    return baseFilter;
  }

  async decorate<T>(
    doc: { _permissions: { view: boolean; edit: boolean; delete: boolean } } & T & Record<string, any>,
  ) {
    const res = await prisma.publicCloudRequestedProject.findFirst({
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
