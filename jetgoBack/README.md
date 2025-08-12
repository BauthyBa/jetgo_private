# JetGo Backend

Backend completo para la aplicación JetGo, construido con Supabase como Backend as a Service (BaaS).

## 🏗️ Estructura del Proyecto

```
jetgoBack/
├── supabase/
│   ├── functions/                 # Edge Functions de Supabase
│   │   ├── email-verification/    # Función para verificación de email
│   │   ├── verify-mercadopago/    # Función para verificación vía MercadoPago
│   │   ├── verify-stripe/         # Función para verificación vía Stripe
│   │   ├── stripe-webhook/        # Webhook para eventos de Stripe
│   │   ├── user-notifications/    # Funciones de notificaciones (futuro)
│   │   ├── utils/                 # Utilidades compartidas (futuro)
│   │   ├── deno.json             # Configuración de Deno
│   │   └── import_map.json       # Mapa de importaciones
│   ├── migrations/               # Migraciones de base de datos
│   │   ├── 001_initial_tables.sql      # Tablas principales
│   │   ├── 002_messages_table.sql      # Tabla de mensajes
│   │   └── 003_identity_verifications.sql # Verificaciones de identidad
│   └── config.toml              # Configuración del proyecto Supabase
├── CONFIGURACION_EMAIL.md        # Guía de configuración de email
├── CONFIGURACION_VERIFICACION.md # Guía de verificación de identidad
└── README.md                    # Este archivo
```

## 🚀 Configuración Inicial

### 1. Requisitos Previos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado
- Cuenta de Supabase activa
- Node.js 18+ (para desarrollo local)
- Deno (se instala automáticamente con Supabase CLI)

### 2. Configurar Proyecto Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login en Supabase
supabase login

# Vincular con proyecto existente
supabase link --project-ref your-project-ref

# O crear nuevo proyecto
supabase projects create your-project-name
```

### 3. Configurar Variables de Entorno

```bash
# Variables básicas (automáticas)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Variables para verificación de identidad
MERCADO_PAGO_ACCESS_TOKEN=your_mercadopago_token
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# URL del frontend
FRONTEND_URL=http://localhost:3000
```

Configurar en Supabase:

```bash
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=your_token
supabase secrets set STRIPE_SECRET_KEY=your_stripe_key
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set FRONTEND_URL=https://your-domain.com
```

## 🗄️ Base de Datos

### Migraciones

```bash
# Aplicar todas las migraciones
supabase migration up

# O resetear la base de datos completa
supabase db reset
```

### Esquema Principal

#### Tablas Principales

- **`user_profiles`**: Perfiles de usuarios con datos personales y verificación
- **`trips`**: Información de viajes organizados
- **`trip_participants`**: Relación entre usuarios y viajes
- **`messages`**: Sistema de mensajería (futuro)
- **`email_verifications`**: Tokens de verificación de email
- **`identity_verifications`**: Registro de verificaciones de identidad

#### Row Level Security (RLS)

Todas las tablas implementan RLS para garantizar que los usuarios solo accedan a sus propios datos:

- Los usuarios pueden ver/editar solo sus propios perfiles
- Los participantes pueden ver solo los viajes en los que participan
- Los organizadores tienen permisos adicionales en sus viajes
- Las verificaciones son visibles solo para el usuario propietario

## ⚡ Edge Functions

### Funciones Disponibles

#### 1. Email Verification (`email-verification`)
- **URL:** `/functions/v1/email-verification`
- **Método:** POST
- **Propósito:** Enviar emails de verificación con tokens únicos

#### 2. Verificación MercadoPago (`verify-mercadopago`)
- **URL:** `/functions/v1/verify-mercadopago`
- **Método:** POST
- **Propósito:** Verificar identidad usando MercadoPago Identity API

#### 3. Verificación Stripe (`verify-stripe`)
- **URL:** `/functions/v1/verify-stripe`
- **Método:** POST
- **Propósito:** Crear sesiones de verificación con Stripe Identity

#### 4. Stripe Webhook (`stripe-webhook`)
- **URL:** `/functions/v1/stripe-webhook`
- **Método:** POST
- **Propósito:** Manejar eventos de verificación completada de Stripe

### Desplegar Funciones

```bash
# Desplegar todas las funciones
supabase functions deploy

# O desplegar funciones específicas
supabase functions deploy email-verification
supabase functions deploy verify-mercadopago
supabase functions deploy verify-stripe
supabase functions deploy stripe-webhook
```

### Desarrollo Local

```bash
# Ejecutar funciones localmente
supabase functions serve

