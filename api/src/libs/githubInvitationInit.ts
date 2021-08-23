import { createAppAuth } from '@octokit/auth'
import { request } from '@octokit/request'
import { getGithubPrivateKey } from '../config/githubConfig'
import { logger } from '@bcgov/common-nodejs-utils';
import { BC_ORGNAZTION_GIT_APP_ID } from '../constants'

// cached value
type APPInitialValue = {
  initialized: number | null,
  apps: object,
  nonInstallatedApp: ((request: string) => any) | null,
}

const installationApps: APPInitialValue = {
  initialized: null,
  apps: {},
  nonInstallatedApp: null,
}

/**
 * getNonInstallationApp
 * @returns a non installed github app
 */
export const getNonInstallationApp = () => {
  logger.info('getNonInstallationApp');

  // caches a non installed app

  try {
    if (!installationApps.nonInstallatedApp) {
      const auth = createAppAuth({
        appId: process.env.GITHUB_APP_ID || BC_ORGNAZTION_GIT_APP_ID,
        privateKey: getGithubPrivateKey(),
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      });
      installationApps.nonInstallatedApp = request.defaults({
        request: {
          hook: auth.hook,
        },
        mediaType: {
          previews: ['machine-man'],
        },
      });
    }
  } catch (err) {
    logger.error(err);
  }
  return installationApps.nonInstallatedApp;
};


const newAuthorizedApp = (installationId) => {

  const app = createAppAuth({
    appId: process.env.GITHUB_APP_ID || BC_ORGNAZTION_GIT_APP_ID,
    privateKey: getGithubPrivateKey(),
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    installationId,
  })

  return {
    initialized: Date.now(),
    app,
    id: installationId,
    authenticatedRequest: request.defaults({
      request: {
        hook: app.hook,
      },
      mediaType: {
        previews: ['machine-man'],
      },
    }),
  }
}

export const getInstallations = async () => {
    logger.info('getInstallations')

    const nonInstallationRequest = getNonInstallationApp()

    if(nonInstallationRequest !== null){
      const response = await nonInstallationRequest('GET /app/installations')
      return response.data
    }
    // TODO(BILLY LI): maybe throw if there's no installation
    return []
}

export const getOrgInstallations = async () => {
  logger.info('getOrgInstallations')

  const installations = await getInstallations()

  // lower case installation login names
  const loweredInstallations = installations.map((i) => ({
    ...i,
    account: { ...i.account, login: i.account.login.toLowerCase() },
  }))

  logger.info(
    `This github app has been installed on ${loweredInstallations.map(
      (i) => i.account.login
    )}`
  )

  return installations
}

/**
 * a new authenticated app must be created for every installation in order to invite users
 */
export const getAuthenticatedApps =  async () => {

  try {
    logger.info('getAuthenticatedApps')
    if (!installationApps.initialized) {
      logger.info('Initializing Authenticated Apps')
      installationApps.initialized = Date.now()

      const installations = await getOrgInstallations()

      installations.forEach((installation) => {
        const name = installation.account.login.toLowerCase()
        if (!installationApps.apps[name]) {
          logger.info(`newAuthorizedApp created for ${name} installation: ${installation.id}`)
          installationApps.apps[name] = newAuthorizedApp(installation.id)
          }
        })
      } else {
        logger.info(`Installation Apps returned: ${Object.keys(installationApps.apps)}`)
        logger.info(`Authenticated Apps were cached, reusing the ones initialized on ${installationApps.initialized}`)
          }
        } catch(err){
          logger.info(err)
        }

  return installationApps
}

/**
 * initializes and validates SSO config as well as github applications
 * all errors bubble to top to quit process
 */
export const init = async () => {
  logger.info('Checking Authenticated Apps')
  await getAuthenticatedApps()
}


export default init
