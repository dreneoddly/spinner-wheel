"use client"

import React, { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { WinnerPopup } from './WinnerPopup'
import { Pacifico } from 'next/font/google'
import { initialPrizeLimits, resetPrizeCounts, PrizeLimit } from '@/app/PrizeLimit'

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
})

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

interface SectionData {
  name: string
  image: string
}

interface WheelSpinnerProps {
  backgroundImage?: string
}

function weightedRandomChoice(prizes: PrizeLimit[]): PrizeLimit {
  const totalWeight = prizes.reduce((sum, prize) => {
    return sum + (typeof prize.limit === 'number' ? prize.limit : 100); // Use 100 for 'unlimited'
  }, 0);

  let random = Math.random() * totalWeight;
  
  for (const prize of prizes) {
    const weight = typeof prize.limit === 'number' ? prize.limit : 100; // Use 100 for 'unlimited'
    if (random < weight) {
      return prize;
    }
    random -= weight;
  }
  
  return prizes[prizes.length - 1]; // Fallback to last prize (should never happen)
}


const WheelSpinner = ({ backgroundImage }: WheelSpinnerProps) => {
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [prizeLimits, setPrizeLimits] = useState<PrizeLimit[]>(initialPrizeLimits)
  const wheelRef = useRef<SVGSVGElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const spinningAudioRef = useRef<HTMLAudioElement>(null);

  const sections: SectionData[] = [
    { name: '5 Pieces of Jibbitzs', image: '/prize 1.svg' },
    { name: 'Hacipupu', image: '/prize 2.svg' },
    { name: 'Socks', image: '/prize 3.svg' },
    { name: 'Bottle', image: '/prize 4.svg' },
    { name: 'Tote Bag', image: '/prize 5.svg' },
    { name: '10% OFF', image: '/10p.svg' }
  ]

  const colors = ['#FBE4E4', '#FFCCCC', '#FBE4E4', '#FFCCCC', '#FBE4E4', '#FFCCCC']

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Paytone+One&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // Function to modify a prize's limit
  useEffect(() => {
    const loadPrizeLimits = () => {
      const storedLimits = localStorage.getItem('prizeLimits')
      const storedDate = localStorage.getItem('prizeLimitsDate')
      const today = new Date().toDateString()

      // Clear storage and use new initial limits if stored limits don't match initial limits structure
      if (storedLimits) {
        const parsedLimits = JSON.parse(storedLimits) as PrizeLimit[];
        const limitsChanged = initialPrizeLimits.some(initial => {
          const stored = parsedLimits.find(p => p.name === initial.name);
          return !stored || stored.limit !== initial.limit;
        });

        if (limitsChanged) {
          localStorage.clear();
          setPrizeLimits(initialPrizeLimits);
          localStorage.setItem('prizeLimits', JSON.stringify(initialPrizeLimits));
          localStorage.setItem('prizeLimitsDate', today);
          return;
        }
      }

      // Rest of the function remains the same
      if (storedLimits && storedDate !== today) {
        const parsedLimits = JSON.parse(storedLimits) as PrizeLimit[];
        const resetLimits = resetPrizeCounts(parsedLimits);
        setPrizeLimits(resetLimits);
        localStorage.setItem('prizeLimits', JSON.stringify(resetLimits));
        localStorage.setItem('prizeLimitsDate', today);
        console.log('Daily reset performed:', resetLimits);
        return;
      }

      if (storedLimits && storedDate === today) {
        setPrizeLimits(JSON.parse(storedLimits) as PrizeLimit[]);
        return;
      }

      setPrizeLimits(initialPrizeLimits);
      localStorage.setItem('prizeLimits', JSON.stringify(initialPrizeLimits));
      localStorage.setItem('prizeLimitsDate', today);
    }

    loadPrizeLimits();

    const interval = setInterval(() => {
      const storedDate = localStorage.getItem('prizeLimitsDate');
      const today = new Date().toDateString();

      if (storedDate !== today) {
        loadPrizeLimits();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('prizeLimits', JSON.stringify(prizeLimits))
  }, [prizeLimits])

  useEffect(() => {
    console.log('Current prize limits:', prizeLimits);
  }, [prizeLimits]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }).toLowerCase())
      setCurrentDate(now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }))
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const playWinSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error)
      })
    }
  }

  const playSpinningSound = () => {
    if (spinningAudioRef.current) {
      spinningAudioRef.current.play().catch(error => {
        console.error('Error playing spinning audio:', error);
      });
    }
  };

  const spinWheel = () => {
    if (spinning) return

    setSpinning(true)
    setWinner(null)
    setShowPopup(false)

    const spinDuration = 5800 + Math.random() * 2000
    let totalRotation = 360 * 10

    // Filter out prizes that have reached their limit
    const availablePrizes = prizeLimits.filter(prize => 
      prize.limit === 'unlimited' || prize.count < prize.limit
    )

    let winningPrize: PrizeLimit;
    let winningIndex: number;

    if (availablePrizes.length === 0 || (availablePrizes.length === 1 && availablePrizes[0].name !== 'Socks')) {
      // All prizes have reached their limit or only non-Socks prizes are available
      // Force it to land on Socks
      winningPrize = prizeLimits.find(prize => prize.name === 'Socks')!
      winningIndex = sections.findIndex(section => section.name === 'Socks')
    } else {
      // Use weighted random choice to select a prize
      winningPrize = weightedRandomChoice(availablePrizes)
      winningIndex = sections.findIndex(section => section.name === winningPrize.name)
    }

    // Calculate the rotation to land on the winning prize
    totalRotation += (5 - winningIndex) * 60 + Math.floor(Math.random() * 60)

    let start: number | null = null
    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const percentage = Math.min(progress / spinDuration, 1)
      const easeOut = 1 - Math.pow(1 - percentage, 3)

      const currentRotation = easeOut * totalRotation
      setRotation(currentRotation)

      if (progress < spinDuration) {
        requestAnimationFrame(animate)
      } else {
        setSpinning(false)
        setWinner(winningIndex)
        setShowPopup(true)
        playWinSound()

        // Update prize count
        setPrizeLimits(prevLimits => 
          prevLimits.map(limit => 
            limit.name === winningPrize.name 
              ? { ...limit, count: limit.count + 1 }
              : limit
          )
        )
      }
      playSpinningSound();
    }

    requestAnimationFrame(animate)
  }

  return (
    <div 
      className="flex flex-col items-center justify-between min-h-screen p-4 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage || '/placeholder.svg?height=1080&width=1920'})` }}
    >
      <div className="w-full flex justify-between items-start">
        <img src="/logomb.svg" width={80} height={80} alt="" />
        <div className="flex flex-col items-center justify-center p-2">
          <h1 className="text-xl sm:text-4xl md:text-5xl text-center font-paytone text-white mb-3 animate-pulse">
            Spin the Wheel
          </h1>
          <p className="text-base sm:text-2xl md:text-3xl text-center font-paytone text-white animate-bounce">
            to Win <span className='text-xl sm:text-4xl md:text-5xl text-shawdow text-pink-500'>EXTRA GIFT</span>
          </p>
        </div>
        <div className="invisible w-[100px]"></div>
      </div>

      <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
        <svg
          ref={wheelRef}
          className="w-full h-full"
          viewBox="0 0 100 100"
          style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'none' : 'transform 0.3s ease-out' }}
        >
          {colors.map((color, index) => (
            <g key={index} transform={`rotate(${index * 60} 50 50)`}>
              <path
                d="M50 50 L50 0 A50 50 0 0 1 93.3 25 Z"
                fill={color}
              />
              <foreignObject x="55" y="10" width="25" height="25" transform="rotate(-15 60 38)">
                <div className="w-full h-full relative">
                  <img
                    src={sections[index].image}
                    alt={""}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>

        <button
          onClick={spinWheel}
          disabled={spinning}
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            bg-white hover:bg-gray-50 
            w-24 h-24
            rounded-full 
            shadow-lg 
            disabled:opacity-50 
            transition-all duration-200 
            border-4 border-pink-200
            flex flex-col items-center justify-center
            group
          `}
        >
          <span className={`
            ${pacifico.className}
            text-3xl text-pink-400
            group-hover:scale-105 transition-transform duration-200
          `}>
            Spin
          </span>
          <span className={`
            ${pacifico.className}
            text-md text-pink-300
            -mt-1
          `}>
            to win
          </span>

          {spinning && (
            <div className="absolute inset-0 rounded-full border-4 border-pink-300 border-t-transparent animate-spin" />
          )}
        </button>

        <div className="absolute top-0 left-1/2 -ml-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-pink-500 z-20"></div>
      </div>

      <div className="mt-4 bg-pink-300 rounded-full px-6 py-2 text-white text-center">
        <p className="text-lg md:text-xl lg:text-2xl font-bold">{currentDate}</p>
        <p className="text-md md:text-lg lg:text-xl">{currentTime}</p>
      </div>

      {showPopup && winner !== null && (
        <WinnerPopup
          name={sections[winner].name}
          image={sections[winner].image}
          onClose={() => setShowPopup(false)}
        />
      )}

      {showPopup && <Confetti width={windowSize.width} height={windowSize.height} />}

      <audio ref={spinningAudioRef}>
        <source src="/spinning2.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

export default WheelSpinner

