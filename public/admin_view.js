// admin_view.js - Admin List, Attendance Scanner, and CRUD

const API_URL = 'http://localhost:3001/api'; 

// Check login
if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
    alert('Access Denied. Please log in as Admin.');
    window.location.href = 'index.html';
}

const studentListBody = document.getElementById('student-list-body');
const countNumber = document.getElementById('count-number');
const loadingMessage = document.getElementById('loading-message');
const emptyMessage = document.getElementById('empty-message');
const scanMessage = document.getElementById('scan-message');
const toggleListBtn = document.getElementById('toggle-list-btn');
const studentListSection = document.getElementById('student-list-section');
const logoutBtn = document.getElementById('logout-btn');

// --- MODAL ELEMENTS ---
const actionModal = document.getElementById('action-modal');
const modalTitle = document.getElementById('modal-title');
const selectedId = document.getElementById('selected-id');
const selectedName = document.getElementById('selected-name');
const actionButtons = document.getElementById('action-buttons');
const deleteConfirmation = document.getElementById('delete-confirmation');
const updateFormContainer = document.getElementById('update-form-container');

// Update Form Inputs
const updateInputs = {
    idno: document.getElementById('update-idno'),
    lastName: document.getElementById('updateLastName'),
    firstName: document.getElementById('updateFirstName'),
    course: document.getElementById('updateCourse'),
    yearLevel: document.getElementById('updateYearLevel')
};

let currentStudentData = null;

// --- 1. SCANNER LOGIC ---

function onScanSuccess(decodedText, decodedResult) {
    html5QrcodeScanner.pause();
    scanMessage.classList.remove('hidden');
    scanMessage.textContent = `Scanned ID: ${decodedText}. Checking in...`;
    scanMessage.classList.remove('error');
    scanMessage.classList.add('success');

    fetch(`${API_URL}/attendance/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeData: decodedText })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            scanMessage.textContent = data.message;
            loadAndRenderStudents(); // Refresh list to show 'Present'
        } else {
            scanMessage.textContent = `Error: ${data.error}`;
            scanMessage.classList.remove('success');
            scanMessage.classList.add('error');
        }
        setTimeout(() => {
            html5QrcodeScanner.resume();
        }, 2000);
    })
    .catch(error => {
        scanMessage.textContent = 'Server Check-in Failed.';
        scanMessage.classList.remove('success');
        scanMessage.classList.add('error');
        console.error('Check-in error:', error);
        setTimeout(() => {
            html5QrcodeScanner.resume(); 
        }, 2000);
    });
}

function onScanFailure(error) {
    // console.warn(`QR Scan error = ${error}`);
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);


// --- 2. LIST & CRUD LOGIC ---

function closeModal() {
    actionModal.classList.add('hidden');
    actionButtons.classList.remove('hidden');
    deleteConfirmation.classList.add('hidden');
    updateFormContainer.classList.add('hidden');
    currentStudentData = null;
}

function handleRowClick(student) {
    currentStudentData = student;
    
    modalTitle.textContent = `Actions for Student`;
    selectedId.textContent = student.idNo;
    selectedName.textContent = `${student.firstName} ${student.lastName}`;

    // Fill form
    updateInputs.idno.value = student.idNo;
    updateInputs.lastName.value = student.lastName;
    updateInputs.firstName.value = student.firstName;
    updateInputs.course.value = student.course; 
    updateInputs.yearLevel.value = student.level;

    // Reset visibility
    actionButtons.classList.remove('hidden');
    deleteConfirmation.classList.add('hidden');
    updateFormContainer.classList.add('hidden');
    actionModal.classList.remove('hidden');
}

async function loadAndRenderStudents() {
    loadingMessage.classList.remove('hidden');
    emptyMessage.classList.add('hidden');
    studentListBody.innerHTML = ''; 

    try {
        const response = await fetch(`${API_URL}/students`);
        const data = await response.json();
        
        if (data.success && data.students) {
            const students = data.students;
            countNumber.textContent = students.length;

            if (students.length === 0) {
                emptyMessage.classList.remove('hidden');
            }

            students.forEach(student => {
                const row = studentListBody.insertRow();
                row.insertCell().textContent = student.idNo;
                row.insertCell().textContent = student.lastName;
                
                // Status Cell
                const statusCell = row.insertCell();
                statusCell.textContent = student.status;
                statusCell.style.color = student.status === 'Present' ? '#34d399' : '#ef4444';
                statusCell.style.fontWeight = 'bold';

                row.insertCell().textContent = student.course;
                row.insertCell().textContent = student.level;
                
                // 🟢 RE-ADDED CLICK HANDLER FOR EDIT/DELETE
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => handleRowClick(student));
            });
        } else {
            console.error('Failed to load students:', data.error);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    } finally {
        loadingMessage.classList.add('hidden');
    }
}

// --- CRUD EVENT LISTENERS ---

// Delete
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!currentStudentData) return;
    try {
        const response = await fetch(`${API_URL}/students/${currentStudentData.idNo}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
            alert('Delete Successful!');
            closeModal();
            loadAndRenderStudents();
        } else {
            alert(`Deletion Failed: ${data.error}`);
        }
    } catch (error) {
        alert('Failed to connect to server for deletion.');
    }
});

// Update
document.getElementById('confirm-update-btn').addEventListener('click', async () => {
    if (!currentStudentData) return;

    const updatedData = {
        firstName: updateInputs.firstName.value.trim(),
        lastName: updateInputs.lastName.value.trim(),
        course: updateInputs.course.value, 
        yearLevel: updateInputs.yearLevel.value
    };

    if (updatedData.course === "" || !updatedData.yearLevel) {
        alert('Please fill all fields.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/students/${currentStudentData.idNo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        const data = await response.json();
        if (data.success) {
            alert('Update Successful!');
            closeModal();
            loadAndRenderStudents();
        } else {
            alert(`Update Failed: ${data.error}`);
        }
    } catch (error) {
        alert('Failed to connect for update.');
    }
});

// Modal Navigation
document.getElementById('update-action-btn').addEventListener('click', () => {
    actionButtons.classList.add('hidden');
    updateFormContainer.classList.remove('hidden');
    modalTitle.textContent = `Update Student Details`;
});

document.getElementById('delete-action-btn').addEventListener('click', () => {
    actionButtons.classList.add('hidden');
    deleteConfirmation.classList.remove('hidden');
    modalTitle.textContent = `Confirm Deletion`;
});

document.querySelector('.close-btn').addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === actionModal) closeModal();
});

// --- PAGE NAVIGATION ---
toggleListBtn.addEventListener('click', () => {
    studentListSection.classList.toggle('hidden');
    if (!studentListSection.classList.contains('hidden')) {
        loadAndRenderStudents();
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    html5QrcodeScanner.stop().catch(err => console.error("Scanner stop error", err));
    window.location.href = 'index.html'; 
});