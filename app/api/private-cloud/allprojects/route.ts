import { NextRequest, NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { PrivateProject } from '@/queries/types';
import { privateCloudProjects } from '@/queries/private-cloud';
import formatDate from '@/components/utils/formatdates';
import { formatFullName } from '@/components/utils/formatFullName';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
//import { NextApiRequest, NextApiResponse } from 'next';

const queryScheme = z.object({
  search: z.string().optional().nullable(),
  ministry: z.string().optional().nullable(),
  cluster: z.string().optional().nullable(),
  userEmail: z.string().email().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    console.log('Handler Called'); //Check if handler is called
    const session = await getServerSession(authOptions);
    console.log('Session', session); //Check session details

    if (!session) {
      console.log('No session, sending 401');
      //res.status(401).json({error: 'Unauthorized'});
      return new NextResponse('Unauthorized', { status: 401 });
      return;
    }

    //Extract and parse the query parameters
    const searchParams = new URL(req.url || '').searchParams;
    const queryParams = queryScheme.parse({
      search: searchParams.get('search') || undefined,
      ministry: searchParams.get('ministry') || undefined,
      cluster: searchParams.get('cluster') || undefined,
      userEmail: searchParams.get('userEmail') || undefined,
    });

    const projects = await privateCloudProjects(
      queryParams.search,
      queryParams.ministry,
      queryParams.cluster,
      queryParams.userEmail,
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
    console.log('Sending CSV response');
    //res.setHeader('Content-Type', 'text/csv');
    //res.setHeader('Content-Disposition', 'attachment; filename="projects.csv"');
    //res.status(200).send(csv);

    return response;
  } catch (error: any) {
    console.error('Error in handler:', error);
    return new NextResponse(error.message, { status: 500 });
    //res.status(500).json({ error: error.message});
  }
}
