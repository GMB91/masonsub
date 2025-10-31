import UploadMappingEditor from '@/components/forms/UploadMappingEditor'
import tmpStore from '@/lib/importTmpStore'

export default async function ResultPage({ params }: { params: { id: string } }) {
  const id = params.id
  let data: any = null
  try {
    data = await tmpStore.readImportData(id)
  } catch (e: any) {
    const msg = String(e?.message || '')
    if (msg.includes('expired')) {
      return (
        <section>
          <h2 className="text-2xl font-semibold">Upload expired</h2>
          <p className="text-sm text-red-600">This upload snapshot has expired. Please re-upload your CSV to create a new preview.</p>
          <div className="mt-4">
            <a href="/upload" className="px-3 py-1 bg-blue-600 text-white rounded">Re-upload CSV</a>
          </div>
        </section>
      )
    }

    return (
      <section>
        <h2 className="text-2xl font-semibold">Upload result</h2>
        <p className="text-sm text-red-600">Could not find uploaded import (it may have expired).</p>
      </section>
    )
  }

  const { suggestedMapping, preview, headers, mapped } = data

  return (
    <section>
      <h2 className="text-2xl font-semibold">Upload — Mapping Editor</h2>
      <p className="text-sm text-slate-600">Review suggested mapping, edit per-column, and apply.</p>

      <UploadMappingEditor id={id} headers={headers} suggestedMapping={suggestedMapping} preview={preview} mapped={mapped} />
    </section>
  )
}
