import { logger } from '@bcgov/common-nodejs-utils';
import { getConfig } from '../config/githubConfig';
import { getAuthenticatedApps } from './githubInvitationInit';


export const inviteUserToOrg = async (userId, org) => {
  const installations = await getAuthenticatedApps()
  const app = installations.apps[org.toLowerCase()]
  return app.authenticatedRequest('POST /orgs/{org}/invitations', {
    org,
    invitee_id: userId,
  })
}

export const inviteUserToOrgs = async (userId, orgs) => {
  logger.info(`inviteUserToOrg ${userId} ${orgs}`)
  return orgs.map(async (org) => {
    try {
      logger.info(`User ${userId} is being invited to ${org}`)
      await inviteUserToOrg(userId, org)
      logger.info(`User ${userId} is to ${org}`)
    } catch (err:any) {
      if (err.status === 422) {
        logger.info(`User ${userId} is already in org ${org}. Skipping.`)
      } else {
        logger.error(`Could not invite ${userId} to org ${org}`)
        logger.info(JSON.stringify(err))
        throw err
      }
    }
  })
}

export const getUserByName = async (username) => {
  logger.info(`getUserByName ${username}`)
  const installations = await getAuthenticatedApps()
  const primaryOrg = getConfig().primaryOrg.toLowerCase()

  const response = await installations.apps[
    primaryOrg
  ].authenticatedRequest('GET /users/{username}', {
    username,
  })
  return response.data
}
