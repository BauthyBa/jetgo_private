"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, MapPin, Users, DollarSign, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { createTrip, type CreateTripData } from "@/lib/trips"

interface CreateTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}

const destinations = [
  "Buenos Aires, Argentina",
  "Santiago de Chile, Chile",
  "Carlos Paz, Córdoba, Argentina",
  "Montevideo, Uruguay",
  "Beijing, China",
  "Shanghai, China",
  "São Paulo, Brasil",
  "Madrid, España",
  "Barcelona, España",
  "Lima, Perú",
  "Cusco, Perú",
  "Bariloche, Argentina",
  "Punta del Este, Uruguay",
]

const interests = [
  "Aventura",
  "Cultura",
  "Gastronomía",
  "Historia",
  "Naturaleza",
  "Playa",
  "Montaña",
  "Ciudad",
  "Arte",
  "Música",
  "Deportes",
  "Fotografía",
  "Relajación",
  "Bienestar",
  "Fiesta",
]

const seasons = [
  { value: "spring", label: "Primavera (Sep-Nov)" },
  { value: "summer", label: "Verano (Dic-Feb)" },
  { value: "autumn", label: "Otoño (Mar-May)" },
  { value: "winter", label: "Invierno (Jun-Ago)" },
  { value: "any", label: "Cualquier época" }
]

