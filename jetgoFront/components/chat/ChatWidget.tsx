"use client"

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Users, 
  MessageSquare, 
  X,
  Maximize2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface ChatWidgetProps {
  user: User | null
  isExpanded?: boolean
  onToggle?: () => void
}

export default function ChatWidget({ user, isExpanded = false, onToggle }: ChatWidgetProps) {
  const { state, actions } = useChat(user)
  const [messageInput, setMessageInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(!isExpanded)
  const hasJoinedRef = useRef(false)

  // Auto-join general room if available (solo una vez)
  useEffect(() => {
    if (user && state.rooms.length > 0 && !state.currentRoom && !hasJoinedRef.current) {
      const generalRoom = state.rooms.find(room => room.name === 'Sala General')
      if (generalRoom) {
        hasJoinedRef.current = true
        actions.joinRoom(generalRoom.id)
      }
    }
  }, [user, state.rooms, state.currentRoom])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !state.currentRoom) return

    await actions.sendMessage(messageInput.trim())
    setMessageInput('')
  }

  if (!user) {
    return null
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-14 h-14 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96">
      <Card className="h-full shadow-xl border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle className="text-lg">Chat</CardTitle>
              {state.currentRoom && (
                <Badge variant="secondary" className="text-xs">
                  {state.members.length} online
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Link href="/chat">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(true)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full flex flex-col">
          {/* Mensajes */}
          <div className="flex-1 p-4">
            {state.loading ? (
              <div className="text-center text-gray-500">Cargando...</div>
            ) : state.error ? (
              <div className="text-center text-red-500">{state.error}</div>
            ) : state.messages.length === 0 ? (
              <div className="text-center text-gray-500">
                {state.currentRoom ? 'No hay mensajes aún' : 'Selecciona una sala'}
              </div>
            ) : (
              <ScrollArea className="h-full">
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
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input de mensaje */}
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
  )
} 