# 🚀 Trigger para Vercel Deploy

Este archivo se creó para forzar un nuevo despliegue en Vercel con todos los cambios:

## ✅ Cambios Incluidos:

1. **jetgoFront convertido a carpeta normal** (no submodule)
2. **vercel.json configurado** para el despliegue
3. **Todos los archivos del frontend** incluidos en el repositorio
4. **Configuración de build** optimizada para Next.js

## 🔧 Configuración de Vercel:

- **Build Command:** `cd jetgoFront && npm install && npm run build`
- **Output Directory:** `jetgoFront/.next`
- **Framework:** Next.js

## 📝 Variables de Entorno Necesarias:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
NEXT_PUBLIC_FRONTEND_URL=https://tu-dominio.vercel.app
```

**Fecha de creación:** $(date) 