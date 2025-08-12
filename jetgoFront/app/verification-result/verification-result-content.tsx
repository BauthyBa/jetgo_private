"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, Home } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function VerificationResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setStatus('error')
          setMessage('Usuario no autenticado')
          return
        }

        // Verificar el estado actual de la verificación en la base de datos
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('identity_verified, verification_status, verification_method')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          setStatus('error')
          setMessage('Error al verificar el estado')
          return
        }

        if (profile.identity_verified) {
          setStatus('success')
          setMessage('¡Tu identidad ha sido verificada exitosamente!')
          
          // Redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } else {
          // Si aún no está verificado, puede estar en proceso
          if (profile.verification_status === 'processing') {
            setStatus('loading')
            setMessage('Tu verificación está siendo procesada. Por favor espera...')
            
            // Volver a verificar en 5 segundos
            setTimeout(checkVerificationStatus, 5000)
          } else {
            setStatus('error')
            setMessage('La verificación no pudo completarse. Por favor intenta nuevamente.')
          }
        }

      } catch (error) {
        console.error('Verification check error:', error)
        setStatus('error')
        setMessage('Error al verificar el estado de la verificación')
      }
    }

    checkVerificationStatus()
  }, [router])

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center">
              {status === 'loading' && (
                <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
              )}
            </div>
            
            <CardTitle className={`text-2xl ${
              status === 'success' ? 'text-green-700' : 
              status === 'error' ? 'text-red-700' : 'text-orange-700'
            }`}>
              {status === 'loading' && 'Procesando Verificación'}
              {status === 'success' && '¡Verificación Exitosa!'}
              {status === 'error' && 'Verificación Fallida'}
            </CardTitle>
            
            <CardDescription className="text-lg mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-2">
                  🎉 ¡Felicitaciones! Tu identidad ha sido verificada.
                </p>
                <p className="text-sm text-green-700">
                  Ahora tienes acceso completo a todas las funciones de JetGo.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Serás redirigido automáticamente al dashboard en unos segundos...
                </p>
              </div>
            )}

            {status === 'loading' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-700 mb-2">
                  ⏳ Tu verificación está siendo procesada por nuestro sistema.
                </p>
                <p className="text-sm text-orange-700">
                  Esto puede tomar unos minutos. Por favor, mantén esta página abierta.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-2">
                  ❌ Hubo un problema con tu verificación.
                </p>
                <p className="text-sm text-red-700">
                  Puedes intentar nuevamente desde tu dashboard o contactar al soporte si el problema persiste.
                </p>
              </div>
            )}

            <Button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={status === 'loading'}
            >
              <Home className="h-4 w-4 mr-2" />
              {status === 'loading' ? 'Verificando...' : 'Ir al Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 