import db from './Database.js'

const initDB = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'teacher',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await db.query(`
            CREATE TABLE IF NOT EXISTS academic_year(
                id SERIAL PRIMARY KEY,
                year_name VARCHAR(20) NOT NULL UNIQUE,
                start_date DATE,
                end_date DATE,
                is_active BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await db.query(`
            CREATE TABLE IF NOT EXISTS academic_terms(
                id SERIAL PRIMARY KEY,
                acyearId INT REFERENCES academic_year(id) ON DELETE CASCADE,
                term_name VARCHAR(20) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                is_active BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(acyearId, term_name)
            )
        `)

        await db.query(`
            CREATE TABLE IF NOT EXISTS classes(
                id SERIAL PRIMARY KEY,
                class_name VARCHAR(50) NOT NULL,
                section VARCHAR(20),
                capacity INT DEFAULT 30,
                academic_year_id INT REFERENCES academic_year(id),
                teacher_id INT REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `)
        // Ensure missing columns exist on existing tables
        await db.query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS section VARCHAR(20)`).catch(() => {})
        await db.query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 30`).catch(() => {})
        await db.query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS teacher_id INT REFERENCES users(id)`).catch(() => {})

        await db.query(`
            CREATE TABLE IF NOT EXISTS students(
                id SERIAL PRIMARY KEY,
                student_id VARCHAR(20) UNIQUE NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100),
                date_of_birth DATE,
                age INT,
                phone VARCHAR(20),
                gender VARCHAR(10),
                address TEXT,
                class_id INT REFERENCES classes(id),
                enrollment_date DATE DEFAULT CURRENT_DATE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `)
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(10)`).catch(() => {})
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`).catch(() => {})

        await db.query(`
            CREATE TABLE IF NOT EXISTS courses(
                id SERIAL PRIMARY KEY,
                course_code VARCHAR(20) UNIQUE NOT NULL,
                course_name VARCHAR(100) NOT NULL,
                instructor VARCHAR(100),
                credits INT DEFAULT 3,
                department VARCHAR(50),
                trade VARCHAR(50),
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await db.query(`
            CREATE TABLE IF NOT EXISTS marks(
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                course_id INT REFERENCES courses(id) ON DELETE CASCADE,
                class_id INT REFERENCES classes(id) ON DELETE SET NULL,
                term_id INT REFERENCES academic_terms(id) ON DELETE CASCADE,
                marks_obtained DECIMAL(5,2) NOT NULL,
                total_marks DECIMAL(5,2) DEFAULT 100,
                exam_type VARCHAR(20) DEFAULT 'Midterm',
                grade VARCHAR(2),
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, course_id, term_id)
            )
        `)
        await db.query(`ALTER TABLE marks ADD COLUMN IF NOT EXISTS exam_type VARCHAR(20) DEFAULT 'Midterm'`).catch(() => {})
        await db.query(`ALTER TABLE marks ADD COLUMN IF NOT EXISTS grade VARCHAR(2)`).catch(() => {})
        await db.query(`ALTER TABLE marks ADD COLUMN IF NOT EXISTS class_id INT REFERENCES classes(id) ON DELETE SET NULL`).catch(() => {})

        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance(
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                course_id INT REFERENCES courses(id) ON DELETE CASCADE,
                class_id INT REFERENCES classes(id) ON DELETE SET NULL,
                class_date DATE NOT NULL,
                status VARCHAR(10) CHECK (status IN ('present','absent','late','excused')),
                recorded_by INT REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, course_id, class_date)
            )
        `)
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS class_id INT REFERENCES classes(id) ON DELETE SET NULL`).catch(() => {})
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS course_id INT REFERENCES courses(id) ON DELETE CASCADE`).catch(() => {})

        await db.query(`
            CREATE TABLE IF NOT EXISTS messages(
                id SERIAL PRIMARY KEY,
                recipient_type VARCHAR(20) NOT NULL,
                recipient_ids TEXT,
                message_type VARCHAR(20) NOT NULL,
                subject VARCHAR(200),
                body TEXT NOT NULL,
                sent_by INT REFERENCES users(id),
                sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `)

        console.log('All database tables created successfully')
    } catch (error) {
        console.log('Failed to create database tables', error)
    }
}

export default initDB
