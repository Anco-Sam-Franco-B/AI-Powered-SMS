import db from "../Configs/Database.js";

// ═══════════════════════════════════════════════
// CLASSES CRUD
// ═══════════════════════════════════════════════

export const getClasses = async (req, res) => {
  try {
    const { academic_year_id } = req.query
    let query = `SELECT c.id, c.class_name, c.section, c.capacity, c.academic_year_id, c.teacher_id, c.created_at,
                        ay.year_name FROM classes c
                 LEFT JOIN academic_year ay ON c.academic_year_id = ay.id`
    const params = []
    if (academic_year_id) {
      query += ` WHERE c.academic_year_id = $1`
      params.push(Number(academic_year_id))
    }
    query += ` ORDER BY c.id DESC`
    const result = await db.query(query, params)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('getClasses error:', error.message)
    try {
      const result = await db.query('SELECT * FROM classes ORDER BY id DESC')
      return res.json({ success: true, data: result.rows })
    } catch (e2) {
      res.status(500).json({ error: 'Failed to fetch classes', details: error.message })
    }
  }
}

export const addClass = async (req, res) => {
  const { class_name, section, academic_year_id, capacity } = req.body
  if (!class_name) return res.status(400).json({ error: 'Class name is required' })
  try {
    // Try with all columns first
    const result = await db.query(
      `INSERT INTO classes(class_name, section, academic_year_id, capacity)
       VALUES($1, $2, $3, $4) RETURNING id, class_name, section, capacity, academic_year_id, created_at`,
      [class_name, section || null, academic_year_id ? Number(academic_year_id) : null, capacity ? Number(capacity) : null]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    // Fallback: column might not exist — try with just class_name
    if (error.code === '42703') {
      try {
        const result = await db.query(
          'INSERT INTO classes(class_name) VALUES($1) RETURNING id, class_name, created_at',
          [class_name]
        )
        return res.status(201).json({ success: true, data: result.rows[0], note: 'Some columns were not available' })
      } catch (e2) {
        console.error('addClass fallback error:', e2.message)
        return res.status(500).json({ error: 'Failed to add class', details: e2.message })
      }
    }
    console.error('addClass error:', error.message, error.code, error.detail)
    res.status(500).json({ error: 'Failed to add class', details: error.message, code: error.code })
  }
}

export const updateClass = async (req, res) => {
  const { id } = req.params
  const { class_name, section, academic_year_id, capacity } = req.body
  try {
    const result = await db.query(
      'UPDATE classes SET class_name=$1, section=$2, academic_year_id=$3, capacity=$4 WHERE id=$5 RETURNING *',
      [class_name, section, academic_year_id, capacity, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Class not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class', details: error.message })
  }
}

export const deleteClass = async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.query('DELETE FROM classes WHERE id=$1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Class not found' })
    res.json({ success: true, message: 'Class deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class', details: error.message })
  }
}

// ═══════════════════════════════════════════════
// STUDENTS CRUD
// ═══════════════════════════════════════════════

export const getStudents = async (req, res) => {
  try {
    const { class_id } = req.query
    let query = `SELECT s.*, c.class_name FROM students s
                 LEFT JOIN classes c ON s.class_id = c.id`
    const params = []
    if (class_id) {
      query += ` WHERE s.class_id = $1`
      params.push(class_id)
    }
    query += ` ORDER BY s.first_name ASC`
    const result = await db.query(query, params)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students', details: error.message })
  }
}

