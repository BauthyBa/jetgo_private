# JetGo - Plataforma de Viajes Compartidos

Una aplicación web moderna para coordinar viajes compartidos con otros usuarios, construida con Next.js 14 y Supabase. JetGo conecta viajeros verificados para crear experiencias únicas y económicas.

## 🚀 Características Principales

- 🔐 **Autenticación completa** con Supabase Auth
- 📧 **Verificación de email** obligatoria al registrarse
- 👤 **Perfiles de usuario personalizados** con verificación de identidad opcional
- 🌍 **Búsqueda avanzada** de viajes por destino, época y presupuesto
- 🏠 **Preferencias de alojamiento** (habitación compartida/privada)
- 📱 **Diseño responsive** y moderno con Tailwind CSS
- 🛡️ **Verificación de edad** (mínimo 18 años)
- 📋 **Términos y condiciones** completos y actualizados
- ⭐ **Sistema de calificaciones** y reseñas
- 🎯 **Filtros avanzados** para encontrar viajes perfectos

## 📊 Estadísticas de la Plataforma

- **2,500+** Viajeros Verificados
- **450+** Viajes Realizados  
- **80%** De viajeros vuelven a elegirnos

## 🌍 Destinos Incluidos

- **Argentina**: Buenos Aires, Carlos Paz (Córdoba)
- **Chile**: Santiago de Chile
- **Uruguay**: Montevideo
- **China**: Gran Muralla China
- **Brasil**: Río de Janeiro
- **España**: Barcelona, Madrid
- **Francia**: París
- **Italia**: Roma, Venecia
- **México**: Ciudad de México
- **Perú**: Lima, Cusco

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Villada-JetGo/jetgo.git
cd jetgo/jetgoFront
```

### 2. Instalar dependencias
```bash
npm install --legacy-peer-deps
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto frontend:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 4. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings > API y copia:
   - Project URL
   - anon/public key
4. Completa el archivo `.env.local` con tus datos

### 5. Configurar la base de datos

**IMPORTANTE:** Los scripts SQL ahora están en `jetgoBack/supabase/migrations/`

1. Ve a tu proyecto de Supabase
2. Abre el SQL Editor
3. Copia y ejecuta el contenido de:
   - `jetgoBack/supabase/migrations/001_initial_tables.sql`
   - `jetgoBack/supabase/migrations/002_messages_table.sql`

### 6. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🎯 Funcionalidades Detalladas

### Nuevo Flujo de Registro y Autenticación ✨

**CAMBIO IMPORTANTE:** Se ha modificado el flujo de autenticación para ser más accesible:

1. **Registro directo**: Los usuarios ahora pueden registrarse directamente con email/password
2. **Verificación de email obligatoria**: Se envía un código de verificación al email
3. **Login habilitado**: Después de verificar el email, pueden acceder a la plataforma
4. **Verificación de identidad opcional**: La verificación de identidad ahora es un paso opcional que se puede completar más tarde

#### Flujo anterior:
Verificación de identidad → Registro → Login

#### Nuevo flujo:
Registro → Verificación de email → Login → Verificación de identidad (opcional)

### Búsqueda y Filtros
- **Filtro por destino** con países específicos
- **Selección de época** del año (Primavera, Verano, Otoño, Invierno)
- **Rango de presupuesto** personalizable
- **Tipo de alojamiento** (compartido/privado/ambos)
- **Calificación mínima** de organizadores
- **Número de participantes** disponible

### Dashboard y Perfil
- **Vista de perfil personal** con estadísticas
- **Galería de destinos** populares
- **Resultados de búsqueda** con información detallada
- **Sistema de calificaciones** como organizador y compañero
- **Historial de viajes** completado y próximos

### Términos y Condiciones
- **20 secciones completas** con regulaciones detalladas
- **Restricción de edad** (18+ años)
- **Políticas de contenido** y propiedad intelectual
- **Colaboración con autoridades** y prevención de delitos
- **Condiciones para menores** acompañados
- **Uso de tecnologías** (GPS, cookies, etc.)

## 🛡️ Seguridad y Verificación

- **Verificación de email** obligatoria
- **Verificación de identidad** opcional (se puede completar después)
- **Validación de edad** (mínimo 18 años)
- **Documentación requerida** con múltiples tipos
- **Sistema de badges** para usuarios verificados
- **Colaboración con autoridades** en casos necesarios

## 🎨 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Radix UI** - Componentes de UI accesibles
- **Lucide React** - Iconografía
- **Supabase** - Backend como servicio

### Backend
- **Supabase** - Base de datos PostgreSQL y autenticación
- **Edge Functions** - Funciones serverless (ver `jetgoBack/`)
- **Row Level Security** - Seguridad a nivel de filas

## 🔄 Estructura del Proyecto

```
jetgo/
├── jetgoFront/              # Frontend Next.js
│   ├── app/                 # App Router de Next.js
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilidades y configuración
│   └── ...
└── jetgoBack/               # Backend y funciones de Supabase
    └── supabase/
        ├── functions/       # Edge Functions
        └── migrations/      # Scripts SQL
```

## 📧 Configuración de Email

Para producción, necesitarás configurar un proveedor de email en Supabase:

1. Ve a Settings > Auth en tu proyecto de Supabase
2. Configura un proveedor SMTP (recomendado: SendGrid, Resend)
3. Personaliza las plantillas de email

## 🚀 Despliegue

### Frontend (Next.js)
- **Vercel** (recomendado)
- **Netlify**
- **Railway**

### Backend (Supabase)
- Las funciones Edge se despliegan directamente en Supabase
- Ver documentación en `jetgoBack/README.md`
