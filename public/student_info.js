// student_info.js - Displays student details and QR code

const studentNameDisplay = document.getElementById('student-name');
const studentIdDisplay = document.getElementById('student-id-display');
const studentDetails = document.getElementById('student-details');
const qrCodeImage = document.getElementById('qr-code-image');

document.addEventListener('DOMContentLoaded', () => {
    let studentData = sessionStorage.getItem('studentData');
    
    // If coming from Registration, use that data instead
    if (!studentData) {
        const regData = sessionStorage.getItem('registrationSuccessData');
        if (regData) {
            studentData = regData;
        }
    }
    
    if (studentData) {
        const student = JSON.parse(studentData);
        
        // Update Text
        studentNameDisplay.textContent = student.firstName || 'Student';
        studentIdDisplay.textContent = student.idNo || student.studentId;
        
        // Update Details if available (Login provides more details than register)
        if (student.course) {
            studentDetails.innerHTML = `${student.course} - Year ${student.level}`;
        }
        
        // Update QR Code Image
        if (student.qrCodeImage) {
            qrCodeImage.src = student.qrCodeImage;
            qrCodeImage.style.display = 'block';
        } else {
            console.error("QR Code Image data is missing.");
            qrCodeImage.alt = "QR Code not available";
        }
        
        // Optional: Clear session data so it doesn't persist on refresh
        // sessionStorage.removeItem('registrationSuccessData'); 

    } else {
        alert('No student data found. Please login.');
        window.location.href = 'login.html';
    }
});