export const addStudent = async (req, res) => {
  const { student_id, first_name, last_name, email, phone, date_of_birth, gender, address, class_id, enrollment_date } = req.body
  if (!first_name || !last_name) return res.status(400).json({ error: 'First and last name are required' })
  try {
    const sid = student_id || `STU${Date.now()}`
    const result = await db.query(
      `INSERT INTO students(student_id, first_name, last_name, email, phone, date_of_birth, gender, address, class_id, enrollment_date)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [sid, first_name, last_name, email || null, phone || null, date_of_birth || null, gender || null, address || null, class_id || null, enrollment_date || new Date()]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add student', details: error.message })
  }
}

export const updateStudent = async (req, res) => {
  const { id } = req.params
  const { first_name, last_name, email, phone, date_of_birth, gender, address, class_id, enrollment_date, is_active } = req.body
  try {
    const result = await db.query(
      `UPDATE students SET first_name=$1, last_name=$2, email=$3, phone=$4, date_of_birth=$5,
       gender=$6, address=$7, class_id=$8, enrollment_date=$9, is_active=$10
       WHERE id=$11 RETURNING *`,
      [first_name, last_name, email, phone, date_of_birth, gender, address, class_id, enrollment_date, is_active !== undefined ? is_active : true, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student', details: error.message })
  }
}

export const deleteStudent = async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.query('DELETE FROM students WHERE id=$1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' })
    res.json({ success: true, message: 'Student deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student', details: error.message })
  }
}

// ═══════════════════════════════════════════════
// COURSES CRUD
// ═══════════════════════════════════════════════

export const getCourses = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM courses ORDER BY id DESC')
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses', details: error.message })
  }
}

export const addCourse = async (req, res) => {
  const { course_code, course_name, instructor, credits, department, trade, description } = req.body
  if (!course_name) return res.status(400).json({ error: 'Course name is required' })
  try {
    const code = course_code || `CRS${Date.now()}`
    const result = await db.query(
      `INSERT INTO courses(course_code, course_name, instructor, credits, department, trade, description)
       VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [code, course_name, instructor || null, credits || 3, department || null, trade || null, description || null]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Course code already exists' })
    res.status(500).json({ error: 'Failed to add course', details: error.message })
  }
}

export const updateCourse = async (req, res) => {
  const { id } = req.params
  const { course_code, course_name, instructor, credits, department, trade, description } = req.body
  try {
    const result = await db.query(
      `UPDATE courses SET course_code=$1, course_name=$2, instructor=$3, credits=$4, department=$5, trade=$6, description=$7
       WHERE id=$8 RETURNING *`,
      [course_code, course_name, instructor, credits, department, trade, description, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course', details: error.message })
  }
}

export const deleteCourse = async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.query('DELETE FROM courses WHERE id=$1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' })
    res.json({ success: true, message: 'Course deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course', details: error.message })
  }
}

// ═══════════════════════════════════════════════
// MARKS CRUD
// ═══════════════════════════════════════════════

export const getMarks = async (req, res) => {
  try {
    const { term_id, class_id, course_id } = req.query
    let query = `SELECT m.*, s.first_name, s.last_name, s.student_id as stu_code, c.course_name, cl.class_name, t.term_name
       FROM marks m
       LEFT JOIN students s ON m.student_id = s.id
       LEFT JOIN courses c ON m.course_id = c.id
       LEFT JOIN classes cl ON m.class_id = cl.id
       LEFT JOIN academic_terms t ON m.term_id = t.id`
    const conditions = []
    const params = []
    if (term_id) { conditions.push(`m.term_id = $${params.length + 1}`); params.push(Number(term_id)) }
    if (class_id) { conditions.push(`m.class_id = $${params.length + 1}`); params.push(Number(class_id)) }
    if (course_id) { conditions.push(`m.course_id = $${params.length + 1}`); params.push(Number(course_id)) }
    if (conditions.length > 0) query += ` WHERE ` + conditions.join(' AND ')
    query += ` ORDER BY m.id DESC`
    const result = await db.query(query, params)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch marks', details: error.message })
  }
}

