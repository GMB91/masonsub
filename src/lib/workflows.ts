import { autoSkipTrace } from './skipTrace'
import { sendProactiveClientUpdate } from './email'
import traceStore from './traceStore'
import { info, warn } from './logger'

export async function updateClaimantWithWorkflows(oldClaimant: any | null, newClaimant: any) {
  const oldStatus = oldClaimant?.status
  const newStatus = newClaimant?.status

  if (oldStatus !== 'researching' && newStatus === 'researching') {
    try {
      const trace = await autoSkipTrace(newClaimant)
      // In a real app we'd persist TraceHistory; here we attach to the returned claimant for dev.
      // eslint-disable-next-line no-console
      info('[workflows] autoSkipTrace (dev)', { claimant: newClaimant.id || newClaimant.external_id || 'unknown', confidence: trace.confidence })
      newClaimant.enriched_data = trace
      try {
        await traceStore.addTrace({
          id: (globalThis.crypto && (globalThis.crypto as any).randomUUID ? (globalThis.crypto as any).randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`),
          claimant_id: newClaimant.id || newClaimant.external_id || 'unknown',
          timestamp: new Date().toISOString(),
          type: 'skip-trace',
          payload: trace,
          confidence: trace.confidence,
        })
        info('trace.persisted', { claimant: newClaimant.id || newClaimant.external_id || 'unknown' })
      } catch (e) {
        warn('trace.persist.failed', { err: (e as any)?.message || String(e) })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[workflows] autoSkipTrace failed (dev):', (err as any)?.message || err)
    }
  }

  if (oldStatus !== 'contacted' && newStatus === 'contacted') {
    try {
      await sendProactiveClientUpdate(newClaimant.id || newClaimant.claim_id || 'unknown', 'contacted')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[workflows] sendProactiveClientUpdate failed (dev):', (err as any)?.message || err)
    }
  }

  // TODO: create Reminder, Activity log, enqueue background jobs
  return newClaimant
}

export default { updateClaimantWithWorkflows }
