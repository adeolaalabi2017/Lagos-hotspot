import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    let scheduled = false
    const scheduleUpdate = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        const current = window.innerWidth < MOBILE_BREAKPOINT
        if (isMobile !== current) {
          setIsMobile(current)
        }
      })
    }
    mql.addEventListener("change", scheduleUpdate)
    scheduleUpdate()
    return () => mql.removeEventListener("change", scheduleUpdate)
  }, [isMobile])

  return !!isMobile
}
