"use client"
import { useEffect, useRef, useState } from "react"
import { Building2, Star, MapPin, TrendingUp } from "lucide-react"

const STATS = [
  { icon: Building2, value: 50, suffix: "+", label: "Verified Companies", color: "text-teal-500" },
  { icon: MapPin, value: 48, suffix: "", label: "States Covered", color: "text-blue-500" },
  { icon: Star, value: 500, suffix: "+", label: "Client Reviews", color: "text-amber-500" },
  { icon: TrendingUp, value: 98, suffix: "%", label: "Avg. Collection Rate", color: "text-emerald-500" },
]

function useCountUp(target: number, duration = 1500, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setCount(target)
    }
    requestAnimationFrame(tick)
  }, [target, duration, active])
  return count
}

function StatItem({ icon: Icon, value, suffix, label, color }: typeof STATS[0]) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const count = useCountUp(value, 1500, active)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className={`font-display font-extrabold text-3xl md:text-4xl stat-number ${color}`}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1 font-medium">{label}</div>
    </div>
  )
}

export function StatsBar() {
  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {STATS.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
