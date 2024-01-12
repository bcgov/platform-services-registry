import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ModelService } from '../modelService';

export class SecurityConfigService extends ModelService<Prisma.SecurityConfigWhereInput> {
  async readFilter() {
    let baseFilter!: Prisma.SecurityConfigWhereInput;

    if (!this.session) return false;
    if (!this.session.isAdmin) {
      const [privateRes, publicRes] = await Promise.all([
        prisma.privateCloudRequestedProject.findMany({ select: { licencePlate: true } }),
        prisma.publicCloudRequestedProject.findMany({ select: { licencePlate: true } }),
      ]);

      const privateOR = privateRes.map(({ licencePlate }) => ({
        licencePlate,
        context: $Enums.ProjectContext.PRIVATE,
      }));
      const publicOR = publicRes.map(({ licencePlate }) => ({ licencePlate, context: $Enums.ProjectContext.PUBLIC }));

      const OR = [...privateOR, ...publicOR];

      baseFilter = {
        OR,
      };
    }

    return baseFilter;
  }

  async writeFilter() {
    return this.readFilter();
  }

  async decorate(doc: any) {
    doc._permissions = {
      view: true,
    };

    return doc;
  }
}
