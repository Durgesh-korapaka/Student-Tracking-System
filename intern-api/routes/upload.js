require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const pool = require('../db/pool');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const upload = multer({ storage: multer.memoryStorage() });

router.post('/:studentId', upload.single('file'), async (req, res) => {
  const { studentId } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const [students] = await pool.query(
      'SELECT id FROM students WHERE id = ?', [studentId]
    );
    if (students.length === 0)
      return res.status(404).json({ error: 'Student not found' });

    const fileName = `students/${studentId}/${Date.now()}_${file.originalname}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    await pool.query(
      'INSERT INTO student_files (student_id, file_name, file_url) VALUES (?, ?, ?)',
      [studentId, file.originalname, fileUrl]
    );

    res.status(201).json({
      message: 'File uploaded successfully!',
      fileName: file.originalname,
      fileUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:studentId', async (req, res) => {
  try {
    const [files] = await pool.query(
      'SELECT * FROM student_files WHERE student_id = ? ORDER BY uploaded_at DESC',
      [req.params.studentId]
    );
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;