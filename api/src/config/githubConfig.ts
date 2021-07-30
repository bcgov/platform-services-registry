import { readFileSync } from 'fs'
import { logger } from '@bcgov/common-nodejs-utils';
import path from 'path'

const getBasePathWithFile = (file) => {
  let filePath

  if (
    (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development') &&
    process.env.PRIVATE_KEY_PATH &&
    file === 'github-private-key.pem'
  ) {
    filePath = `${process.env.PRIVATE_KEY_PATH}/${file}`
  } else if (process.env.NODE_ENV === 'production' && process.env.CONFIG_PATH) {
    filePath = `${process.env.CONFIG_PATH}/${file}`
  } else {
    filePath = path.join(__dirname, `${file}`)
  }
  logger.info(`Loading ${file} from ${filePath}`)
  return filePath
} 
/**
 * returns the config file, opting to use a wrapper funciton over direct import to allow for
 * testability. File mocks can only be static :/
 */
export const getConfig = () => {
  const data = readFileSync(getBasePathWithFile('config.json'))
  return JSON.parse(data.toString())
}

/**
 * @returns role mapping configg
 */
export const getRoleMapping = () => {
  const data = readFileSync(getBasePathWithFile('role-mappers.json'))
  return JSON.parse(data.toString())
}

/** @returns github private key */
export const getGithubPrivateKey = () => {
  const data = readFileSync(getBasePathWithFile('github-private-key.pem'))
  return data.toString()
}
