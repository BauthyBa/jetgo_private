"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Filter,
  Search,
  Loader2
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { getTrips, type Trip, type TripFilters } from "@/lib/trips"

interface AllTripsViewProps {
  user: User
  profile: any
  onBack: () => void
}

export default function AllTripsView({ user, profile, onBack }: AllTripsViewProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    country: "",
    season: "",
    budgetRange: "",
    tags: "",
  })
  const [sortBy, setSortBy] = useState("featured") // featured, newest, rating, participants

  useEffect(() => {
    fetchAllTrips()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [trips, searchTerm, filters, sortBy])

  const fetchAllTrips = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getTrips()
      
      if (error) {
        console.error('Error fetching trips:', error)
        alert('Error al cargar los viajes. Inténtalo de nuevo.')
        setTrips([])
      } else {
        console.log('Viajes cargados:', data)
        setTrips(data || [])
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setTrips([])
    } finally {
      setIsLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...trips]

    // Aplicar búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.organizer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Aplicar filtros
    if (filters.country) {
      filtered = filtered.filter(trip => trip.country === filters.country)
    }

    if (filters.season) {
      filtered = filtered.filter(trip => trip.season === filters.season)
    }

    if (filters.budgetRange) {
      const [min, max] = filters.budgetRange.split('-').map(Number)
      filtered = filtered.filter(trip => {
        if (!trip.budget_min || !trip.budget_max) return false
        return trip.budget_min >= min && trip.budget_max <= (max || 99999)
      })
    }

    if (filters.tags) {
      filtered = filtered.filter(trip =>
        trip.tags?.some(tag => tag.toLowerCase().includes(filters.tags.toLowerCase()))
      )
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'featured':
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'participants':
        filtered.sort((a, b) => b.current_participants - a.current_participants)
        break
    }

    setFilteredTrips(filtered)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha flexible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Presupuesto abierto'
    if (!max) return `Desde $${min}`
    if (!min) return `Hasta $${max}`
    return `$${min}-${max}`
  }

  // Obtener países únicos para el filtro
  const uniqueCountries = Array.from(new Set(trips.map(trip => trip.country).filter(Boolean))) as string[]

  // Obtener tags únicos para el filtro
  const uniqueTags = Array.from(new Set(trips.flatMap(trip => trip.tags || []))).slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
      <header className="bg-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="mr-4 text-orange-600 hover:bg-orange-50 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <img src="/jetgo-logo.png" alt="JetGo" className="h-8 w-8 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Todos los Viajes</h1>
              <p className="text-sm text-orange-600">Explora todas las aventuras disponibles</p>
            </div>
          </div>
          <div className="ml-auto">
            <Badge className="bg-orange-100 text-orange-700 border-orange-300">
              {filteredTrips.length} viajes encontrados
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filtros y búsqueda */}
        <Card className="mb-6 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros y Búsqueda
            </CardTitle>
            <CardDescription className="text-orange-100">
              Encuentra el viaje perfecto para ti
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Barra de búsqueda */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar viajes</Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Buscar por destino, descripción, organizador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="sort">Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="rating">Mejor valorados</SelectItem>
                    <SelectItem value="participants">Más participantes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="country">País</Label>
                <Select value={filters.country} onValueChange={(value) => setFilters({...filters, country: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los países</SelectItem>
                    {uniqueCountries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="season">Temporada</Label>
                <Select value={filters.season} onValueChange={(value) => setFilters({...filters, season: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier época" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cualquier época</SelectItem>
                    <SelectItem value="spring">Primavera</SelectItem>
                    <SelectItem value="summer">Verano</SelectItem>
                    <SelectItem value="autumn">Otoño</SelectItem>
                    <SelectItem value="winter">Invierno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">Presupuesto</Label>
                <Select value={filters.budgetRange} onValueChange={(value) => setFilters({...filters, budgetRange: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier precio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cualquier precio</SelectItem>
                    <SelectItem value="0-500">$0 - $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                    <SelectItem value="2000-99999">$2,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Intereses</Label>
                <Select value={filters.tags} onValueChange={(value) => setFilters({...filters, tags: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier interés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cualquier interés</SelectItem>
                    {uniqueTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de viajes */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-lg text-gray-600">Cargando viajes...</span>
          </div>
        ) : filteredTrips.length === 0 ? (
          <Card className="border-orange-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay viajes disponibles</h3>
              <p className="text-gray-600 mb-4">
                No se encontraron viajes que coincidan con tus criterios de búsqueda.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("")
                  setFilters({ country: "", season: "", budgetRange: "", tags: "" })
                }}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Limpiar filtros
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
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-xl font-bold text-orange-700">{trip.destination}</h4>
                            {trip.featured && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                ⭐ Destacado
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            {trip.organizer?.profile_image_url ? (
                              <img
                                src={trip.organizer.profile_image_url}
                                alt={trip.organizer.name}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                                {trip.organizer?.name?.charAt(0) || 'O'}
                              </div>
                            )}
                            <p className="text-gray-600">
                              Organizado por {trip.organizer?.name || 'Organizador'}
                              {trip.organizer?.identity_verified && (
                                <Badge className="ml-2 bg-green-100 text-green-700 border-green-300 text-xs">
                                  ✓ Verificado
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
                            {trip.current_participants}/{trip.max_participants} viajeros
                          </Badge>
                          {trip.rating && trip.rating > 0 && (
                            <div className="flex items-center mt-1">
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
                            <p className="font-semibold text-blue-700">{trip.current_participants} unidos</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg italic">
                        "{trip.description || 'Sin descripción disponible'}"
                      </p>

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
      </div>
    </div>
  )
}
