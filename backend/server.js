import express from 'express'
import Routes from './routes/index.routes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { closeDB, testConnection } from './Configs/Database.js'
import initDB from './Configs/DBInitialization.js'
import morgan from 'morgan'

dotenv.config()
const app=express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use('/api/v1', Routes)

app.get('/health', async(req, res)=>{
    const healthCheck={
        status: 'success',
        timestamp: new Date().toISOString(),
        checks: {}
    }

    try {
        const dbStatus= await testConnection()
        healthCheck.checks.database=dbStatus.success?'healthy':'unhealthy'

        if(!dbStatus.success){
            healthCheck.status='error'
            healthCheck.error= dbStatus.error
        }

        const statusCode= dbStatus.success ? 200 : 503
        res.status(statusCode).json(healthCheck)
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        })
    }
})

process.on('SIGINT', async()=>{
    console.log('Received SIGINT. Shutting down gracefully...')
    await closeDB()
    process.exit(0)
})
process.on('SIGTERM', async()=>{
    console.log('Received SIGTERM. Shutting down gracefully...')
    await closeDB()
    process.exit(0)
})

app.listen(port, async ()=>{
    console.log(`Server is running on http://localhost:${port}`)

    try {
        const connectionResult = await testConnection()
        if (!connectionResult.success) {
            console.log('Warning: Server started with database connection issues')
        }
        await initDB()
    } catch (err) {
        console.log('Warning: Could not initialize database:', err.message)
    }
})
