import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface Trip {
  id: string
  organizer_id: string
  destination: string
  description: string | null
  start_date: string | null
  end_date: string | null
  budget_min: number | null
  budget_max: number | null
  max_participants: number
  current_participants: number
  room_type: string | null
  status: string
  tags: string[] | null
  image_url: string | null
  rating: number | null
  total_ratings: number | null
  season: string | null
  country: string | null
  featured: boolean | null
  created_at: string
  updated_at: string
  organizer?: {
    name: string
    profile_image_url?: string
    identity_verified: boolean
  }
  participants?: {
    user_id: string
    status: string
    user_profiles: {
      name: string
      profile_image_url?: string
    }
  }[]
}

export interface TripFilters {
  destination?: string
  season?: string
  budget_min?: number
  budget_max?: number
  room_type?: string
  country?: string
  tags?: string[]
}

export interface CreateTripData {
  destination: string
  description?: string
  start_date?: string
  end_date?: string
  budget_min?: number
  budget_max?: number
  max_participants: number
  room_type?: string
  tags?: string[]
  season?: string
  country?: string
}

// Obtener todos los viajes públicos con filtros opcionales
export async function getTrips(filters?: TripFilters): Promise<{ data: Trip[] | null, error: any }> {
  try {
    let query = supabase
      .from('trips')
      .select(`
        *,
        organizer:user_profiles!trips_organizer_id_fkey (
          name,
          profile_image_url,
          identity_verified
        ),
        participants:trip_participants (
          user_id,
          status,
          user_profiles!trip_participants_user_id_fkey (
            name,
            profile_image_url
          )
        )
      `)
      .eq('status', 'open')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    // Aplicar filtros si existen
    if (filters?.destination) {
      query = query.ilike('destination', `%${filters.destination}%`)
    }
    
    if (filters?.season) {
      query = query.eq('season', filters.season)
    }
    
    if (filters?.budget_min) {
      query = query.gte('budget_min', filters.budget_min)
    }
    
    if (filters?.budget_max) {
      query = query.lte('budget_max', filters.budget_max)
    }
    
    if (filters?.room_type) {
      query = query.eq('room_type', filters.room_type)
    }
    
    if (filters?.country) {
      query = query.eq('country', filters.country)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching trips:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Obtener viajes del usuario (organizados por él)
export async function getUserTrips(userId: string): Promise<{ data: Trip[] | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user trips:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Crear un nuevo viaje
export async function createTrip(tripData: CreateTripData, organizerId: string): Promise<{ data: Trip | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          ...tripData,
          organizer_id: organizerId,
          current_participants: 1, // El organizador siempre es el primer participante
          status: 'open'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating trip:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Actualizar un viaje existente
export async function updateTrip(tripId: string, tripData: Partial<CreateTripData>): Promise<{ data: Trip | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .update({
        ...tripData,
        updated_at: new Date().toISOString()
      })
      .eq('id', tripId)
      .select()
      .single()

    if (error) {
      console.error('Error updating trip:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Eliminar un viaje
export async function deleteTrip(tripId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)

    if (error) {
      console.error('Error deleting trip:', error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: err }
  }
}

// Unirse a un viaje
export async function joinTrip(tripId: string, userId: string): Promise<{ error: any }> {
  try {
    // Primero verificar si ya está en el viaje
    const { data: existing } = await supabase
      .from('trip_participants')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      return { error: { message: 'Ya estás registrado en este viaje' } }
    }

    // Agregar participante
    const { error } = await supabase
      .from('trip_participants')
      .insert([
        {
          trip_id: tripId,
          user_id: userId,
          status: 'pending'
        }
      ])

    if (error) {
      console.error('Error joining trip:', error)
      return { error }
    }

    // Actualizar contador de participantes
    await updateTripParticipantCount(tripId)

    return { error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: err }
  }
}

// Salir de un viaje
export async function leaveTrip(tripId: string, userId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('trip_participants')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error leaving trip:', error)
      return { error }
    }

    // Actualizar contador de participantes
    await updateTripParticipantCount(tripId)

    return { error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: err }
  }
}

// Actualizar el contador de participantes de un viaje
async function updateTripParticipantCount(tripId: string) {
  try {
    // Contar participantes confirmados + organizador
    const { data: participants } = await supabase
      .from('trip_participants')
      .select('id')
      .eq('trip_id', tripId)
      .eq('status', 'confirmed')

    const participantCount = (participants?.length || 0) + 1 // +1 para el organizador

    await supabase
      .from('trips')
      .update({ current_participants: participantCount })
      .eq('id', tripId)

  } catch (err) {
    console.error('Error updating participant count:', err)
  }
}

// Obtener destinos populares
export async function getPopularDestinations(): Promise<{ data: any[] | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('destination, country, image_url')
      .eq('status', 'open')
      .order('destination')

    if (error) {
      console.error('Error fetching destinations:', error)
      return { data: null, error }
    }

    // Agrupar por destino y contar viajes
    const destinationMap = new Map()
    
    if (data) {
      for (const trip of data) {
        const key = trip.destination
        if (destinationMap.has(key)) {
          destinationMap.get(key).trips += 1
        } else {
          destinationMap.set(key, {
            name: trip.destination,
            country: trip.country,
            image: trip.image_url || '/placeholder.svg',
            trips: 1,
            rating: 4.7, // Rating promedio por ahora
          })
        }
      }
    }

    return { data: Array.from(destinationMap.values()), error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Buscar viajes
export async function searchTrips(searchParams: TripFilters): Promise<{ data: Trip[] | null, error: any }> {
  return getTrips(searchParams)
} 