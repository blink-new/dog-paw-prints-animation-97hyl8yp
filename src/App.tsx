import { useState, useEffect, useCallback } from 'react'

interface PawPrint {
  id: number
  x: number
  y: number
  rotation: number
  size: number
  createdAt: number
  pawType: 'front-left' | 'front-right' | 'back-left' | 'back-right'
  walkId: string
}

interface WalkingDog {
  id: string
  x: number
  y: number
  direction: number
  speed: number
  stepCount: number
  lastStepTime: number
  size: number
}

const PawIcon = ({ size = 24, className = '', pawType }: { 
  size?: number
  className?: string
  pawType: 'front-left' | 'front-right' | 'back-left' | 'back-right'
}) => {
  const isFrontPaw = pawType.includes('front')
  
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={className}
    >
      {isFrontPaw ? (
        <>
          <ellipse cx='12' cy='16' rx='6' ry='4' />
          <circle cx='8' cy='8' r='2.5' />
          <circle cx='12' cy='6' r='2.5' />
          <circle cx='16' cy='8' r='2.5' />
          <circle cx='6' cy='12' r='2' />
        </>
      ) : (
        <>
          <ellipse cx='12' cy='15' rx='5' ry='3.5' />
          <circle cx='9' cy='8' r='2' />
          <circle cx='12' cy='7' r='2' />
          <circle cx='15' cy='8' r='2' />
          <circle cx='7' cy='11' r='1.5' />
        </>
      )}
    </svg>
  )
}

function App() {
  const [pawPrints, setPawPrints] = useState<PawPrint[]>([])
  const [dogs, setDogs] = useState<WalkingDog[]>([])
  const [nextPawId, setNextPawId] = useState(1)

  const createNewDog = useCallback(() => {
    const startSide = Math.random() < 0.5 ? 'left' : 'top'
    const dogSize = 0.8 + Math.random() * 0.6
    
    let startX, startY, direction
    
    if (startSide === 'left') {
      startX = -50
      startY = 100 + Math.random() * (window.innerHeight - 200)
      direction = -30 + Math.random() * 60
    } else {
      startX = 100 + Math.random() * (window.innerWidth - 200)
      startY = -50
      direction = 60 + Math.random() * 60
    }
    
    const newDog: WalkingDog = {
      id: `dog-${Date.now()}-${Math.random()}`,
      x: startX,
      y: startY,
      direction,
      speed: 1 + Math.random() * 2,
      stepCount: 0,
      lastStepTime: Date.now(),
      size: dogSize
    }
    
    setDogs(prev => [...prev, newDog])
  }, [])

  const createPawPrint = useCallback((dog: WalkingDog, pawType: PawPrint['pawType']) => {
    const isLeft = pawType.includes('left')
    const isFront = pawType.includes('front')
    
    const dirRad = (dog.direction * Math.PI) / 180
    
    const sideOffset = (isLeft ? -1 : 1) * 15 * dog.size
    const frontBackOffset = (isFront ? -10 : 10) * dog.size
    
    const pawX = dog.x + 
      Math.cos(dirRad) * frontBackOffset - 
      Math.sin(dirRad) * sideOffset
    const pawY = dog.y + 
      Math.sin(dirRad) * frontBackOffset + 
      Math.cos(dirRad) * sideOffset
    
    const newPaw: PawPrint = {
      id: nextPawId,
      x: pawX,
      y: pawY,
      rotation: dog.direction + (Math.random() - 0.5) * 30,
      size: (18 + Math.random() * 8) * dog.size,
      createdAt: Date.now(),
      pawType,
      walkId: dog.id
    }

    setPawPrints(prev => {
      const updated = [...prev, newPaw]
      
      if (updated.length > 100) {
        return updated.slice(-100)
      }
      
      return updated
    })
    
    setNextPawId(prev => prev + 1)
  }, [nextPawId])

  useEffect(() => {
    const animationFrame = () => {
      const now = Date.now()
      
      setDogs(prevDogs => {
        return prevDogs.map(dog => {
          const dirRad = (dog.direction * Math.PI) / 180
          const newX = dog.x + Math.cos(dirRad) * dog.speed
          const newY = dog.y + Math.sin(dirRad) * dog.speed
          
          const stepInterval = 400 + Math.random() * 200
          let newStepCount = dog.stepCount
          
          if (now - dog.lastStepTime > stepInterval) {
            const pawSequence = ['front-left', 'back-right', 'front-right', 'back-left'] as const
            const currentPaw = pawSequence[dog.stepCount % 4]
            
            createPawPrint(dog, currentPaw)
            newStepCount = dog.stepCount + 1
          }
          
          return {
            ...dog,
            x: newX,
            y: newY,
            stepCount: newStepCount,
            lastStepTime: now - dog.lastStepTime > stepInterval ? now : dog.lastStepTime
          }
        }).filter(dog => {
          return dog.x > -100 && dog.x < window.innerWidth + 100 && 
                 dog.y > -100 && dog.y < window.innerHeight + 100
        })
      })
      
      requestAnimationFrame(animationFrame)
    }
    
    const frameId = requestAnimationFrame(animationFrame)
    return () => cancelAnimationFrame(frameId)
  }, [createPawPrint])

  useEffect(() => {
    const createDogInterval = () => {
      const randomDelay = 3000 + Math.random() * 5000
      
      const timeout = setTimeout(() => {
        createNewDog()
        createDogInterval()
      }, randomDelay)
      
      return timeout
    }

    createNewDog()
    const timeout = createDogInterval()
    
    return () => clearTimeout(timeout)
  }, [createNewDog])

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setPawPrints(prev => 
        prev.filter(paw => now - paw.createdAt < 20000)
      )
    }, 2000)

    return () => clearInterval(cleanupInterval)
  }, [])

  return (
    <div className='min-h-screen w-full bg-background overflow-hidden relative'>
      {pawPrints.map((paw, index) => {
        const age = Date.now() - paw.createdAt
        const shouldFadeOut = age > 15000
        
        return (
          <div
            key={paw.id}
            className={`paw-print text-primary ${shouldFadeOut ? 'fade-out' : ''}`}
            style={{
              left: `${paw.x}px`,
              top: `${paw.y}px`,
              transform: `rotate(${paw.rotation}deg)`,
              animationDelay: `${index * 20}ms`,
              zIndex: Math.max(1, 100 - index)
            }}
          >
            <PawIcon size={paw.size} pawType={paw.pawType} />
          </div>
        )
      })}
      
      <div className='absolute top-8 left-1/2 transform -translate-x-1/2 z-50'>
        <h1 className='text-2xl font-medium text-primary/60 tracking-wide text-center'>
          Dogs Walking
        </h1>
        <div className='text-sm text-primary/40 text-center mt-2 space-y-1'>
          <p>{dogs.length} dogs walking</p>
          <p>{pawPrints.length} paw prints on screen</p>
        </div>
      </div>
    </div>
  )
}

export default App