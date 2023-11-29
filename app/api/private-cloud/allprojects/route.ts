import { NextRequest, NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { PrivateProject } from '@/queries/types';
import { privateCloudProjects } from '@/queries/private-cloud';
import formatDate from '@/components/utils/formatdates';
import { formatFullName } from '@/components/utils/formatFullName';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';

const searchParamsSchema = z.object({
  search: z.string().nullable(),
  ministry: z.string().nullable(),
  cluster: z.array(z.string()),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('No session, sending 401');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = req.nextUrl;

    const parsedSearchParams = searchParamsSchema.parse({
      search: searchParams.get('search'),
      ministry: searchParams.get('ministry'),
      cluster: searchParams.getAll('cluster'),
    });

    let email = null;

    if (!session.user.roles.includes('admin')) {
      email = session.user.email;
    }

    const projects = await privateCloudProjects(
      parsedSearchParams.search,
      parsedSearchParams.ministry,
      parsedSearchParams.cluster,
      email,
    );

    // Map the data to the correct format for CSV conversion
    const formattedData = projects.map((project: PrivateProject) => ({
      name: project.name,
      description: project.description,
      ministry: project.ministry,
      cluster: project.cluster,
      projectOwnerEmail: project.projectOwnerDetails.email,
      projectOwnerName: formatFullName(project.projectOwnerDetails),
      primaryTechnicalLeadEmail: project.primaryTechnicalLeadDetails.email,
      primaryTechnicalLeadName: formatFullName(project.primaryTechnicalLeadDetails),
      secondaryTechnicalLeadEmail: project.secondaryTechnicalLeadDetails
        ? project.secondaryTechnicalLeadDetails.email
        : '',
      secondaryTechnicalLeadName: formatFullName(project.secondaryTechnicalLeadDetails),
      created: formatDate(project.created['$date']),
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
        'Content-Disposition': 'attachment; filename="projects.csv"',
      },
    });

    return response;
  } catch (error: any) {
    console.error('Error in handler:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
