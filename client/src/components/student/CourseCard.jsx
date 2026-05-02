import React from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'

const CourseCard = ({course, onRateClick}) => {
  const {currency, calculateRating, userData} = useContext(AppContext)
  
  const isEnrolled = userData?.enrolledCourses?.includes(course._id)
  
  const handleRateClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRateClick) onRateClick(course)
  }
  
  return (
    <div className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg relative'>
        <Link to={'/course/' + course._id} onClick={() => scrollTo(0,0)} className='block'>
          <img className='w-full' src={course.courseThumbnail} alt="" />
          <div className='p-3 text-left'>
            <h3 className='text-base font-semibold'>{course.courseTitle}</h3>
            <p className='text-gray-500'>{course.educator.name}</p>
            <div className='flex items-center space-x-2'>
              <p>{calculateRating(course)}</p>
              <div className='flex'>
                {[...Array(5)].map((_ , i) => (<img key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5'/>))}
              </div>
              <p className='text-gray-500'>{course.courseRatings.length}{course.courseRatings.length > 1 ? ' ratings' : ' rating'}</p>
            </div>
            <p className='text-base font-semibold text-gray-800'>{currency}{(course.coursePrice - course.discount * course.coursePrice/100).toFixed(2)}</p>
          </div>
        </Link>
        {isEnrolled && (
          <button 
            onClick={handleRateClick}
            className='absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors'
          >
            ⭐ Rate
          </button>
        )}
    </div>
  )
}

export default CourseCard

//The spread operator (...) turns it into a real iterable array: