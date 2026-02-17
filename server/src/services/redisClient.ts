import { createClient } from 'redis'
import { getServerEnvConfig } from '../config/env.js'

let client: ReturnType<typeof createClient> | null = null
let isReady = false

export async function getRedisClient() {
  if (client) return client

  const { redisUrl } = getServerEnvConfig()
  if (!redisUrl) return null

  client = createClient({ url: redisUrl })

  client.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })

  if (!isReady) {
    await client.connect()
    isReady = true
  }

  return client
}

export async function closeRedisClient() {
  if (client && isReady) {
    await client.quit()
    isReady = false
    client = null
  }
}