# Función específica
supabase functions serve email-verification --no-verify-jwt
```

## 🔐 Sistema de Autenticación

### Flujo de Registro

1. **Registro inicial**: Usuario crea cuenta con email/password
2. **Verificación de email**: Se envía link de verificación por email
3. **Creación de perfil**: Después de verificar email, se crea perfil básico
4. **Verificación de identidad**: Usuario puede elegir entre MercadoPago o Stripe
5. **Acceso completo**: Una vez verificado, acceso a todas las funciones

### Estados de Verificación

- **`verified: false`**: Email no verificado (acceso limitado)
- **`identity_verified: false`**: Identidad no verificada (funciones básicas bloqueadas)
- **`identity_verified: true`**: Completamente verificado (acceso total)

## 🛡️ Verificación de Identidad

### Métodos Disponibles

#### MercadoPago Identity
- **Ventajas:** Procesamiento inmediato, especializado en LATAM
- **Documentos:** DNI (Argentina), RUT (Chile), CPF (Brasil), etc.
- **Costo:** Variable por país

#### Stripe Identity
- **Ventajas:** Reconocimiento facial, documentos internacionales
- **Documentos:** Pasaporte, Licencia de Conducir, ID Cards
- **Costo:** ~$1.50 USD por verificación exitosa

### Configuración Detallada

Ver [`CONFIGURACION_VERIFICACION.md`](./CONFIGURACION_VERIFICACION.md) para instrucciones completas.

## 📧 Sistema de Email

### Configuración de Email

Ver [`CONFIGURACION_EMAIL.md`](./CONFIGURACION_EMAIL.md) para configurar:

- Templates de email personalizados
- URLs de redirección
- Configuración SMTP (opcional)

## 🚦 Estados del Sistema

### Niveles de Acceso

#### Usuario No Registrado
- Solo puede ver landing page
- Acceso a registro/login

#### Email No Verificado
- Acceso solo al proceso de verificación de email
- Dashboard bloqueado

#### Email Verificado, Identidad No Verificada
- Dashboard con vista "censurada"
- Funciones principales bloqueadas
- Acceso al proceso de verificación de identidad

#### Completamente Verificado
- Acceso completo a todas las funciones
- Puede crear y unirse a viajes
- Mensajería habilitada

## 🔧 Herramientas de Desarrollo

### Logs y Debugging

```bash
# Ver logs de funciones
supabase functions logs --project-ref your-ref

# Logs de función específica
supabase functions logs verify-stripe --project-ref your-ref

# Logs en tiempo real
supabase functions logs --follow
```

### Testing

```bash
# Ejecutar tests de funciones (si existen)
deno test --allow-all functions/

# Test de base de datos
supabase test db
```

## 📊 Monitoreo y Métricas

### Dashboard de Supabase

Monitorea en tiempo real:
- Uso de Edge Functions
- Conexiones a la base de datos
- Rate limits y errores
- Costos de verificación

### Logs Importantes

- **Verificaciones exitosas**: Se registran en `identity_verifications`
- **Errores de API**: Se loguean en las Edge Functions
- **Webhooks fallidos**: Revisar logs de `stripe-webhook`

## 🛠️ Troubleshooting

### Problemas Comunes

1. **Functions no responden**
   ```bash
   # Verificar despliegue
   supabase functions list
   
   # Redeployar si es necesario
   supabase functions deploy function-name
   ```

2. **Errores de webhook**
   ```bash
   # Verificar configuración en Stripe Dashboard
   # Revisar STRIPE_WEBHOOK_SECRET
   # Verificar URL del webhook
   ```

3. **Problemas de base de datos**
   ```bash
   # Verificar migraciones
   supabase migration list
   
   # Aplicar migraciones pendientes
   supabase migration up
   ```

### Logs Útiles

```bash
# Todos los logs
supabase logs

# Solo errores
supabase logs --level error

# Filtrar por función
supabase logs --filter "edge_function:verify-stripe"
```

## 📈 Escalabilidad

### Límites y Consideraciones

- **Edge Functions**: 10GB/mes en plan gratuito
- **Database**: 500MB en plan gratuito
- **Verificaciones**: Costos por verificación exitosa
- **Rate Limiting**: Configurado automáticamente

### Optimizaciones

- Cachear resultados de verificación
- Implementar rate limiting en el frontend
- Monitorear costos de verificación
- Usar índices apropiados en la base de datos

## 🔒 Seguridad

### Implementado

- ✅ Row Level Security en todas las tablas
- ✅ API Keys seguras en variables de entorno
- ✅ Validación de webhooks con firmas
- ✅ CORS configurado apropiadamente
- ✅ Tokens JWT para autenticación

### Recomendaciones

- Rotar API keys regularmente
- Monitorear intentos de verificación fallidos
- Implementar rate limiting adicional si es necesario
- Revisar logs regularmente por actividad sospechosa

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [API de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs)
- [Stripe Identity API](https://stripe.com/docs/identity)
- [Guía de Edge Functions](https://supabase.com/docs/guides/functions)

## 🤝 Contribución

1. Crear rama de feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer cambios y commitear: `git commit -am 'Agregar nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📄 Licencia

Este proyecto es parte del sistema JetGo y está sujeto a sus términos de licencia.

---

**Contacto**: Para soporte técnico o consultas, contactar al equipo de desarrollo de JetGo. 