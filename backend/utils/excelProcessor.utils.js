import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

export const readExcelFile = (filePath) => {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(worksheet, { defval: '', raw: false });
    } catch (error) {
        throw new Error(`Error reading Excel file: ${error.message}`);
    }
};

export const validateStudentData = (data) => {
    const errors = [];
    data.forEach((row, index) => {
        if (!row.first_name) errors.push(`Row ${index + 2}: Missing required field 'first_name'`);
        if (!row.last_name) errors.push(`Row ${index + 2}: Missing required field 'last_name'`);
        if (!row.email) errors.push(`Row ${index + 2}: Missing required field 'email'`);
        if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            errors.push(`Row ${index + 2}: Invalid email format`);
        }
        if (row.age && (isNaN(row.age) || row.age < 0 || row.age > 120)) {
            errors.push(`Row ${index + 2}: Invalid age value`);
        }
    });
    return errors;
};

export const validateCourseData = (data) => {
    const requiredFields = ['course_code', 'course_name'];
    const errors = [];
    data.forEach((row, index) => {
        requiredFields.forEach(field => {
            if (!row[field]) {
                errors.push(`Row ${index + 2}: Missing required field '${field}'`);
            }
        });
        if (row.credits && (isNaN(row.credits) || row.credits < 0)) {
            errors.push(`Row ${index + 2}: Invalid credits value`);
        }
    });
    return errors;
};

export const validateMarkData = (data) => {
    const errors = [];
    data.forEach((row, index) => {
        if (!row.student_id) errors.push(`Row ${index + 2}: Missing required field 'student_id'`);
        if (!row.course_id) errors.push(`Row ${index + 2}: Missing required field 'course_id'`);
        const marks = row.marks_obtained !== '' ? row.marks_obtained : undefined;
        if (marks === undefined || marks === null) errors.push(`Row ${index + 2}: Missing marks/score`);
        if (marks !== undefined && marks !== null && (isNaN(Number(marks)) || Number(marks) < 0)) {
            errors.push(`Row ${index + 2}: Invalid marks value '${marks}'`);
        }
    });
    return errors;
};

export const validateAttendanceData = (data) => {
    const errors = [];
    data.forEach((row, index) => {
        if (!row.student_id) errors.push(`Row ${index + 2}: Missing required field 'student_id'`);
        if (row.status && !['present','absent','late','excused','Present','Absent','Late','Excused'].includes(row.status)) {
            errors.push(`Row ${index + 2}: Status must be present, absent, late, or excused`);
        }
    });
    return errors;
};
