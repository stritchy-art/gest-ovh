import fs from 'fs'

export interface ServerEnvConfig {
  ovhEndpoint: 'ovh-eu' | 'ovh-us' | 'ovh-ca'
  ovhAppKey: string
  ovhAppSecret: string
  ovhConsumerKey: string
  redisUrl?: string
  actionLogRetention?: number
}

function readSecretFile(path?: string): string {
  if (!path) return ''
  try {
    return fs.readFileSync(path, 'utf-8').trim()
  } catch {
    return ''
  }
}

export function getServerEnvConfig(): ServerEnvConfig {
  const ovhAppKey = process.env.OVH_APP_KEY || readSecretFile(process.env.OVH_APP_KEY_FILE)
  const ovhAppSecret = process.env.OVH_APP_SECRET || readSecretFile(process.env.OVH_APP_SECRET_FILE)
  const ovhConsumerKey = process.env.OVH_CONSUMER_KEY || readSecretFile(process.env.OVH_CONSUMER_KEY_FILE)

  return {
    ovhEndpoint: (process.env.OVH_ENDPOINT as ServerEnvConfig['ovhEndpoint']) || 'ovh-eu',
    ovhAppKey,
    ovhAppSecret,
    ovhConsumerKey,
    redisUrl: process.env.REDIS_URL,
    actionLogRetention: process.env.ACTION_LOG_RETENTION ? Number(process.env.ACTION_LOG_RETENTION) : 500
  }
}

export function hasOvhCredentials(config: ServerEnvConfig): boolean {
  return Boolean(config.ovhAppKey && config.ovhAppSecret && config.ovhConsumerKey)
}
