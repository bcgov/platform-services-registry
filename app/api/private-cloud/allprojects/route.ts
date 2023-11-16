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
      projectOwnerId: project.projectOwnerId, // Already a string
      primaryTechnicalLeadId: project.primaryTechnicalLeadId || '', // Handle null or undefined
      secondaryTechnicalLeadId: project.secondaryTechnicalLeadId || '',
      created: project.created.toString(),
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
        'projectOwnerId',
        'primaryTechnicalLeadId',
        'created',
        'licence plate',
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
