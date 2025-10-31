import { NextResponse } from 'next/server'
import tmpStore from '@/lib/importTmpStore'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const id = String(form.get('id') || '')
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
    // mapping can come as a single JSON field (tests / clients) OR as
    // separate form fields named mapping[<header>] produced by the server-side editor.
    let mapping: Record<string, string> = {}
    const mappingRaw = form.get('mapping')
    if (mappingRaw) {
      try {
        mapping = JSON.parse(String(mappingRaw))
      } catch (e) {
        return NextResponse.json({ error: 'invalid mapping' }, { status: 400 })
      }
    } else {
      // attempt to assemble mapping from form entries like mapping[Full Name] = "name"
      try {
        // Some test mocks are plain objects without entries(); guard accordingly
        const entries = (form as any).entries && typeof (form as any).entries === 'function' ? (form as any).entries() : null
        if (entries && typeof entries[Symbol.iterator] === 'function') {
          for (const [k, v] of entries) {
            if (typeof k === 'string' && k.startsWith('mapping[') && k.endsWith(']')) {
              const header = k.slice(8, -1)
              mapping[header] = String(v || '')
            }
          }
        } else if (typeof form === 'object') {
          // fallback for very small mocks: iterate known keys via get? not much to do here
          // If mapping is empty here, downstream will error.
          for (const key of Object.keys(form)) {
            if (key.startsWith('mapping[') && key.endsWith(']')) {
              try {
                const header = key.slice(8, -1)
                const val = (form as any).get ? (form as any).get(key) : (form as any)[key]
                mapping[header] = String(val || '')
              } catch (e) {
                // ignore
              }
            }
          }
        }
      } catch (e) {
        // ignore and continue; we'll validate mapping below
      }
    }
    try {
      await tmpStore.applyMapping(id, mapping)
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('expired')) {
        // snapshot expired — redirect user to upload page to re-upload
        return NextResponse.redirect(new URL(`/upload?err=expired`, req.url))
      }
      throw e
    }

    // redirect back to result page with applied flag
    return NextResponse.redirect(new URL(`/upload/result/${id}?applied=1`, req.url))
  } catch (err: any) {
    console.error('[import/apply] error', err)
    return NextResponse.json({ error: err?.message ?? 'apply failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
