import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
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
          borderRadius: "22%",
        }}
      >
        <div
          style={{
            width: 296,
            height: 296,
            borderRadius: "50%",
            border: "20px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "white",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 20,
              height: 216,
              background: "white",
              borderRadius: 10,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 216,
              height: 20,
              background: "white",
              borderRadius: 10,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
