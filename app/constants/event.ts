import { EventType } from '@prisma/client';

export const eventTypeNames: Record<EventType, string> = {
  [EventType.LOGIN]: 'Login',
  [EventType.LOGOUT]: 'Logout',
  [EventType.CREATE_TEAM_API_TOKEN]: 'Create Team API Token',
  [EventType.UPDATE_TEAM_API_TOKEN]: 'Update Team API Token',
  [EventType.DELETE_TEAM_API_TOKEN]: 'Delete Team API Token',
  [EventType.CREATE_API_TOKEN]: 'Create API Token',
  [EventType.DELETE_API_TOKEN]: 'Delete API Token',
  [EventType.CREATE_PRIVATE_CLOUD_PRODUCT]: 'Create Private Cloud Product',
  [EventType.UPDATE_PRIVATE_CLOUD_PRODUCT]: 'Update Private Cloud Product',
  [EventType.DELETE_PRIVATE_CLOUD_PRODUCT]: 'Delete Private Cloud Product',
  [EventType.EXPORT_PRIVATE_CLOUD_PRODUCT]: 'Export Private Cloud Product',
  [EventType.REVIEW_PRIVATE_CLOUD_REQUEST]: 'Review Private Cloud Request',
  [EventType.RESEND_PRIVATE_CLOUD_REQUEST]: 'Resend Private Cloud Request',
  [EventType.REPROVISION_PRIVATE_CLOUD_PRODUCT]: 'Reprovision Private Cloud Product',
  [EventType.CREATE_PUBLIC_CLOUD_PRODUCT]: 'Create Public Cloud Product',
  [EventType.UPDATE_PUBLIC_CLOUD_PRODUCT]: 'Update Public Cloud Product',
  [EventType.DELETE_PUBLIC_CLOUD_PRODUCT]: 'Delete Public Cloud Product',
  [EventType.EXPORT_PUBLIC_CLOUD_PRODUCT]: 'Export Public Cloud Product',
  [EventType.REVIEW_PUBLIC_CLOUD_REQUEST]: 'Review Public Cloud Request',
};