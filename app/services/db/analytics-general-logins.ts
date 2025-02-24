import { EventType, Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { AnalyticsGeneralFilterBody } from '@/validation-schemas/analytics-general';

export async function filterAnalyticsGeneral({ dates = [], userId = '' }: AnalyticsGeneralFilterBody) {
  const pipeline: Prisma.InputJsonValue[] = [
    {
      $match: {
        type: EventType.LOGIN,
        ...(userId && userId !== '' ? { userId } : {}),
        ...(dates?.length === 2
          ? {
              $expr: {
                $and: [
                  { $gte: ['$createdAt', { $toDate: dates[0] }] },
                  { $lte: ['$createdAt', { $toDate: dates[1] }] },
                ],
              },
            }
          : {}),
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
  return result as never as { date: string; Logins: string }[];
}
