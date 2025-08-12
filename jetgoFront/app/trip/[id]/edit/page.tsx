"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Edit,
  Save,
  X
} from 'lucide-react'
import type { Trip } from '@/lib/trips'

export default function TripEditPage() {
  const params = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState({
    destination: '',
    description: '',
    start_date: '',
    end_date: '',
    budget_min: '',
    budget_max: '',
    max_participants: '8'
  })

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
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        
        setTrip(data)
        setEditData({
          destination: data.destination,
          description: data.description || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          budget_min: data.budget_min?.toString() || '',
          budget_max: data.budget_max?.toString() || '',
          max_participants: data.max_participants?.toString() || '8'
        })
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

  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('trips')
        .update({
          destination: editData.destination,
          description: editData.description,
          start_date: editData.start_date || null,
          end_date: editData.end_date || null,
          budget_min: editData.budget_min ? parseInt(editData.budget_min) : null,
          budget_max: editData.budget_max ? parseInt(editData.budget_max) : null,
          max_participants: parseInt(editData.max_participants)
        })
        .eq('id', trip!.id)

      if (error) throw error

      // Redirect to trip detail page
      router.push(`/trip/${trip!.id}`)
    } catch (error) {
      console.error('Error saving trip:', error)
      alert('Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/trip/${params.id}`)
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
            onClick={() => router.push('/')}
            className="mt-4 text-orange-500 hover:text-orange-600"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Editar Viaje: {trip.destination}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Editar Detalles del Viaje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destino
                </label>
                <Input
                  value={editData.destination}
                  onChange={(e) => setEditData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Destino del viaje"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del viaje"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio
                  </label>
                  <Input
                    type="date"
                    value={editData.start_date}
                    onChange={(e) => setEditData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de fin
                  </label>
                  <Input
                    type="date"
                    value={editData.end_date}
                    onChange={(e) => setEditData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Presupuesto mínimo
                  </label>
                  <Input
                    type="number"
                    value={editData.budget_min}
                    onChange={(e) => setEditData(prev => ({ ...prev, budget_min: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Presupuesto máximo
                  </label>
                  <Input
                    type="number"
                    value={editData.budget_max}
                    onChange={(e) => setEditData(prev => ({ ...prev, budget_max: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de participantes
                </label>
                <Input
                  type="number"
                  value={editData.max_participants}
                  onChange={(e) => setEditData(prev => ({ ...prev, max_participants: e.target.value }))}
                  min="1"
                  max="50"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 