export const addMark = async (req, res) => {
  const { student_id, course_id, class_id, term_id, marks_obtained, total_marks, exam_type, grade } = req.body
  if (!student_id || !course_id || marks_obtained === undefined) {
    return res.status(400).json({ error: 'student_id, course_id, and marks_obtained are required' })
  }
  try {
    const result = await db.query(
      `INSERT INTO marks(student_id, course_id, class_id, term_id, marks_obtained, total_marks, exam_type, grade)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT(student_id, course_id, term_id)
       DO UPDATE SET marks_obtained=$5, total_marks=$6, exam_type=$7, grade=$8
       RETURNING *`,
      [student_id, course_id, class_id || null, term_id || null, marks_obtained, total_marks || 100, exam_type || 'Midterm', grade || null]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add mark', details: error.message })
  }
}

export const updateMark = async (req, res) => {
  const { id } = req.params
  const { marks_obtained, total_marks, exam_type, grade, course_id, term_id, class_id } = req.body
  try {
    const result = await db.query(
      `UPDATE marks SET marks_obtained=$1, total_marks=$2, exam_type=$3, grade=$4, course_id=$5, term_id=$6, class_id=$7
       WHERE id=$8 RETURNING *`,
      [marks_obtained, total_marks, exam_type, grade, course_id, term_id, class_id, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mark not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mark', details: error.message })
  }
}

export const bulkMarks = async (req, res) => {
  const { records } = req.body
  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'records array is required' })
  }
  try {
    const results = []
    const errors = []
    for (let i = 0; i < records.length; i++) {
      const r = records[i]
      if (!r.student_id || !r.course_id || r.marks_obtained === undefined) {
        errors.push({ index: i, error: 'student_id, course_id, and marks_obtained are required', record: r })
        continue
      }
      try {
        const grade = r.grade || (r.total_marks
          ? (Number(r.marks_obtained) / Number(r.total_marks)) >= 0.9 ? 'A+'
            : (Number(r.marks_obtained) / Number(r.total_marks)) >= 0.8 ? 'A'
            : (Number(r.marks_obtained) / Number(r.total_marks)) >= 0.7 ? 'B'
            : (Number(r.marks_obtained) / Number(r.total_marks)) >= 0.6 ? 'C'
            : (Number(r.marks_obtained) / Number(r.total_marks)) >= 0.5 ? 'D'
            : 'F'
          : null)
        const result = await db.query(
          `INSERT INTO marks(student_id, course_id, class_id, term_id, marks_obtained, total_marks, exam_type, grade)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT(student_id, course_id, term_id)
           DO UPDATE SET marks_obtained=$5, total_marks=$6, exam_type=$7, grade=$8
           RETURNING *`,
          [r.student_id, r.course_id, r.class_id || null, r.term_id || null, Number(r.marks_obtained), Number(r.total_marks) || 100, r.exam_type || 'Midterm', grade]
        )
        results.push(result.rows[0])
      } catch (err) {
        errors.push({ index: i, error: err.message, record: r })
      }
    }
    res.status(201).json({ success: true, data: results, errors: errors.length > 0 ? errors : undefined, count: results.length })
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk insert marks', details: error.message })
  }
}

export const deleteMark = async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.query('DELETE FROM marks WHERE id=$1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mark not found' })
    res.json({ success: true, message: 'Mark deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mark', details: error.message })
  }
}

// ═══════════════════════════════════════════════
// ATTENDANCE CRUD
// ═══════════════════════════════════════════════

export const getAttendance = async (req, res) => {
  try {
    const { class_id, course_id, start_date, end_date } = req.query
    let query = `SELECT a.*, s.first_name, s.last_name, s.student_id as stu_code, c.course_name, cl.class_name
       FROM attendance a
       LEFT JOIN students s ON a.student_id = s.id
       LEFT JOIN courses c ON a.course_id = c.id
       LEFT JOIN classes cl ON a.class_id = cl.id`
    const conditions = []
    const params = []
    if (class_id) { conditions.push(`a.class_id = $${params.length + 1}`); params.push(Number(class_id)) }
    if (course_id) { conditions.push(`a.course_id = $${params.length + 1}`); params.push(Number(course_id)) }
    if (start_date) { conditions.push(`a.class_date >= $${params.length + 1}`); params.push(start_date) }
    if (end_date) { conditions.push(`a.class_date <= $${params.length + 1}`); params.push(end_date) }
    if (conditions.length > 0) query += ` WHERE ` + conditions.join(' AND ')
    query += ` ORDER BY a.class_date DESC, a.id DESC`
    const result = await db.query(query, params)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message })
  }
}

export const addAttendance = async (req, res) => {
  const { student_id, course_id, class_id, date, class_date, status } = req.body
  const cd = date || class_date
  if (!student_id || !cd || !status) {
    return res.status(400).json({ error: 'student_id, date, and status are required' })
  }
  if (!['present', 'absent', 'late', 'excused', 'Present', 'Absent', 'Late', 'Excused'].includes(status)) {
    return res.status(400).json({ error: 'Status must be: present, absent, late, or excused' })
  }
  try {
    const result = await db.query(
      `INSERT INTO attendance(student_id, course_id, class_id, class_date, status, recorded_by)
       VALUES($1, $2, $3, $4, $5, $6)
        ON CONFLICT(student_id, course_id, class_date)
        DO UPDATE SET status=$5
        RETURNING *`,
      [Number(student_id), course_id ? Number(course_id) : null, class_id ? Number(class_id) : null, cd, status.toLowerCase(), req.user?.userId || null]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('addAttendance error:', error.message, error.code, error.detail)
    res.status(500).json({ error: 'Failed to add attendance', details: error.message, code: error.code })
  }
}

export const updateAttendance = async (req, res) => {
  const { id } = req.params
  const { status, course_id, class_id } = req.body
  try {
    const result = await db.query(
      'UPDATE attendance SET status=$1, course_id=$2, class_id=$3 WHERE id=$4 RETURNING *',
      [status, course_id, class_id, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Attendance not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance', details: error.message })
  }
}

export const deleteAttendance = async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.query('DELETE FROM attendance WHERE id=$1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Attendance not found' })
    res.json({ success: true, message: 'Attendance deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attendance', details: error.message })
  }
}

