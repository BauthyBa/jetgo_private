"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, RefreshCw, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface EmailVerificationProps {
  email: string
  onVerificationComplete: () => void
  onBack: () => void
}

export default function EmailVerification({ email, onVerificationComplete, onBack }: EmailVerificationProps) {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Verificar periódicamente si el usuario ya verificó su email
  useEffect(() => {
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email_confirmed_at) {
        setSuccess("¡Email verificado exitosamente!")
        setTimeout(onVerificationComplete, 1500)
      }
    }

    const interval = setInterval(checkVerification, 3000)
    return () => clearInterval(interval)
  }, [onVerificationComplete])

  const showStyledAlert = (title: string, message: string, type: "success" | "error" | "warning") => {
    if (type === "success") {
      setSuccess(message)
      setError("")
    } else {
      setError(message)
      setSuccess("")
    }
    
    setTimeout(() => {
      setError("")
      setSuccess("")
    }, 5000)
  }

  const handleResendEmail = async () => {
    if (resendTimer > 0) return

    setResendLoading(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        showStyledAlert("", `Error al reenviar: ${error.message}`, "error")
      } else {
        showStyledAlert("", "Email de verificación enviado nuevamente", "success")
        setResendTimer(60)
      }
    } catch (error) {
      console.error("Error reenviando email:", error)
      showStyledAlert("", "Error al reenviar. Intenta de nuevo.", "error")
    }

    setResendLoading(false)
  }

  const handleCheckVerification = async () => {
    setIsChecking(true)
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        showStyledAlert("", "Error al verificar el estado", "error")
        return
      }

      if (user && user.email_confirmed_at) {
        showStyledAlert("", "¡Email verificado exitosamente!", "success")
        setTimeout(onVerificationComplete, 1500)
      } else {
        showStyledAlert("", "Email aún no verificado. Revisa tu bandeja de entrada.", "warning")
      }
    } catch (error) {
      console.error("Error verificando estado:", error)
      showStyledAlert("", "Error inesperado. Intenta de nuevo.", "error")
    }

    setIsChecking(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-blue-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-blue-700">Verifica tu Email</CardTitle>
          <CardDescription className="text-lg">
            Hemos enviado un enlace de verificación a:<br />
            <strong className="text-blue-600">{email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              {success}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📧 Instrucciones:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Revisa tu bandeja de entrada de correo</li>
              <li>2. Busca el email de Supabase Auth</li>
              <li>3. Haz clic en el botón <strong>"Confirmar Email"</strong></li>
              <li>4. Regresa aquí para continuar</li>
            </ol>
          </div>

          <div className="text-center space-y-3">
            <Button
              onClick={handleCheckVerification}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ya verifiqué mi email
                </>
              )}
            </Button>

            <p className="text-sm text-gray-600">
              ¿No recibiste el email?
            </p>
            
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={resendLoading || resendTimer > 0}
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : resendTimer > 0 ? (
                `Reenviar en ${resendTimer}s`
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Reenviar email
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full text-blue-600 hover:bg-blue-50"
            >
              Volver al registro
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>💡 <strong>Tip:</strong> Si no encuentras el email, revisa tu carpeta de spam o correo no deseado.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 