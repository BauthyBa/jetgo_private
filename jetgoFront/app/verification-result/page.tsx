"use client"

import { Suspense } from "react"
import { VerificationResultContent } from "./verification-result-content"

export default function VerificationResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-xl rounded-lg p-6 text-center">
            <div className="animate-pulse">
              <div className="mx-auto mb-4 w-20 h-20 bg-orange-200 rounded-full"></div>
              <div className="h-8 bg-orange-200 rounded mb-2"></div>
              <div className="h-4 bg-orange-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerificationResultContent />
    </Suspense>
  )
} 