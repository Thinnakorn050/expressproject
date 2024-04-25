const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mysql = require('mysql');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // เพิ่มบรรทัดนี้เพื่อให้ใช้ bodyParser กับ urlencoded ได้
app.use(cookieParser());
app.use(logger('dev'));

//============== Express Session middleware==================//
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
//============== view engine setup ==================//
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'jade');

// Middleware สำหรับการแปลงข้อมูลที่ส่งมาเป็น JSON
app.use(express.json());

//================connectdb=================//
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sunproject'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

//=========ข้อมูลผู้ใช้================//
const users = [
    { username: 'student', email: 'student@example.com', password: '123', role: 'student' },
    { username: 'staff', email: 'staff@example.com', password: '456', role: 'staff' },
    { username: 'lecture', email: 'lecture@example.com', password: '789', role: 'lecture' }
];

//===========Route============//
// รหัสของเส้นทางเราอาจมีการกำหนดซ้ำซ้อนกัน ต้องตรวจสอบเส้นทางและการสั่งการของแต่ละอัน
app.get('/homepage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'homepage.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/student_booking.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'student_booking.html'));
});

app.get('/student_status.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'student_status.html'));
});

app.get('/student_his.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'student_his.html'));
});

app.get('/staff_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'staff_dashboard.html'));
});

app.get('/staff_status.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'staff_status.html'));
});

app.get('/staff_history.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'staff_history.html'));
});

app.get('/staff_addingroom.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'staff_addingroom.html'));
});

app.get('/staff_edittionroom.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'staff_edittionroom.html'));
});

// app.get('/lecture_booking_status.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'lecture_booking_status.html'));
// });

app.get('/lecture_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'lecture_dashboard.html'));
});

app.get('/lecture_history.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'lecture_history.html'));
});

app.get('/lecture_bookingrequest.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'lecture_bookingrequest.html'));
});

app.get('/browseroomLists.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'browseroomLists.html'));
});

//=============API===============//
//============homepage===============//
app.post('/homepage', (req, res) => {

});
//============register===============//
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    res.redirect('/login.html');
});

//============login===============//
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
        } else {
            if (results.length > 0) {
                const user = results[0];
                if (user.role === 'student') {
                    res.sendFile(path.join(__dirname, 'views', 'student_booking.html'));
                } else if (user.role === 'staff') {
                    res.sendFile(path.join(__dirname, 'views', 'staff_dashboard.html'));
                } else if (user.role === 'lecture') {
                    res.sendFile(path.join(__dirname, 'views', 'lecture_dashboard.html'));
                } else {
                    res.status(401).send('Unauthorized access');
                }
            } else {
                res.status(401).send('Invalid email or password');
            }
        }
    });
});

//=============API===============//
//============สร้างการจอง===============//
//============booking===============//
app.post('/api/bookings', (req, res) => {
    const { roomname, room_status, time_slot, reason } = req.body;
    const bookingData = { roomname, room_status, time_slot, reason };

    connection.query('INSERT INTO bookings SET ?', bookingData, (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'An error occurred while processing your booking.' });
        } else {
            console.log('Booking added successfully');
            res.status(201).json({ message: 'Booking successful' });
        }
    });
});



// API endpoint for getting bookings
app.get('/api/bookings', (req, res) => {
    connection.query('SELECT * FROM bookings', (err, results) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while fetching bookings.' });
        } else {
            res.status(200).json(results);
        }
    });
});

//============booking===============//
// สร้าง API endpoint สำหรับการจองห้องสมุด
app.post('/api/bookings', (req, res) => {
    const { roomname, room_status, time_slot, reason, status } = req.body;

    // สร้างคำสั่ง SQL เพื่อเพิ่มข้อมูลการจองลงในฐานข้อมูล
    const sql = 'INSERT INTO bookings (roomname, room_status, time_slot, reason, status) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [roomname, room_status, time_slot, reason, status], (error, results) => {
        if (error) {
            console.error('Error executing SQL:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        res.status(200).json({ message: 'Booking successful' });
    });
});


// API endpoint for updating booking status
app.put('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { status, approver } = req.body;

    connection.query('UPDATE bookings SET status = ?, approver = ? WHERE id = ?', [status, approver, id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'An error occurred while updating booking status.' });
        } else {
            console.log('Booking status updated successfully');
            res.redirect('/student_status.html');
        }
    });
});



// API endpoint for updating booking status by lecture
app.put('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { status, approver } = req.body;

    // Check if user is a lecture
    if (req.user.role !== 'lecture') {
        return res.status(403).json({ error: 'Only lecture can update booking status' });
    }

    // Only update booking status when requested status is 'pending'
    if (status !== 'pending') {
        return res.status(400).json({ error: 'Only "pending" status can be updated' });
    }

    connection.query('UPDATE bookings SET status = ?, approver = ? WHERE id = ?', [status, approver, id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while updating booking status.' });
        } else {
            console.log('Booking status updated successfully');
            res.status(200).json({ message: 'Booking status updated successfully' });

            // Insert into booking history table
            connection.query('INSERT INTO booking_history (booking_id, approver, status) VALUES (?, ?, ?)', [id, approver, status], (err, result) => {
                if (err) {
                    console.error('Error:', err);
                } else {
                    console.log('Booking history recorded successfully');
                }
            });
        }
    });
});


