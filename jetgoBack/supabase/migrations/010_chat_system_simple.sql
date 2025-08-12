-- ==================================================
-- SISTEMA DE CHAT DE GRUPO (SIN REALTIME)
-- Tablas: rooms, room_members, chat_messages
-- ==================================================

-- Crear tabla de salas de chat
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT FALSE,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de miembros de las salas
CREATE TABLE IF NOT EXISTS room_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Crear tabla de mensajes del chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Habilitar Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rooms
CREATE POLICY "Anyone can view public rooms" ON rooms
  FOR SELECT USING (is_private = FALSE);

CREATE POLICY "Room members can view private rooms" ON rooms
  FOR SELECT USING (
    is_private = FALSE OR 
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_members.room_id = rooms.id 
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" ON rooms
  FOR UPDATE USING (auth.uid() = created_by);

-- Políticas RLS para room_members
CREATE POLICY "Room members can view room members" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members rm 
      WHERE rm.room_id = room_members.room_id 
      AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public rooms" ON room_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = room_id 
      AND rooms.is_private = FALSE
    )
  );

CREATE POLICY "Room admins can add members to private rooms" ON room_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_members rm 
      WHERE rm.room_id = room_members.room_id 
      AND rm.user_id = auth.uid() 
      AND rm.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Users can leave rooms" ON room_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Room admins can remove members" ON room_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM room_members rm 
      WHERE rm.room_id = room_members.room_id 
      AND rm.user_id = auth.uid() 
      AND rm.role IN ('admin', 'moderator')
    )
  );

-- Políticas RLS para chat_messages
CREATE POLICY "Room members can view messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_members.room_id = chat_messages.room_id 
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Room members can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_members.room_id = chat_messages.room_id 
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Message senders can update their messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Message senders can delete their messages" ON chat_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Función para crear una sala por defecto
CREATE OR REPLACE FUNCTION create_default_room()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear sala general por defecto
  INSERT INTO rooms (name, description, created_by, is_private)
  VALUES ('Sala General', 'Sala de chat general para todos los usuarios', NEW.id, FALSE);
  
  -- Agregar al usuario como admin de la sala general
  INSERT INTO room_members (room_id, user_id, role)
  SELECT id, NEW.id, 'admin'
  FROM rooms 
  WHERE created_by = NEW.id 
  AND name = 'Sala General'
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear sala por defecto cuando se crea un perfil de usuario
DROP TRIGGER IF EXISTS create_default_room_trigger ON user_profiles;
CREATE TRIGGER create_default_room_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_room();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at 
  BEFORE UPDATE ON rooms
  FOR EACH ROW 
  EXECUTE FUNCTION update_chat_updated_at();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at 
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW 
  EXECUTE FUNCTION update_chat_updated_at(); 