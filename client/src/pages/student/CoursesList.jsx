import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar'
import { useParams } from 'react-router-dom'
import CourseCard from '../../components/student/CourseCard'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'
import RatingModal from '../../components/student/RatingModal'

const CoursesList = () => {
  const { navigate, allCourses, searchCourses, fetchTopRatedCourses } = useContext(AppContext)
  const { input } = useParams() //we get input from the url parameter
  const [filteredCourse, setFilteredCourse] = useState([])
  const [searchTerm, setSearchTerm] = useState(input || '')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [minDiscount, setMinDiscount] = useState('')
  const [activeMode, setActiveMode] = useState('all')
  const [loading, setLoading] = useState(false)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    setSearchTerm(input || '')
  }, [input])

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      try {
        if(activeMode === 'top-rated'){
          const courses = await fetchTopRatedCourses({ minAverageRating: 3, limit: 20 })
          setFilteredCourse(courses)
          return
        }

        if(searchTerm || minPrice !== 0 || maxPrice !== 1000 || minDiscount){
          const courses = await searchCourses({
            title: searchTerm || undefined,
            minPrice: minPrice !== 0 ? minPrice : undefined,
            maxPrice: maxPrice !== 1000 ? maxPrice : undefined,
            minDiscount: minDiscount || undefined,
            isPublished: true
          })
          setFilteredCourse(courses)
          return
        }

        setFilteredCourse(allCourses)
      } catch (error) {
        setFilteredCourse([])
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [allCourses, searchTerm, minPrice, maxPrice, minDiscount, activeMode, fetchTopRatedCourses, searchCourses])

  const clearFilters = () => {
    setSearchTerm('')
    setMinPrice(0)
    setMaxPrice(1000)
    setMinDiscount('')
    setActiveMode('all')
    navigate('/course-list')
  }

  const onSearchSubmit = (term) => {
    setSearchTerm(term)
    setActiveMode('all')
    navigate(term ? `/course-list/${term}` : '/course-list')
  }

  const handleRateClick = (course) => {
    setSelectedCourse(course)
    setRatingModalOpen(true)
  }

  return (
    <>
    <div className='relative md:px-36 px-8 pt-20 text-left'>
      <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
        <div>
          <h1 className='text-4xl font-semibold text-gray-800'>Course List</h1>
          <p className='text-gray-500'>
          <span className='text-blue-600 cursor-pointer' onClick={() => navigate('/')}>Home </span>/ <span>Course List</span></p>
        </div>
        <SearchBar data={searchTerm} onSearch={onSearchSubmit} />
      </div>
      <div className='mt-8 grid gap-4 md:grid-cols-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-600'>Price Range: ${minPrice} - ${maxPrice}</label>
          <div className='relative w-full h-2'>
            <div className='absolute w-full h-2 bg-gray-200 rounded-lg' />
            <div 
              className='absolute h-2 bg-blue-600 rounded-lg pointer-events-none'
              style={{
                left: `${(minPrice / 1000) * 100}%`,
                right: `${100 - (maxPrice / 1000) * 100}%`
              }}
            />
            <input 
              value={minPrice} 
              onChange={e => {
                const val = Number(e.target.value)
                if (val <= maxPrice) setMinPrice(val)
              }} 
              type='range' 
              min='0' 
              max='1000' 
              step='50'
              className='absolute w-full h-2 rounded-lg appearance-none bg-transparent cursor-pointer thumb-min'
              style={{ zIndex: minPrice > 500 ? 5 : 3 }}
            />
            <input 
              value={maxPrice} 
              onChange={e => {
                const val = Number(e.target.value)
                if (val >= minPrice) setMaxPrice(val)
              }} 
              type='range' 
              min='0' 
              max='1000' 
              step='50'
              className='absolute w-full h-2 rounded-lg appearance-none bg-transparent cursor-pointer thumb-max'
              style={{ zIndex: 4 }}
            />
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-600'>Min Discount</label>
          <input value={minDiscount} onChange={e => setMinDiscount(e.target.value)} type='number' placeholder='0' className='border rounded px-3 py-2 outline-none' />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-600'>Filters</label>
          <div className='flex gap-2 flex-wrap'>
            <button type='button' onClick={() => { setActiveMode('all') }} className={`px-3 py-2 rounded border ${activeMode === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
              All
            </button>
            <button type='button' onClick={() => { setActiveMode('top-rated') }} className={`px-3 py-2 rounded border ${activeMode === 'top-rated' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
              Top Rated
            </button>
            <button type='button' onClick={clearFilters} className='px-3 py-2 rounded border bg-gray-100 text-gray-700'>Clear</button>
          </div>
        </div>
      </div>
      {loading && <p className='mt-6 text-gray-600'>Loading courses...</p>}
      {searchTerm && !loading && <p className='mt-4 text-sm text-gray-600'>Searching by title/description: "{searchTerm}"</p>}
      {(minPrice !== 0 || maxPrice !== 1000 || minDiscount || activeMode === 'top-rated') && !loading && (
        <p className='mt-2 text-sm text-gray-500'>
          {activeMode === 'top-rated' ? 'Showing top rated courses.' : ''}
          {(minPrice !== 0 || maxPrice !== 1000) ? ` Price range: $${minPrice} - $${maxPrice}.` : ''}
          {minDiscount ? ` Minimum discount: ${minDiscount}%.` : ''}
        </p>
      )}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0'>
        {filteredCourse.map((course, index) => <CourseCard key={index} course={course} onRateClick={handleRateClick} /> )}
      </div>
    </div>
    <Footer />
    {selectedCourse && (
      <RatingModal 
        course={selectedCourse}
        backendUrl={backendUrl}
        getToken={getToken}
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onRatingSuccess={() => {
          // Refetch courses to show updated ratings
          window.location.reload()
        }}
      />
    )}
    </>
  )
}

export default CoursesList