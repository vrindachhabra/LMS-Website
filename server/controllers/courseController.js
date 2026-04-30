import Course from "../models/Course.js";
import User from "../models/User.js";

//Get all courses
export const getAllCourses = async (req, res) => {
    try{
        const courses = await Course.find({isPublished: true}).select(['-courseContent', '-enrolledStudents']).populate({path: 'educator'})
        //populate({ path: 'educator' }) is replacing the educator’s ObjectId with the full educator document.
        res.json({success: true, courses})
    } catch(error){
        res.json({success: false, message: error.message})
    }
}
// Search courses with regex, comparison, and published filters
export const searchCourses = async (req, res) => {
    try {
        const { title, minPrice, maxPrice, minDiscount, isPublished } = req.query
        const filter = {}

        if(title){
            filter.$or = [
                { courseTitle: { $regex: title, $options: 'i' } },
                { courseDescription: { $regex: title, $options: 'i' } }
            ]
        }

        if(minPrice !== undefined || maxPrice !== undefined){
            filter.coursePrice = {}
            if(minPrice !== undefined) filter.coursePrice.$gte = Number(minPrice)
            if(maxPrice !== undefined) filter.coursePrice.$lte = Number(maxPrice)
        }

        if(minDiscount !== undefined){
            filter.discount = { $gte: Number(minDiscount) }
        }

        if(isPublished !== undefined){
            filter.isPublished = isPublished === 'true'
        }

        const courses = await Course.find(filter)
            .select(['-courseContent', '-enrolledStudents'])
            .populate({ path: 'educator' })

        res.json({ success: true, courses })
    } catch(error){
        res.json({ success: false, message: error.message })
    }
}

// Get top rated courses using aggregation operators
export const getTopRatedCourses = async (req, res) => {
    try {
        const { minAverageRating = 4, minEnrollments = 5, limit = 10 } = req.query

        const courses = await Course.aggregate([
            { $match: { isPublished: true } },
            { $addFields: {
                averageRating: { $avg: '$courseRatings.rating' },
                enrolledCount: { $size: '$enrolledStudents' }
            } },
            { $match: {
                averageRating: { $gte: Number(minAverageRating) },
                enrolledCount: { $gte: Number(minEnrollments) }
            } },
            { $sort: { averageRating: -1, enrolledCount: -1 } },
            { $limit: Number(limit) }
        ])

        res.json({ success: true, courses })
    } catch(error){
        res.json({ success: false, message: error.message })
    }
}

// Find courses by whether a thumbnail exists using $exists
export const getCoursesByThumbnail = async (req, res) => {
    try {
        const hasThumbnail = req.query.hasThumbnail !== 'false'
        const filter = hasThumbnail
            ? { courseThumbnail: { $exists: true, $ne: '' } }
            : { courseThumbnail: { $exists: false } }

        const courses = await Course.find(filter).select(['-courseContent', '-enrolledStudents']).populate({ path: 'educator' })
        res.json({ success: true, courses })
    } catch(error){
        res.json({ success: false, message: error.message })
    }
}

// Update course discount with $set and $inc operators
export const updateCourseDiscount = async (req, res) => {
    const { id } = req.params
    const { discount, discountDelta } = req.body

    try {
        const update = {}
        if(discount !== undefined) update.$set = { discount: Math.min(Math.max(Number(discount), 0), 100) }
        if(discountDelta !== undefined) update.$inc = { discount: Number(discountDelta) }

        if(!Object.keys(update).length){
            return res.json({ success: false, message: 'No update values provided' })
        }

        const updatedCourse = await Course.findByIdAndUpdate(id, update, { new: true })
        res.json({ success: true, updatedCourse })
    } catch(error){
        res.json({ success: false, message: error.message })
    }
}

// Add a student to a course and user enrollments using $addToSet
export const addStudentToCourse = async (req, res) => {
    const { id } = req.params
    const { userId } = req.body

    try {
        if(!userId){
            return res.json({ success: false, message: 'Missing userId' })
        }

        const course = await Course.findByIdAndUpdate(
            id,
            { $addToSet: { enrolledStudents: userId } },
            { new: true }
        )

        if(!course){
            return res.json({ success: false, message: 'Course not found' })
        }

        const user = await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: course._id } })
        if(!user){
            return res.json({ success: false, message: 'User not found' })
        }

        res.json({ success: true, course })
    } catch(error){
        res.json({ success: false, message: error.message })
    }
}

// Remove a student from a course using $pull
export const removeStudentFromCourse = async (req, res) => {
    const { id } = req.params
    const { userId } = req.body

    try {
        if(!userId){
            return res.json({ success: false, message: 'Missing userId' })
        }

        const course = await Course.findByIdAndUpdate(
            id,
            { $pull: { enrolledStudents: userId } },
            { new: true }
        )

        if(!course){
            return res.json({ success: false, message: 'Course not found' })
        }

        const user = await User.findByIdAndUpdate(userId, { $pull: { enrolledCourses: course._id } })
        if(!user){
            return res.json({ success: false, message: 'User not found' })
        }

        res.json({ success: true, course })
    } catch(error){
        res.json({ success: false, message: error.message })
    }
}

// Update nested lecture preview flags using arrayFilters
export const toggleLecturePreview = async (req, res) => {
    const { id } = req.params
    const { chapterId, lectureId, isPreviewFree } = req.body

    try {
        if(!chapterId || !lectureId || typeof isPreviewFree !== 'boolean'){
            return res.json({ success: false, message: 'chapterId, lectureId and boolean isPreviewFree are required' })
        }

        const result = await Course.updateOne(
            { _id: id, 'courseContent.chapterId': chapterId, 'courseContent.chapterContent.lectureId': lectureId },
            {
                $set: {
                    'courseContent.$[chapter].chapterContent.$[lecture].isPreviewFree': isPreviewFree
                }
            },
            {
                arrayFilters: [
                    { 'chapter.chapterId': chapterId },
                    { 'lecture.lectureId': lectureId }
                ]
            }
        )

        if(result.matchedCount === 0){
            return res.json({ success: false, message: 'No matching course/chapter/lecture found' })
        }

        const updatedCourse = await Course.findById(id)
        res.json({ success: true, updatedCourse })
    } catch(error){
        res.json({ success: false, message: error.message })
    }
}
//Get course by id
export const getCourseId = async (req, res) =>{
    const {id} = req.params
    try{
        const courseData = await Course.findById(id).populate({path: 'educator'})

        //remove lectureUrl if preview is not free
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = ""
                }
            })
        })
        res.json({success: true, courseData})
    } catch(error){
        res.json({success: false, message: error.message})
    }
}