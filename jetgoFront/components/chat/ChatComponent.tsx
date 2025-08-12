"use client"

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Users, 
  MessageSquare, 
  Plus, 
  LogOut, 
  Settings,
  User as UserIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ChatComponentProps {
  user: User | null
}

export default function ChatComponent({ user }: ChatComponentProps) {
  const { state, actions } = useChat(user)
  const [messageInput, setMessageInput] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDescription, setNewRoomDescription] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !state.currentRoom) return

    await actions.sendMessage(messageInput.trim())
    setMessageInput('')
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim()) return

    try {
      await actions.createRoom({
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || undefined,
        is_private: false
      })
      setNewRoomName('')
      setNewRoomDescription('')
      setShowCreateRoom(false)
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    await actions.joinRoom(roomId)
  }

  const handleLeaveRoom = async () => {
    if (state.currentRoom) {
      await actions.leaveRoom(state.currentRoom.id)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Debes iniciar sesión para usar el chat</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Sidebar con lista de salas */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Salas de Chat
            </h2>
            <Button
              size="sm"
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Formulario para crear sala */}
          {showCreateRoom && (
            <form onSubmit={handleCreateRoom} className="space-y-3 mb-4">
              <Input
                placeholder="Nombre de la sala"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                required
              />
              <Input
                placeholder="Descripción (opcional)"
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">
                  Crear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateRoom(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Lista de salas */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {state.rooms.map((room) => (
              <div
                key={room.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  state.currentRoom?.id === room.id
                    ? 'bg-blue-100 border-blue-200 border'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleJoinRoom(room.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{room.name}</h3>
                    {room.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {room.description}
                      </p>
                    )}
                  </div>
                  {room.is_private && (
                    <Badge variant="secondary" className="text-xs">
                      Privada
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col">
        {state.currentRoom ? (
          <>
            {/* Header de la sala */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{state.currentRoom.name}</h2>
                {state.currentRoom.description && (
                  <p className="text-sm text-gray-500">{state.currentRoom.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {state.members.length}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLeaveRoom}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" />
                  Salir
                </Button>
              </div>
            </div>

            {/* Lista de mensajes */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {state.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.sender_id !== user.id && (
                        <div className="text-xs font-medium mb-1 opacity-75">
                          {message.sender_profile?.name || 'Usuario'}
                        </div>
                      )}
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {format(new Date(message.created_at), 'HH:mm', { locale: es })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Formulario para enviar mensaje */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Estado cuando no hay sala seleccionada */
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Selecciona una sala</h3>
                <p className="text-gray-600 mb-4">
                  Únete a una sala existente o crea una nueva para comenzar a chatear
                </p>
                <Button onClick={() => setShowCreateRoom(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Sala
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Panel de miembros (opcional) */}
      {state.currentRoom && (
        <div className="w-64 border-l bg-gray-50">
          <div className="p-4 border-b bg-white">
            <h3 className="font-semibold flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Miembros ({state.members.length})
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {state.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {member.user_profile?.name || 'Usuario'}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {member.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
} 