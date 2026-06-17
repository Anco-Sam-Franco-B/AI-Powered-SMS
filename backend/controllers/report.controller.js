import db from "../Configs/Database.js";
import xlsx from 'xlsx';
import PDFDocument from 'pdfkit';

const fetchReportData = async (type) => {
  let data = []
  let headers = []
  let title = ''

  switch (type) {
    case 'performance': {
      title = 'Performance Report'
      headers = ['Student ID', 'First Name', 'Last Name', 'Course', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade', 'Exam Type']
      const result = await db.query(`
        SELECT s.student_id, s.first_name, s.last_name, c.course_name,
               m.marks_obtained, m.total_marks, m.grade, m.exam_type
        FROM marks m
        JOIN students s ON m.student_id = s.id
        JOIN courses c ON m.course_id = c.id
        ORDER BY s.first_name, c.course_name
      `)
      data = result.rows.map(r => [
        r.student_id, r.first_name, r.last_name, r.course_name,
        Number(r.marks_obtained), Number(r.total_marks),
        r.total_marks ? ((r.marks_obtained / r.total_marks) * 100).toFixed(1) + '%' : 'N/A',
        r.grade || '', r.exam_type
      ])
      break
    }
    case 'attendance': {
      title = 'Attendance Report'
      headers = ['Student ID', 'First Name', 'Last Name', 'Date', 'Status', 'Course']
      const result = await db.query(`
        SELECT s.student_id, s.first_name, s.last_name, a.class_date, a.status, c.course_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        LEFT JOIN courses c ON a.course_id = c.id
        ORDER BY a.class_date DESC, s.first_name
      `)
      data = result.rows.map(r => [
        r.student_id, r.first_name, r.last_name,
        r.class_date ? new Date(r.class_date).toISOString().slice(0, 10) : '',
        r.status.charAt(0).toUpperCase() + r.status.slice(1), r.course_name || ''
      ])
      break
    }
    case 'students': {
      title = 'Student Directory'
      headers = ['Student ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Class', 'Enrollment Date', 'Status']
      const result = await db.query(`
        SELECT s.student_id, s.first_name, s.last_name, s.email, s.phone,
               s.gender, c.class_name, s.enrollment_date, s.is_active
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        ORDER BY s.first_name
      `)
      data = result.rows.map(r => [
        r.student_id, r.first_name, r.last_name, r.email || '',
        r.phone || '', r.gender || '', r.class_name || '',
        r.enrollment_date ? new Date(r.enrollment_date).toISOString().slice(0, 10) : '',
        r.is_active ? 'Active' : 'Inactive'
      ])
      break
    }
    case 'risk': {
      title = 'Risk Analysis'
      headers = ['Student ID', 'First Name', 'Last Name', 'Attendance Rate', 'Avg Score', 'Risk Status']
      const result = await db.query(`
        SELECT s.student_id, s.first_name, s.last_name,
          COALESCE(
            (SELECT ROUND(AVG(CASE WHEN a.status='present' THEN 100 ELSE 0 END), 1)
             FROM attendance a WHERE a.student_id = s.id), 0
          ) as attendance_rate,
          COALESCE(
            (SELECT ROUND(AVG(m.marks_obtained / NULLIF(m.total_marks, 0) * 100), 1)
             FROM marks m WHERE m.student_id = s.id), 0
          ) as avg_score
        FROM students s
        ORDER BY avg_score ASC
      `)
      data = result.rows.map(r => [
        r.student_id, r.first_name, r.last_name,
        r.attendance_rate + '%', r.avg_score + '%',
        r.avg_score < 50 ? 'At Risk' : r.avg_score < 70 ? 'Needs Attention' : 'On Track'
      ])
      break
    }
    default: {
      title = 'Academic Summary'
      headers = ['Metric', 'Value', 'Details']
      const [
        { rows: [sc] }, { rows: [cc] }, { rows: [crc] },
        { rows: [mc] }, { rows: [ac] }, { rows: activeTerm }
      ] = await Promise.all([
        db.query("SELECT COUNT(*)::int as count FROM students"),
        db.query("SELECT COUNT(*)::int as count FROM classes"),
        db.query("SELECT COUNT(*)::int as count FROM courses"),
        db.query("SELECT COUNT(*)::int as count FROM marks"),
        db.query("SELECT COUNT(*)::int as count FROM attendance"),
        db.query("SELECT term_name, start_date, end_date FROM academic_terms WHERE is_active=true LIMIT 1")
      ])
      const term = activeTerm[0]
      data = [
        ['Report Generated', new Date().toLocaleString(), ''],
        ['Active Students', sc.count, 'Currently enrolled'],
        ['Classes', cc.count, 'Active classes'],
        ['Courses', crc.count, 'Available courses'],
        ['Marks Records', mc.count, 'Exam entries'],
        ['Attendance Records', ac.count, 'Attendance logs'],
        ['Active Term', term?.term_name || 'None', term ? `${new Date(term.start_date).toISOString().slice(0,10)} to ${new Date(term.end_date).toISOString().slice(0,10)}` : ''],
      ]
      break
    }
  }

  return { headers, data, title }
}

// ─── Generate CSV ───
const generateCSV = (headers, data) => {
  const rows = [headers.join(','), ...data.map(r => r.map(cell => {
    if (cell === null || cell === undefined) return ''
    const s = String(cell)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }).join(','))]
  return '\uFEFF' + rows.join('\r\n')
}

// ─── Generate Excel (.xlsx) ───
const generateExcel = (headers, data, title) => {
  const ws = xlsx.utils.aoa_to_sheet([headers, ...data])
  ws['!cols'] = headers.map(() => ({ wch: 20 }))
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, title.slice(0, 31))
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

// ─── Generate PDF ───
const generatePDF = (headers, data, title) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    const titleSize = title.length > 40 ? 16 : 20
    doc.fontSize(titleSize).font('Helvetica-Bold').text(title, { align: 'center' })
    const now = new Date()
    doc.fontSize(9).font('Helvetica').fillColor('#666')
      .text(`Generated: ${now.toLocaleString()}`, { align: 'center' })
    doc.moveDown(1.5)

    // Column widths
    const pageWidth = doc.page.width - 60
    const colWidth = Math.min(120, pageWidth / headers.length)
    const usableWidth = colWidth * headers.length
    const startX = 30 + (pageWidth - usableWidth) / 2

    // Helper to draw table
    const drawTable = (rows, drawHeader = false) => {
      const cellPadding = 4
      let y = doc.y
      const fontSize = rows.length > 20 ? 6 : 7

      if (drawHeader) {
        doc.fontSize(fontSize + 1).font('Helvetica-Bold').fillColor('#1e40af')
        headers.forEach((h, i) => {
          doc.text(h, startX + i * colWidth + cellPadding, y + cellPadding, {
            width: colWidth - cellPadding * 2, align: 'left'
          })
        })
        y += 18
      }

      doc.fontSize(fontSize).font('Helvetica').fillColor('#333')
      for (const row of rows) {
        // Check page break
        if (y > doc.page.height - 60) {
          doc.addPage()
          y = doc.y
          // Redraw header on new page
          doc.fontSize(fontSize + 1).font('Helvetica-Bold').fillColor('#1e40af')
          headers.forEach((h, i) => {
            doc.text(h, startX + i * colWidth + cellPadding, y + cellPadding, {
              width: colWidth - cellPadding * 2, align: 'left'
            })
          })
          doc.fillColor('#e5e7eb').rect(startX, y + 16, usableWidth, 0.5).fill()
          y += 18
          doc.fontSize(fontSize).font('Helvetica').fillColor('#333')
        }

        // Alternate row background
        if (rows.indexOf(row) % 2 === 0) {
          doc.fillColor('#f8fafc').rect(startX, y - 2, usableWidth, 16).fill()
          doc.fillColor('#333')
        }

        row.forEach((cell, i) => {
          const str = cell === null || cell === undefined ? '' : String(cell)
          doc.text(str, startX + i * colWidth + cellPadding, y + cellPadding, {
            width: colWidth - cellPadding * 2, align: 'left'
          })
        })
        y += 16
      }
      doc.y = y + 5
    }

    // Table header
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e40af')
    headers.forEach((h, i) => {
      doc.text(h, startX + i * colWidth + 4, doc.y + 4, {
        width: colWidth - 8, align: 'left'
      })
    })
    doc.fillColor('#e5e7eb').rect(startX, doc.y + 16, usableWidth, 0.5).fill()
    doc.moveDown(1.5)

    drawTable(data)

    // Footer
    doc.fontSize(7).fillColor('#999')
      .text(`Page 1 of 1`, startX, doc.page.height - 30, { align: 'center', width: usableWidth })

    doc.end()
  })
}

