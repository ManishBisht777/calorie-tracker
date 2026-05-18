"use client"

import Script from "next/script"

const ONEKO_SPRITE = "/oneko/bunny.png"

export function Oneko() {
  return (
    <Script
      src="/oneko.js"
      data-cat={ONEKO_SPRITE}
      strategy="afterInteractive"
    />
  )
}
