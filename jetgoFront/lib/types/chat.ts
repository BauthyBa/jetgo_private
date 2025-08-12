// Tipos para el sistema de chat de grupo en tiempo real

export interface Room {
  id: string
  name: string
  description?: string
  created_by: string
  is_private: boolean
  max_members: number
  created_at: string
  updated_at: string
}

export interface RoomMember {
  id: string
  room_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  // Campos adicionales del perfil de usuario
  user_profile?: {
    name: string
    email: string
  }
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  created_at: string
  updated_at: string
  // Campos adicionales del remitente
  sender_profile?: {
    name: string
    email: string
  }
}

export interface CreateRoomData {
  name: string
  description?: string
  is_private?: boolean
  max_members?: number
}

export interface SendMessageData {
  room_id: string
  content: string
  message_type?: 'text' | 'image' | 'file' | 'system'
}

export interface JoinRoomData {
  room_id: string
}

export interface ChatState {
  currentRoom: Room | null
  rooms: Room[]
  messages: ChatMessage[]
  members: RoomMember[]
  loading: boolean
  error: string | null
}

export interface ChatContextType {
  state: ChatState
  actions: {
    joinRoom: (roomId: string) => Promise<void>
    leaveRoom: (roomId: string) => Promise<void>
    sendMessage: (content: string, messageType?: 'text' | 'image' | 'file' | 'system') => Promise<void>
    createRoom: (roomData: CreateRoomData) => Promise<Room>
    loadRooms: () => Promise<void>
    loadMessages: (roomId: string) => Promise<void>
    loadMembers: (roomId: string) => Promise<void>
  }
} 