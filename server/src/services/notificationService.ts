import nodemailer from 'nodemailer'
import { ActionLogEntry } from './actionLogService.js'

interface NotificationConfig {
  enabled: boolean
  slackEnabled: boolean
  emailEnabled: boolean
  slackWebhookUrl?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  mailFrom?: string
  mailTo?: string
}

function getNotificationConfig(): NotificationConfig {
  return {
    enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
    slackEnabled: process.env.SLACK_ENABLED === 'true',
    emailEnabled: process.env.EMAIL_ENABLED === 'true',
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    mailFrom: process.env.MAIL_FROM,
    mailTo: process.env.MAIL_TO
  }
}

export async function notifyAction(entry: ActionLogEntry) {
  const config = getNotificationConfig()
  
  if (!config.enabled) {
    return // Notifications désactivées globalement
  }

  const promises = []
  
  if (config.slackEnabled) {
    promises.push(sendSlackNotification(entry))
  }
  
  if (config.emailEnabled) {
    promises.push(sendEmailNotification(entry))
  }
  
  if (promises.length > 0) {
    await Promise.allSettled(promises)
  }
}

async function sendSlackNotification(entry: ActionLogEntry) {
  const { slackWebhookUrl } = getNotificationConfig()
  if (!slackWebhookUrl) {
    console.warn('⚠️ SLACK_WEBHOOK_URL non configurée')
    return
  }

  const color = entry.status === 'success' ? '#36a64f' : '#ff4d4f'
  const text = `${entry.action.toUpperCase()} ${entry.instanceId} (${entry.projectId})`

  await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [
        {
          color,
          title: `OVH Cloud Manager - ${entry.mode.toUpperCase()}`,
          text,
          fields: [
            { title: 'Statut', value: entry.status, short: true },
            { title: 'Mode', value: entry.mode, short: true },
            { title: 'Heure', value: entry.timestamp, short: false }
          ]
        }
      ]
    })
  })
}

async function sendEmailNotification(entry: ActionLogEntry) {
  const { smtpHost, smtpPort, smtpUser, smtpPass, mailFrom, mailTo } = getNotificationConfig()
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom || !mailTo) return

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  })

  const subject = `[OVH Manager] ${entry.action.toUpperCase()} ${entry.instanceId} - ${entry.status.toUpperCase()}`
  const text = `
Action: ${entry.action}
Instance: ${entry.instanceId}
Projet: ${entry.projectId}
Mode: ${entry.mode}
Statut: ${entry.status}
Heure: ${entry.timestamp}
${entry.message ? `Message: ${entry.message}` : ''}
`.trim()

  await transporter.sendMail({
    from: mailFrom,
    to: mailTo,
    subject,
    text
  })
}
