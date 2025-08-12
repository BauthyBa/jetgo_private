"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  Heart, 
  MessageCircle, 
  Eye, 
  Edit,
  Plus,
  Loader2,
  Settings,
  UserCheck
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { getUserTrips, type Trip } from "@/lib/trips"

interface MyTripsViewProps {
  user: User
  profile: any
  onBack: () => void
  onCreateTrip: () => void
}

export default function MyTripsView({ user, profile, onBack, onCreateTrip }: MyTripsViewProps) {
  const [myTrips, setMyTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("organized")
  const router = useRouter()

  useEffect(() => {
    fetchMyTrips()
  }, [user])

  const fetchMyTrips = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getUserTrips(user.id)
      
      if (error) {
        console.error('Error fetching user trips:', error)
        // Mostrar mensaje de error más amigable
        const errorMessage = error.message || 'Error desconocido'
        if (errorMessage.includes('relationship') || errorMessage.includes('foreign key')) {
          console.log('Error de relación de base de datos, continuando sin participantes...')
          // Si es un error de relación, podemos continuar con datos básicos
          setMyTrips([])
        } else {
          alert(`Error al cargar tus viajes: ${errorMessage}`)
          setMyTrips([])
        }
      } else {
        console.log('Mis viajes cargados:', data)
        setMyTrips(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setMyTrips([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha flexible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Presupuesto abierto'
    if (!max) return `Desde $${min}`
    if (!min) return `Hasta $${max}`
    return `$${min}-${max}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'full':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      default:
        return 'bg-orange-100 text-orange-700 border-orange-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Abierto'
      case 'full':
        return 'Completo'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconocido'
    }
  }

  const handleEditTrip = (trip: Trip) => {
    router.push(`/trip/${trip.id}/edit`)
  }

  const handleViewMessages = (trip: Trip) => {
    router.push(`/trip/${trip.id}/chat`)
  }

  const handleViewDetails = (trip: Trip) => {
    router.push(`/trip/${trip.id}`)
  }

  const handleBackFromDetail = () => {
    // setSelectedTrip(null) // This line is removed as per the edit hint
  }

  const filteredTrips = myTrips.filter(trip => {
    const searchLower = searchTerm.toLowerCase()
    return (
      trip.destination.toLowerCase().includes(searchLower) ||
      (trip.description && trip.description.toLowerCase().includes(searchLower)) ||
      (trip.tags && trip.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    )
  })

  // Si hay un viaje seleccionado, mostrar la vista detallada
  // if (selectedTrip) { // This block is removed as per the edit hint
  //   return (
  //     <TripDetailView 
  //       trip={selectedTrip} 
  //       user={user} 
  //       onBack={handleBackFromDetail}
  //     />
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
      <header className="bg-white/95 backdrop-blur-lg border-b border-orange-200 sticky top-0 z-50 shadow-lg shadow-orange-100/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-orange-600 hover:bg-orange-50 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Viajes</h1>
                <p className="text-sm text-orange-600">Gestiona tus viajes organizados</p>
              </div>
            </div>
            
            <Button
              onClick={onCreateTrip}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 transition-all duration-300 transform hover:scale-[1.02] border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Viaje
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-orange-100 p-1 rounded-lg">
            <TabsTrigger
              value="organized"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              <Settings className="h-4 w-4 mr-2" />
              Organizados por mí
            </TabsTrigger>
            <TabsTrigger
              value="participating"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Participando
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organized" className="space-y-6 mt-6">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar en mis viajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Cargando tus viajes...</span>
              </div>
            ) : filteredTrips.length === 0 ? (
              <Card className="border-orange-200 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tienes viajes organizados
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Crea tu primer viaje y comienza a conectar con otros viajeros
                  </p>
                  <Button
                    onClick={onCreateTrip}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Mi Primer Viaje
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredTrips.map((trip) => (
                  <Card key={trip.id} className="border-orange-200 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <img
                            src={trip.image_url || "/placeholder.svg"}
                            alt={trip.destination}
                            className="w-full h-48 md:h-full object-cover rounded-l-lg"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-bold text-orange-700">{trip.destination}</h4>
                                {trip.featured && (
                                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                    ⭐ Destacado
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`text-xs ${getStatusColor(trip.status)}`}>
                                  {getStatusText(trip.status)}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Creado el {formatDate(trip.created_at)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 mb-2">
                                {trip.current_participants}/{trip.max_participants} viajeros
                              </Badge>
                              {trip.rating && trip.rating > 0 && (
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-600 ml-1">{trip.rating.toFixed(1)}</span>
                                  <span className="text-xs text-gray-500 ml-1">({trip.total_ratings})</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {trip.tags?.map((tag: string) => (
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
                                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center bg-green-50 p-3 rounded-lg">
                              <DollarSign className="h-5 w-5 mr-3 text-green-500" />
                              <div>
                                <p className="text-sm text-gray-600">Presupuesto</p>
                                <p className="font-semibold text-green-700">
                                  {formatBudget(trip.budget_min, trip.budget_max)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                              <Users className="h-5 w-5 mr-3 text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-600">Participantes</p>
                                <p className="font-semibold text-blue-700">
                                  {trip.current_participants || 0} unidos
                                </p>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg italic">
                            "{trip.description || 'Sin descripción disponible'}"
                          </p>

                          {/* Mensaje sobre participantes */}
                          <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-700 text-center">
                              {trip.current_participants > 1 
                                ? `${trip.current_participants} personas se han unido a este viaje`
                                : 'Aún no hay participantes en este viaje. ¡Comparte el enlace para que más personas se unan!'
                              }
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <Button 
                              onClick={() => handleEditTrip(trip)}
                              className="flex-1 bg-orange-500 hover:bg-orange-600"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Viaje
                            </Button>
                            <Button
                              onClick={() => handleViewMessages(trip)}
                              variant="outline"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Ver Mensajes
                            </Button>
                            <Button
                              onClick={() => handleViewDetails(trip)}
                              variant="outline"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
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

          <TabsContent value="participating" className="space-y-6 mt-6">
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No estás participando en viajes
                </h3>
                <p className="text-gray-600 mb-6">
                  Únete a viajes organizados por otros usuarios para comenzar a viajar juntos
                </p>
                <Button
                  onClick={onBack}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Explorar Viajes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 