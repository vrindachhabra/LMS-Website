import React, { useState } from 'react'
import Rating from './Rating'
import { toast } from 'react-toastify'
import axios from 'axios'

const RatingModal = ({ course, backendUrl, getToken, isOpen, onClose, onRatingSuccess }) => {
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRating = (value) => {
    setRating(value)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const token = await getToken()
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId: course._id, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success('Rating submitted successfully')
        setRating(0)
        onClose()
        if (onRatingSuccess) onRatingSuccess()
      } else {
        toast.error(data.message || 'Failed to submit rating')
      }
    } catch (error) {
      toast.error(error.message || 'Error submitting rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
        <h2 className='text-2xl font-semibold mb-2'>Rate Course</h2>
        <p className='text-gray-600 mb-4 truncate'>{course?.courseTitle}</p>
        
        <div className='mb-6'>
          <p className='text-sm text-gray-600 mb-3'>How would you rate this course?</p>
          <div className='flex justify-center'>
            <Rating initialRating={rating} onRate={handleRating} />
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RatingModal
