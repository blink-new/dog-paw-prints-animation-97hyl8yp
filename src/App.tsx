import { useState, useEffect, useCallback } from 'react'

interface PawPrint {
  id: number
  x: number
  y: number
  rotation: number
  size: number
  createdAt: number
}

const PawIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2Z" />
    <path d="M8.5 4C7.4 4 6.5 4.9 6.5 6C6.5 7.1 7.4 8 8.5 8C9.6 8 10.5 7.1 10.5 6C10.5 4.9 9.6 4 8.5 4Z" />
    <path d="M15.5 4C14.4 4 13.5 4.9 13.5 6C13.5 7.1 14.4 8 15.5 8C16.6 8 17.5 7.1 17.5 6C17.5 4.9 16.6 4 15.5 4Z" />
    <path d="M6 8C4.9 8 4 8.9 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 8.9 7.1 8 6 8Z" />
    <path d="M18 8C16.9 8 16 8.9 16 10C16 11.1 16.9 12 18 12C19.1 12 20 11.1 20 10C20 8.9 19.1 8 18 8Z" />
    <path d="M12 8C9.8 8 8 9.8 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 9.8 14.2 8 12 8Z" />
  </svg>
)

function App() {
  const [pawPrints, setPawPrints] = useState<PawPrint[]>([])
  const [nextId, setNextId] = useState(1)

  const createPawPrint = useCallback(() => {
    const newPaw: PawPrint = {
      id: nextId,
      x: Math.random() * (window.innerWidth - 60),
      y: Math.random() * (window.innerHeight - 60),
      rotation: Math.random() * 360,
      size: 20 + Math.random() * 20, // Size between 20-40px
      createdAt: Date.now()
    }

    setPawPrints(prev => {
      const updated = [...prev, newPaw]
      
      // If we have more than 100 prints, remove the oldest ones
      if (updated.length > 100) {
        return updated.slice(-100)
      }
      
      return updated
    })
    
    setNextId(prev => prev + 1)
  }, [nextId])

  // Create new paw prints at random intervals
  useEffect(() => {
    const createPawInterval = () => {
      const randomDelay = 200 + Math.random() * 800 // Random delay between 200-1000ms
      
      const timeout = setTimeout(() => {
        createPawPrint()
        createPawInterval() // Schedule next paw print
      }, randomDelay)
      
      return timeout
    }

    const timeout = createPawInterval()
    
    return () => clearTimeout(timeout)
  }, [createPawPrint])

  // Clean up old paw prints that should fade out
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setPawPrints(prev => 
        prev.filter(paw => now - paw.createdAt < 15000) // Keep prints for 15 seconds
      )
    }, 1000)

    return () => clearInterval(cleanupInterval)
  }, [])

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative">
      {/* Paw prints */}
      {pawPrints.map((paw, index) => {
        const age = Date.now() - paw.createdAt
        const shouldFadeOut = age > 12000 // Start fading after 12 seconds
        
        return (
          <div
            key={paw.id}
            className={`paw-print text-primary ${shouldFadeOut ? 'fade-out' : ''}`}
            style={{
              left: `${paw.x}px`,
              top: `${paw.y}px`,
              transform: `rotate(${paw.rotation}deg)`,
              animationDelay: `${index * 50}ms`,
              zIndex: 100 - index // Newer prints appear on top
            }}
          >
            <PawIcon size={paw.size} />
          </div>
        )
      })}
      
      {/* Optional: Add a subtle title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
        <h1 className="text-2xl font-medium text-primary/60 tracking-wide">
          Dog Paw Prints
        </h1>
        <p className="text-sm text-primary/40 text-center mt-2">
          {pawPrints.length} prints on screen
        </p>
      </div>
    </div>
  )
}

export default App