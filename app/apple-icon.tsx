import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#222222",
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            border: "8px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "white",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 8,
              height: 76,
              background: "white",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 76,
              height: 8,
              background: "white",
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
