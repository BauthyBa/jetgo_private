# Sistema de Chat de Grupo en Tiempo Real

## 🎯 Descripción

Sistema de chat de grupo en tiempo real implementado con Supabase y React, siguiendo los lineamientos del prompt. Permite a los usuarios crear salas, unirse a ellas y comunicarse en tiempo real.

## 🏗️ Arquitectura

### Base de Datos (Supabase)

#### Tablas Principales

1. **`rooms`** - Salas de chat
   - `id` (UUID, PK)
   - `name` (TEXT) - Nombre de la sala
   - `description` (TEXT) - Descripción opcional
   - `created_by` (UUID, FK) - Usuario que creó la sala
   - `is_private` (BOOLEAN) - Si la sala es privada
   - `max_members` (INTEGER) - Máximo de miembros
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **`room_members`** - Miembros de las salas
   - `id` (UUID, PK)
   - `room_id` (UUID, FK) - Referencia a la sala
   - `user_id` (UUID, FK) - Referencia al usuario
   - `role` (TEXT) - 'admin', 'moderator', 'member'
   - `joined_at` (TIMESTAMP)

3. **`chat_messages`** - Mensajes del chat
   - `id` (UUID, PK)
   - `room_id` (UUID, FK) - Referencia a la sala
   - `sender_id` (UUID, FK) - Usuario que envió el mensaje
   - `content` (TEXT) - Contenido del mensaje
   - `message_type` (TEXT) - 'text', 'image', 'file', 'system'
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

#### Row Level Security (RLS)

- **rooms**: Solo miembros pueden ver salas privadas
- **room_members**: Solo miembros de la sala pueden ver otros miembros
- **chat_messages**: Solo miembros pueden ver y enviar mensajes

### Frontend (React + TypeScript)

#### Componentes Principales

1. **`ChatComponent`** (`/components/chat/ChatComponent.tsx`)
   - Componente principal del chat
   - Lista de salas, mensajes en tiempo real
   - Formulario para enviar mensajes
   - Panel de miembros

2. **`ChatWidget`** (`/components/chat/ChatWidget.tsx`)
   - Widget flotante para acceso rápido
   - Se integra en el dashboard
   - Minimizable y expandible

3. **`useChat`** (`/hooks/useChat.ts`)
   - Hook personalizado para manejar la lógica del chat
   - Suscripciones en tiempo real con Supabase
   - Gestión de estado del chat

#### Tipos TypeScript

```typescript
interface Room {
  id: string
  name: string
  description?: string
  created_by: string
  is_private: boolean
  max_members: number
  created_at: string
  updated_at: string
}

interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  created_at: string
  updated_at: string
  sender_profile?: {
    name: string
    email: string
  }
}
```

## 🚀 Funcionalidades

### ✅ Implementadas

1. **Autenticación de usuarios**
   - Integración con Supabase Auth
   - Verificación de email requerida

2. **Gestión de salas**
   - Crear nuevas salas
   - Unirse a salas públicas
   - Ver lista de salas disponibles
   - Salir de salas

3. **Mensajería en tiempo real**
   - Enviar mensajes de texto
   - Recibir mensajes instantáneamente
   - Historial de mensajes
   - Timestamps en formato local

4. **Gestión de miembros**
   - Ver lista de miembros de la sala
   - Roles de usuario (admin, moderator, member)
   - Contador de miembros online

5. **Interfaz de usuario**
   - Diseño responsive
   - Auto-scroll a nuevos mensajes
   - Indicadores visuales de estado
   - Integración con el tema de JetGo

### 🔄 Tiempo Real

- **Supabase Realtime**: Suscripciones a cambios en `chat_messages`
- **Actualizaciones instantáneas**: Nuevos mensajes aparecen sin recargar
- **Gestión de conexión**: Manejo automático de reconexión

## 📁 Estructura de Archivos

