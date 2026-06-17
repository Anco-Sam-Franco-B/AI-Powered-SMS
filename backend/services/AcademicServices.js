import db from "../Configs/Database.js";

export const insertAcademicYear=async(data)=>{
    await db.query('BEGIN')

    try {

        const checkYearName=await db.query(`SELECT * FROM academic_year WHERE year_name='${data.yearname}'`)
        if(!checkYearName){
            const recordAcademicYear=await db.query(`INSERT INTO academic_year(year_name, is_active) VALUES('${data.yearname}', '${data.isActive}')`)
            if(!recordAcademicYear){
                return{
                    success: false,
                    message: 'Something went wrong! Academic year not added!'
                }
            }
            return {
                success: true,
                message: 'New academic year added successfuly!'
            }

            await db.query('COMMIT');
        }
        else{
            return {
                success: false,
                message: 'Academic year must be unique!'
            }
        }

    } catch (error) {
        await db.query('ROLLBACK')
        throw error
    }
}