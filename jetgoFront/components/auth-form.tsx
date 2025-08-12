"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock, Calendar, FileText, Heart, MapPin, Bed, Sparkles, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Slider } from "@/components/ui/slider"
import EmailVerification from "./email-verification"

const interests = [
  { value: "beaches", label: "🏖️ Playas / Beaches" },
  { value: "mountains", label: "🏔️ Montañas / Mountains" },
  { value: "cities", label: "🌆 Ciudades / Cities" },
  { value: "culture", label: "🎭 Cultural / Culture" },
  { value: "adventure", label: "🧗‍♂️ Aventura / Adventure" },
  { value: "food", label: "🍕 Gastronomía / Food" },
  { value: "nightlife", label: "🌃 Vida Nocturna / Nightlife" },
  { value: "nature", label: "🌿 Naturaleza / Nature" },
  { value: "shopping", label: "🛍️ Compras / Shopping" },
  { value: "museums", label: "🏛️ Museos / Museums" },
  { value: "photography", label: "📷 Fotografía / Photography" },
  { value: "music", label: "🎵 Música / Music" },
]

const countries = [
  { value: "argentina", label: "🇦🇷 Argentina" },
  { value: "chile", label: "🇨🇱 Chile" },
  { value: "uruguay", label: "🇺🇾 Uruguay" },
  { value: "brazil", label: "🇧🇷 Brasil / Brazil" },
  { value: "colombia", label: "🇨🇴 Colombia" },
  { value: "peru", label: "🇵🇪 Perú / Peru" },
  { value: "ecuador", label: "🇪🇨 Ecuador" },
  { value: "bolivia", label: "🇧🇴 Bolivia" },
  { value: "paraguay", label: "🇵🇾 Paraguay" },
  { value: "spain", label: "🇪🇸 España / Spain" },
  { value: "france", label: "🇫🇷 Francia / France" },
  { value: "italy", label: "🇮🇹 Italia / Italy" },
  { value: "portugal", label: "🇵🇹 Portugal" },
  { value: "mexico", label: "🇲🇽 México / Mexico" },
  { value: "usa", label: "🇺🇸 Estados Unidos / USA" },
  { value: "canada", label: "🇨🇦 Canadá / Canada" },
]

const documentTypes = [
  { value: "dni", label: "DNI" },
  { value: "passport", label: "Pasaporte / Passport" },
  { value: "drivers_license", label: "Licencia de Conducir / Driver's License" },
  { value: "national_id", label: "Cédula Nacional / National ID" },
  { value: "other", label: "Other / Otro" },
]

type AuthFormProps = {
  verificationComplete?: boolean
}

