-- ==================================================
-- RESET COMPLETO DE LA BASE DE DATOS JETGO
-- Ejecutar todo este archivo en el SQL Editor de Supabase
-- ==================================================

-- PASO 1: Eliminar todas las tablas existentes
DROP TABLE IF EXISTS identity_verifications CASCADE;
DROP TABLE IF EXISTS trip_participants CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- PASO 2: Crear tabla de perfiles de usuario con TODAS las columnas necesarias
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER,
  document_type TEXT,
  document_number TEXT,
  interests TEXT[] DEFAULT '{}',
  preferred_countries TEXT[] DEFAULT '{}',
  room_preference TEXT CHECK (room_preference IN ('shared', 'private', 'both')),
  verified BOOLEAN DEFAULT FALSE,
  identity_verified BOOLEAN DEFAULT FALSE,
  verification_method TEXT CHECK (verification_method IN ('mercadopago', 'stripe')),
  verification_id TEXT,
  verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected', 'processing', 'verified')),
  verification_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 3: Crear tabla de viajes
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget_min INTEGER,
  budget_max INTEGER,
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 1,
  room_type TEXT CHECK (room_type IN ('shared', 'private', 'both')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 4: Crear tabla de participantes en viajes
CREATE TABLE trip_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  UNIQUE(trip_id, user_id)
);

-- PASO 5: Crear tabla de verificaciones de email
CREATE TABLE email_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(user_id, email)
);

-- PASO 6: Crear tabla de verificaciones de identidad
CREATE TABLE identity_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('mercadopago', 'stripe')),
  external_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'verified', 'canceled')),
  document_type TEXT,
  document_number TEXT,
  verification_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 7: Crear tabla de mensajes (opcional para futuro)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 8: Crear índices para optimizar consultas
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_trips_organizer_id ON trips(organizer_id);
CREATE INDEX idx_trips_destination ON trips(destination);
CREATE INDEX idx_trip_participants_trip_id ON trip_participants(trip_id);
CREATE INDEX idx_trip_participants_user_id ON trip_participants(user_id);
CREATE INDEX idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX idx_identity_verifications_provider ON identity_verifications(provider);
CREATE INDEX idx_identity_verifications_status ON identity_verifications(status);
CREATE INDEX idx_messages_trip_id ON messages(trip_id);

-- PASO 9: Habilitar Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- PASO 10: Políticas de seguridad para user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage user profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- PASO 11: Políticas de seguridad para trips
CREATE POLICY "Anyone can view trips" ON trips
  FOR SELECT USING (true);

CREATE POLICY "Users can create trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their trips" ON trips
  FOR UPDATE USING (auth.uid() = organizer_id);

-- PASO 12: Políticas de seguridad para trip_participants
CREATE POLICY "Users can view trip participants" ON trip_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join trips" ON trip_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON trip_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- PASO 13: Políticas de seguridad para email_verifications
CREATE POLICY "Users can view their own email verifications" ON email_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage email verifications" ON email_verifications
  FOR ALL USING (true);

-- PASO 14: Políticas de seguridad para identity_verifications
CREATE POLICY "Users can view their own identity verifications" ON identity_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage identity verifications" ON identity_verifications
  FOR ALL USING (auth.role() = 'service_role');

-- PASO 15: Políticas de seguridad para messages
CREATE POLICY "Trip participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_participants 
      WHERE trip_participants.trip_id = messages.trip_id 
      AND trip_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM trip_participants 
      WHERE trip_participants.trip_id = messages.trip_id 
      AND trip_participants.user_id = auth.uid()
    )
  );

-- PASO 16: Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- PASO 17: Triggers para actualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_identity_verifications_updated_at BEFORE UPDATE ON identity_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- ✅ BASE DE DATOS LISTA PARA USAR
-- ==================================================
-- Ahora puedes probar la verificación de identidad
-- Tu Edge Function debería funcionar correctamente 