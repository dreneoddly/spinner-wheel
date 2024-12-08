import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface WinnerPopupProps {
  name: string
  image: string
  onClose: () => void
}

export const WinnerPopup: React.FC<WinnerPopupProps> = ({ name, image, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade-out animation
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg p-8 shadow-xl text-center max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-pink-700">Congratulations!</h2>
        <p className="text-xl mb-4 text-pink-600">You won:</p>
        <div className="w-32 h-32 mx-auto mb-4">
          <Image src={image} alt={name} width={128} height={128} className="w-full h-full object-contain" />
        </div>
        <p className="text-2xl font-bold text-pink-500 mb-4">{name}</p>
        <button
          onClick={onClose}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

