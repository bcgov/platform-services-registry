import { NextRequest, NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { PrivateProject } from '@/queries/types';
import { getPrivateCloudProjectsQuery, getPrivateCloudProjectsResult } from '@/queries/private-cloud/helpers';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const ministry = searchParams.get('ministry');
  const cluster = searchParams.get('cluster');
  const userEmail = searchParams.get('email');

  try {
    const searchQuery = await getPrivateCloudProjectsQuery({
      searchTerm: search,
      ministry,
      cluster,
      userEmail,
    });

    const projects = await getPrivateCloudProjectsResult({ searchQuery });

    // Map the data to the correct format for CSV conversion
    const formattedData = projects.map((project: PrivateProject) => ({
      name: project.name,
      description: project.description,
      ministry: project.ministry,
      cluster: project.cluster,
      projectOwnerEmail: project.projectOwnerDetails.email,
      projectOwnerName: project.projectOwnerDetails.firstName + ' ' + project.projectOwnerDetails.lastName,
      primaryTechnicalLeadEmail: project.primaryTechnicalLeadDetails.email,
      primaryTechnicalLeadName:
        project.primaryTechnicalLeadDetails.firstName + ' ' + project.primaryTechnicalLeadDetails.lastName,
      secondaryTechnicalLeadEmail: project.secondaryTechnicalLeadDetails
        ? project.secondaryTechnicalLeadDetails.email
        : '',
      secondaryTechnicalLeadName: project.secondaryTechnicalLeadDetails
        ? project.secondaryTechnicalLeadDetails.firstName + ' ' + project.secondaryTechnicalLeadDetails.lastName
        : '',
      created: new Date(project.created['$date']).toISOString(),
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
    return new NextResponse(error.message, { status: 500 });
  }
}