export default function CreateTripDialog({ open, onOpenChange, userId }: CreateTripDialogProps) {
  console.log('CreateTripDialog renderizado con:', { open, userId })
  
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [tripData, setTripData] = useState({
    destination: "",
    customDestination: "",
    startDate: "",
    endDate: "",
    budgetMin: "",
    budgetMax: "",
    maxParticipants: "",
    description: "",
    roomType: "",
    selectedInterests: [] as string[],
    season: "",
    requirements: "",
    isFlexibleDates: false,
  })

  const handleInterestToggle = (interest: string) => {
    setTripData((prev) => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter((i) => i !== interest)
        : [...prev.selectedInterests, interest],
    }))
  }

  const extractCountryFromDestination = (destination: string): string => {
    const parts = destination.split(', ')
    return parts[parts.length - 1] || ''
  }

  const handleSubmit = async () => {
    if (!userId) {
      alert("Error: Usuario no identificado")
      return
    }

    setIsLoading(true)
    
    try {
      const finalDestination = tripData.destination === "Otro" 
        ? tripData.customDestination 
        : tripData.destination.split(',')[0] // Solo la ciudad, no el país

      const createData: CreateTripData = {
        destination: finalDestination,
        description: tripData.description,
        start_date: tripData.startDate || undefined,
        end_date: tripData.endDate || undefined,
        budget_min: tripData.budgetMin ? parseInt(tripData.budgetMin) : undefined,
        budget_max: tripData.budgetMax ? parseInt(tripData.budgetMax) : undefined,
        max_participants: parseInt(tripData.maxParticipants),
        room_type: tripData.roomType || undefined,
        tags: tripData.selectedInterests.length > 0 ? tripData.selectedInterests : undefined,
        season: tripData.season || undefined,
        country: tripData.destination === "Otro" 
          ? undefined 
          : extractCountryFromDestination(tripData.destination)
      }

      console.log('Creando viaje con datos:', createData)
      
      const { data, error } = await createTrip(createData, userId)
      
      if (error) {
        console.error('Error al crear viaje:', error)
        alert(`Error al crear el viaje: ${error.message || 'Error desconocido'}`)
        return
      }

      console.log('Viaje creado exitosamente:', data)
      
      // Mostrar notificación de éxito
      const notification = document.createElement('div')
      notification.className = `
        fixed top-4 right-4 z-[9999] max-w-sm w-full
        bg-green-50 border-green-200 text-green-800 border-l-4 p-4 rounded-lg shadow-lg
        animate-in slide-in-from-right duration-300
      `
      notification.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0">🎉</div>
          <div class="ml-3">
            <h3 class="text-sm font-medium">¡Viaje creado exitosamente!</h3>
            <div class="mt-1 text-sm">Tu viaje a ${finalDestination} ya está publicado y otros usuarios pueden unirse.</div>
          </div>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (notification.parentNode === document.body) {
          document.body.removeChild(notification)
        }
      }, 5000)

      // Cerrar dialog y resetear formulario
      onOpenChange(false)
      setStep(1)
      resetForm()
      
      // Recargar la página o emitir evento para actualizar la lista de viajes
      window.location.reload()
      
    } catch (err) {
      console.error('Error inesperado:', err)
      alert(`Error inesperado: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTripData({
      destination: "",
      customDestination: "",
      startDate: "",
      endDate: "",
      budgetMin: "",
      budgetMax: "",
      maxParticipants: "",
      description: "",
      roomType: "",
      selectedInterests: [],
      season: "",
      requirements: "",
      isFlexibleDates: false,
    })
  }

  const canContinueStep1 = tripData.destination && (tripData.destination !== "Otro" || tripData.customDestination) && tripData.startDate && tripData.endDate
  const canContinueStep2 = tripData.budgetMin && tripData.budgetMax && tripData.maxParticipants
  const canSubmit = tripData.description && tripData.selectedInterests.length > 0

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Sparkles className="h-6 w-6 mr-2 text-orange-500" />
            Crear Nuevo Viaje
          </DialogTitle>
          <DialogDescription>
            Paso {step} de 3: {step === 1 ? "Destino y Fechas" : step === 2 ? "Presupuesto y Participantes" : "Detalles del Viaje"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Destino
              </Label>
              <Select value={tripData.destination} onValueChange={(value) => setTripData({ ...tripData, destination: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un destino" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                  <SelectItem value="Otro">Otro destino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tripData.destination === "Otro" && (
              <div className="space-y-2">
                <Label htmlFor="custom-destination">Especifica tu destino</Label>
                <Input
                  id="custom-destination"
                  placeholder="Ej: Roma, Italia"
                  value={tripData.customDestination}
                  onChange={(e) => setTripData({ ...tripData, customDestination: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Fecha de inicio
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={tripData.startDate}
                  onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Fecha de fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={tripData.endDate}
                  onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Época del año</Label>
              <Select value={tripData.season} onValueChange={(value) => setTripData({ ...tripData, season: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la época" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.value} value={season.value}>
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="flexible-dates"
                checked={tripData.isFlexibleDates}
                onCheckedChange={(checked) => setTripData({ ...tripData, isFlexibleDates: checked as boolean })}
              />
              <Label htmlFor="flexible-dates" className="text-sm">
                Tengo flexibilidad con las fechas
              </Label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget-min" className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Presupuesto mínimo (USD)
                </Label>
                <Input
                  id="budget-min"
                  type="number"
                  placeholder="500"
                  value={tripData.budgetMin}
                  onChange={(e) => setTripData({ ...tripData, budgetMin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-max">Presupuesto máximo (USD)</Label>
                <Input
                  id="budget-max"
                  type="number"
                  placeholder="1500"
                  value={tripData.budgetMax}
                  onChange={(e) => setTripData({ ...tripData, budgetMax: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-participants" className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Número máximo de participantes
              </Label>
              <Input
                id="max-participants"
                type="number"
                placeholder="8"
                min="2"
                max="20"
                value={tripData.maxParticipants}
                onChange={(e) => setTripData({ ...tripData, maxParticipants: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-type">Preferencia de alojamiento</Label>
              <Select value={tripData.roomType} onValueChange={(value) => setTripData({ ...tripData, roomType: value })}>
                <SelectTrigger>
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
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del viaje</Label>
              <Textarea
                id="description"
                placeholder="Describe tu viaje, qué actividades planeas hacer, qué tipo de viajeros buscas..."
                value={tripData.description}
                onChange={(e) => setTripData({ ...tripData, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Intereses del viaje (selecciona al menos uno)</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={tripData.selectedInterests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      tripData.selectedInterests.includes(interest)
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "hover:bg-orange-50 border-orange-300"
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos adicionales (opcional)</Label>
              <Textarea
                id="requirements"
                placeholder="Ej: Nivel de inglés básico, experiencia en senderismo, etc."
                value={tripData.requirements}
                onChange={(e) => setTripData({ ...tripData, requirements: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canContinueStep1) ||
                  (step === 2 && !canContinueStep2) ||
                  isLoading
                }
                className="bg-orange-500 hover:bg-orange-600"
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando viaje...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Crear Viaje
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
