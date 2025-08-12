-- Mejorar la tabla trips con campos adicionales
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'any')),
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_featured ON trips(featured);
CREATE INDEX IF NOT EXISTS idx_trips_country ON trips(country);
CREATE INDEX IF NOT EXISTS idx_trips_season ON trips(season);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON trips(start_date);

-- Actualizar políticas RLS para trips
DO $$
BEGIN
    -- Política para que cualquiera pueda ver viajes públicos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Anyone can view open trips') THEN
        CREATE POLICY "Anyone can view open trips" ON trips
            FOR SELECT USING (status = 'open');
    END IF;
    
    -- Política para que los usuarios puedan crear viajes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Users can create trips') THEN
        CREATE POLICY "Users can create trips" ON trips
            FOR INSERT WITH CHECK (auth.uid() = organizer_id);
    END IF;
    
    -- Política para que los organizadores puedan actualizar sus viajes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Organizers can update their trips') THEN
        CREATE POLICY "Organizers can update their trips" ON trips
            FOR UPDATE USING (auth.uid() = organizer_id);
    END IF;
    
    -- Política para que los organizadores puedan eliminar sus viajes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Organizers can delete their trips') THEN
        CREATE POLICY "Organizers can delete their trips" ON trips
            FOR DELETE USING (auth.uid() = organizer_id);
    END IF;
END $$;

-- Actualizar políticas RLS para trip_participants
DO $$
BEGIN
    -- Política para que los participantes puedan ver sus participaciones
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_participants' AND policyname = 'Users can view their participations') THEN
        CREATE POLICY "Users can view their participations" ON trip_participants
            FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
                SELECT organizer_id FROM trips WHERE trips.id = trip_participants.trip_id
            ));
    END IF;
    
    -- Política para que los usuarios puedan unirse a viajes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_participants' AND policyname = 'Users can join trips') THEN
        CREATE POLICY "Users can join trips" ON trip_participants
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Política para que los usuarios puedan actualizar su participación
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_participants' AND policyname = 'Users can update their participation') THEN
        CREATE POLICY "Users can update their participation" ON trip_participants
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$; 