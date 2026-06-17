import db from "../Configs/Database.js";

export const newAcademicYear=async(req, res)=>{
    const {yearname, isActive}=req.body
    if(!yearname || isActive === undefined){
        return res.status(400).json({
            message: 'All inputs are required'
        })
    }

    try {        
        const recordAcademicYear=await db.query('INSERT INTO academic_year(year_name, is_active) VALUES($1, $2) RETURNING *', [yearname, isActive])
        if(!recordAcademicYear){
            return res.status(500).json({
                success: false,
                message: 'Something went wrong! Academic year not added!'
            })
        }
        return res.status(201).json({
            success: true,
            message: 'New academic year added successfully!'
        })
        
    } catch (error) {
        console.error(error)
        if(error.code === '23505'){
            return res.status(500).json({
                success: false,
                message: 'Academic year name must be unique!'
            })
        }
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

export const getAcademicYear=async(req, res)=>{
    try {
        const data=await db.query('SELECT * FROM academic_year ORDER BY id DESC')
        if(!data){
            return res.status(500).json({
                message: 'Failed to fetch academic year'
            })
        }

        return res.status(200).json({
            message: 'Academic Year Fetched!',
            academicYear: data.rows
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

export const getOneAcademicYear=async(req, res)=>{
    const {yearId}=req.params
    if(!yearId){
        return res.status(404).json({
            message: 'Academic year ID is required!'
        })
    }
    try {
        const data=await db.query('SELECT * FROM academic_year WHERE id=$1 LIMIT 1', [yearId])
        if(!data || data.rows.length === 0){
            return res.status(500).json({
                message: 'Failed to fetch academic year info'
            })
        }

        return res.status(200).json({
            message: 'Academic Year information Fetched!',
            academicYear: data.rows[0]
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

export const updateStatusYear=async(req,res)=>{
    const {yearId, status}=req.params
    try {
        const update=await db.query('UPDATE academic_year SET is_active=$1 WHERE id=$2 RETURNING *', [status, yearId])
        if(!update || update.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: `Academic Year ID ${yearId} not found`
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Academic year status updated successfully'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

export const updateYear=async(req, res)=>{
    const {yearId}=req.params
    const {year_name}=req.body
    if(!year_name){
        return res.status(400).json({
            message: 'All inputs are required'
        })
    }
    if(!yearId){
        return res.status(404).json({
            message: 'Academic year ID is required!'
        })
    }
    try {
        const updateYear=await db.query('UPDATE academic_year SET year_name=$1 WHERE id=$2 RETURNING *', [year_name, yearId])
        if(!updateYear || updateYear.rows.length === 0){
            return res.status(404).json({
                message: 'Failed to update year or year ID not found!'
            })
        }
        return res.status(200).json({
            message: 'Academic year updated successfully!'
        })
    } catch (error) {
        console.error(error)
        if(error.code === '23505'){
            return res.status(500).json({
                message: 'Academic year name must be unique!'
            })
        }
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
}
