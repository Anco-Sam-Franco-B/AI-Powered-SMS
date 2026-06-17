import express from 'express'
import verifyAuth from '../../middlewares/UserAuth.js'
import { generateReport } from '../../controllers/report.controller.js'

const reportRoutes = express.Router()

reportRoutes.get('/generate', verifyAuth, generateReport)

export default reportRoutes
