import { createClient } from 'redis'
import { getServerEnvConfig } from '../config/env.js'

let client: ReturnType<typeof createClient> | null = null
let isReady = false
let connectionFailed = false
let warningShown = false

export async function getRedisClient() {
  if (client) return client
  if (connectionFailed) return null

  const { redisUrl } = getServerEnvConfig()
  if (!redisUrl) {
    if (!warningShown) {
      console.log('⚠️  Redis non configuré - Les logs d\'actions ne seront pas persistés')
      warningShown = true
    }
    return null
  }

  try {
    client = createClient({ url: redisUrl })

    client.on('error', () => {
      // Silencieux - déjà géré dans le catch
    })

    // Timeout de 2 secondes pour la connexion Redis
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
      )
    ])
    
    isReady = true
    console.log('✅ Redis connecté')
    return client
    
  } catch (error) {
    if (!warningShown) {
      console.log('⚠️  Redis non disponible - L\'application continuera sans Redis (logs en mémoire uniquement)')
      warningShown = true
    }
    connectionFailed = true
    if (client) {
      client.disconnect().catch(() => {})
    }
    client = null
    isReady = false
    return null
  }
}

export function isRedisAvailable(): boolean {
  return isReady && client !== null
}

export async function closeRedisClient() {
  if (client && isReady) {
    await client.quit()
    isReady = false
    client = null
  }
}
