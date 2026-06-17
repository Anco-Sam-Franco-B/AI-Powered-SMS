import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
})

db.on('connect', ()=>{
    console.log('New client connected to PostgreSQL')
})
db.on('error', (err, client)=>{
    console.log('Unexpected error on idle client', err)
})
db.on('remove', ()=>{
    console.log('Client removed from pool')
})

export const testConnection = async ()=>{
    let client
    try {
        client = await db.connect()
        console.log('PostgreSQL connected successfully to database:', db.options.database)
        return { success: true }
    } catch (error) {
        console.error('Database connection Failed:', error.message)
        return { success: false, errors: error }
    } finally {
        if (client) client.release()
    }
}

export const closeDB = async ()=>{
    console.log('Closing database pool...')
    await db.end()
    console.log('Database pool closed.')
}

export default db
