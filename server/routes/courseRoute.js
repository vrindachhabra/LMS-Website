import express from 'express'
import {
    getAllCourses,
    getCourseId,
    searchCourses,
    getTopRatedCourses,
    getCoursesByThumbnail,
    updateCourseDiscount,
    addStudentToCourse,
    removeStudentFromCourse,
    toggleLecturePreview
} from '../controllers/courseController.js'

const courseRouter = express.Router()

courseRouter.get('/all', getAllCourses)
courseRouter.get('/search', searchCourses)
courseRouter.get('/top-rated', getTopRatedCourses)
courseRouter.get('/with-thumbnail', getCoursesByThumbnail)
courseRouter.patch('/:id/discount', updateCourseDiscount)
courseRouter.patch('/:id/enroll', addStudentToCourse)
courseRouter.patch('/:id/unenroll', removeStudentFromCourse)
courseRouter.patch('/:id/lecture-preview', toggleLecturePreview)
courseRouter.get('/:id', getCourseId)

export default courseRouter