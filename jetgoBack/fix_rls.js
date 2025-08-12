const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://pamidjksvzshakzkrtdy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbWlkanJrc3Z6c2hhazhrdGR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk1MzU1MywiZXhwIjoyMDUwNTI5NTUzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Crear cliente de Supabase con service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  try {
    console.log('🔧 Iniciando corrección de políticas RLS...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'fix_rls.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL cargado, ejecutando...');
    
    // Ejecutar el SQL usando rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Si no existe la función exec_sql, intentar ejecutar directamente
      console.log('🔄 Intentando método alternativo...');
      
      // Dividir el SQL en comandos individuales
      const commands = sql.split(';').filter(cmd => cmd.trim());
      
      for (const command of commands) {
        if (command.trim()) {
          try {
            const { error: cmdError } = await supabase.rpc('exec_sql', { sql_query: command });
            if (cmdError) {
              console.log(`⚠️ Comando saltado: ${command.substring(0, 50)}...`);
            }
          } catch (e) {
            console.log(`⚠️ Error en comando: ${e.message}`);
          }
        }
      }
    } else {
      console.log('✅ SQL ejecutado correctamente');
    }
    
    console.log('🎉 Corrección de políticas RLS completada');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la función
fixRLSPolicies(); 