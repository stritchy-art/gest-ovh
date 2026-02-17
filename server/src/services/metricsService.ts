import promClient from 'prom-client'

const collectDefaultMetrics = promClient.collectDefaultMetrics
collectDefaultMetrics()

export const actionCounter = new promClient.Counter({
  name: 'ovh_manager_actions_total',
  help: 'Total des actions start/stop',
  labelNames: ['action', 'mode', 'status'] as const
})

export const apiRequestHistogram = new promClient.Histogram({
  name: 'ovh_manager_api_request_duration_seconds',
  help: 'Durée des requêtes API',
  labelNames: ['route', 'method', 'status'] as const,
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5]
})

export async function getMetrics(): Promise<string> {
  return promClient.register.metrics()
}
