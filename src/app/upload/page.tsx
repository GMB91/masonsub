import React from "react"

export default function UploadPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Upload Data</h2>
      <p className="text-sm text-slate-600">Upload a CSV to infer column mappings and preview rows.</p>

      <form method="post" action="/import/submit" encType="multipart/form-data" className="mt-4">
        <div className="flex items-center gap-2">
          <label htmlFor="csv-file" className="sr-only">CSV file</label>
            <input id="csv-file" aria-label="CSV file" title="CSV file" type="file" name="file" accept="text/csv" className="" />
          <input type="hidden" name="org" value="demo" />
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Upload & Preview</button>
        </div>
      </form>
    </section>
  )
}
