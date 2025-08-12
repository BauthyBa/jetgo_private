# 🚀 Despliegue en Vercel

Este proyecto está configurado para ser desplegado fácilmente en Vercel. Sigue estos pasos:

## 📋 Prerrequisitos

1. **Cuenta en Vercel**: [vercel.com](https://vercel.com)
2. **Proyecto de Supabase configurado**: [supabase.com](https://supabase.com)
3. **Código subido a GitHub/GitLab**: El repositorio debe estar en un servicio de Git

## 🔧 Configuración

### 1. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) y inicia sesión
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub/GitLab
4. Vercel detectará automáticamente que es un proyecto Next.js

### 2. Configurar Variables de Entorno

En la configuración del proyecto en Vercel, ve a **Settings > Environment Variables** y agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
NEXT_PUBLIC_FRONTEND_URL=https://tu-dominio.vercel.app
```

**Obtener las credenciales de Supabase:**
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Settings > API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar el Build

El archivo `vercel.json` ya está configurado para:
- Construir desde el directorio `jetgoFront`
- Usar Next.js como framework
- Configurar las funciones serverless correctamente

## 🚀 Despliegue

### Opción 1: Despliegue Automático (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Cada push a la rama principal se desplegará automáticamente

### Opción 2: Despliegue Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

## 🔍 Verificación

Después del despliegue:

1. **Verifica que la aplicación carga** en tu dominio de Vercel
2. **Prueba el registro de usuarios** con tu email
3. **Verifica que los emails de confirmación** llegan correctamente
4. **Comprueba la conexión con Supabase** en la consola del navegador

## 🛠️ Solución de Problemas

### Error: "Module not found"
- Verifica que todas las dependencias están en `jetgoFront/package.json`
- Asegúrate de que el build se ejecuta desde el directorio correcto

### Error: "Environment variables not found"
- Verifica que las variables de entorno están configuradas en Vercel
- Asegúrate de que los nombres coinciden exactamente

### Error: "Supabase connection failed"
- Verifica las credenciales de Supabase
- Comprueba que la URL y la clave anónima son correctas

### Error: "Email verification not working"
- Verifica que `NEXT_PUBLIC_FRONTEND_URL` apunta a tu dominio de Vercel
- Comprueba la configuración de las Edge Functions en Supabase

## 📝 Notas Importantes

- **Base de datos**: Asegúrate de que las migraciones de Supabase están ejecutadas
- **Edge Functions**: Las funciones de Supabase deben estar desplegadas
- **Dominio personalizado**: Puedes configurar un dominio personalizado en Vercel
- **SSL**: Vercel proporciona SSL automáticamente

## 🔗 Enlaces Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js en Vercel](https://nextjs.org/docs/deployment#vercel-recommended) 