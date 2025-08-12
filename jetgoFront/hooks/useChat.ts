import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  ChatState, 
  ChatContextType, 
  Room, 
  ChatMessage, 
  RoomMember, 
  CreateRoomData 
} from '@/lib/types/chat'
import { User } from '@supabase/supabase-js'

export function useChat(user: User | null): ChatContextType {
  const [state, setState] = useState<ChatState>({
    currentRoom: null,
    rooms: [],
    messages: [],
    members: [],
    loading: false,
    error: null
  })

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)
  const userRef = useRef(user)

  // Actualizar userRef cuando cambie el usuario
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Cargar salas disponibles
  const loadRooms = useCallback(async () => {
    if (!userRef.current) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setState(prev => ({ 
        ...prev, 
        rooms: rooms || [], 
        loading: false 
      }))
    } catch (error) {
      console.error('Error loading rooms:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Error al cargar las salas', 
        loading: false 
      }))
    }
  }, [])

  // Cargar mensajes de una sala
  const loadMessages = useCallback(async (roomId: string) => {
    if (!userRef.current) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error

      // Actualizar el último ID de mensaje para polling
      if (messages && messages.length > 0) {
        lastMessageIdRef.current = messages[messages.length - 1].id
      }

      setState(prev => ({ 
        ...prev, 
        messages: messages || [], 
        loading: false 
      }))
    } catch (error) {
      console.error('Error loading messages:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Error al cargar los mensajes', 
        loading: false 
      }))
    }
  }, [])

  // Función para verificar nuevos mensajes (polling)
  const checkNewMessages = useCallback(async (roomId: string) => {
    if (!userRef.current || !lastMessageIdRef.current) return

    try {
      const { data: newMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .gt('id', lastMessageIdRef.current)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (newMessages && newMessages.length > 0) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, ...newMessages]
        }))
        lastMessageIdRef.current = newMessages[newMessages.length - 1].id
      }
    } catch (error) {
      console.error('Error checking new messages:', error)
    }
  }, [])

  // Cargar miembros de una sala
  const loadMembers = useCallback(async (roomId: string) => {
    if (!userRef.current) return

    try {
      const { data: members, error } = await supabase
        .from('room_members')
        .select(`
          *,
          user_profile:user_profiles!room_members_user_id_fkey(name, email)
        `)
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true })

      if (error) throw error

      setState(prev => ({ 
        ...prev, 
        members: members || [] 
      }))
    } catch (error) {
      console.error('Error loading members:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Error al cargar los miembros' 
      }))
    }
  }, [])

  // Detener polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Iniciar polling para nuevos mensajes
  const startPolling = useCallback((roomId: string) => {
    stopPolling()
    
    pollingIntervalRef.current = setInterval(() => {
      checkNewMessages(roomId)
    }, 2000)
  }, [checkNewMessages, stopPolling])

  // Unirse a una sala
  const joinRoom = useCallback(async (roomId: string) => {
    if (!userRef.current) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Verificar si ya es miembro
      const { data: existingMember } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userRef.current.id)
        .single()

      if (!existingMember) {
        // Unirse a la sala
        const { error: joinError } = await supabase
          .from('room_members')
          .insert({
            room_id: roomId,
            user_id: userRef.current.id,
            role: 'member'
          })

        if (joinError) throw joinError
      }

      // Obtener información de la sala
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError

      // Cargar mensajes y miembros
      await Promise.all([
        loadMessages(roomId),
        loadMembers(roomId)
      ])

      setState(prev => ({ 
        ...prev, 
        currentRoom: room, 
        loading: false 
      }))

      // Iniciar polling para nuevos mensajes
      startPolling(roomId)

    } catch (error) {
      console.error('Error joining room:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Error al unirse a la sala', 
        loading: false 
      }))
    }
  }, [loadMessages, loadMembers, startPolling])

  // Salir de una sala
  const leaveRoom = useCallback(async (roomId: string) => {
    if (!userRef.current) return

    try {
      // Detener polling
      stopPolling()

      // Salir de la sala
      const { error } = await supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userRef.current.id)

      if (error) throw error

      setState(prev => ({ 
        ...prev, 
        currentRoom: null,
        messages: [],
        members: []
      }))

    } catch (error) {
      console.error('Error leaving room:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Error al salir de la sala' 
      }))
    }
  }, [stopPolling])

  // Enviar mensaje
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'file' | 'system' = 'text') => {
    if (!userRef.current || !state.currentRoom) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: state.currentRoom.id,
          sender_id: userRef.current.id,
          content,
          message_type: messageType
        })

      if (error) throw error

    } catch (error) {
      console.error('Error sending message:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Error al enviar el mensaje' 
      }))
    }
  }, [state.currentRoom])

  // Crear nueva sala
  const createRoom = useCallback(async (roomData: CreateRoomData): Promise<Room> => {
    if (!userRef.current) throw new Error('Usuario no autenticado')

    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        ...roomData,
        created_by: userRef.current.id
      })
      .select()
      .single()

    if (error) throw error

    // Unirse automáticamente a la sala creada
    await joinRoom(room.id)

    return room
  }, [joinRoom])

  // Cargar salas al montar el componente
  useEffect(() => {
    if (user) {
      loadRooms()
    }
  }, [user, loadRooms])

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return {
    state,
    actions: {
      joinRoom,
      leaveRoom,
      sendMessage,
      createRoom,
      loadRooms,
      loadMessages,
      loadMembers
    }
  }
} 