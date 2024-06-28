import { Prisma, EventType } from '@prisma/client';
import prisma from '@/core/prisma';

export async function loginEvents() {
  const pipeline: Prisma.InputJsonValue[] = [
    {
      $match: {
        type: EventType.LOGIN,
        $expr: {
          $gte: ['$createdAt', { $dateSubtract: { startDate: '$$NOW', unit: 'month', amount: 3 } }],
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
  return result as never as { date: string; Logins: string }[];
}
