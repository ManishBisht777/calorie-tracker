import React from "react"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex justify-center">
      <div className="max-w-6xl">{children}</div>
    </div>
  )
}
