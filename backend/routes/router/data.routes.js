import express from 'express'
import verifyAuth from '../../middlewares/UserAuth.js'
import {
  getClasses, addClass, updateClass, deleteClass,
  getStudents, addStudent, updateStudent, deleteStudent,
  getCourses, addCourse, updateCourse, deleteCourse,
  getMarks, addMark, updateMark, deleteMark, bulkMarks,
  getAttendance, addAttendance, updateAttendance, deleteAttendance, bulkAttendance,
  getAcademicYears, addAcademicYear, updateAcademicYear, deleteAcademicYear,
  getAcademicTerms, addAcademicTerm, updateAcademicTerm, deleteAcademicTerm,
  getCurrentAcademicInfo,
  getMessages, sendMessage,
} from '../../controllers/data.controller.js'

const dataRoutes = express.Router()

// Classes
dataRoutes.get('/classes', verifyAuth, getClasses)
dataRoutes.post('/classes', verifyAuth, addClass)
dataRoutes.put('/classes/:id', verifyAuth, updateClass)
dataRoutes.delete('/classes/:id', verifyAuth, deleteClass)

// Students
dataRoutes.get('/students', verifyAuth, getStudents)
dataRoutes.post('/students', verifyAuth, addStudent)
dataRoutes.put('/students/:id', verifyAuth, updateStudent)
dataRoutes.delete('/students/:id', verifyAuth, deleteStudent)

// Courses
dataRoutes.get('/courses', verifyAuth, getCourses)
dataRoutes.post('/courses', verifyAuth, addCourse)
dataRoutes.put('/courses/:id', verifyAuth, updateCourse)
dataRoutes.delete('/courses/:id', verifyAuth, deleteCourse)

// Marks
dataRoutes.get('/marks', verifyAuth, getMarks)
dataRoutes.post('/marks', verifyAuth, addMark)
dataRoutes.post('/marks/bulk', verifyAuth, bulkMarks)
dataRoutes.put('/marks/:id', verifyAuth, updateMark)
dataRoutes.delete('/marks/:id', verifyAuth, deleteMark)

// Attendance
dataRoutes.get('/attendance', verifyAuth, getAttendance)
dataRoutes.post('/attendance', verifyAuth, addAttendance)
dataRoutes.put('/attendance/:id', verifyAuth, updateAttendance)
dataRoutes.delete('/attendance/:id', verifyAuth, deleteAttendance)
dataRoutes.post('/attendance/bulk', verifyAuth, bulkAttendance)

// Academic Years
dataRoutes.get('/academic-years', verifyAuth, getAcademicYears)
dataRoutes.post('/academic-years', verifyAuth, addAcademicYear)
dataRoutes.put('/academic-years/:id', verifyAuth, updateAcademicYear)
dataRoutes.delete('/academic-years/:id', verifyAuth, deleteAcademicYear)

// Academic Terms
dataRoutes.get('/academic-terms', verifyAuth, getAcademicTerms)
dataRoutes.post('/academic-terms', verifyAuth, addAcademicTerm)
dataRoutes.put('/academic-terms/:id', verifyAuth, updateAcademicTerm)
dataRoutes.delete('/academic-terms/:id', verifyAuth, deleteAcademicTerm)

// Current Academic Info
dataRoutes.get('/current-academic-info', verifyAuth, getCurrentAcademicInfo)

// Messages
dataRoutes.get('/messages', verifyAuth, getMessages)
dataRoutes.post('/messages', verifyAuth, sendMessage)

export default dataRoutes
