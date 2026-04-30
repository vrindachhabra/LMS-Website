import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar'
import { useParams } from 'react-router-dom'
import CourseCard from '../../components/student/CourseCard'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'

const CoursesList = () => {
  const { navigate, allCourses, searchCourses, fetchTopRatedCourses, fetchCoursesByThumbnail } = useContext(AppContext)
  const { input } = useParams() //we get input from the url parameter
  const [filteredCourse, setFilteredCourse] = useState([])
  const [searchTerm, setSearchTerm] = useState(input || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minDiscount, setMinDiscount] = useState('')
  const [showThumbnail, setShowThumbnail] = useState(false)
  const [activeMode, setActiveMode] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSearchTerm(input || '')
  }, [input])

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      try {
        if(activeMode === 'top-rated'){
          const courses = await fetchTopRatedCourses({ minAverageRating: 4, limit: 20 })
          setFilteredCourse(courses)
          return
        }

        if(showThumbnail){
          const courses = await fetchCoursesByThumbnail(true)
          setFilteredCourse(courses)
          return
        }

        if(searchTerm || minPrice || maxPrice || minDiscount){
          const courses = await searchCourses({
            title: searchTerm || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
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
  }, [allCourses, searchTerm, minPrice, maxPrice, minDiscount, showThumbnail, activeMode, fetchCoursesByThumbnail, fetchTopRatedCourses, searchCourses])

  const clearFilters = () => {
    setSearchTerm('')
    setMinPrice('')
    setMaxPrice('')
    setMinDiscount('')
    setShowThumbnail(false)
    setActiveMode('all')
    navigate('/course-list')
  }

  const onSearchSubmit = (term) => {
    setSearchTerm(term)
    setActiveMode('all')
    setShowThumbnail(false)
    navigate(term ? `/course-list/${term}` : '/course-list')
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
          <label className='text-sm text-gray-600'>Min Price</label>
          <input value={minPrice} onChange={e => setMinPrice(e.target.value)} type='number' placeholder='0' className='border rounded px-3 py-2 outline-none' />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-600'>Max Price</label>
          <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} type='number' placeholder='0' className='border rounded px-3 py-2 outline-none' />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-600'>Min Discount</label>
          <input value={minDiscount} onChange={e => setMinDiscount(e.target.value)} type='number' placeholder='0' className='border rounded px-3 py-2 outline-none' />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-600'>Filters</label>
          <div className='flex gap-2 flex-wrap'>
            <button type='button' onClick={() => { setActiveMode('all'); setShowThumbnail(false) }} className={`px-3 py-2 rounded border ${activeMode === 'all' && !showThumbnail ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
              All
            </button>
            <button type='button' onClick={() => { setActiveMode('top-rated'); setShowThumbnail(false) }} className={`px-3 py-2 rounded border ${activeMode === 'top-rated' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
              Top Rated
            </button>
            <button type='button' onClick={() => { setShowThumbnail(prev => !prev); setActiveMode('all') }} className={`px-3 py-2 rounded border ${showThumbnail ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
              {showThumbnail ? 'Thumbnail On' : 'Thumbnail Only'}
            </button>
            <button type='button' onClick={clearFilters} className='px-3 py-2 rounded border bg-gray-100 text-gray-700'>Clear</button>
          </div>
        </div>
      </div>
      {loading && <p className='mt-6 text-gray-600'>Loading courses...</p>}
      {searchTerm && !loading && <p className='mt-4 text-sm text-gray-600'>Searching by title/description: "{searchTerm}"</p>}
      {(minPrice || maxPrice || minDiscount || showThumbnail || activeMode === 'top-rated') && !loading && (
        <p className='mt-2 text-sm text-gray-500'>
          {activeMode === 'top-rated' ? 'Showing top rated courses.' : ''}
          {showThumbnail ? ' Showing only thumbnail courses.' : ''}
          {(minPrice || maxPrice) ? ` Price range: ${minPrice || 'min'} - ${maxPrice || 'max'}.` : ''}
          {minDiscount ? ` Minimum discount: ${minDiscount}%.` : ''}
        </p>
      )}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0'>
        {filteredCourse.map((course, index) => <CourseCard key={index} course={course}/> )}
      </div>
    </div>
    <Footer />
    </>
  )
}

export default CoursesList