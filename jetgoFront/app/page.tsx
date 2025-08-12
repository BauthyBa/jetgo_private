"use client"

import LandingPage from "@/components/landing-page"
import AuthForm from "@/components/auth-form"
import Dashboard from "@/components/dashboard"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard'>('landing')
  const [user, setUser] = useState<User | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Nuevo estado para controlar carga inicial

  useEffect(() => {
    // Verificar si hay parámetros de URL para mostrar mensajes
    const urlParams = new URLSearchParams(window.location.search)
    const verified = urlParams.get('verified')
    const error = urlParams.get('error')
    const message = urlParams.get('message')

    if (verified === 'true' && message === 'email_verified') {
      // Mostrar mensaje de éxito
      showVerificationSuccess()
      // Limpiar los parámetros de la URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (error) {
      // Mostrar mensaje de error
      showVerificationError(error)
      // Limpiar los parámetros de la URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Verificar si hay un usuario autenticado
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      // Si hay un usuario autenticado, mostrar dashboard
      if (user) {
        setCurrentView('dashboard')
      }
      setIsInitialLoad(false) // Marcar que ya terminó la carga inicial
    }

    getUser()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        
        // Solo mostrar mensaje de bienvenida en login real (no en carga inicial)
        if (event === 'SIGNED_IN' && session?.user && !isInitialLoad) {
          showWelcomeMessage(session.user.email || 'usuario')
          setCurrentView('dashboard')
        } else if (event === 'SIGNED_OUT') {
          setCurrentView('landing')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const showVerificationSuccess = () => {
    const alertDiv = document.createElement('div')
    alertDiv.className = `
      fixed top-4 right-4 z-[9999] max-w-sm w-full
      bg-green-50 border-green-200 text-green-800 border-l-4 p-4 rounded-lg shadow-lg
      animate-in slide-in-from-right duration-300
    `
    
    alertDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">✅</div>
        <div class="ml-3">
          <h3 class="text-sm font-medium">¡Email Verificado!</h3>
          <div class="mt-1 text-sm">Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.</div>
        </div>
        <button class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-100">
          <span class="sr-only">Dismiss</span>
          <svg class="w-3 h-3" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
        </button>
      </div>
    `
    
    document.body.appendChild(alertDiv)
    
    const dismissButton = alertDiv.querySelector('button')
    const dismiss = () => {
      if (alertDiv.parentNode === document.body) {
        alertDiv.classList.add('animate-out', 'slide-out-to-right', 'duration-300')
        setTimeout(() => {
          if (alertDiv.parentNode === document.body) {
            document.body.removeChild(alertDiv)
          }
        }, 300)
      }
    }
    
    dismissButton?.addEventListener('click', dismiss)
    setTimeout(dismiss, 8000)
  }

  const showVerificationError = (error: string) => {
    const errorMessages: { [key: string]: string } = {
      'verification_failed': 'Error al verificar el email. El enlace puede haber expirado.',
      'unexpected_error': 'Ocurrió un error inesperado durante la verificación.'
    }

    const message = errorMessages[error] || 'Error de verificación desconocido.'

    const alertDiv = document.createElement('div')
    alertDiv.className = `
      fixed top-4 right-4 z-[9999] max-w-sm w-full
      bg-red-50 border-red-200 text-red-800 border-l-4 p-4 rounded-lg shadow-lg
      animate-in slide-in-from-right duration-300
    `
    
    alertDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">❌</div>
        <div class="ml-3">
          <h3 class="text-sm font-medium">Error de Verificación</h3>
          <div class="mt-1 text-sm">${message}</div>
        </div>
        <button class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-100">
          <span class="sr-only">Dismiss</span>
          <svg class="w-3 h-3" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
        </button>
      </div>
    `
    
    document.body.appendChild(alertDiv)
    
    const dismissButton = alertDiv.querySelector('button')
    const dismiss = () => {
      if (alertDiv.parentNode === document.body) {
        alertDiv.classList.add('animate-out', 'slide-out-to-right', 'duration-300')
        setTimeout(() => {
          if (alertDiv.parentNode === document.body) {
            document.body.removeChild(alertDiv)
          }
        }, 300)
      }
    }
    
    dismissButton?.addEventListener('click', dismiss)
    setTimeout(dismiss, 8000)
  }

  const showWelcomeMessage = (email: string) => {
    const alertDiv = document.createElement('div')
    alertDiv.className = `
      fixed top-4 right-4 z-[9999] max-w-sm w-full
      bg-green-50 border-green-200 text-green-800 border-l-4 p-4 rounded-lg shadow-lg
      animate-in slide-in-from-right duration-300
    `
    
    alertDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">🎉</div>
        <div class="ml-3">
          <h3 class="text-sm font-medium">¡Bienvenido a JetGo!</h3>
          <div class="mt-1 text-sm">Hola ${email}, has iniciado sesión exitosamente.</div>
        </div>
        <button class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-100">
          <span class="sr-only">Dismiss</span>
          <svg class="w-3 h-3" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
        </button>
      </div>
    `
    
    document.body.appendChild(alertDiv)
    
    const dismissButton = alertDiv.querySelector('button')
    const dismiss = () => {
      if (alertDiv.parentNode === document.body) {
        alertDiv.classList.add('animate-out', 'slide-out-to-right', 'duration-300')
        setTimeout(() => {
          if (alertDiv.parentNode === document.body) {
            document.body.removeChild(alertDiv)
          }
        }, 300)
      }
    }
    
    dismissButton?.addEventListener('click', dismiss)
    setTimeout(dismiss, 6000)
  }

  return (
    <main className="min-h-screen">
      {currentView === 'landing' && (
        <LandingPage 
          onGetStarted={() => setCurrentView('auth')}
        />
      )}
      {currentView === 'auth' && (
        <AuthForm />
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard user={user} />
      )}
    </main>
  )
}
