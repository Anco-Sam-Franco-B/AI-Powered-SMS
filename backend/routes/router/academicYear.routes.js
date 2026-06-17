import express from 'express'
import { getAcademicYear, getOneAcademicYear, newAcademicYear, updateStatusYear, updateYear } from '../../controllers/academicYear.Controller.js'
import { deleteTerm, getTerm, getTerms, newTerm, updateStatusTerm, updateTerm } from '../../controllers/academicTerms.controller.js'

const academicYear=express.Router()

//Academic Years Routes
academicYear.get('/view-year', getAcademicYear)
academicYear.get('/view-year/:yearId', getOneAcademicYear)
academicYear.post('/new-year', newAcademicYear)
academicYear.patch('/update-status/year/:yearId/status/:status', updateStatusYear)
academicYear.put('/update/year/:yearId', updateYear)

//Academic Terms Routes
academicYear.get('/view-term', getTerms)
academicYear.get('/view-term/:termId', getTerm)
academicYear.post('/new-term/:yearId', newTerm)
academicYear.patch('/update-status/term/:termId/status/:status', updateStatusTerm)
academicYear.put('/update/term/:termId', updateTerm)
academicYear.delete('/delete/term/:termId', deleteTerm)

export default academicYear