import { NextRequest, NextResponse } from 'next/server';
import { PrivateCloudProject } from '@prisma/client';
import prisma from '@/lib/prisma';
import { string, z } from 'zod';
import { privateCloudProjectsPaginated } from '@/queries/paginated/private-cloud';
import { stringify } from 'csv-stringify/sync';
//import { PrivateCloudProjectMongo } from './privateCloudProjectMongo';
import { PrivateProject } from '@/queries/types';
// import { sendProvisionedEmails } from "../ches/emailHandlers.js";

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  //const defaultPageSize = searchParams.get('defaultPageSize');
  //const currentPage = searchParams.get('currentPage');
  const search = searchParams.get('search') || '';
  const ministry = searchParams.get('ministry');
  const cluster = searchParams.get('cluster');
  const userEmail = searchParams.get('email');

  //if (!search) {
  //  return new NextResponse('Missing query parameters.', { status: 400 });
  // }

  try {
    const result = await privateCloudProjectsPaginated(
      1000000, //+defaultPageSize,
      1, //+currentPage,
      search,
      ministry,
      cluster,
      userEmail,
    );

    // Map the data to the correct format for CSV conversion
    const formattedData = result.data.map((project: PrivateProject) => ({
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

    return response; //changed from NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
