-- ==================================================
-- CORRECCIÓN COMPLETA DE TODAS LAS POLÍTICAS RLS
-- Elimina recursión infinita en rooms y room_members
-- ==================================================

-- Eliminar TODAS las políticas existentes de rooms
DROP POLICY IF EXISTS "Anyone can view public rooms" ON rooms;
DROP POLICY IF EXISTS "Room members can view private rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON rooms;

-- Eliminar TODAS las políticas existentes de room_members
DROP POLICY IF EXISTS "Room members can view room members" ON room_members;
DROP POLICY IF EXISTS "Users can join public rooms" ON room_members;
DROP POLICY IF EXISTS "Room admins can add members to private rooms" ON room_members;
DROP POLICY IF EXISTS "Room creators can add members" ON room_members;
DROP POLICY IF EXISTS "Users can leave rooms" ON room_members;
DROP POLICY IF EXISTS "Room admins can remove members" ON room_members;
DROP POLICY IF EXISTS "Room creators can remove members" ON room_members;

-- Crear políticas SIMPLES para rooms (sin recursión)
CREATE POLICY "Anyone can view public rooms" ON rooms
  FOR SELECT USING (is_private = FALSE);

CREATE POLICY "Room creators can view their private rooms" ON rooms
  FOR SELECT USING (
    is_private = FALSE OR 
    created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" ON rooms
  FOR UPDATE USING (auth.uid() = created_by);

-- Crear políticas SIMPLES para room_members (sin recursión)
CREATE POLICY "Anyone can view public room members" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = room_members.room_id 
      AND rooms.is_private = FALSE
    )
  );

CREATE POLICY "Room creators can view their room members" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = room_members.room_id 
      AND rooms.created_by = auth.uid()
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

CREATE POLICY "Room creators can add members" ON room_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = room_members.room_id 
      AND rooms.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can leave rooms" ON room_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Room creators can remove members" ON room_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = room_members.room_id 
      AND rooms.created_by = auth.uid()
    )
  ); 