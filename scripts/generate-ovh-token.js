// Script pour générer un OVH Consumer Key
// Usage: node scripts/generate-ovh-token.js

import ovh from 'ovh'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function main() {
  console.log('🔑 Génération du Consumer Key OVH\n')

  const endpoint = await question('Endpoint (ovh-eu, ovh-us, ovh-ca) [ovh-eu]: ') || 'ovh-eu'
  const appKey = await question('Application Key: ')
  const appSecret = await question('Application Secret: ')

  if (!appKey || !appSecret) {
    console.error('❌ Application Key et Secret requis')
    process.exit(1)
  }

  const client = ovh({
    endpoint,
    appKey,
    appSecret
  })

  try {
    const result = await client.requestPromised('POST', '/auth/credential', {
      accessRules: [
        { method: 'GET', path: '/cloud/project' },
        { method: 'GET', path: '/cloud/project/*' },
        { method: 'POST', path: '/cloud/project/*/instance/*/start' },
        { method: 'POST', path: '/cloud/project/*/instance/*/stop' }
      ]
    })

    console.log('\n✅ Validation URL générée:\n')
    console.log(result.validationUrl)
    console.log('\n📋 Ouvrez cette URL dans votre navigateur pour autoriser l\'application.')
    console.log('\nAprès validation, ajoutez cette clé dans votre .env:\n')
    console.log(`OVH_CONSUMER_KEY=${result.consumerKey}\n`)

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }

  rl.close()
}

main()
