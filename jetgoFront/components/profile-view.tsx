"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, Users, MapPin, ThumbsUp, MessageCircle, Award, TrendingUp, Edit } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface ProfileViewProps {
  user: User
  profile: any
  onBack: () => void
}

const mockReviewsReceived: any[] = []

const mockReviewsGiven: any[] = []

const mockTripHistory = [
  {
    id: 1,
    destination: "Buenos Aires",
    dates: "15-22 Marzo 2024",
    role: "Organizador",
    participants: 8,
    rating: 4.8,
    status: "Completado",
    image: "/placeholder.svg?height=100&width=150&text=Buenos Aires",
  },
  {
    id: 2,
    destination: "China",
    dates: "1-15 Abril 2024",
    role: "Participante",
    participants: 10,
    rating: 4.9,
    status: "Completado",
    image: "/placeholder.svg?height=100&width=150&text=China",
  },
  {
    id: 3,
    destination: "Santiago de Chile",
    dates: "10-17 Mayo 2024",
    role: "Participante",
    participants: 6,
    rating: 4.7,
    status: "Próximo",
    image: "/placeholder.svg?height=100&width=150&text=Santiago",
  },
]

export default function ProfileView({ user, profile, onBack }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Cargar imagen guardada al inicializar el componente
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        // Cargar la URL de la imagen desde la base de datos
        const { data, error } = await supabase
          .from('user_profiles')
          .select('profile_image_url')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error loading profile image:', error)
          return
        }

        if (data?.profile_image_url) {
          console.log('Imagen de perfil cargada desde Supabase:', data.profile_image_url)
          setProfileImage(data.profile_image_url)
        }
      } catch (error) {
        console.error('Error loading profile image:', error)
      }
    }

    loadProfileImage()
  }, [user.id])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, GIF, etc.)')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede ser mayor a 5MB')
      return
    }

    setUploadingImage(true)
    
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`

      console.log('Subiendo imagen a Supabase Storage...', fileName)

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Error uploading to storage:', uploadError)
        throw new Error(`Error al subir la imagen: ${uploadError.message}`)
      }

      // Obtener URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl
      console.log('Imagen subida exitosamente, URL:', publicUrl)

      // Actualizar la tabla user_profiles con la nueva URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          profile_image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        throw new Error(`Error al actualizar el perfil: ${updateError.message}`)
      }

      // Actualizar la imagen localmente
      setProfileImage(publicUrl)

      // Disparar evento para sincronizar con otros componentes
      console.log('Disparando evento profileImageUpdated')
      window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: publicUrl }))

      setUploadingImage(false)
      
      // Mostrar notificación de éxito más elegante
      const notification = document.createElement('div')
      notification.className = `
        fixed top-4 right-4 z-[9999] max-w-sm w-full
        bg-green-50 border-green-200 text-green-800 border-l-4 p-4 rounded-lg shadow-lg
        animate-in slide-in-from-right duration-300
      `
      notification.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0">📸</div>
          <div class="ml-3">
            <h3 class="text-sm font-medium">¡Foto actualizada!</h3>
            <div class="mt-1 text-sm">Tu foto de perfil se ha guardado en Supabase exitosamente.</div>
          </div>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (notification.parentNode === document.body) {
          document.body.removeChild(notification)
        }
      }, 4000)

    } catch (error: any) {
      console.error('Error al subir la imagen:', error)
      setUploadingImage(false)
      alert(`Error al actualizar la foto de perfil: ${error.message}`)
    }
  }

  const organizerRating =
    mockReviewsReceived.length > 0
      ? mockReviewsReceived.filter((r) => r.type === "organizer").reduce((acc, r) => acc + r.rating, 0) /
        mockReviewsReceived.filter((r) => r.type === "organizer").length
      : 0

  const companionRating =
    mockReviewsReceived.length > 0
      ? mockReviewsReceived.filter((r) => r.type === "companion").reduce((acc, r) => acc + r.rating, 0) /
        mockReviewsReceived.filter((r) => r.type === "companion").length
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
      <header className="bg-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => {
              console.log('Regresando al dashboard, verificando imagen...')
              // Disparar evento antes de volver
              window.dispatchEvent(new CustomEvent('profileImageUpdated'))
              onBack()
            }} 
            className="mr-4 text-orange-600 hover:bg-orange-50 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <img src="/jetgo-logo.png" alt="JetGo" className="h-8 w-8 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-sm text-orange-600">Gestiona tu información y reputación</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="border-orange-200 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar con funcionalidad de cambio de imagen */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-orange-100 shadow-lg">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-4xl font-bold">
                      {profile?.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Overlay para cambiar foto */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <label 
                    htmlFor="profile-image-upload" 
                    className="text-white text-sm font-medium cursor-pointer bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-full flex items-center space-x-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{uploadingImage ? 'Subiendo...' : 'Cambiar'}</span>
                  </label>
                </div>

                {/* Input oculto para subir archivos */}
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                
                {/* Indicador de carga */}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-gray-900">{profile?.name || user.email}</h2>
                  {profile?.verified && (
                    <Badge className="bg-green-100 text-green-700 border-green-300">✓ Identidad Verificada</Badge>
                  )}
                  <Button
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">4.8</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      General
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">12</div>
                    <div className="text-sm text-gray-600">Viajes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">8</div>
                    <div className="text-sm text-gray-600">Organizados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">24</div>
                    <div className="text-sm text-gray-600">Reseñas</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile?.interests?.map((interest: string) => (
                    <Badge key={interest} variant="outline" className="border-orange-300 text-orange-600">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Como Organizador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-orange-600">{organizerRating.toFixed(1)}</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(organizerRating) ? "text-yellow-500 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Basado en {mockReviewsReceived.filter((r) => r.type === "organizer").length} reseñas como organizador
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Como Compañero
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-blue-600">{companionRating.toFixed(1)}</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(companionRating) ? "text-yellow-500 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Basado en {mockReviewsReceived.filter((r) => r.type === "companion").length} reseñas como compañero
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-orange-100 p-1 rounded-lg">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="reviews-received"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Reseñas Recibidas
            </TabsTrigger>
            <TabsTrigger
              value="reviews-given"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Reseñas Dadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="border-orange-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <MapPin className="h-5 w-5 mr-2" />
                  Historial de Viajes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTripHistory.map((trip) => (
                  <div key={trip.id} className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                    <img
                      src={trip.image || "/placeholder.svg"}
                      alt={trip.destination}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{trip.destination}</h4>
                      <p className="text-sm text-gray-600">{trip.dates}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={trip.role === "Organizador" ? "default" : "secondary"}
                          className={trip.role === "Organizador" ? "bg-orange-500" : ""}
                        >
                          {trip.role}
                        </Badge>
                        <Badge
                          variant={trip.status === "Completado" ? "outline" : "default"}
                          className={trip.status === "Próximo" ? "bg-green-500" : "border-green-300 text-green-700"}
                        >
                          {trip.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="text-sm font-semibold">{trip.rating}</span>
                      </div>
                      <p className="text-sm text-gray-600">{trip.participants} viajeros</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews-received" className="space-y-6 mt-6">
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Aún no tienes reseñas!</h3>
                <p className="text-gray-600 mb-4">
                  Cuando completes tus primeros viajes, otros viajeros podrán dejarte comentarios y calificaciones.
                </p>
                <p className="text-sm text-orange-600">
                  💡 Tip: Sé un gran compañero de viaje para recibir excelentes reseñas
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews-given" className="space-y-6 mt-6">
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Comienza a viajar y opinar!</h3>
                <p className="text-gray-600 mb-4">
                  Después de completar viajes, podrás dejar reseñas sobre tus compañeros y organizadores.
                </p>
                <p className="text-sm text-blue-600">
                  💡 Tip: Las reseñas honestas ayudan a mejorar la comunidad JetGo
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
