const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase - necesitas tu service role key
const supabaseUrl = 'https://pamidjksvzshakzkrtdy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Error: Necesitas configurar SUPABASE_SERVICE_ROLE_KEY');
  console.log('💡 Ve a Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  try {
    console.log('🔧 Iniciando corrección de políticas RLS...');
    
    // Ejecutar SQL directamente usando el cliente
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return;
    }
    
    console.log('✅ Conexión exitosa, ejecutando correcciones...');
    
    // Ejecutar el SQL de corrección
    const sqlCommands = [
      // Eliminar políticas de rooms
      'DROP POLICY IF EXISTS "Anyone can view public rooms" ON rooms;',
      'DROP POLICY IF EXISTS "Room members can view private rooms" ON rooms;',
      'DROP POLICY IF EXISTS "Authenticated users can create rooms" ON rooms;',
      'DROP POLICY IF EXISTS "Room creators can update their rooms" ON rooms;',
      
      // Eliminar políticas de room_members
      'DROP POLICY IF EXISTS "Room members can view room members" ON room_members;',
      'DROP POLICY IF EXISTS "Users can join public rooms" ON room_members;',
      'DROP POLICY IF EXISTS "Room admins can add members to private rooms" ON room_members;',
      'DROP POLICY IF EXISTS "Room creators can add members" ON room_members;',
      'DROP POLICY IF EXISTS "Users can leave rooms" ON room_members;',
      'DROP POLICY IF EXISTS "Room admins can remove members" ON room_members;',
      'DROP POLICY IF EXISTS "Room creators can remove members" ON room_members;',
      
      // Crear nuevas políticas para rooms
      'CREATE POLICY "Anyone can view public rooms" ON rooms FOR SELECT USING (is_private = FALSE);',
      'CREATE POLICY "Room creators can view their private rooms" ON rooms FOR SELECT USING (is_private = FALSE OR created_by = auth.uid());',
      'CREATE POLICY "Authenticated users can create rooms" ON rooms FOR INSERT WITH CHECK (auth.uid() = created_by);',
      'CREATE POLICY "Room creators can update their rooms" ON rooms FOR UPDATE USING (auth.uid() = created_by);',
      
      // Crear nuevas políticas para room_members
      'CREATE POLICY "Anyone can view public room members" ON room_members FOR SELECT USING (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = room_members.room_id AND rooms.is_private = FALSE));',
      'CREATE POLICY "Room creators can view their room members" ON room_members FOR SELECT USING (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = room_members.room_id AND rooms.created_by = auth.uid()));',
      'CREATE POLICY "Users can join public rooms" ON room_members FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM rooms WHERE rooms.id = room_id AND rooms.is_private = FALSE));',
      'CREATE POLICY "Room creators can add members" ON room_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = room_members.room_id AND rooms.created_by = auth.uid()));',
      'CREATE POLICY "Users can leave rooms" ON room_members FOR DELETE USING (auth.uid() = user_id);',
      'CREATE POLICY "Room creators can remove members" ON room_members FOR DELETE USING (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = room_members.room_id AND rooms.created_by = auth.uid()));'
    ];
    
    for (const sql of sqlCommands) {
      try {
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (sqlError) {
          console.log(`⚠️ Comando saltado: ${sql.substring(0, 50)}...`);
        } else {
          console.log(`✅ Ejecutado: ${sql.substring(0, 50)}...`);
        }
      } catch (e) {
        console.log(`⚠️ Error en comando: ${e.message}`);
      }
    }
    
    console.log('🎉 Corrección de políticas RLS completada');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixRLSPolicies(); 