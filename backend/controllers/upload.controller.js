import { readExcelFile, validateStudentData, validateCourseData, validateMarkData, validateAttendanceData } from '../utils/excelProcessor.utils.js';
import { insertStudents, insertCourses, insertMarks, insertAttendance, getStudents, getCourses } from '../services/UploadServices.js';
import fs from 'fs';

const normalizeCol = (k) => k.trim().replace(/[\s_-]+/g, '_').toLowerCase().replace(/^_|_$/g, '')

const COLUMN_ALIASES = {
  first_name: ['first_name', 'firstname', 'first name', 'fname', 'given_name', 'givenname'],
  last_name: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'family_name', 'familyname'],
  student_id: ['student_id', 'studentid', 'student id', 'id', 'std_id', 'stid', 'admission_no', 'admission_number', 'roll_no', 'rollno'],
  course_code: ['course_code', 'course_code', 'coursecode', 'code', 'course id', 'course_id', 'courseid', 'subject_code', 'sub_code'],
  course_name: ['course_name', 'coursename', 'course name', 'name', 'subject_name', 'subject', 'course_title'],
  email: ['email', 'e-mail', 'mail', 'email_address', 'emailaddress'],
  phone: ['phone', 'telephone', 'tel', 'mobile', 'contact_no', 'contact', 'phone_number'],
  date_of_birth: ['date_of_birth', 'dob', 'birth_date', 'birthdate', 'dateofbirth', 'birthday'],
  marks_obtained: ['marks_obtained', 'marks', 'marksobtained', 'score', 'obtained_marks', 'marks_scored', 'grade_score', 'mark'],
  total_marks: ['total_marks', 'totalmarks', 'total', 'max_marks', 'maxmarks', 'out_of', 'full_marks'],
  exam_type: ['exam_type', 'examtype', 'exam', 'exam_type', 'examination', 'assessment_type', 'test_type'],
  class_id: ['class_id', 'classid', 'class', 'class_name', 'section', 'grade_id', 'cls_id'],
  term_id: ['term_id', 'termid', 'term', 'semester', 'sem', 'semester_id'],
  status: ['status', 'attendance_status', 'att_status', 'present_status'],
  date: ['date', 'class_date', 'attendance_date', 'attendancedate', 'record_date', 'entry_date'],
  gender: ['gender', 'sex'],
  address: ['address', 'addr', 'location'],
  enrollment_date: ['enrollment_date', 'enrolment_date', 'enrollmentdate', 'enrolmentdate', 'join_date', 'joining_date'],
  instructor: ['instructor', 'teacher', 'professor', 'lecturer'],
  credits: ['credits', 'credit', 'credit_hours', 'credithours'],
  department: ['department', 'dept', 'department_name'],
  trade: ['trade', 'stream', 'branch', 'specialization'],
  description: ['description', 'desc', 'details', 'about'],
  grade: ['grade', 'letter_grade', 'lettergrade']
}

function normalizeRow(row) {
  const normalized = {}
  const aliasMap = {}
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) aliasMap[alias] = canonical
  }
  for (const [key, val] of Object.entries(row)) {
    const nk = normalizeCol(key)
    const mapped = aliasMap[nk] || nk
    normalized[mapped] = val
  }
  return normalized
}

export const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const table = req.params.table;
        
        if (!['students', 'courses'].includes(table)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Invalid table specified. Use "students" or "courses"' });
        }

        const filePath = req.file.path;
        const data = readExcelFile(filePath).map(normalizeRow);

        if (data.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        let validationErrors = [];
        if (table === 'students') {
            validationErrors = validateStudentData(data);
        } else if (table === 'courses') {
            validationErrors = validateCourseData(data);
        }

        if (validationErrors.length > 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: validationErrors 
            });
        }

        let result;
        if (table === 'students') {
            result = await insertStudents(data);
        } else if (table === 'courses') {
            result = await insertCourses(data);
        }

        fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: `${data.length} records successfully imported into ${table} table`,
            count: data.length
        });

    } catch (error) {
        console.error('Upload error:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            error: 'Error processing file',
            details: error.message 
        });
    }
};

export const uploadExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const filePath = req.file.path;

        const raw = readExcelFile(filePath);
        if (raw.length === 0) { fs.unlinkSync(filePath); return res.status(400).json({ error: 'Excel/CSV file is empty' }); }

        const data = raw.map(normalizeRow);
        const firstRow = data[0];
        const columns = Object.keys(firstRow);

        let table = 'unknown';
        if (columns.includes('first_name') && columns.includes('last_name')) table = 'students';
        else if (columns.includes('course_code') && columns.includes('course_name')) table = 'courses';
        else if (columns.some(c => ['marks_obtained', 'marks', 'score', 'mark'].includes(c))) table = 'marks';
        else if (columns.includes('status') && columns.some(c => ['date', 'class_date'].includes(c))) table = 'attendance';

        if (table === 'unknown') {
            fs.unlinkSync(filePath);
            const hints = []
            if (columns.some(c => ['first_name', 'firstname', 'fname', 'given_name'].includes(c)) !== columns.includes('last_name'))
                hints.push('For "students": include both first_name AND last_name columns')
            if (columns.includes('first_name') && columns.includes('last_name')) hints.push('→ students table detected ✓')
            if (columns.some(c => ['marks_obtained', 'marks', 'score', 'mark'].includes(c))) hints.push('→ marks table detected ✓')
            if (columns.includes('status') && columns.some(c => ['date', 'class_date'].includes(c))) hints.push('→ attendance table detected ✓')
            if (columns.some(c => ['course_code', 'coursecode'].includes(c)) && columns.some(c => ['course_name', 'coursename', 'subject'].includes(c))) hints.push('→ courses table detected ✓')

            return res.status(400).json({
                error: 'Could not detect table type from columns',
                detected_columns: columns,
                hints
            });
        }

        let validationErrors = [];
        if (table === 'students') validationErrors = validateStudentData(data);
        else if (table === 'courses') validationErrors = validateCourseData(data);
        else if (table === 'marks') validationErrors = validateMarkData(data);
        else if (table === 'attendance') validationErrors = validateAttendanceData(data);

        if (validationErrors.length > 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Validation failed', details: validationErrors });
        }

        let result;
        if (table === 'students') result = await insertStudents(data);
        else if (table === 'courses') result = await insertCourses(data);
        else if (table === 'marks') result = await insertMarks(data);
        else if (table === 'attendance') result = await insertAttendance(data);

        fs.unlinkSync(filePath);
        res.json({ success: true, message: `${data.length} records imported into ${table} table`, count: data.length, table });
    } catch (error) {
        console.error('Upload Excel error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Error processing file', details: error.message });
    }
};

export const listStudents = async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;
        const students = await getStudents(Number(limit), Number(offset));
        res.json({ success: true, data: students, count: students.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students', details: error.message });
    }
};

export const listCourses = async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;
        const courses = await getCourses(Number(limit), Number(offset));
        res.json({ success: true, data: courses, count: courses.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }
};