export default function AuthForm({ verificationComplete = false }: AuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [roomPreference, setRoomPreference] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [age, setAge] = useState(18)

  // Estados para el nuevo flujo
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [registrationEmail, setRegistrationEmail] = useState("")
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentTab, setCurrentTab] = useState<"login" | "register">("login")

  // Función para mostrar alertas estilizadas
  const showStyledAlert = (title: string, message: string, type: "success" | "error" | "warning") => {
    const alertDiv = document.createElement('div')
    alertDiv.className = `
      fixed top-4 right-4 z-[9999] max-w-sm w-full
      ${type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
        type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' : 
        'bg-red-50 border-red-200 text-red-800'} 
      border-l-4 p-4 rounded-lg shadow-lg animate-in slide-in-from-right duration-300
    `
    
    alertDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'}
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium">${title}</h3>
          <div class="mt-1 text-sm">${message}</div>
        </div>
        <button class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-100">
          <span class="sr-only">Dismiss</span>
          <svg class="w-3 h-3" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
        </button>
      </div>
    `
    
    document.body.appendChild(alertDiv)
    
    const dismissButton = alertDiv.querySelector('button')
    const dismiss = () => {
      if (alertDiv.parentNode === document.body) {
        alertDiv.classList.add('animate-out', 'slide-out-to-right', 'duration-300')
        setTimeout(() => {
          if (alertDiv.parentNode === document.body) {
            document.body.removeChild(alertDiv)
          }
        }, 300)
      }
    }
    
    dismissButton?.addEventListener('click', dismiss)
    setTimeout(dismiss, 6000)
  }

  if (showEmailVerification) {
    return (
      <EmailVerification
        email={registrationEmail}
        onVerificationComplete={() => {
          setShowEmailVerification(false)
          showStyledAlert("🎉 ¡Email Verificado!", "Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.", "success")
          setCurrentTab("login")
          // Limpiar campos del formulario de registro
          setName("")
          setDocumentType("")
          setDocumentNumber("")
          setSelectedInterests([])
          setSelectedCountries([])
          setRoomPreference("")
          setAcceptedTerms(false)
          setAge(18)
        }}
        onBack={() => {
          setShowEmailVerification(false)
          setRegistrationEmail("")
        }}
      />
    )
  }

  // Función para diagnosticar la conexión con Supabase
  const diagnoseSupabaseConnection = async () => {
    try {
      // Intentar hacer una petición simple a Supabase
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
      
      if (error) {
        showStyledAlert("🔧 Diagnóstico Supabase", `Error de conexión: ${error.message}`, "error")
      } else {
        showStyledAlert("✅ Supabase Conectado", "La conexión con Supabase está funcionando correctamente.", "success")
      }
    } catch (error) {
      showStyledAlert("🌐 Error de Red", "No se puede conectar con Supabase. Verifica tu conexión a internet.", "error")
    }
  }

  // Verificar si Supabase está configurado
  if (!supabase) {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-orange-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-600 p-3 rounded-full">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Configuración Requerida</CardTitle>
            <CardDescription>Para usar JetGo, necesitas configurar Supabase</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas con alertas estilizadas
    if (!email || !password) {
      showStyledAlert("⚠️ Campos Vacíos", "Por favor, completa el email y la contraseña para iniciar sesión.", "warning")
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      showStyledAlert("📧 Email Inválido", "Por favor, verifica que el formato del email sea correcto.", "warning")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showStyledAlert("🚫 Credenciales Incorrectas", "El email o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo.", "error")
        } else if (error.message.includes('Email not confirmed')) {
          showStyledAlert("📧 Email No Verificado", "Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.", "warning")
        } else if (error.message.includes('Too many requests')) {
          showStyledAlert("⏰ Demasiados Intentos", "Has intentado iniciar sesión muchas veces. Espera unos minutos antes de intentar de nuevo.", "warning")
        } else {
          showStyledAlert("🚨 Error de Acceso", `Error al iniciar sesión: ${error.message}`, "error")
        }
        setLoading(false)
        return
      }

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          showStyledAlert("📧 Verifica tu Email", "Tu email aún no ha sido verificado. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.", "warning")
          setLoading(false)
          return
        }

        showStyledAlert("🎉 ¡Bienvenido de Vuelta!", `¡Hola de nuevo! Has iniciado sesión exitosamente.`, "success")
        
        // Aquí puedes redirigir al dashboard o actualizar el estado de la app
      }
    } catch (error) {
      console.error("Error durante el login:", error)
      showStyledAlert("💥 Error Inesperado", "Ocurrió un error inesperado durante el inicio de sesión. Por favor, intenta de nuevo.", "error")
    }

    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!email || !password || !name) {
      showStyledAlert("⚠️ Campos Incompletos", "Por favor, completa todos los campos obligatorios antes de continuar.", "warning")
      return
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      showStyledAlert("📧 Email Inválido", "Por favor, ingresa un email válido con formato correcto.", "warning")
      return
    }
    
    if (password.length < 6) {
      showStyledAlert("🔒 Contraseña Débil", "La contraseña debe tener al menos 6 caracteres para mayor seguridad.", "warning")
      return
    }
    
    if (name.length < 2) {
      showStyledAlert("👤 Nombre Muy Corto", "Por favor, ingresa tu nombre completo.", "warning")
      return
    }
    
    if (!acceptedTerms) {
      showStyledAlert("📋 Términos No Aceptados", "Debes aceptar los términos y condiciones para continuar con el registro.", "warning")
      return
    }

    if (Number(age) < 18) {
      showStyledAlert("🚫 Edad Insuficiente", "Debes ser mayor de 18 años para registrarte en JetGo.", "error")
      return
    }
    
    if (!supabase) {
      showStyledAlert("🔧 Error de Configuración", "No se pudo conectar con el servidor. Intenta recargar la página.", "error")
      return
    }

    setLoading(true)

    try {
      // Registrar usuario con confirmación de email por enlace
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: name,
            age: Number(age),
            document_type: documentType,
            document_number: documentNumber,
            interests: selectedInterests,
            preferred_countries: selectedCountries,
            room_preference: roomPreference,
          }
        }
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          showStyledAlert("👤 Usuario Ya Existe", `El email "${email}" ya está registrado. Intenta iniciar sesión en su lugar.`, "warning")
        } else if (error.message.includes('Password should be at least')) {
          showStyledAlert("🔒 Contraseña Muy Débil", "La contraseña debe ser más segura. Usa al menos 6 caracteres.", "warning")
        } else if (error.message.includes('Invalid email')) {
          showStyledAlert("📧 Email Inválido", `El formato del email "${email}" no es válido. Verifica que esté escrito correctamente.`, "warning")
        } else if (error.message.includes('Email rate limit exceeded')) {
          showStyledAlert("⏰ Límite de Emails Excedido", "Has intentado registrarte muchas veces. Espera 5 minutos antes de intentar de nuevo.", "warning")
        } else {
          showStyledAlert("🚨 Error de Registro", `Error al registrarse: ${error.message}. Contacta soporte si el problema persiste.`, "error")
        }
        setLoading(false)
        return
      }

      if (data.user && !data.session) {
        // Usuario creado pero necesita verificar email
        showStyledAlert("📧 ¡Cuenta Creada!", "Hemos enviado un email de verificación a tu correo. Haz clic en el enlace para verificar tu cuenta.", "success")
        
        // Mostrar mensaje de verificación
        setShowEmailVerification(true)
        setRegistrationEmail(email)
      } else if (data.session) {
        // Usuario ya verificado (no debería pasar en signUp)
        showStyledAlert("🎉 ¡Registro Exitoso!", "Tu cuenta ha sido creada y verificada. Ya puedes iniciar sesión.", "success")
      }
    } catch (error) {
      console.error("Error durante el registro:", error)
      showStyledAlert("💥 Error Inesperado", "Ocurrió un error inesperado durante el registro. Por favor, intenta de nuevo.", "error")
    }

    setLoading(false)
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    setSelectedInterests(prev => 
      checked ? [...prev, interest] : prev.filter(i => i !== interest)
    )
  }

  const handleCountryChange = (country: string, checked: boolean) => {
    setSelectedCountries(prev => 
      checked ? [...prev, country] : prev.filter(c => c !== country)
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b-4 border-orange-500">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center space-x-3">
            <img src="/jetgo-logo.png" alt="JetGo" className="h-8 w-8 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">JetGo</h1>
              <p className="text-sm text-orange-600">Inicia sesión o regístrate</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl border-orange-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-orange-600 mb-2">
              {currentTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </CardTitle>
            <CardDescription>
              {currentTab === "login" 
                ? "Bienvenido de vuelta a JetGo" 
                : "Únete a nuestra comunidad de viajeros verificados"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tu contraseña segura"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Nombre completo
                      </Label>
                      <Input
                        id="register-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-age" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Edad: {age} años
                      </Label>
                      <Slider
                        id="register-age"
                        value={[age]}
                        onValueChange={(value) => setAge(value[0])}
                        min={18}
                        max={80}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Tipo de documento (opcional)
                      </Label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de documento" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((doc) => (
                            <SelectItem key={doc.value} value={doc.value}>
                              {doc.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-document-number">
                        Número de documento (opcional)
                      </Label>
                      <Input
                        id="register-document-number"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        placeholder="Número de documento"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Intereses de viaje (opcional)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {interests.map((interest) => (
                        <div key={interest.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`interest-${interest.value}`}
                            checked={selectedInterests.includes(interest.value)}
                            onCheckedChange={(checked) => handleInterestChange(interest.value, !!checked)}
                          />
                          <Label
                            htmlFor={`interest-${interest.value}`}
                            className="text-xs cursor-pointer"
                          >
                            {interest.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Países de interés (opcional)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {countries.map((country) => (
                        <div key={country.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`country-${country.value}`}
                            checked={selectedCountries.includes(country.value)}
                            onCheckedChange={(checked) => handleCountryChange(country.value, !!checked)}
                          />
                          <Label
                            htmlFor={`country-${country.value}`}
                            className="text-xs cursor-pointer"
                          >
                            {country.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Bed className="h-4 w-4 mr-2" />
                      Preferencia de alojamiento (opcional)
                    </Label>
                    <Select value={roomPreference} onValueChange={setRoomPreference}>
                      <SelectTrigger>
                        <SelectValue placeholder="¿Cómo prefieres alojarte?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shared">🏠 Habitación compartida - Más económico</SelectItem>
                        <SelectItem value="private">🏨 Habitación privada - Más privacidad</SelectItem>
                        <SelectItem value="both">🤝 Ambas opciones - Flexible según el viaje</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                      required
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="terms" className="text-sm cursor-pointer">
                        Acepto los{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsDialog(true)}
                          className="text-orange-600 hover:text-orange-700 underline"
                        >
                          términos y condiciones
                        </button>{" "}
                        de JetGo
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Crear Cuenta
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <strong>Nuevo flujo:</strong> La verificación de identidad ahora es opcional. 
                    Primero verifica tu email, luego podrás acceder a la plataforma y completar la verificación de identidad cuando gustes.
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {showTermsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-600">Términos y Condiciones de JetGo</h2>
              <Button
                variant="ghost"
                onClick={() => setShowTermsDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none space-y-4">
                <p className="text-sm text-gray-600">
                  Al usar JetGo, aceptas nuestros términos y condiciones que incluyen:
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Ser mayor de 18 años para usar la plataforma</li>
                  <li>• Proporcionar información veraz y mantener tu perfil actualizado</li>
                  <li>• Respetar a otros usuarios y seguir las políticas de comunidad</li>
                  <li>• Cumplir con las leyes locales durante los viajes</li>
                  <li>• Aceptar que JetGo puede usar geolocalización para mejorar el servicio</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  Para ver los términos completos, visita nuestra página web o contáctanos.
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => setShowTermsDialog(false)}
                >
                  Entendido
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
