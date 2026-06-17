import db from "../Configs/Database.js";

export const newTerm=async(req, res)=>{
    const {yearId}=req.params
    const {term_name, start_date, end_date, is_active}=req.body
    if(!term_name || !start_date || !end_date || is_active === undefined){
        return res.status(400).json({
            message: 'All inputs are required!'
        })
    }
    if(!yearId){
        return res.status(400).json({
            message: 'Academic Year ID is required!'
        })
    }

    try {
        const newTerm=await db.query(
            'INSERT INTO academic_terms(acyearId, term_name, start_date, end_date, is_active) VALUES($1, $2, $3, $4, $5) RETURNING *',
            [yearId, term_name, start_date, end_date, is_active]
        )
        if(!newTerm){
            return res.status(500).json({
                message: 'Something went wrong! Failed to create new term.'
            })
        }

        return res.status(201).json({
            message: 'Academic Term added successfully!'
        })
        
    } catch (error) {
        console.log(error)
        if(error.code === '23505'){
            return res.status(500).json({
                message: 'This term name already exists for this academic year!'
            })
        }
        return res.status(500).json({
            message: 'Internal Server Error',
            ServerError: error.message
        })
    }
}

export const getTerms=async(req, res)=>{
    try {
        const currentYear=await db.query("SELECT * FROM academic_year WHERE is_active=true LIMIT 1")
        if(currentYear.rows.length === 0){
            return res.status(404).json({
                message: 'No active academic year found. Please activate an academic year first.'
            })
        }
        const currentAcademicYearID = currentYear.rows[0].id

        const getCurrentTerms=await db.query(
            'SELECT * FROM academic_terms WHERE acyearId=$1 ORDER BY id DESC LIMIT 3',
            [currentAcademicYearID]
        )
        return res.status(200).json({
            message: 'Academic terms fetched successfully',
            termsData: getCurrentTerms.rows
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Internal Server Error',
            ServerError: error.message
        })
    }
}

export const getTerm=async(req, res)=>{
    const {termId}=req.params
    if(!termId) return res.status(400).json({
        message: 'Academic term ID is required!'
    })
    
    try {
        const currentYear=await db.query("SELECT * FROM academic_year WHERE is_active=true LIMIT 1")
        if(currentYear.rows.length === 0){
            return res.status(404).json({
                message: 'No active academic year found.'
            })
        }
        const currentAcademicYearID = currentYear.rows[0].id

        const getCurrentTerm=await db.query(
            'SELECT * FROM academic_terms WHERE acyearId=$1 AND id=$2',
            [currentAcademicYearID, termId]
        )
        if(getCurrentTerm.rows.length === 0){
            return res.status(404).json({
                message: 'Term not found!'
            })
        }
        return res.status(200).json({
            message: 'Academic term fetched successfully',
            termData: getCurrentTerm.rows[0]
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Internal Server Error',
            ServerError: error.message
        })
    }
}

export const updateTerm=async(req, res)=>{
    const {termId}=req.params
    const {term_name, start_date, end_date, is_active}=req.body
    if(!termId) return res.status(400).json({ message: 'Term ID is required!' })

    try {
        const update=await db.query(
            'UPDATE academic_terms SET term_name=$1, start_date=$2, end_date=$3, is_active=$4 WHERE id=$5 RETURNING *',
            [term_name, start_date, end_date, is_active, termId]
        )
        if(!update || update.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'Academic Term not found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Academic Term updated successfully'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

export const updateStatusTerm=async(req,res)=>{
    const {termId, status}=req.params
    try {
        const update=await db.query('UPDATE academic_terms SET is_active=$1 WHERE id=$2 RETURNING *', [status, termId])
        if(!update || update.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: `Academic Term ID ${termId} not found`
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Academic Term status updated successfully'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

export const deleteTerm=async(req,res)=>{
    const {termId}=req.params
    if(!termId) return res.status(400).json({
        message: 'Term ID is required!'
    })
    try {
        const deleteTerm=await db.query('DELETE FROM academic_terms WHERE id=$1 RETURNING *', [termId])
        if(!deleteTerm || deleteTerm.rows.length === 0){
            return res.status(404).json({ message: 'Term not found' })
        }
        return res.status(200).json({
            message: 'Academic term deleted successfully'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}
