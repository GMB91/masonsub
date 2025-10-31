"use client"
import React from "react"

export default function UploadForm() {
  return (
    <form className="bg-white border border-slate-200 rounded-xl p-4">
  <label htmlFor="csv-file" className="block text-sm">CSV File</label>
  <input id="csv-file" aria-label="CSV file" title="CSV file" type="file" accept=".csv" className="mt-2" />
      <div className="mt-4"><button className="btn bg-blue-600 text-white px-4 py-2 rounded">Upload</button></div>
    </form>
  )
}
