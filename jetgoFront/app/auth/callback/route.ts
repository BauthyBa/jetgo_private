import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
      }

      if (data.user) {
        // Verificar si el perfil ya existe
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (!existingProfile) {
          // Obtener los metadatos del usuario (que enviamos durante el signup)
          const userMetadata = data.user.user_metadata || {}
          
          // Crear perfil de usuario
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              name: userMetadata.name || '',
              email: data.user.email || '',
              age: userMetadata.age || null,
              document_type: userMetadata.document_type || null,
              document_number: userMetadata.document_number || null,
              interests: userMetadata.interests || [],
              preferred_countries: userMetadata.preferred_countries || [],
              room_preference: userMetadata.room_preference || null,
              verified: true, // Email verificado
              identity_verified: false, // Identidad no verificada inicialmente
            })

          if (profileError) {
            console.error('Error creating user profile:', profileError)
            // Continuar aunque falle la creación del perfil
          }
        }

        // Redirigir al usuario al dashboard o página principal con mensaje de éxito
        return NextResponse.redirect(`${requestUrl.origin}/?verified=true&message=email_verified`)
      }
    } catch (error) {
      console.error('Unexpected error in callback:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=unexpected_error`)
    }
  }

  // Si no hay código, redirigir a la página principal
  return NextResponse.redirect(`${requestUrl.origin}/`)
} 