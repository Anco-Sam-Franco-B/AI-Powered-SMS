import db from "../Configs/Database.js";

export const insertStudents = async (students) => {
    try {
        await db.query('BEGIN');
        for (const s of students) {
            const sid = s.student_id || `STU${Date.now()}${Math.floor(Math.random()*1000)}`;
            await db.query(`
                INSERT INTO students(student_id, first_name, last_name, email, phone, date_of_birth, age, gender, address, class_id, enrollment_date, is_active)
                VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)
                ON CONFLICT (student_id) DO UPDATE SET
                first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, email=EXCLUDED.email,
                phone=EXCLUDED.phone, age=EXCLUDED.age, gender=EXCLUDED.gender, address=EXCLUDED.address,
                class_id=EXCLUDED.class_id, enrollment_date=EXCLUDED.enrollment_date
            `, [
                sid, s.first_name, s.last_name, s.email || null, s.phone || null,
                s.date_of_birth ? new Date(s.date_of_birth) : null, s.age || null, s.gender || null, s.address || null,
                s.class_id || null, s.enrollment_date ? new Date(s.enrollment_date) : new Date()
            ]);
        }
        await db.query('COMMIT');
        return { success: true, count: students.length };
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
};

export const insertCourses = async (courses) => {
    try {
        await db.query('BEGIN');
        for (const c of courses) {
            const code = c.course_code || `CRS${Date.now()}${Math.floor(Math.random()*1000)}`;
            await db.query(`
                INSERT INTO courses(course_code, course_name, instructor, credits, department, trade, description)
                VALUES($1,$2,$3,$4,$5,$6,$7)
                ON CONFLICT (course_code) DO UPDATE SET
                course_name=EXCLUDED.course_name, instructor=EXCLUDED.instructor,
                credits=EXCLUDED.credits, department=EXCLUDED.department,
                trade=EXCLUDED.trade, description=EXCLUDED.description
            `, [
                code, c.course_name, c.instructor || null, c.credits || 3,
                c.department || null, c.trade || null, c.description || null
            ]);
        }
        await db.query('COMMIT');
        return { success: true, count: courses.length };
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
};

export const insertMarks = async (marks) => {
    try {
        await db.query('BEGIN');
        for (const m of marks) {
            await db.query(`
                INSERT INTO marks(student_id, course_id, class_id, term_id, marks_obtained, total_marks, exam_type, grade)
                VALUES($1,$2,$3,$4,$5,$6,$7,$8)
                ON CONFLICT(student_id, course_id, term_id) DO UPDATE SET
                marks_obtained=EXCLUDED.marks_obtained, total_marks=EXCLUDED.total_marks,
                exam_type=EXCLUDED.exam_type, grade=EXCLUDED.grade
            `, [
                m.student_id, m.course_id, m.class_id || null, m.term_id || null,
                m.marks_obtained || m.marks || m.score, m.total_marks || 100,
                m.exam_type || 'Midterm', m.grade || null
            ]);
        }
        await db.query('COMMIT');
        return { success: true, count: marks.length };
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
};

export const insertAttendance = async (records) => {
    try {
        await db.query('BEGIN');
        for (const r of records) {
            const cd = r.date || r.class_date || new Date().toISOString().slice(0,10);
            await db.query(`
                INSERT INTO attendance(student_id, course_id, class_id, class_date, status)
                VALUES($1,$2,$3,$4,$5)
                ON CONFLICT(student_id, course_id, class_date) DO UPDATE SET status=EXCLUDED.status
            `, [
                r.student_id, r.course_id || null, r.class_id || null,
                cd, (r.status || 'present').toLowerCase()
            ]);
        }
        await db.query('COMMIT');
        return { success: true, count: records.length };
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
};

export const getStudents = async (limit = 5000, offset = 0) => {
    const result = await db.query('SELECT s.*, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id ORDER BY s.id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows;
};

export const getCourses = async (limit = 5000, offset = 0) => {
    const result = await db.query('SELECT * FROM courses ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows;
};
