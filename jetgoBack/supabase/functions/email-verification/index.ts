import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface EmailVerificationRequest {
  email: string
  userId: string
}

serve(async (req) => {
  const { email, userId } = await req.json() as EmailVerificationRequest
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  
  try {
    // Generar token de verificación
    const verificationToken = crypto.randomUUID()
    
    // Guardar token en la base de datos
    const { error: dbError } = await supabase
      .from('email_verifications')
      .upsert({
        user_id: userId,
        email: email,
        verification_token: verificationToken,
        created_at: new Date().toISOString(),
        verified: false
      })
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }
    
    // Aquí puedes integrar con un servicio de email como Resend, SendGrid, etc.
    // Por ahora retornamos el token para testing
    const verificationUrl = `${Deno.env.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`
    
    console.log(`Email verification URL for ${email}: ${verificationUrl}`)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de verificación enviado',
        verificationUrl: verificationUrl // Solo para desarrollo
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
}) 