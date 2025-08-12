"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Shield, Heart, Sparkles, ArrowRight, Globe, Camera, MessageCircle } from "lucide-react"

const featuredDestinations = [
  {
    name: "Buenos Aires",
    country: "Argentina",
    image: "/placeholder.svg?height=300&width=400&text=Buenos Aires Skyline",
    rating: 4.9,
    trips: 156,
    price: "$600-1200",
    description: "Tango, asado y arquitectura europea en el corazón de Sudamérica",
  },
  {
    name: "Santiago de Chile",
    country: "Chile",
    image: "/placeholder.svg?height=300&width=400&text=Santiago Mountains",
    rating: 4.8,
    trips: 89,
    price: "$700-1400",
    description: "Vinos excepcionales con vista a la cordillera de los Andes",
  },
  {
    name: "Carlos Paz",
    country: "Argentina",
    image: "/placeholder.svg?height=300&width=400&text=Carlos Paz Lake",
    rating: 4.7,
    trips: 124,
    price: "$400-800",
    description: "Sierras, lago y aventura en el corazón de Córdoba",
  },
  {
    name: "Montevideo",
    country: "Uruguay",
    image: "/placeholder.svg?height=300&width=400&text=Montevideo Beach",
    rating: 4.6,
    trips: 67,
    price: "$500-900",
    description: "Playas, cultura y la calidez uruguaya te esperan",
  },
]

const testimonials = [
  {
    name: "María González",
    location: "Buenos Aires",
    rating: 5,
    comment:
      "Increíble experiencia! Conocí personas maravillosas y visitamos lugares únicos. JetGo hizo que todo fuera súper fácil.",
    trips: 12,
    avatar: "/placeholder.svg?height=60&width=60&text=MG",
  },
  {
    name: "Carlos Rodríguez",
    location: "Santiago",
    rating: 5,
    comment: "La verificación de identidad me dio mucha confianza. Todos los viajeros son reales y confiables.",
    trips: 8,
    avatar: "/placeholder.svg?height=60&width=60&text=CR",
  },
  {
    name: "Ana Martínez",
    location: "Córdoba",
    rating: 5,
    comment: "Perfecto para dividir gastos y hacer nuevos amigos. Ya tengo mi próximo viaje planeado!",
    trips: 15,
    avatar: "/placeholder.svg?height=60&width=60&text=AM",
  },
]

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b-4 border-orange-500 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/jetgo-logo.png" alt="JetGo" className="h-10 w-10 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JetGo</h1>
              <p className="text-sm text-orange-600">Viajes que conectan</p>
            </div>
          </div>
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Comenzar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Viaja{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Conectado
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Descubre el mundo compartiendo experiencias únicas con viajeros verificados. Divide gastos, multiplica
              aventuras.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onGetStarted}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
              >
                Comenzar Ahora
              </Button>
              <Button
                onClick={onGetStarted}
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 text-lg"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                Únete Ahora
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">2,500+</div>
                <div className="text-gray-600">Viajeros Verificados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">450+</div>
                <div className="text-gray-600">Viajes Realizados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">80%</div>
                <div className="text-gray-600">De viajeros vuelven a elegirnos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Destinos Más Populares</h2>
            <p className="text-xl text-gray-600">Los lugares favoritos de nuestra comunidad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((destination, index) => (
              <Card
                key={destination.name}
                className="overflow-hidden border-orange-200 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-orange-600 border-0">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {destination.rating}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.country}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm mb-3">{destination.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-orange-600 font-semibold">{destination.price}</span>
                    <span className="text-gray-500">{destination.trips} viajes</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por Qué Elegir JetGo?</h2>
            <p className="text-xl text-gray-600">Seguridad, comunidad y aventura en una sola plataforma</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-orange-200 shadow-lg text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl mb-3 text-orange-700">100% Verificado</CardTitle>
              <CardDescription className="text-gray-600">
                Todos los usuarios pasan por verificación de identidad con documento y reconocimiento facial para tu
                seguridad.
              </CardDescription>
            </Card>

            <Card className="border-orange-200 shadow-lg text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl mb-3 text-orange-700">Comunidad Activa</CardTitle>
              <CardDescription className="text-gray-600">
                Conecta con viajeros de ideas afines, comparte experiencias y crea amistades que duran toda la vida.
              </CardDescription>
            </Card>

            <Card className="border-orange-200 shadow-lg text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl mb-3 text-orange-700">Gastos Compartidos</CardTitle>
              <CardDescription className="text-gray-600">
                Divide costos de transporte, alojamiento y actividades. Viaja más gastando menos.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Lo Que Dicen Nuestros Viajeros</h2>
            <p className="text-xl text-gray-600">Experiencias reales de nuestra comunidad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-orange-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                  <Badge variant="outline" className="border-orange-300 text-orange-600">
                    {testimonial.trips} viajes realizados
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo Para Tu Próxima Aventura?</h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a miles de viajeros que ya descubrieron una nueva forma de explorar el mundo
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-4"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Comenzar Mi Viaje
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/jetgo-logo.png" alt="JetGo" className="h-8 w-8 rounded-lg" />
                <div>
                  <h3 className="text-xl font-bold">JetGo</h3>
                  <p className="text-sm text-orange-400">Viajes que conectan</p>
                </div>
              </div>
              <p className="text-gray-400">
                La plataforma líder en viajes compartidos con verificación de identidad y comunidad activa.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destinos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Buenos Aires</li>
                <li>Santiago de Chile</li>
                <li>Carlos Paz</li>
                <li>Montevideo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Términos y Condiciones</li>
                <li>Política de Privacidad</li>
                <li>Contacto</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 contacto@jetgo.com.ar</li>
                <li>🌐 www.jetgo.com.ar</li>
                <li>📱 +54 9 11 1234-5678</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JetGo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
