# Configuración de Verificación de Identidad

## 🔐 Variables de Entorno Requeridas

### Para Supabase Edge Functions

Configura estas variables en tu proyecto de Supabase:

```bash
# Variables obligatorias (ya configuradas)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Variables para MercadoPago
MERCADO_PAGO_ACCESS_TOKEN=your_mercadopago_access_token

# Variables para Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Variable para frontend (opcional para desarrollo)
FRONTEND_URL=http://localhost:3000
```

### Para el Frontend (Next.js)

En tu archivo `jetgoFront/.env.local`:

```bash
# Estas ya deberían estar configuradas
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏦 Configuración de MercadoPago

### 1. Obtener Access Token

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Inicia sesión con tu cuenta de MercadoPago
3. Crea una nueva aplicación o usa una existente
4. En el dashboard de tu aplicación:
   - Ve a **"Credenciales"**
   - Copia el **Access Token de Producción** (o de Prueba para desarrollo)
   - Este será tu `MERCADO_PAGO_ACCESS_TOKEN`

### 2. Configurar el Access Token

```bash
# En el dashboard de Supabase > Settings > Edge Functions
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-abcdef-your-token
```

### 3. Documentos Soportados por MercadoPago

- **Argentina:** DNI, Pasaporte
- **Chile:** RUT/RUN, Pasaporte
- **Brasil:** CPF, Pasaporte
- **México:** CURP, IFE, Pasaporte
- **Colombia:** CC, Pasaporte

## 💳 Configuración de Stripe Identity

### 1. Obtener API Keys

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Inicia sesión en tu cuenta de Stripe
3. Ve a **"Developers" > "API keys"**
4. Copia:
   - **Secret key** (sk_test_ o sk_live_) → `STRIPE_SECRET_KEY`

### 2. Configurar Webhook

1. En Stripe Dashboard, ve a **"Developers" > "Webhooks"**
2. Haz clic en **"Add endpoint"**
3. Configura:
   - **Endpoint URL:** `https://your-supabase-url.supabase.co/functions/v1/stripe-webhook`
   - **Events:** Selecciona estos eventos:
     - `identity.verification_session.verified`
     - `identity.verification_session.requires_input`
     - `identity.verification_session.canceled`
4. Copia el **Signing secret** (whsec_...) → `STRIPE_WEBHOOK_SECRET`

### 3. Configurar las Variables

```bash
# En el dashboard de Supabase > Settings > Edge Functions
STRIPE_SECRET_KEY=sk_test_51ABc...your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...your_webhook_secret
```

### 4. Documentos Soportados por Stripe

- **Licencia de Conducir** (driving_license)
- **Pasaporte** (passport)  
- **Documento de Identidad** (id_card)

## 🚀 Configuración en Supabase

### 1. Desplegar Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login en Supabase
supabase login

# Vincularte a tu proyecto
supabase link --project-ref your-project-ref

# Desplegar todas las funciones
supabase functions deploy verify-mercadopago
supabase functions deploy verify-stripe
supabase functions deploy stripe-webhook

# O desplegar todas a la vez
supabase functions deploy
```

### 2. Configurar Variables de Entorno

```bash
# Configurar todas las variables
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=your_token
supabase secrets set STRIPE_SECRET_KEY=your_stripe_key
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set FRONTEND_URL=https://your-domain.com
```

### 3. Aplicar Migraciones

```bash
# Aplicar las migraciones de base de datos
supabase db reset
# O aplicar solo las nuevas
supabase migration up
```

## 📊 URLs de las Edge Functions

Una vez desplegadas, tus funciones estarán disponibles en:

- **MercadoPago:** `https://your-project.supabase.co/functions/v1/verify-mercadopago`
- **Stripe:** `https://your-project.supabase.co/functions/v1/verify-stripe`
- **Webhook de Stripe:** `https://your-project.supabase.co/functions/v1/stripe-webhook`

## 🔧 Flujo de Verificación

### MercadoPago Flow
1. Usuario completa formulario → `verify-mercadopago`
2. Función llama a MercadoPago API
3. Respuesta inmediata (approved/pending/rejected)
4. Usuario ve resultado al instante

### Stripe Flow
1. Usuario completa formulario → `verify-stripe`
2. Función crea session en Stripe
3. Usuario es redirigido a Stripe para completar verificación
4. Stripe procesa documentos y envía webhook
5. `stripe-webhook` actualiza la base de datos
6. Usuario regresa a `/verification-result`

## 🧪 Testing

### Datos de Prueba para MercadoPago

```json
{
  "document": {
    "type": "DNI",
    "number": "12345678"
  },
  "personalInfo": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "test@example.com"
  }
}
```

### Datos de Prueba para Stripe

Stripe Identity requiere documentos reales o documentos de prueba específicos que proporciona Stripe en su documentación.

## 🛠️ Troubleshooting

### Errores Comunes

1. **"Access token inválido"**
   - Verifica que el token de MercadoPago sea correcto
   - Asegúrate de usar el token de producción en producción

2. **"Stripe webhook signature invalid"**
   - Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
   - Asegúrate de que la URL del webhook esté configurada correctamente

3. **"Database error"**
   - Verifica que las migraciones se hayan aplicado correctamente
   - Revisa los permisos RLS en Supabase

### Logs

Para ver logs de las funciones:

```bash
supabase functions logs verify-mercadopago
supabase functions logs verify-stripe
supabase functions logs stripe-webhook
```

## 💰 Costos

### MercadoPago
- Verificación de identidad: Consulta precios en tu país
- Generalmente costo por verificación exitosa

### Stripe Identity
- $1.50 USD por verificación exitosa (precios pueden variar)
- Sin costo por verificaciones fallidas

## 📋 Checklist de Configuración

- [ ] Obtener access token de MercadoPago
- [ ] Obtener secret key de Stripe
- [ ] Configurar webhook de Stripe
- [ ] Configurar variables de entorno en Supabase
- [ ] Desplegar Edge Functions
- [ ] Aplicar migraciones de base de datos
- [ ] Probar flujo completo con datos de prueba
- [ ] Configurar URLs de producción

## 🔒 Seguridad

- **Nunca** expongas las API keys en el frontend
- Usa HTTPS siempre
- Las Edge Functions manejan las llamadas seguras a las APIs
- Los webhooks verifican las firmas para prevenir ataques
- Los datos se almacenan encriptados en Supabase 