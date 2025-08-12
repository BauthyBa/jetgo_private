"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import TripDetailView from '@/components/trip-detail-view'
import type { Trip } from '@/lib/trips'

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const fetchTrip = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from('trips')
          .select(`
            *,
            user_profiles!trips_created_by_fkey(name)
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        setTrip(data)
      } catch (error) {
        console.error('Error fetching trip:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
    fetchTrip()
  }, [params.id, router])

  const handleBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando viaje...</p>
        </div>
      </div>
    )
  }

  if (!trip || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Viaje no encontrado</p>
          <button 
            onClick={handleBack}
            className="mt-4 text-orange-500 hover:text-orange-600"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return <TripDetailView trip={trip} user={user} onBack={handleBack} />
} 