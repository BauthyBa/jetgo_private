"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Shield, CheckCircle, User, AlertCircle, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface VerificationFlowProps {
  onComplete: () => void
}

interface DocumentData {
  type: string
  number: string
  country: string
}

interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
}

export default function VerificationFlow({ onComplete }: VerificationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [documentData, setDocumentData] = useState<DocumentData>({
    type: 'dni',
    number: '',
    country: 'AR'
  })
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const steps = [
    { id: 1, title: "Método", icon: Shield },
    { id: 2, title: "Datos", icon: FileText },
    { id: 3, title: "Verificación", icon: User },
    { id: 4, title: "Completado", icon: CheckCircle },
  ]

  const handleContinue = () => {
    setCurrentStep(2)
  }

  const handleDataSubmit = async () => {
    setIsProcessing(true)
    setCurrentStep(3)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Usuario no autenticado')

      // Obtener el token JWT del usuario
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Token de acceso no disponible')

      const verificationData = {
        userId: user.id,
        document: documentData,
        personalInfo
      }

      // Usar la URL correcta de Supabase para las Edge Functions
      const supabaseUrl = "https://pamidjksvzshakzkrtdy.supabase.co"
      const functionUrl = `${supabaseUrl}/functions/v1/verify-mercadopago`
      
      console.log('Llamando a MercadoPago con datos:', verificationData)
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbWlkamtzdnpzaGFremtydGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5ODM3MjQsImV4cCI6MjA1MjU1OTcyNH0.bvO5xGqJYa9MjUWC8N1LlBdWQFd9H4C8M0EEYL9Y-6I'
        },
        body: JSON.stringify(verificationData)
      })

      const result = await response.json()
      console.log('Respuesta de MercadoPago:', result)
      
      if (!result.success) {
        throw new Error(result.error || 'Error en la verificación')
      }

      setVerificationResult(result)

      // Si es exitoso, completar verificación
      if (result.status === 'approved') {
        setVerificationComplete(true)
        setCurrentStep(4)
        setTimeout(() => {
          onComplete()
        }, 3000)
      } else {
        setCurrentStep(4)
      }

    } catch (error: any) {
      console.error('Verification error:', error)
      setVerificationResult({
        success: false,
        error: error.message || 'Error en la verificación'
      })
      setCurrentStep(4)
    } finally {
      setIsProcessing(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <Card className="mb-8 border-orange-200 bg-orange-50/50">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-orange-800">Verificación de Identidad</CardTitle>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Paso {currentStep} de {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-3 mb-4" />
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 text-gray-500'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-orange-700' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && <div className="flex-1 h-px bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Step 1: Método de Verificación */}
      {currentStep === 1 && (
        <Card className="border-orange-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-orange-800">
              <Shield className="w-6 h-6" />
              Verificación con MercadoPago
            </CardTitle>
            <CardDescription>
              Verificaremos tu identidad usando MercadoPago de forma segura y confiable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-6 bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-500 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-800">MercadoPago Identity</h3>
                    <p className="text-sm text-orange-600">Verificación rápida y segura</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Recomendado</Badge>
              </div>
              
              <div className="space-y-3 text-sm text-orange-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Verificación en tiempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>100% seguro y encriptado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Solo necesitas tu documento</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleContinue}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              >
                Continuar con MercadoPago
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Datos Personales */}
      {currentStep === 2 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-800">
              <FileText className="w-6 h-6" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Proporciona tus datos para la verificación de identidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-orange-800">Datos Personales</h4>
                
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                    placeholder="Tu nombre"
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                    placeholder="Tu apellido"
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                    placeholder="tu@email.com"
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    placeholder="+54 9 11 1234 5678"
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-orange-800">Documento de Identidad</h4>
                
                <div>
                  <Label htmlFor="docType">Tipo de Documento</Label>
                  <Select 
                    value={documentData.type} 
                    onValueChange={(value) => setDocumentData({...documentData, type: value})}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-500">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dni">DNI</SelectItem>
                      <SelectItem value="passport">Pasaporte</SelectItem>
                      <SelectItem value="cedula">Cédula</SelectItem>
                      <SelectItem value="libreta_civica">Libreta Cívica</SelectItem>
                      <SelectItem value="libreta_enrolamiento">Libreta de Enrolamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="docNumber">Número de Documento</Label>
                  <Input
                    id="docNumber"
                    value={documentData.number}
                    onChange={(e) => setDocumentData({...documentData, number: e.target.value})}
                    placeholder="12345678"
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="country">País</Label>
                  <Select 
                    value={documentData.country} 
                    onValueChange={(value) => setDocumentData({...documentData, country: value})}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-500">
                      <SelectValue placeholder="Selecciona el país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AR">Argentina</SelectItem>
                      <SelectItem value="BR">Brasil</SelectItem>
                      <SelectItem value="CL">Chile</SelectItem>
                      <SelectItem value="UY">Uruguay</SelectItem>
                      <SelectItem value="CO">Colombia</SelectItem>
                      <SelectItem value="MX">México</SelectItem>
                      <SelectItem value="PE">Perú</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Volver
              </Button>
              <Button
                onClick={handleDataSubmit}
                disabled={!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !documentData.number}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Verificar Identidad
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Procesando Verificación */}
      {currentStep === 3 && (
        <Card className="border-orange-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-orange-800">
              <User className="w-6 h-6" />
              Procesando Verificación
            </CardTitle>
            <CardDescription>
              Estamos verificando tu identidad con MercadoPago...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
            </div>
            <p className="text-gray-600">
              Este proceso puede tomar unos minutos. No cierres esta ventana.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Resultado */}
      {currentStep === 4 && (
        <Card className="border-orange-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3">
              {verificationComplete ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-green-800">¡Verificación Exitosa!</span>
                </>
              ) : verificationResult?.error ? (
                <>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <span className="text-red-800">Error en Verificación</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                  <span className="text-blue-800">Verificación Completada</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {verificationComplete ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">
                    {verificationResult?.message || "Tu identidad ha sido verificada exitosamente"}
                  </h4>
                  <p className="text-sm text-green-600">
                    Ahora tienes acceso completo a todas las funciones de JetGo.
                  </p>
                  {verificationResult?.development_mode && (
                    <Badge className="mt-2 bg-blue-100 text-blue-800">
                      Modo Desarrollo
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">
                  Serás redirigido al dashboard en unos segundos...
                </p>
              </div>
            ) : verificationResult?.error ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Error en la Verificación</h4>
                  <p className="text-sm text-red-600">
                    {verificationResult.error}
                  </p>
                </div>
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Intentar Nuevamente
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    {verificationResult?.message || "Verificación en proceso"}
                  </h4>
                  <p className="text-sm text-blue-600">
                    Te contactaremos pronto con el resultado.
                  </p>
                </div>
                <Button
                  onClick={onComplete}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Volver al Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
