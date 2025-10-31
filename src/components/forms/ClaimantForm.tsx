"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { claimantSchema, ClaimantInput } from '@/lib/validators/claimant'
import { useClaimantMutations } from '@/lib/hooks/useClaimants'

export default function ClaimantForm({ initial, onSaved }: { initial?: Partial<ClaimantInput>, onSaved?: () => void }) {
  const { create, update } = useClaimantMutations()
  const { register, handleSubmit, formState: { errors } } = useForm<ClaimantInput>({ resolver: zodResolver(claimantSchema), defaultValues: initial as any })

  const onSubmit = async (data: ClaimantInput) => {
    try {
      if ((initial as any)?.id) {
        await update.mutateAsync({ id: (initial as any).id, patch: data })
      } else {
        await create.mutateAsync(data)
      }
      onSaved && onSaved()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-white border border-slate-200 rounded-xl p-4">
      <div>
        <label className="block text-sm">First name</label>
        <input {...register('firstName')} className="mt-1 w-full border rounded px-2 py-1" />
        {errors.firstName && <div className="text-red-600 text-sm">{errors.firstName.message as any}</div>}
      </div>
      <div>
        <label className="block text-sm">Last name</label>
        <input {...register('lastName')} className="mt-1 w-full border rounded px-2 py-1" />
        {errors.lastName && <div className="text-red-600 text-sm">{errors.lastName.message as any}</div>}
      </div>
      <div>
        <label className="block text-sm">Email</label>
        <input {...register('email')} className="mt-1 w-full border rounded px-2 py-1" />
      </div>
      <div className="flex gap-2">
        <button className="btn bg-blue-600 text-white px-4 py-2 rounded" type="submit">Save</button>
      </div>
    </form>
  )
}
