import { Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { LoginSearchBody } from '@/validation-schemas/logins';

export async function loginEvents({ types = [], dates = [], userId = '' }: LoginSearchBody) {
  const pipeline: Prisma.InputJsonValue[] = [
    {
      $match: {
        type: types[0],
        ...(userId && userId !== '' ? { userId } : {}),
        $expr: {
          $and: [{ $gte: ['$createdAt', { $toDate: dates[0] }] }, { $lte: ['$createdAt', { $toDate: dates[1] }] }],
        },
      },
    },
    {
      $project: {
        yearMonthDayVancouver: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone: 'America/Vancouver',
          },
        },
      },
    },
    {
      $group: {
        _id: '$yearMonthDayVancouver',
        Logins: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        date: '$_id',
        Logins: 1,
      },
    },
  ];

  const result = await prisma.event.aggregateRaw({ pipeline });
  return result as never as { date: string; [key: string]: string }[];
}
