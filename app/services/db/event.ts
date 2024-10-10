import { EventType } from '@prisma/client';
import { z } from 'zod';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';

const validationSchemas = {
  [EventType.CREATE_PRIVATE_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.UPDATE_PRIVATE_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.DELETE_PRIVATE_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.REVIEW_PRIVATE_CLOUD_REQUEST]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.RESEND_PRIVATE_CLOUD_REQUEST]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.REPROVISION_PRIVATE_CLOUD_PRODUCT]: z.object({
    licencePlate: z.string().min(6),
  }),
  [EventType.CREATE_PUBLIC_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.UPDATE_PUBLIC_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.DELETE_PUBLIC_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.REVIEW_PUBLIC_CLOUD_REQUEST]: z.object({
    requestId: z.string().length(24),
  }),
};

const validationKeys = Object.keys(validationSchemas);

export async function createEvent(type: EventType, userId = '', data = {}) {
  try {
    if (validationKeys.includes(type)) {
      const validationSchame = validationSchemas[type as keyof typeof validationSchemas];

      const parsed = validationSchame.safeParse(data);
      if (!parsed.success) {
        throw Error(`invalid data for event type ${type}: ${JSON.stringify(data)}`);
      }
    }

    const event = await prisma.event.create({
      data: {
        type,
        userId,
        data,
      },
    });

    return event;
  } catch (error) {
    logger.error('createEvent:', error);
  }
}
