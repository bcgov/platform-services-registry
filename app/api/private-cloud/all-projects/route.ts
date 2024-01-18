import { NextRequest, NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { PrivateProject } from '@/queries/types';
import { privateCloudProjectsPaginated } from '@/queries/paginated/private-cloud';
import formatDate from '@/components/utils/formatdates';
import { formatFullName } from '@/components/utils/formatFullName';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { userInfo } from '@/queries/user';

const searchParamsSchema = z.object({
  search: z.string().nullable(),
  ministry: z.string().nullable(),
  cluster: z.string().nullable(),
  active: z.boolean().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = req.nextUrl;

    const parsedSearchParams = searchParamsSchema.parse({
      search: searchParams.get('search'),
      ministry: searchParams.get('ministry'),
      cluster: searchParams.get('cluster'),
      active: searchParams.get('active') === 'true', // Converts 'true' string to true boolean
    });

    const { userEmail, ministryRoles } = userInfo(session.user.email, session.roles);

    const { data } = await privateCloudProjectsPaginated(
      0,
      0,
      parsedSearchParams.search,
      parsedSearchParams.ministry,
      parsedSearchParams.cluster,
      userEmail,
      ministryRoles,
      parsedSearchParams.active,
    );

    if (data.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    // Map the data to the correct format for CSV conversion
    const formattedData = data.map((project: PrivateProject) => ({
      name: project.name,
      description: project.description,
      ministry: project.ministry,
      cluster: project.cluster,
      projectOwnerEmail: project.projectOwner.email,
      projectOwnerName: formatFullName(project.projectOwner),
      primaryTechnicalLeadEmail: project.primaryTechnicalLead.email,
      primaryTechnicalLeadName: formatFullName(project.primaryTechnicalLead),
      secondaryTechnicalLeadEmail: project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
      secondaryTechnicalLeadName: formatFullName(project.secondaryTechnicalLead),
      created: formatDate(project.created.$date),
      licencePlate: project.licencePlate,
    }));

    // Convert the data to CSV
    const csv = stringify(formattedData, {
      header: true,
      columns: [
        'name',
        'description',
        'ministry',
        'cluster',
        'projectOwnerEmail',
        'projectOwnerName',
        'primaryTechnicalLeadEmail',
        'primaryTechnicalLeadName',
        'secondaryTechnicalLeadEmail',
        'secondaryTechnicalLeadName',
        'created',
        'licencePlate',
      ],
    });

    // Response for csv
    const response = new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=private-cloud-products.csv',
      },
    });

    return response;
  } catch (error: any) {
    console.error('Error in handler:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
