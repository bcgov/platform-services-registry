import { EventType } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';
import { format, toZonedTime } from 'date-fns-tz';
import prisma from '@/core/prisma';
import { AnalyticsGeneralFilterBody } from '@/validation-schemas/analytics-general';

export async function getAnalyticsGeneral({ dates = [], userId = '' }: AnalyticsGeneralFilterBody) {
  const dateFilter =
    dates.length === 2
      ? {
          createdAt: {
            gte: startOfDay(new Date(dates[0])),
            lte: endOfDay(new Date(dates[1])),
          },
        }
      : {};

  const events = await prisma.event.findMany({
    where: {
      type: EventType.LOGIN,
      ...(userId ? { userId } : {}),
      ...dateFilter,
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const grouped: Record<string, number> = {};

  events.forEach(({ createdAt }) => {
    const zonedDate = format(toZonedTime(createdAt, 'America/Vancouver'), 'yyyy-MM-dd');
    grouped[zonedDate] = (grouped[zonedDate] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, Logins]) => ({ date, Logins }));
}
