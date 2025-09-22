import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import * as SunCalc from 'suncalc'
import { useAppStore } from '@/store/appStore'

interface SunMoonPosition {
  x: number
  y: number
  phase: 'dawn' | 'day' | 'dusk' | 'night'
  progress: number
  moonPhase?: 'new' | 'waxingCrescent' | 'firstQuarter' | 'waxingGibbous' | 'full' | 'waningGibbous' | 'lastQuarter' | 'waningCrescent'
}

// Calculate the SVG path for the sun/moon arc
const calculateArcPath = (width: number, height: number): string => {
  const startX = 0
  const startY = height
  const endX = width
  const endY = height
  const controlX = width / 2
  const controlY = 0
  
  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
}

const WeatherAnimation: React.FC = () => {
  const { userPreferences, weatherData } = useAppStore()
  const [sunMoonPos, setSunMoonPos] = useState<SunMoonPosition>({
    x: 50,
    y: 50,
    phase: 'day',
    progress: 0.5
  })
  const [rainDrops, setRainDrops] = useState<Array<{ id: number; delay: number; left: number }>>([])

  useEffect(() => {
    const updateSunMoonPosition = () => {
      const now = new Date()
      const lat = userPreferences.location?.lat || 40.7128 // Default to NYC
      const lon = userPreferences.location?.lon || -74.0060

      const times = SunCalc.getTimes(now, lat, lon)
      const sunrise = times.sunrise.getTime()
      const sunset = times.sunset.getTime()
      const dawn = times.dawn.getTime()
      const dusk = times.dusk.getTime()
      const currentTime = now.getTime()

      let phase: 'dawn' | 'day' | 'dusk' | 'night' = 'day'
      let progress = 0.5
      let x = 50
      let y = 50

      if (currentTime >= dawn && currentTime < sunrise) {
        // Dawn phase
        phase = 'dawn'
        progress = (currentTime - dawn) / (sunrise - dawn)
        x = 10 + progress * 40 // Move from left to center
        y = 80 - progress * 30 // Move up
      } else if (currentTime >= sunrise && currentTime < sunset) {
        // Day phase
        phase = 'day'
        progress = (currentTime - sunrise) / (sunset - sunrise)
        x = 10 + progress * 80 // Full arc across sky
        y = 50 - Math.sin(progress * Math.PI) * 30 // Arc motion
      } else if (currentTime >= sunset && currentTime < dusk) {
        // Dusk phase
        phase = 'dusk'
        progress = (currentTime - sunset) / (dusk - sunset)
        x = 90 - progress * 40 // Move from right to center
        y = 50 + progress * 30 // Move down
      } else {
        // Night phase
        phase = 'night'
        const nextSunrise = new Date(now)
        nextSunrise.setDate(nextSunrise.getDate() + 1)
        const nextSunriseTimes = SunCalc.getTimes(nextSunrise, lat, lon)
        const nightDuration = nextSunriseTimes.sunrise.getTime() - dusk
        progress = (currentTime - dusk) / nightDuration
        x = 10 + progress * 80 // Moon arc
        y = 60 - Math.sin(progress * Math.PI) * 20 // Lower arc for moon
      }

      setSunMoonPos({ x, y, phase, progress })
    }

    updateSunMoonPosition()
    const interval = setInterval(updateSunMoonPosition, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [userPreferences.location])

  useEffect(() => {
    // Generate rain drops if it's raining
    if (weatherData?.condition.toLowerCase().includes('rain')) {
      const drops = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 2,
        left: Math.random() * 100
      }))
      setRainDrops(drops)
    } else {
      setRainDrops([])
    }
  }, [weatherData])

  const getBackgroundGradient = () => {
    switch (sunMoonPos.phase) {
      case 'dawn':
        return 'weather-gradient-dawn'
      case 'day':
        return 'weather-gradient-day'
      case 'dusk':
        return 'weather-gradient-dusk'
      case 'night':
        return 'weather-gradient-night'
      default:
        return 'weather-gradient-day'
    }
  }

  // Calculate moon phase
  const getMoonPhase = () => {
    const now = new Date()
    const moonIllumination = SunCalc.getMoonIllumination(now)
    const phase = moonIllumination.phase

    if (phase <= 0.05 || phase > 0.95) return 'new'
    if (phase <= 0.20) return 'waxingCrescent'
    if (phase <= 0.30) return 'firstQuarter'
    if (phase <= 0.45) return 'waxingGibbous'
    if (phase <= 0.55) return 'full'
    if (phase <= 0.70) return 'waningGibbous'
    if (phase <= 0.80) return 'lastQuarter'
    return 'waningCrescent'
  }

  // Generate hour markers along the arc
  const hourMarkers = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const progress = i / 23
      const x = progress * 100
      const y = 50 - Math.sin(progress * Math.PI) * 30
      return { x, y, hour: i }
    })
  }, [])

  return (
    <div className={`fixed inset-0 ${getBackgroundGradient()} transition-all duration-1000`}>
      {/* SVG Arc Path */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="text-yellow-300" />
            <stop offset="50%" className="text-orange-400" />
            <stop offset="100%" className="text-yellow-300" />
          </linearGradient>
        </defs>
        
        {/* Arc Path */}
        <path
          d={calculateArcPath(100, 50)}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          className="transform scale-100"
        />

        {/* Hour Markers */}
        {hourMarkers.map(({ x, y, hour }) => (
          <circle
            key={hour}
            cx={`${x}%`}
            cy={`${y}%`}
            r="4"
            className="fill-white/20"
          />
        ))}
      </svg>

      {/* Clouds */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="cloud cloud-1 absolute top-20 opacity-80"
          style={{ left: '-100px' }}
        >
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
            <ellipse cx="30" cy="40" rx="25" ry="15" className="fill-cloud" opacity="0.8" />
            <ellipse cx="60" cy="35" rx="35" ry="20" className="fill-cloud" opacity="0.9" />
            <ellipse cx="90" cy="40" rx="25" ry="15" className="fill-cloud" opacity="0.8" />
          </svg>
        </motion.div>

        <motion.div
          className="cloud cloud-2 absolute top-32 opacity-60"
          style={{ left: '-80px' }}
        >
          <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
            <ellipse cx="25" cy="35" rx="20" ry="12" fill="white" opacity="0.7" />
            <ellipse cx="50" cy="30" rx="30" ry="18" fill="white" opacity="0.8" />
            <ellipse cx="75" cy="35" rx="20" ry="12" fill="white" opacity="0.7" />
          </svg>
        </motion.div>

        <motion.div
          className="cloud cloud-3 absolute top-16 opacity-70"
          style={{ left: '-60px' }}
        >
          <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            <ellipse cx="20" cy="30" rx="15" ry="10" fill="white" opacity="0.6" />
            <ellipse cx="40" cy="25" rx="25" ry="15" fill="white" opacity="0.7" />
            <ellipse cx="60" cy="30" rx="15" ry="10" fill="white" opacity="0.6" />
          </svg>
        </motion.div>
      </div>

      {/* Sun/Moon */}
      <motion.div
        className="absolute"
        animate={{
          left: `${sunMoonPos.x}%`,
          top: `${sunMoonPos.y}%`
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
          duration: 2
        }}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        {sunMoonPos.phase === 'night' ? (
          // Moon
          <motion.div
            className="w-16 h-16 relative"
            animate={{
              boxShadow: [
                '0 0 20px var(--color-moon-glow)',
                '0 0 30px var(--color-moon-glow)',
                '0 0 20px var(--color-moon-glow)'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-300 relative overflow-hidden">
              {/* Moon phases */}
              <div 
                className={`absolute inset-0 bg-gray-900 transition-all duration-1000 ${
                  getMoonPhase() === 'new' ? 'opacity-95' :
                  getMoonPhase() === 'waxingCrescent' ? 'clip-path-crescent-right opacity-90' :
                  getMoonPhase() === 'firstQuarter' ? 'clip-path-half-right opacity-90' :
                  getMoonPhase() === 'waxingGibbous' ? 'clip-path-gibbous-right opacity-90' :
                  getMoonPhase() === 'full' ? 'opacity-0' :
                  getMoonPhase() === 'waningGibbous' ? 'clip-path-gibbous-left opacity-90' :
                  getMoonPhase() === 'lastQuarter' ? 'clip-path-half-left opacity-90' :
                  'clip-path-crescent-left opacity-90'
                }`}
              />
              
              {/* Moon craters - visible based on phase */}
              <div className="absolute top-2 left-3 w-2 h-2 bg-gray-400 rounded-full opacity-30" />
              <div className="absolute top-6 right-2 w-1 h-1 bg-gray-400 rounded-full opacity-40" />
              <div className="absolute bottom-3 left-2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-35" />
            </div>
          </motion.div>
        ) : (
          // Sun
          <motion.div
            className="relative"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg">
              <motion.div
                className="w-full h-full rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,193,7,0.4)',
                    '0 0 40px rgba(255,193,7,0.6)',
                    '0 0 20px rgba(255,193,7,0.4)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            {/* Sun rays */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-6 bg-yellow-300 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '50% 32px',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg)`
                }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scaleY: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Rain Effect */}
      {rainDrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="rain-drop"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`
          }}
        />
      ))}

      {/* Weather Info Overlay */}
      {weatherData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-6 glass-card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {weatherData.condition.toLowerCase().includes('rain') ? '🌧️' :
               weatherData.condition.toLowerCase().includes('cloud') ? '☁️' :
               sunMoonPos.phase === 'night' ? '🌙' : '☀️'}
            </div>
            <div>
              <div className="text-white font-semibold text-lg">
                {Math.round(weatherData.temperature)}°C
              </div>
              <div className="text-white/80 text-sm">
                {weatherData.description}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default WeatherAnimation