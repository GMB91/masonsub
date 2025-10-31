"use client"
import React, { useEffect } from 'react'

export default function UploadMappingClient({ id, headers, suggested }: { id: string; headers: string[]; suggested: Record<string, any> }) {
  useEffect(() => {
    function getStoredThreshold() { try { const v = localStorage.getItem('upload-mapping-threshold'); if (v) return Number(v); } catch (e) {} return 70 }
    function setStoredThreshold(v: any) { try { localStorage.setItem('upload-mapping-threshold', String(v)) } catch (e) {} }

    function toMapping() {
      const mapping: Record<string, string> = {}
      headers.forEach(h => { const sel = document.querySelector('select[name="mapping[' + h + ']"]') as HTMLSelectElement | null; if (sel) mapping[h] = sel.value })
      const hidden = document.getElementById('mapping-json-' + id) as HTMLInputElement | null
      if (hidden) hidden.value = JSON.stringify(mapping)
      highlight(mapping)
      updateHeaderChips(mapping)
    }

    function applyAuto() {
      const chk = document.getElementById('auto-apply-' + id) as HTMLInputElement | null
      const thrEl = document.getElementById('threshold-' + id) as HTMLInputElement | null
      const thr = thrEl ? Number(thrEl.value) : getStoredThreshold()
      headers.forEach(h => {
        const info = (suggested || {})[h]
        const sel = document.querySelector('select[name="mapping[' + h + ']"]') as HTMLSelectElement | null
        if (!sel) return
        const top = info && info.top ? info.top.target : ''
        const conf = info && info.top ? Number(info.top.confidence) : 0
        if (chk && chk.checked && top && conf >= thr/100) { try { sel.value = top } catch (e) {} }
      })
      toMapping()
    }

    function highlight(mapping: Record<string,string>) {
      const ths = Array.from(document.querySelectorAll('table thead th'))
      const rows = Array.from(document.querySelectorAll('table tbody tr'))
      headers.forEach((h, idx) => {
        const th = ths[idx] as HTMLElement | undefined
        const mapped = mapping[h] || ''
        if (th) { if (mapped && mapped !== h) th.classList.add('bg-amber-50'); else th.classList.remove('bg-amber-50') }
        rows.forEach(r => { const td = r.children[idx] as HTMLElement | undefined; if (td) { if (mapped && mapped !== h) td.classList.add('bg-amber-50'); else td.classList.remove('bg-amber-50') } })
      })
    }

    function updateHeaderChips(mapping: Record<string,string>) {
      try {
        headers.forEach(h => {
          const chip = document.querySelector('[data-preview-mapped-for="' + h + '"]') as HTMLElement | null
          const th = document.querySelector('[data-mapped-header-for="' + h + '"]') as HTMLElement | null
          const orig = document.querySelector('[data-mapped-original-for="' + h + '"]') as HTMLElement | null
          const mappedTo = mapping[h] || ''
          if (chip) chip.textContent = mappedTo ? '→ ' + mappedTo : ''
          if (th) th.textContent = mappedTo ? mappedTo : h
          if (orig) orig.textContent = mappedTo && mappedTo !== h ? '(was ' + h + ')' : ''
        })
      } catch (e) {
        // ignore DOM errors
      }
    }

    function init() {
      const thrEl = document.getElementById('threshold-' + id) as HTMLInputElement | null
      const thrDisplay = document.getElementById('threshold-display-' + id) as HTMLElement | null
      if (thrEl) {
        const stored = getStoredThreshold()
        thrEl.value = String(stored)
        if (thrDisplay) thrDisplay.textContent = stored + '%'
        thrEl.addEventListener('input', (ev: any) => { const v = ev.target.value; if (thrDisplay) thrDisplay.textContent = v + '%' })
        thrEl.addEventListener('change', (ev: any) => { setStoredThreshold(ev.target.value); applyAuto() })
      }
      document.querySelectorAll('select[name^="mapping["]').forEach(s => s.addEventListener('change', toMapping))
      const chk = document.getElementById('auto-apply-' + id) as HTMLInputElement | null
      if (chk) chk.addEventListener('change', applyAuto)
      applyAuto()

      // expose helpers for tests/debug
      try { (window as any)['__uploadMapping_' + id] = { toMapping, applyAuto } } catch (e) {}
    }

    try { init() } catch (e) { document.addEventListener('DOMContentLoaded', init) }

    // cleanup not necessary for short-lived page
  }, [id, headers, suggested])

  return null
}
