"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  Edit,
  MessageCircle,
  Eye,
  Send,
  X,
  Save
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useChat } from '@/hooks/useChat'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Trip } from '@/lib/trips'

interface TripDetailViewProps {
  trip: Trip
  user: User
  onBack: () => void
}

export default function TripDetailView({ trip, user, onBack }: TripDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    destination: trip.destination,
    description: trip.description || '',
    start_date: trip.start_date || '',
    end_date: trip.end_date || '',
    budget_min: trip.budget_min?.toString() || '',
    budget_max: trip.budget_max?.toString() || '',
    max_participants: trip.max_participants?.toString() || '8'
  })
  const [isSaving, setIsSaving] = useState(false)
  
  // Chat functionality
  const { state, actions } = useChat(user)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasJoinedRef = useRef(false)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  // Join trip chat room when component mounts (solo una vez)
  useEffect(() => {
    if (user && trip.id && state.rooms.length > 0 && !hasJoinedRef.current) {
      // Create or join trip-specific chat room
      const roomName = `Viaje: ${trip.destination}`
      const existingRoom = state.rooms.find(room => room.name === roomName)
      
      if (existingRoom) {
        hasJoinedRef.current = true
        actions.joinRoom(existingRoom.id)
      } else {
        // Create room for this trip
        hasJoinedRef.current = true
        actions.createRoom({
          name: roomName,
          description: `Chat del viaje a ${trip.destination}`,
          is_private: false
        })
      }
    }
  }, [user, trip.id, state.rooms])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !state.currentRoom) return

    await actions.sendMessage(messageInput.trim())
    setMessageInput('')
  }

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
        .eq('id', trip.id)

      if (error) throw error

      setIsEditing(false)
      // Refresh trip data
      window.location.reload()
    } catch (error) {
      console.error('Error saving trip:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Editar Viaje' : trip.destination}
              </h1>
            </div>
            
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Viaje
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Chat */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat del Viaje</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 p-4">
                    {state.loading ? (
                      <div className="text-center text-gray-500">Cargando chat...</div>
                    ) : state.error ? (
                      <div className="text-center text-red-500">{state.error}</div>
                    ) : state.messages.length === 0 ? (
                      <div className="text-center text-gray-500">
                        {state.currentRoom ? 'No hay mensajes aún' : 'Conectando al chat...'}
                      </div>
                    ) : (
                      <div className="h-full overflow-y-auto">
                        <div className="space-y-2">
                          {state.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                  message.sender_id === user?.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <div className="font-medium text-xs mb-1">
                                  {message.sender_profile?.name || 'Usuario'}
                                </div>
                                <div>{message.content}</div>
                                <div className="text-xs opacity-70 mt-1">
                                  {format(new Date(message.created_at), 'HH:mm', { locale: es })}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  {state.currentRoom && (
                    <form onSubmit={handleSendMessage} className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Escribe un mensaje..."
                          className="flex-1"
                        />
                        <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Trip Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Detalles del Viaje</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
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
                    
                    <div className="flex space-x-2">
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
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{trip.destination}</span>
                    </div>
                    
                    {trip.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                        <p className="text-gray-600">{trip.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Fechas</div>
                          <div className="text-sm text-gray-600">
                            {trip.start_date && trip.end_date ? (
                              <>
                                {format(new Date(trip.start_date), 'dd/MM/yyyy', { locale: es })} - 
                                {format(new Date(trip.end_date), 'dd/MM/yyyy', { locale: es })}
                              </>
                            ) : (
                              'No especificadas'
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Presupuesto</div>
                          <div className="text-sm text-gray-600">
                            {trip.budget_min && trip.budget_max ? (
                              `$${trip.budget_min.toLocaleString()} - $${trip.budget_max.toLocaleString()}`
                            ) : (
                              'No especificado'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Participantes</div>
                        <div className="text-sm text-gray-600">
                          Máximo {trip.max_participants || 8} personas
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Creado por</div>
                        <div className="text-sm text-gray-600">{(trip as any).created_by_name || 'Usuario'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 