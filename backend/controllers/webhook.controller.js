import dotenv from 'dotenv'

dotenv.config()

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

export const notifyDataUpload = async (req, res) => {
    try {
        const { table, record_count } = req.body

        const response = await fetch(`${AI_SERVICE_URL}/api/v1/training/trigger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || ''
            },
            body: JSON.stringify({
                model_type: 'all',
                dataset_info: {
                    table,
                    record_count,
                    timestamp: new Date().toISOString()
                }
            })
        })

        const data = await response.json()
        res.json({
            success: true,
            message: 'AI training pipeline notified',
            ai_response: data
        })
    } catch (error) {
        console.error('Webhook error:', error.message)
        res.status(200).json({
            success: true,
            message: 'Data uploaded (AI service unavailable for auto-training)',
            note: 'AI training will run on next scheduled cycle'
        })
    }
}

export const checkAIService = async (req, res) => {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/monitoring/health`)
        const data = await response.json()
        res.json({ success: true, ai_service: data })
    } catch (error) {
        res.json({ success: false, ai_service: 'unavailable', message: error.message })
    }
}
