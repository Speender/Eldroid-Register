// server.js - Node.js/Express Backend with SQLite and Authentication

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt'); // Required for password hashing
const qrcode = require('qrcode'); // Required for QR generation

const app = express();
const port = 3001;
const SALT_ROUNDS = 10;
const ADMIN_SECRET_KEY = '123456'; // Change this!

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); 
app.use(express.json());

// --- Database Setup ---
const db = new sqlite3.Database('./student_registration.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        // 1. Students Table
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            idNo TEXT UNIQUE NOT NULL,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            course TEXT NOT NULL,
            level TEXT NOT NULL,
            password TEXT NOT NULL,
            qrCodeData TEXT UNIQUE,
            status TEXT DEFAULT 'Absent'
        )`);
        
        // 2. Admins Table
        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
    }
});

// --- API ROUTES ---

// 1. STUDENT REGISTRATION (Generates QR Code)
app.post('/api/students/register', async (req, res) => {
    const { studentId, firstName, lastName, course, yearLevel, password } = req.body;

    if (!studentId || !firstName || !lastName || !course || !yearLevel || !password) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    
    // The QR code will contain the Student ID
    const qrCodeData = studentId; 

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const sql = `INSERT INTO students (idNo, firstName, lastName, course, level, password, qrCodeData)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        const params = [studentId, firstName, lastName, course, yearLevel, hashedPassword, qrCodeData];

        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ success: false, error: 'Student ID already registered.' });
                }
                console.error('Database error:', err.message);
                return res.status(500).json({ success: false, error: 'Registration failed.' });
            }

            // GENERATE QR CODE IMAGE
            qrcode.toDataURL(qrCodeData, { errorCorrectionLevel: 'H' }, function (qrErr, url) {
                if (qrErr) return res.status(500).json({ success: false, error: 'QR Gen Error' });
                
                // Send success response with the QR Code Image
                res.status(201).json({ 
                    success: true, 
                    message: 'Registration Successful!',
                    qrCodeImage: url, // This is the Base64 image string
                    studentId: studentId
                });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error.' });
    }
});

// 2. STUDENT LOGIN
app.post('/api/students/login', (req, res) => {
    const { studentId, password } = req.body;
    const sql = `SELECT firstName, lastName, password, qrCodeData, level, course FROM students WHERE idNo = ?`;

    db.get(sql, [studentId], async (err, row) => {
        if (err || !row) return res.status(401).json({ success: false, error: 'Invalid ID or Password.' });
        
        const match = await bcrypt.compare(password, row.password);
        if (match) {
            // Generate QR for login response too
            const qrCodeDataUrl = await qrcode.toDataURL(row.qrCodeData);
            return res.json({ 
                success: true, 
                student: { ...row, qrCodeImage: qrCodeDataUrl }
            });
        } else {
            return res.status(401).json({ success: false, error: 'Invalid ID or Password.' });
        }
    });
});

// 3. ADMIN LOGIN
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT password FROM admins WHERE username = ?`, [username], async (err, row) => {
        if (err || !row) return res.status(401).json({ success: false, error: 'Invalid Credentials.' });
        const match = await bcrypt.compare(password, row.password);
        if (match) res.json({ success: true });
        else res.status(401).json({ success: false, error: 'Invalid Credentials.' });
    });
});

// 4. ADMIN REGISTER
app.post('/api/admin/register', async (req, res) => {
    const { adminKey, username, password } = req.body;
    if (adminKey !== ADMIN_SECRET_KEY) return res.status(403).json({ success: false, error: 'Invalid Key' });
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    db.run(`INSERT INTO admins (username, password) VALUES (?, ?)`, [username, hashedPassword], (err) => {
        if (err) return res.status(400).json({ success: false, error: 'Error creating admin.' });
        res.status(201).json({ success: true, message: 'Admin Created' });
    });
});

// 5. ATTENDANCE SCAN
app.post('/api/attendance/checkin', (req, res) => {
    const { qrCodeData } = req.body;
    db.run(`UPDATE students SET status = 'Present' WHERE qrCodeData = ?`, [qrCodeData], function(err) {
        if (err || this.changes === 0) return res.status(404).json({ success: false, error: 'Student not found.' });
        db.get(`SELECT firstName, lastName FROM students WHERE qrCodeData = ?`, [qrCodeData], (e, row) => {
            res.json({ success: true, message: `Checked in: ${row.firstName} ${row.lastName}` });
        });
    });
});

// 6. GET ALL STUDENTS (Admin View)
app.get('/api/students', (req, res) => {
    db.all('SELECT idNo, firstName, lastName, course, level, status FROM students', [], (err, rows) => {
        res.json({ success: true, students: rows });
    });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
});