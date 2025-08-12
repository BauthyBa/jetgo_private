"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import VerificationFlow from "@/components/verification-flow"
import AuthForm from "@/components/auth-form"

interface AuthFlowProps {
  onBack: () => void
}

export default function AuthFlow({ onBack }: AuthFlowProps) {
  const [step, setStep] = useState<"verification" | "auth">("verification")
  const [verificationComplete, setVerificationComplete] = useState(false)

  const handleVerificationComplete = () => {
    setVerificationComplete(true)
    setStep("auth")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100">
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b-4 border-orange-500">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4 text-orange-600 hover:bg-orange-50 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <img src="/jetgo-logo.png" alt="JetGo" className="h-8 w-8 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">JetGo</h1>
              <p className="text-sm text-orange-600">Proceso de Registro</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {step === "verification" && <VerificationFlow onComplete={handleVerificationComplete} />}
        {step === "auth" && <AuthForm verificationComplete={verificationComplete} />}
      </div>
    </div>
  )
}
