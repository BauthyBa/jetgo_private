"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useChat } from '@/hooks/useChat'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  MessageCircle, 
  Send 
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Trip } from '@/lib/trips'

export default function TripChatPage() {
  const params = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasJoinedRef = useRef(false)

  const { state, actions } = useChat(user)

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  // Join trip chat room when component mounts
  useEffect(() => {
    if (user && trip && state.rooms.length > 0 && !hasJoinedRef.current) {
      const roomName = `Viaje: ${trip.destination}`
      const existingRoom = state.rooms.find(room => room.name === roomName)
      
      if (existingRoom) {
        hasJoinedRef.current = true
        actions.joinRoom(existingRoom.id)
      } else {
        hasJoinedRef.current = true
        actions.createRoom({
          name: roomName,
          description: `Chat del viaje a ${trip.destination}`,
          is_private: false
        })
      }
    }
  }, [user, trip, state.rooms])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !state.currentRoom) return

    await actions.sendMessage(messageInput.trim())
    setMessageInput('')
  }

  const handleBack = () => {
    router.push(`/trip/${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando chat...</p>
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
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Chat: {trip.destination}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="h-[calc(100vh-200px)]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Chat del Viaje</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-full flex flex-col">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 