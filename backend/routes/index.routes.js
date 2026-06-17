import express from "express"
import userAuthRoutes from "./router/userAuth.routes.js"
import academicYear from "./router/academicYear.routes.js"
import uploadRoutes from "./router/upload.routes.js"
import dataRoutes from "./router/data.routes.js"
import webhookRoutes from "./router/webhook.routes.js"
import reportRoutes from "./router/report.routes.js"

const Routes=express.Router()

Routes.use('/auth', userAuthRoutes)
Routes.use('/academics', academicYear)
Routes.use('/upload', uploadRoutes)
Routes.use('/data', dataRoutes)
Routes.use('/webhook', webhookRoutes)
Routes.use('/reports', reportRoutes)

export default Routes
