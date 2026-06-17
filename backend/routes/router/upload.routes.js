import express from 'express'
import { upload, uploadExcel, listStudents, listCourses } from '../../controllers/upload.controller.js'
import { upload as uploadMiddleware } from '../../utils/uploads.utils.js'
import verifyAuth from '../../middlewares/UserAuth.js'

const uploadRoutes=express.Router()

uploadRoutes.post('/upload-excel', verifyAuth, uploadMiddleware.single('file'), uploadExcel)
uploadRoutes.post('/:table', verifyAuth, uploadMiddleware.single('file'), upload)
uploadRoutes.get('/students', verifyAuth, listStudents)
uploadRoutes.get('/courses', verifyAuth, listCourses)

export default uploadRoutes
