'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageReviewerProps {
  images: string[]; // Array of image preview URLs
  initialIndex: number; // Starting image index
  onClose: () => void; // Callback to close the modal
  imageNames: string[]; // Array of image names for accessibility
}

export default function ImageReviewer({ images, initialIndex, onClose, imageNames }: ImageReviewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const showPreviousImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const showNextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') showPreviousImage();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="dialog"
        aria-label="Image reviewer"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-4xl w-full h-[80vh] bg-white rounded-lg overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close image reviewer"
          >
            ×
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={images[currentIndex]}
              alt={`Selected image ${imageNames[currentIndex]}`}
              fill
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={showPreviousImage}
                disabled={currentIndex === 0}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white ${
                  currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                onClick={showNextImage}
                disabled={currentIndex === images.length - 1}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white ${
                  currentIndex === images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}