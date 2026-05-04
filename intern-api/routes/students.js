const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET all students
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET student by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create student
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone || null]
    );
    res.status(201).json({ id: result.insertId, name, email, phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE students SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?',
      [name, email, phone, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// VALIDATION API - POST with full validation
router.post('/validate', async (req, res) => {
  const { name, email, phone } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push('name must be at least 2 characters');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('valid email is required');
  if (phone && !/^\d{10}$/.test(phone)) errors.push('phone must be 10 digits');

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, email, phone) VALUES (?, ?, ?)',
      [name.trim(), email, phone || null]
    );
    res.status(201).json({ id: result.insertId, name, email, phone });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// MULTI INSERT API - insert array of students using loop
router.post('/bulk', async (req, res) => {
  const students = req.body;
  if (!Array.isArray(students) || students.length === 0)
    return res.status(400).json({ error: 'Send an array of students' });

  const results = [];
  const errors = [];

  for (let i = 0; i < students.length; i++) {
    const { name, email, phone } = students[i];
    if (!name || !email) {
      errors.push({ index: i, error: 'name and email required' });
      continue;
    }
    try {
      const [result] = await pool.query(
        'INSERT INTO students (name, email, phone) VALUES (?, ?, ?)',
        [name, email, phone || null]
      );
      results.push({ id: result.insertId, name, email });
    } catch (err) {
      errors.push({ index: i, email, error: err.message });
    }
  }

  res.json({ inserted: results.length, results, errors });
});

// SELECT DEPENDENT INSERT - enroll student into course
router.post('/enroll', async (req, res) => {
  const { student_id, course_id } = req.body;

  try {
    // Step 1: check student exists
    const [students] = await pool.query('SELECT id, name FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) return res.status(404).json({ error: 'Student not found' });

    // Step 2: check course exists
    const [courses] = await pool.query('SELECT id, title FROM courses WHERE id = ?', [course_id]);
    if (courses.length === 0) return res.status(404).json({ error: 'Course not found' });

    // Step 3: check already enrolled
    const [existing] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );
    if (existing.length > 0) return res.status(409).json({ error: 'Already enrolled' });

    // Step 4: insert enrollment
    const [result] = await pool.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
      [student_id, course_id]
    );

    res.status(201).json({
      enrollment_id: result.insertId,
      student: students[0].name,
      course: courses[0].title
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MULTIPLE SELECT QUERIES - dashboard
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students');
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) AS totalCourses FROM courses');
    const [enrollmentStats] = await pool.query(`
      SELECT c.title, COUNT(e.id) AS enrolled,
             SUM(e.status = 'completed') AS completed
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, c.title
    `);
    const [recentEnrollments] = await pool.query(`
      SELECT s.name, c.title, e.enrolled_at, e.status
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrolled_at DESC LIMIT 5
    `);

    res.json({ totalStudents, totalCourses, enrollmentStats, recentEnrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;