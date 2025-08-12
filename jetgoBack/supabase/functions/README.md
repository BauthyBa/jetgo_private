# Supabase Edge Functions

Esta carpeta contiene las funciones Edge de Supabase para JetGo.

## Estructura

```
supabase/
├── functions/
│   ├── email-verification/     # Función para manejo de verificación de email
│   ├── user-notifications/     # Función para notificaciones a usuarios
│   └── utils/                  # Utilidades compartidas
└── config.toml                 # Configuración de Supabase
```

## Desarrollo

Para desarrollar y desplegar estas funciones:

1. Instala Supabase CLI:
```bash
npm i supabase --save-dev
```

2. Autentícate:
```bash
npx supabase login
```

3. Desarrolla localmente:
```bash
npx supabase functions serve
```

4. Despliega a producción:
```bash
npx supabase functions deploy
```

## Funciones Disponibles

- `email-verification`: Maneja el envío de emails de verificación
- `user-notifications`: Gestiona notificaciones push y email 