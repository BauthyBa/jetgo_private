#!/bin/bash

# Script de despliegue para Vercel
# Uso: ./deploy.sh

echo "🚀 Iniciando despliegue en Vercel..."

# Verificar que estamos en el directorio correcto
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: No se encontró vercel.json. Asegúrate de estar en la raíz del proyecto."
    exit 1
fi

# Verificar que el frontend existe
if [ ! -d "jetgoFront" ]; then
    echo "❌ Error: No se encontró el directorio jetgoFront."
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Construir el proyecto
echo "🔨 Construyendo el proyecto..."
cd jetgoFront
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: La construcción falló."
    exit 1
fi

cd ..

# Desplegar en Vercel
echo "🚀 Desplegando en Vercel..."
vercel --prod

echo "✅ Despliegue completado!"
echo "🌐 Tu aplicación está disponible en: https://tu-dominio.vercel.app"
echo ""
echo "📝 Recuerda configurar las variables de entorno en Vercel:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_FRONTEND_URL" 