// ─── Generate Markdown ───
const generateMarkdown = (headers, data, title) => {
  const sep = '| ' + headers.join(' | ') + ' |'
  const div = '| ' + headers.map(() => '---').join(' | ') + ' |'
  const rows = data.map(r => '| ' + r.join(' | ') + ' |')
  return `# ${title}\n\nGenerated: ${new Date().toLocaleString()}\n\n${sep}\n${div}\n${rows.join('\n')}\n`
}

export const generateReport = async (req, res) => {
  try {
    const { type = 'summary', format = 'xlsx' } = req.query
    const { headers, data, title } = await fetchReportData(type)
    const timestamp = new Date().toISOString().slice(0, 10)
    const safeTitle = title.toLowerCase().replace(/\s+/g, '-')

    if (format === 'csv') {
      const csv = generateCSV(headers, data)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}-${timestamp}.csv"`)
      return res.send(csv)
    }

    if (format === 'md') {
      const md = generateMarkdown(headers, data, title)
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}-${timestamp}.md"`)
      return res.send(md)
    }

    if (format === 'pdf') {
      const pdf = await generatePDF(headers, data, title)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}-${timestamp}.pdf"`)
      res.setHeader('Content-Length', pdf.length)
      return res.send(pdf)
    }

    // Default: Excel
    const buffer = generateExcel(headers, data, title)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}-${timestamp}.xlsx"`)
    res.setHeader('Content-Length', buffer.length)
    res.send(buffer)

  } catch (error) {
    console.error('Report generation error:', error)
    res.status(500).json({ error: 'Failed to generate report', details: error.message })
  }
}
