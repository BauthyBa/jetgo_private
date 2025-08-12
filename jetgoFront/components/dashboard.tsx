"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import {
  LogOut,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Star,
  Heart,
  Sparkles,
  Search,
  Plus,
  MessageCircle,
  Eye,
  Shield,
  FileText,
  Camera,
  CheckCircle,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import AllTripsView from "@/components/all-trips-view"
import ProfileView from "@/components/profile-view"
import CreateTripDialog from "@/components/create-trip-dialog"
import VerificationFlow from "@/components/verification-flow"
import MyTripsView from "@/components/my-trips-view"
import ChatWidget from "@/components/chat/ChatWidget"
import { getTrips, getPopularDestinations, searchTrips, type Trip, type TripFilters } from "@/lib/trips"

interface UserProfile {
  name: string
  document_type: string
  document_number: string
  interests: string[]
  preferred_countries: string[]
  room_preference: string
  verified: boolean
  identity_verified: boolean
  profile_image_url?: string
}

interface TripSearch {
  destination: string
  season: string
  budget: string
  room_type: string
}

const seasons = ["Primavera (Sep-Nov)", "Verano (Dic-Feb)", "Otoño (Mar-May)", "Invierno (Jun-Ago)", "Cualquier época"]

export default function Dashboard({ user }: { user: User }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentView, setCurrentView] = useState<"home" | "trips" | "profile" | "verification" | "my-trips">("home")
  const [tripSearch, setTripSearch] = useState<TripSearch>({
    destination: "",
    season: "",
    budget: "",
    room_type: "",
  })
  const [searchResults, setSearchResults] = useState<Trip[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [showCreateTrip, setShowCreateTrip] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchPopularDestinations()
    
    // Limpiar imágenes antiguas del localStorage (migración a Supabase)
    const cleanupLocalStorage = () => {
      const oldImageKey = `profile_image_${user.id}`
      if (localStorage.getItem(oldImageKey)) {
        console.log('Limpiando imagen antigua del localStorage...')
        localStorage.removeItem(oldImageKey)
      }
    }
    
    cleanupLocalStorage()
  }, [user])

  // Effect para escuchar cambios de foto de perfil desde otros componentes
  useEffect(() => {
    const handleProfileImageChange = (event: any) => {
      console.log('Evento profileImageUpdated recibido en dashboard')
      const newImageUrl = event.detail
      if (newImageUrl) {
        console.log('Nueva URL de imagen:', newImageUrl)
        setProfileImage(newImageUrl)
      } else {
        // Refrescar desde la base de datos
        fetchProfile()
      }
    }

    window.addEventListener('profileImageUpdated', handleProfileImageChange)
    console.log('Event listener agregado para profileImageUpdated')
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageChange)
      console.log('Event listener removido')
    }
  }, [user.id])

  const fetchProfile = async () => {
    if (!supabase) return

    const { data, error } = await supabase.from("user_profiles").select("*, profile_image_url").eq("user_id", user.id).single()

    if (data) {
      setProfile(data)
      
      // Cargar imagen de perfil desde la base de datos
      if (data.profile_image_url) {
        console.log('Imagen de perfil cargada desde DB:', data.profile_image_url)
        setProfileImage(data.profile_image_url)
      }
    }
  }

  const fetchPopularDestinations = async () => {
    const { data, error } = await getPopularDestinations()
    if (data) {
      setDestinations(data)
    } else {
      console.error('Error fetching destinations:', error)
      // Fallback a destinos estáticos si hay error
      setDestinations([
        {
          name: "Buenos Aires",
          country: "Argentina", 
          image: "/placeholder.svg?height=300&width=400&text=Buenos Aires Obelisk",
          rating: 4.9,
          trips: 15,
        },
        {
          name: "Santiago de Chile",
          country: "Chile",
          image: "/placeholder.svg?height=300&width=400&text=Santiago Mountains", 
          rating: 4.8,
          trips: 8,
        },
        {
          name: "Carlos Paz",
          country: "Argentina",
          image: "/placeholder.svg?height=300&width=400&text=Carlos Paz Lake",
          rating: 4.7,
          trips: 6,
        }
      ])
    }
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  const handleVerificationComplete = async () => {
    // Actualizar el perfil como identity_verified
    if (supabase && profile) {
      const { error } = await supabase
        .from("user_profiles")
        .update({ identity_verified: true })
        .eq("user_id", user.id)

      if (!error) {
        // Recargar perfil completo incluyendo la imagen
        await fetchProfile()
        setCurrentView("home")
        
        // Mostrar mensaje de éxito
        showSuccessAlert("¡Identidad Verificada!", "Tu identidad ha sido verificada exitosamente. Ahora tienes acceso completo a JetGo.")
      }
    }
  }

  const showSuccessAlert = (title: string, message: string) => {
    const alertDiv = document.createElement('div')
    alertDiv.className = `
      fixed top-4 right-4 z-[9999] max-w-sm w-full
      bg-green-50 border-green-200 text-green-800 border-l-4 p-4 rounded-lg shadow-lg
      animate-in slide-in-from-right duration-300
    `
    
    alertDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">🎉</div>
        <div class="ml-3">
          <h3 class="text-sm font-medium">${title}</h3>
          <div class="mt-1 text-sm">${message}</div>
        </div>
      </div>
    `
    
    document.body.appendChild(alertDiv)
    
    setTimeout(() => {
      if (alertDiv.parentNode === document.body) {
        document.body.removeChild(alertDiv)
      }
    }, 5000)
  }

  // Si está en vista de verificación
  if (currentView === "verification") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
        <header className="bg-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="/jetgo-logo.png" alt="JetGo" className="h-10 w-10 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JetGo</h1>
                <p className="text-sm text-orange-600">Verificación de Identidad</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentView("home")}
              className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
            >
              Volver al Dashboard
            </Button>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <VerificationFlow onComplete={handleVerificationComplete} />
        </div>
      </div>
    )
  }

  const handleSearch = async () => {
    setIsLoading(true)
    
    try {
      const filters: TripFilters = {}
      
      // Mapear los valores del formulario a filtros
      if (tripSearch.destination) {
        filters.destination = tripSearch.destination
      }
      
      if (tripSearch.season) {
        // Mapear las estaciones del español a inglés
        const seasonMap: Record<string, string> = {
          "Primavera (Sep-Nov)": "spring",
          "Verano (Dic-Feb)": "summer", 
          "Otoño (Mar-May)": "autumn",
          "Invierno (Jun-Ago)": "winter",
          "Cualquier época": "any"
        }
        filters.season = seasonMap[tripSearch.season]
      }
      
      if (tripSearch.budget) {
        // Parsear rango de presupuesto
        if (tripSearch.budget === "0-500") {
          filters.budget_min = 0
          filters.budget_max = 500
        } else if (tripSearch.budget === "500-1000") {
          filters.budget_min = 500
          filters.budget_max = 1000
        } else if (tripSearch.budget === "1000-2000") {
          filters.budget_min = 1000
          filters.budget_max = 2000
        } else if (tripSearch.budget === "2000+") {
          filters.budget_min = 2000
        }
      }
      
      if (tripSearch.room_type) {
        filters.room_type = tripSearch.room_type
      }

      console.log('Buscando con filtros:', filters)
      const { data, error } = await searchTrips(filters)
      
      if (error) {
        console.error('Error searching trips:', error)
        alert('Error al buscar viajes. Inténtalo de nuevo.')
        setSearchResults([])
      } else {
        console.log('Viajes encontrados:', data)
        setSearchResults(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  if (currentView === "trips") {
    return <AllTripsView user={user} profile={profile} onBack={() => setCurrentView("home")} />
  }

  if (currentView === "my-trips") {
    return <MyTripsView user={user} profile={profile} onBack={() => setCurrentView("home")} onCreateTrip={() => setShowCreateTrip(true)} />
  }

  if (currentView === "profile") {
    return <ProfileView user={user} profile={profile} onBack={() => setCurrentView("home")} />
  }

  // Vista censurada si no está verificado
  if (profile && !profile.identity_verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
        <header className="bg-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="/jetgo-logo.png" alt="JetGo" className="h-10 w-10 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JetGo</h1>
                <p className="text-sm text-orange-600">Viajes que conectan</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">¡Hola!</p>
                <div className="font-semibold text-orange-600 flex items-center">
                  {profile?.name || "Usuario"}
                  <Badge className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">⚠️ Sin verificar</Badge>
                </div>
              </div>
              <Button
                onClick={() => setCurrentView("verification")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Verificarme
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-yellow-300 shadow-xl bg-yellow-50">
              <CardHeader className="text-center pb-8">
                <div className="bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-12 w-12 text-yellow-600" />
                </div>
                <CardTitle className="text-3xl text-yellow-800 mb-4">
                  🔒 Verificación de Identidad Requerida
                </CardTitle>
                <CardDescription className="text-lg text-yellow-700 max-w-2xl">
                  Para acceder a todas las funciones de JetGo y garantizar la seguridad de nuestra comunidad, 
                  necesitas completar la verificación de tu identidad.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Documento</h3>
                    <p className="text-sm text-yellow-700">Sube tu documento de identidad oficial</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Verificación Facial</h3>
                    <p className="text-sm text-yellow-700">Confirma tu identidad con reconocimiento facial</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-yellow-800 mb-2">¡Listo!</h3>
                    <p className="text-sm text-yellow-700">Accede a todas las funciones de JetGo</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mb-6 border border-yellow-300">
                  <h4 className="font-semibold text-gray-800 mb-3">🔒 Funciones bloqueadas:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Buscar viajes
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Crear viajes
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Contactar viajeros
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Ver perfiles completos
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentView("verification")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Verificar Mi Identidad Ahora
                </Button>

                <p className="text-xs text-yellow-600 mt-4">
                  🛡️ Tus datos están protegidos y se utilizan únicamente para verificación
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
      <header className="bg-white/95 backdrop-blur-lg border-b border-orange-200 sticky top-0 z-50 shadow-lg shadow-orange-100/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo Section - Left */}
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl opacity-0 group-hover:opacity-75 transition-opacity duration-300 blur"></div>
                <img 
                  src="/jetgo-logo.png" 
                  alt="JetGo" 
                  className="relative h-12 w-12 rounded-xl ring-2 ring-orange-100 group-hover:ring-orange-300 transition-all duration-300 cursor-pointer" 
                  onClick={() => setCurrentView("home")}
                  title="Ir al inicio"
                />
              </div>
              <div className="hidden sm:block">
                <h1 
                  className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent cursor-pointer hover:from-orange-700 hover:to-red-700 transition-all duration-200"
                  onClick={() => setCurrentView("home")}
                  title="Ir al inicio"
                >
                  JetGo
                </h1>
                <p className="text-sm text-orange-500 font-medium">Viajes que conectan</p>
              </div>
            </div>

            {/* Center Navigation - Optional for future expansion */}
            <div className="hidden lg:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                <button className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-orange-50">
                  Explorar
                </button>
                <button 
                  onClick={() => setCurrentView("my-trips")}
                  className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-orange-50"
                >
                  Mis Viajes
                </button>
                <button className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-orange-50">
                  Comunidad
                </button>
                <a 
                  href="/chat"
                  className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-orange-50 flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </a>
              </nav>
            </div>

            {/* User Section - Right */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500 font-medium">¡Hola!</p>
                    <span className="font-semibold text-gray-800">
                      {profile?.name || "Usuario"}
                    </span>
                  </div>
                  
                  {/* Badge de verificación debajo del nombre */}
                  <div className="flex justify-end mt-1">
                    {profile?.identity_verified ? (
                      <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 text-xs">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Verificado</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 text-xs">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Sin verificar</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Avatar con indicador de verificación */}
                <div className="relative">
                  <div 
                    className="w-10 h-10 rounded-full overflow-hidden shadow-lg cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all duration-200 transform hover:scale-105 ring-2 ring-orange-100"
                    onClick={() => setCurrentView("profile")}
                    title="Ver mi perfil"
                  >
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                        {(profile?.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Indicador de verificación en el avatar */}
                  {profile?.identity_verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {!profile?.identity_verified && (
                  <Button
                    onClick={() => setCurrentView("verification")}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transition-all duration-300 transform hover:scale-[1.02] border-0"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Verificarme</span>
                    <span className="sm:hidden">Verificar</span>
                  </Button>
                )}
                
                <div className="relative group">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-2 border-orange-200 text-orange-600 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:border-transparent bg-white/80 backdrop-blur-sm shadow-lg shadow-orange-100/50 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                    <span className="sm:hidden">Salir</span>
                  </Button>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Cerrar sesión
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="sm:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:bg-orange-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Subtle bottom gradient line */}
        <div className="h-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-60"></div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-orange-100 p-1 rounded-lg">
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Buscar Viajes
            </TabsTrigger>
            <TabsTrigger
              value="destinations"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Destinos
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              <Users className="h-4 w-4 mr-2" />
              Mi Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6 mt-6">
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="h-6 w-6 mr-2" />
                  Buscar Compañeros de Viaje
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Encuentra personas con intereses similares para tu próxima aventura
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-orange-700 font-semibold">
                      Destino
                    </Label>
                    <Select
                      value={tripSearch.destination}
                      onValueChange={(value) => setTripSearch({ ...tripSearch, destination: value })}
                    >
                      <SelectTrigger className="border-orange-200 focus:border-orange-500">
                        <SelectValue placeholder="¿A dónde quieres ir?" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((dest) => (
                          <SelectItem key={dest.name} value={dest.name}>
                            {dest.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season" className="text-orange-700 font-semibold">
                      Época del año
                    </Label>
                    <Select
                      value={tripSearch.season}
                      onValueChange={(value) => setTripSearch({ ...tripSearch, season: value })}
                    >
                      <SelectTrigger className="border-orange-200 focus:border-orange-500">
                        <SelectValue placeholder="¿Cuándo viajas?" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons.map((season) => (
                          <SelectItem key={season} value={season}>
                            {season}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-orange-700 font-semibold">
                      Presupuesto (USD)
                    </Label>
                    <Select
                      value={tripSearch.budget}
                      onValueChange={(value) => setTripSearch({ ...tripSearch, budget: value })}
                    >
                      <SelectTrigger className="border-orange-200 focus:border-orange-500">
                        <SelectValue placeholder="¿Cuál es tu presupuesto?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-500">$0 - $500</SelectItem>
                        <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                        <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                        <SelectItem value="2000+">$2,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room-type" className="text-orange-700 font-semibold">
                      Tipo de alojamiento
                    </Label>
                    <Select
                      value={tripSearch.room_type}
                      onValueChange={(value) => setTripSearch({ ...tripSearch, room_type: value })}
                    >
                      <SelectTrigger className="border-orange-200 focus:border-orange-500">
                        <SelectValue placeholder="¿Cómo prefieres hospedarte?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shared">Habitación compartida</SelectItem>
                        <SelectItem value="private">Habitación privada</SelectItem>
                        <SelectItem value="both">Ambas opciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Buscar Viajes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setCurrentView("trips")}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent py-3"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Ver Todos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-orange-700 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2" />
                  Viajes Encontrados ({searchResults.length})
                </h3>
                {searchResults.map((result) => (
                  <Card key={result.id} className="border-orange-200 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <img
                            src={result.image_url || "/placeholder.svg"}
                            alt={result.destination}
                            className="w-full h-48 md:h-full object-cover rounded-l-lg"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-orange-700">{result.destination}</h4>
                              <div className="flex items-center mt-1">
                                {result.organizer?.profile_image_url ? (
                                  <img
                                    src={result.organizer.profile_image_url}
                                    alt={result.organizer.name}
                                    className="w-6 h-6 rounded-full mr-2"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                                    {result.organizer?.name?.charAt(0) || 'O'}
                                  </div>
                                )}
                                <p className="text-gray-600">
                                  Organizado por {result.organizer?.name || 'Organizador'}
                                  {result.organizer?.identity_verified && (
                                    <Badge className="ml-2 bg-green-100 text-green-700 border-green-300 text-xs">
                                      ✓ Verificado
                                    </Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
                                {result.current_participants}/{result.max_participants} viajeros
                              </Badge>
                              {result.rating && (
                                <div className="flex items-center mt-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-600 ml-1">{result.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {result.tags?.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="border-orange-300 text-orange-600">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center bg-orange-50 p-3 rounded-lg">
                              <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                              <div>
                                <p className="text-sm text-gray-600">Fechas</p>
                                <p className="font-semibold text-orange-700">
                                  {result.start_date && result.end_date 
                                    ? `${new Date(result.start_date).toLocaleDateString()} - ${new Date(result.end_date).toLocaleDateString()}`
                                    : 'Fechas flexibles'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center bg-green-50 p-3 rounded-lg">
                              <DollarSign className="h-5 w-5 mr-3 text-green-500" />
                              <div>
                                <p className="text-sm text-gray-600">Presupuesto</p>
                                <p className="font-semibold text-green-700">
                                  ${result.budget_min || 0} - ${result.budget_max || 0}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                              <Users className="h-5 w-5 mr-3 text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-600">Participantes</p>
                                <p className="font-semibold text-blue-700">{result.current_participants} unidos</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg italic">"{result.description}"</p>

                          <div className="flex gap-3">
                            <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                              <Heart className="h-4 w-4 mr-2" />
                              Unirse al viaje
                            </Button>
                            <Button
                              variant="outline"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contactar
                            </Button>
                            <Button
                              variant="outline"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver más
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="destinations" className="space-y-6 mt-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-orange-700 mb-2">Destinos Populares</h2>
              <p className="text-gray-600">Descubre los lugares más increíbles con JetGo</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((destination, index) => (
                <Card
                  key={destination.name || index}
                  className="overflow-hidden border-orange-200 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-orange-600 border-0">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {destination.rating}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{destination.name}</h3>
                      <p className="text-sm opacity-90">{destination.trips} viajes disponibles</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-gray-600 mb-4">{destination.description || `Descubre ${destination.name}`}</p>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver viajes disponibles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="border-orange-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setCurrentView("trips")}
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl mb-2 text-orange-700">Explorar Viajes</CardTitle>
                  <CardDescription className="text-gray-600">
                    Descubre todos los viajes disponibles con filtros avanzados
                  </CardDescription>
                </CardContent>
              </Card>

              <Card
                className="border-orange-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setCurrentView("profile")}
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl mb-2 text-orange-700">Mi Perfil</CardTitle>
                  <CardDescription className="text-gray-600">
                    Ve tus reseñas, calificaciones y gestiona tu información
                  </CardDescription>
                </CardContent>
              </Card>

              <Card
                className="border-orange-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => {
                  console.log('Botón "Crear Viaje" clickeado desde dashboard')
                  setShowCreateTrip(true)
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl mb-2 text-orange-700">Crear Viaje</CardTitle>
                  <CardDescription className="text-gray-600">
                    Organiza tu propio viaje y encuentra compañeros
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {profile && (
              <Card className="border-orange-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="text-xl">Resumen de Mi Perfil</CardTitle>
                  <CardDescription className="text-orange-100">Tu actividad reciente en JetGo</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">4.8</div>
                      <div className="text-gray-600 flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        Calificación
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">12</div>
                      <div className="text-gray-600">Viajes Realizados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">8</div>
                      <div className="text-gray-600">Viajes Organizados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            console.log('Botón flotante "Crear Viaje" clickeado')
            setShowCreateTrip(true)
          }}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat Widget */}
      <ChatWidget user={user} />

      {/* Create Trip Dialog */}
      {showCreateTrip && (
        <CreateTripDialog
          open={showCreateTrip}
          onOpenChange={setShowCreateTrip}
          userId={user?.id}
        />
      )}
    </div>
  )
}