export const bulkAttendance = async (req, res) => {
  const { records } = req.body
  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'records array is required' })
  }
  try {
    const results = []
    const errors = []
    for (const r of records) {
      const cd = r.date || r.class_date || r.classDate
      if (!r.student_id || !cd || !r.status) {
        errors.push({ student_id: r.student_id, error: 'Missing required fields' })
        continue
      }
      try {
        const result = await db.query(
          `INSERT INTO attendance(student_id, course_id, class_id, class_date, status, recorded_by)
           VALUES($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            Number(r.student_id),
            r.course_id ? Number(r.course_id) : null,
            r.class_id ? Number(r.class_id) : null,
            cd,
            r.status.toLowerCase(),
            req.user?.userId || null
          ]
        )
        results.push(result.rows[0])
      } catch (err) {
        // If INSERT fails (e.g. missing unique constraint), try with ON CONFLICT
        if (err.code === '42P10' || err.message?.includes('ON CONFLICT')) {
          try {
            const result = await db.query(
              `INSERT INTO attendance(student_id, course_id, class_id, class_date, status, recorded_by)
               VALUES($1, $2, $3, $4, $5, $6)
               ON CONFLICT(student_id, course_id, class_date)
               DO UPDATE SET status=$5
               RETURNING *`,
              [
                Number(r.student_id),
                r.course_id ? Number(r.course_id) : null,
                r.class_id ? Number(r.class_id) : null,
                cd,
                r.status.toLowerCase(),
                req.user?.userId || null
              ]
            )
            results.push(result.rows[0])
          } catch (err2) {
            errors.push({ student_id: r.student_id, error: err2.message, code: err2.code })
          }
        } else if (err.code === '23505') {
          // Duplicate — update instead
          try {
            const result = await db.query(
              `UPDATE attendance SET status=$1 WHERE student_id=$2 AND class_date=$3 AND (course_id=$4 OR course_id IS NULL) RETURNING *`,
              [r.status.toLowerCase(), Number(r.student_id), cd, r.course_id ? Number(r.course_id) : null]
            )
            if (result.rows.length > 0) results.push(result.rows[0])
            else errors.push({ student_id: r.student_id, error: 'Could not update attendance' })
          } catch (err3) {
            errors.push({ student_id: r.student_id, error: err3.message, code: err3.code })
          }
        } else {
          errors.push({ student_id: r.student_id, error: err.message, code: err.code })
        }
      }
    }
    res.status(201).json({
      success: true, data: results,
      errors: errors.length > 0 ? errors : undefined,
      count: results.length
    })
  } catch (error) {
    console.error('bulkAttendance error:', error.message, error.code, error.detail)
    res.status(500).json({ error: 'Failed to bulk insert attendance', details: error.message, code: error.code })
  }
}

// ═══════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// ACADEMIC YEARS CRUD
// ═══════════════════════════════════════════════

export const getAcademicYears = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM academic_year ORDER BY id DESC')
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch academic years', details: error.message })
  }
}

export const addAcademicYear = async (req, res) => {
  const { name, year_name, start_date, end_date, is_current, is_active } = req.body
  const yn = name || year_name
  if (!yn) return res.status(400).json({ error: 'Year name is required' })
  try {
    const active = is_current !== undefined ? is_current : (is_active !== undefined ? is_active : false)
    const result = await db.query(
      'INSERT INTO academic_year(year_name, start_date, end_date, is_active) VALUES($1, $2, $3, $4) RETURNING *',
      [yn, start_date || null, end_date || null, active]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Academic year name must be unique' })
    res.status(500).json({ error: 'Failed to add academic year', details: error.message })
  }
}

export const updateAcademicYear = async (req, res) => {
  const { id } = req.params
  const { name, year_name, start_date, end_date, is_current, is_active } = req.body
  try {
    const yn = name || year_name
    const active = is_current !== undefined ? is_current : is_active
    const result = await db.query(
      'UPDATE academic_year SET year_name=$1, start_date=$2, end_date=$3, is_active=$4 WHERE id=$5 RETURNING *',
      [yn, start_date, end_date, active !== undefined ? active : false, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Academic year not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update academic year', details: error.message })
  }
}

export const deleteAcademicYear = async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.query('DELETE FROM academic_year WHERE id=$1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Academic year not found' })
    res.json({ success: true, message: 'Academic year deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete academic year', details: error.message })
  }
}

// ═══════════════════════════════════════════════
// ACADEMIC TERMS CRUD
// ═══════════════════════════════════════════════

export const getAcademicTerms = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, ay.year_name FROM academic_terms t
       LEFT JOIN academic_year ay ON t.acyearId = ay.id
       ORDER BY t.id DESC`
    )
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch academic terms', details: error.message })
  }
}

export const addAcademicTerm = async (req, res) => {
  const { name, term_name, academic_year_id, acyearId, start_date, end_date, is_current, is_active } = req.body
  const tn = name || term_name
  const ayId = academic_year_id || acyearId
  if (!tn || !start_date || !end_date || !ayId) {
    return res.status(400).json({ error: 'term_name, start_date, end_date, and academic_year_id are required' })
  }
  try {
    const active = is_current !== undefined ? is_current : (is_active !== undefined ? is_active : false)
    const result = await db.query(
      'INSERT INTO academic_terms(acyearId, term_name, start_date, end_date, is_active) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [ayId, tn, start_date, end_date, active]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Term name already exists for this academic year' })
    res.status(500).json({ error: 'Failed to add term', details: error.message })
  }
}

