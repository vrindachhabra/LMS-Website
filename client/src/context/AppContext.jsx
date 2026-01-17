import { createContext, useState, useEffect } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import {useAuth , useUser} from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from "react-toastify";


export const AppContext = createContext()
export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const {getToken} = useAuth()
    const {user} = useUser()

    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(false)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [userData, setUserData] = useState(null)

    //Fetching all courses
    const fetchAllCourses = async() =>{
        try {
            const token = await getToken();
            if (!token) return;
            if (!backendUrl) return;
            const { data } = await axios.get(
            backendUrl + "/api/course/all"
            );
            if(data.success){
                setAllCourses(data.courses)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fetch user data
    const fetchUserData = async () => {
        try {
            if (!backendUrl) return;
            if(user?.publicMetadata?.role === 'educator'){
                setIsEducator(true)
            }

            const token = await getToken();
            if (!token) return;
            const {data} = await axios.get(backendUrl + "/api/user/data", {headers: {Authorization: `Bearer ${token}`}})

            if(data.success){
                setUserData(data.user)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    //Function to calculate avg rating of course
    const calculateRating = (course) => {
        if(course.courseRatings.length == 0)
            return 0;
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    //Function to calculate Course Chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]})
    }
    //Function to calculate Course Duration
    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.map((chapter) => chapter.chapterContent.map((lecture) => time += lecture.lectureDuration))
        return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]})
    }
    //Function to calculate num of lectures in the course
    const calculateLectures = (course) => {
        let totalLectures = 0
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length
            }
        });
        return totalLectures;
    }

    //Fetch user enrolled courses
    const fetchUserEnrolledCourses = async () => {
        try {
            if (!backendUrl) return;
            const token = await getToken();
            if (!token) return;
            const { data } = await axios.get(backendUrl + "/api/user/my-enrollments", {headers: {Authorization: `Bearer ${token}` }})
            if(data.success){
                setEnrolledCourses(data.enrolledCourses.reverse())
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchAllCourses()
    },[])

    useEffect(() => {
        if(user){
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [user])

    const value = {
        currency, allCourses, navigate, calculateRating, isEducator, setIsEducator, calculateChapterTime, calculateCourseDuration, calculateLectures, enrolledCourses, setEnrolledCourses, fetchUserEnrolledCourses, backendUrl, userData, setUserData, getToken, fetchAllCourses
    }
    return (
        <AppContext.Provider value ={value}>
            {props.children}
        </AppContext.Provider>
    )
}