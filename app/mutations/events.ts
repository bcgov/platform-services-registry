import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';

export async function createEvent(type: $Enums.EventType, userId = '', payload = {}) {
  const event = await prisma.event.create({
    data: {
      type,
      userId,
      payload,
    },
  });

  return event;
}
