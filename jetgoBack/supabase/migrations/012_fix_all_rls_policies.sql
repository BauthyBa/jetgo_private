-- ==================================================
-- CORRECCIÓN COMPLETA DE TODAS LAS POLÍTICAS RLS
-- ==================================================

-- Eliminar TODAS las políticas existentes de room_members
DROP POLICY IF EXISTS "Room members can view room members" ON room_members;
DROP POLICY IF EXISTS "Users can join public rooms" ON room_members;
DROP POLICY IF EXISTS "Room admins can add members to private rooms" ON room_members;
DROP POLICY IF EXISTS "Room creators can add members" ON room_members;
DROP POLICY IF EXISTS "Users can leave rooms" ON room_members;
DROP POLICY IF EXISTS "Room admins can remove members" ON room_members;
DROP POLICY IF EXISTS "Room creators can remove members" ON room_members;

-- Crear políticas corregidas sin recursión
CREATE POLICY "Room members can view room members" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = room_members.room_id 
      AND rooms.is_private = FALSE
    )
    OR
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