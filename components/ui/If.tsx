import { type ReactNode } from "react"

export default function If({
  condition,
  children,
}: {
  condition: boolean
  children: ReactNode
}): ReactNode {
  return condition ? children : null
}