export const updateAcademicTerm = async (req, res) => {
  const { id } = req.params
  const { name, term_name, start_date, end_date, is_current, is_active } = req.body
  try {
    const tn = name || term_name
    const active = is_current !== undefined ? is_current : is_active
    const result = await db.query(
      'UPDATE academic_terms SET term_name=$1, start_date=$2, end_date=$3, is_active=$4 WHERE id=$5 RETURNING *',
      [tn, start_date, end_date, active !== undefined ? active : false, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Term not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update term', details: error.message })
  }
}

export const deleteAcademicTerm = async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.query('DELETE FROM academic_terms WHERE id=$1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Term not found' })
    res.json({ success: true, message: 'Term deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete term', details: error.message })
  }
}

// ═══════════════════════════════════════════════
// CURRENT ACADEMIC INFO
// ═══════════════════════════════════════════════

export const getCurrentAcademicInfo = async (req, res) => {
  try {
    const yearResult = await db.query(
      "SELECT * FROM academic_year WHERE is_active=true LIMIT 1"
    )
    if (yearResult.rows.length === 0) {
      return res.json({ success: true, data: { year: null, term: null } })
    }
    const year = yearResult.rows[0]
    const termResult = await db.query(
      "SELECT * FROM academic_terms WHERE acyearId=$1 AND is_active=true ORDER BY id DESC LIMIT 1",
      [year.id]
    )
    const term = termResult.rows[0] || null
    const allTermsResult = await db.query(
      "SELECT * FROM academic_terms WHERE acyearId=$1 ORDER BY id ASC",
      [year.id]
    )
    res.json({
      success: true,
      data: { year, term, terms: allTermsResult.rows },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current academic info', details: error.message })
  }
}

export const getMessages = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM messages ORDER BY sent_at DESC')
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message })
  }
}

export const sendMessage = async (req, res) => {
  const { recipient_type, recipient_ids, message_type, subject, body } = req.body
  if (!recipient_type || !body) return res.status(400).json({ error: 'recipient_type and body are required' })
  try {
    const result = await db.query(
      `INSERT INTO messages(recipient_type, recipient_ids, message_type, subject, body, sent_by)
       VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      [recipient_type, recipient_ids || null, message_type || 'general', subject || null, body, req.user?.userId || null]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', details: error.message })
  }
}
