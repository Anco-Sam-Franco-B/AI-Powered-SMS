import express from 'express'
import { notifyDataUpload, checkAIService } from '../../controllers/webhook.controller.js'
import verifyAuth from '../../middlewares/UserAuth.js'

const webhookRoutes = express.Router()

webhookRoutes.post('/data-upload', verifyAuth, notifyDataUpload)
webhookRoutes.get('/ai-health', verifyAuth, checkAIService)

export default webhookRoutes