// API endpoint for fetching booking history
app.get('/api/booking-history', (req, res) => {
    connection.query('SELECT * FROM bookings', (err, results) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while fetching booking history.' });
        } else {
            res.status(200).json(results);
        }
    });
});

// API endpoint for fetching booking details by booking ID
app.get('/api/booking-details/:id', (req, res) => {
    const bookingId = req.params.id;

    connection.query('SELECT * FROM bookings WHERE id = ?', bookingId, (err, results) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while fetching booking details.' });
        } else {
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ message: 'Booking not found' });
            }
        }
    });
});


// API endpoint for updating booking status by lecture
app.put('/api/bookings/:id/confirm', (req, res) => {
    const { id } = req.params;
    const { status, approver } = req.body;

    // Check if user is a lecture
    if (req.user && req.user.role) {
        // ทำสิ่งที่ต้องการเมื่อคุณสมบัติ 'role' มีค่า
        // ยกตัวอย่างเช่นการใช้งานค่า 'role' ในโค้ดของคุณ
        // เช่น console.log(req.user.role);
    } else {
        console.log("Role is undefined or not available.");
    }



    // Only update booking status when requested status is 'accepted' or 'rejected'
    if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ error: 'Status can only be "accepted" or "rejected"' });
    }

    connection.query('UPDATE bookings SET status = ?, approver = ? WHERE id = ?', [status, approver, id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while updating booking status.' });
        } else {
            console.log('Booking status updated successfully');
            res.status(200).json({ message: 'Booking status updated successfully' });

            // Insert into booking confirmation table
            connection.query('INSERT INTO booking_confirmation (booking_id, approver, status) VALUES (?, ?, ?)', [id, approver, status], (err, result) => {
                if (err) {
                    console.error('Error:', err);
                } else {
                    console.log('Booking confirmation recorded successfully');

                    // Update status in student_status.html and student_his.html
                    updateStudentStatusAndHistory(id, status);
                }
            });
        }
    });
});

// Function to update status in student_status.html and student_his.html
function updateStudentStatusAndHistory(bookingId, status) {
    // Update status in student_status.html
    const studentStatusElement = document.getElementById(`status_${bookingId}`);
    if (studentStatusElement) {
        studentStatusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }

    // Update status in student_his.html
    const studentHistoryElement = document.getElementById(`status_${bookingId}`);
    if (studentHistoryElement) {
        studentHistoryElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
}

app.post('/updateStatus', (req, res) => {
    res.json({ success: true });
});



// API endpoint for student booking status
app.get('/api/student-booking-status/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    connection.query('SELECT b.*, bh.approver, bh.status FROM bookings b JOIN booking_history bh ON b.id = bh.booking_id WHERE b.student_id = ?', studentId, (err, results) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while fetching booking status.' });
        } else {
            res.status(200).json(results);
        }
    });
});

// API endpoint for retrieving room status from student_status.html+
app.get('/api/room-status-from-student', (req, res) => {
    const roomStatusData = getRoomStatusFromStudent();

    res.status(200).json(roomStatusData);
});

// API endpoint for updating room
app.get('/edit-room.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'edit-room.html'));
});

// ฟังก์ชันสำหรับอัปเดตสถานะการจองในฐานข้อมูล
function updateBookingStatus(bookingId, status) {
    connection.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, bookingId],
        (error, results) => {
            if (error) {
                console.error('Error updating booking status:', error);
                return;
            }
            console.log('Booking status updated successfully');
        }
    );
}

// สร้าง API endpoint เพื่อดึงข้อมูล room availability จากฐานข้อมูล
app.get('/api/room_availability', (req, res) => {
    const query = 'SELECT * FROM room_availability';
    connection.query(query, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

// Sample data (replace this with actual database connection and queries)
let roomAvailability = [
    { roomNumber: 101, availability: ["free", "pending", "reserved", "disabled"] },
    { roomNumber: 102, availability: ["free", "free", "reserved", "disabled"] },
    { roomNumber: 103, availability: ["free", "free", "free", "free"] },
    { roomNumber: 104, availability: ["pending", "free", "reserved", "free"] }
];

// Route to update room availability
app.put('/room_availability/:roomNumber', (req, res) => {
    const roomNumber = parseInt(req.params.roomNumber);
    const { status } = req.body;

    // Find the room in the roomAvailability array
    const roomIndex = roomAvailability.findIndex(room => room.roomNumber === roomNumber);

    if (roomIndex !== -1) {
        // Update the room status
        roomAvailability[roomIndex].availability = [status, status, status, status]; // assuming all time slots are updated with the same status

        // Return success response
        res.status(200).json({ message: `Room ${roomNumber} availability updated successfully.` });
    } else {
        // Return error response if room is not found
        res.status(404).json({ error: `Room ${roomNumber} not found.` });
    }
});






// Loop through the array of users and insert each one into the users table
users.forEach(user => {
    connection.query('INSERT INTO users SET ?', user, (err, result) => {
        if (err) throw err;
        console.log('User added successfully');
    });
});

// เพิ่มเรื่องอื่นๆ เช่นการเปิด port ให้แอปพลิเคชันของคุณทำงาน
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port  ${PORT}`);
});