```
jetgoFront/
├── app/
│   └── chat/
│       └── page.tsx              # Página dedicada del chat
├── components/
│   └── chat/
│       ├── ChatComponent.tsx     # Componente principal
│       └── ChatWidget.tsx        # Widget flotante
├── hooks/
│   └── useChat.ts               # Hook personalizado
├── lib/
│   └── types/
│       └── chat.ts              # Tipos TypeScript
└── jetgoBack/
    └── supabase/
        └── migrations/
            └── 010_chat_system.sql  # Migración de la BD
```

## 🔧 Configuración

### 1. Base de Datos

Ejecutar la migración SQL:

```sql
-- Ejecutar en Supabase SQL Editor
-- Contenido de: jetgoBack/supabase/migrations/010_chat_system.sql
```

### 2. Supabase Realtime

Habilitar Realtime en Supabase:
- Dashboard → Database → Replication
- Habilitar para las tablas: `chat_messages`, `room_members`, `rooms`

### 3. Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎨 Características de UX

### Diseño
- **Tema consistente**: Colores naranja/rojo de JetGo
- **Responsive**: Funciona en móvil y desktop
- **Accesibilidad**: Contraste adecuado, navegación por teclado

### Interacciones
- **Auto-scroll**: Nuevos mensajes aparecen automáticamente
- **Feedback visual**: Indicadores de carga, estados de botones
- **Notificaciones**: Mensajes de error y éxito

### Integración
- **Dashboard**: Widget flotante integrado
- **Navegación**: Enlace en el header del dashboard
- **Página dedicada**: `/chat` para experiencia completa

## 🔒 Seguridad

### Row Level Security (RLS)
- Usuarios solo pueden ver mensajes de salas donde son miembros
- Solo miembros pueden enviar mensajes
- Verificación de autenticación en todas las operaciones

### Validación
- Contenido de mensajes validado
- Límites en tamaño de mensajes
- Sanitización de entrada de usuario

## 🚀 Uso

### Para Usuarios

1. **Acceder al chat**:
   - Desde el dashboard: Click en "Chat" en la navegación
   - Widget flotante: Click en el botón de chat
   - URL directa: `/chat`

2. **Crear una sala**:
   - Click en el botón "+" en la lista de salas
   - Completar nombre y descripción
   - La sala se crea automáticamente

3. **Unirse a una sala**:
   - Click en cualquier sala de la lista
   - Se une automáticamente si es pública

4. **Enviar mensajes**:
   - Escribir en el campo de texto
   - Presionar Enter o click en enviar

### Para Desarrolladores

```typescript
// Usar el hook en cualquier componente
import { useChat } from '@/hooks/useChat'

function MyComponent({ user }) {
  const { state, actions } = useChat(user)
  
  // state contiene: currentRoom, rooms, messages, members, loading, error
  // actions contiene: joinRoom, leaveRoom, sendMessage, createRoom, etc.
}
```

## 🔮 Futuras Mejoras

- [ ] Mensajes con archivos adjuntos
- [ ] Emojis y reacciones
- [ ] Notificaciones push
- [ ] Salas privadas con invitaciones
- [ ] Moderación de mensajes
- [ ] Búsqueda de mensajes
- [ ] Mensajes editados/eliminados
- [ ] Indicadores de "escribiendo..."
- [ ] Mensajes leídos/no leídos

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Mensajes no aparecen en tiempo real**
   - Verificar que Realtime esté habilitado en Supabase
   - Revisar la consola del navegador para errores

2. **No se puede unir a salas**
   - Verificar que el usuario esté autenticado
   - Revisar las políticas RLS

3. **Widget no aparece**
   - Verificar que el usuario esté logueado
   - Revisar que el componente esté importado correctamente

### Debug

```typescript
// Habilitar logs detallados
console.log('Chat state:', state)
console.log('Current room:', state.currentRoom)
console.log('Messages:', state.messages)
```

## 📝 Notas de Implementación

- El sistema crea automáticamente una "Sala General" cuando se registra un usuario
- Los mensajes se limitan a 100 por sala para optimizar rendimiento
- El widget se auto-minimiza para no interferir con la experiencia
- Todas las operaciones están protegidas por RLS
- El sistema maneja automáticamente las reconexiones de WebSocket 