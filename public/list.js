// list.js - Fetches and displays student list (FINAL CRUD LOGIC)

const API_URL = 'http://192.168.1.14:3001/api'; 
const studentListBody = document.getElementById('student-list-body');
const countNumber = document.getElementById('count-number');
const loadingMessage = document.getElementById('loading-message');
const emptyMessage = document.getElementById('empty-message');
const backButton = document.getElementById('back-btn');

// Modal DOM Elements
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

let currentStudentData = null; // Stores data of the row clicked


/**
 * Resets the modal state and hides it.
 */
function closeModal() {
    actionModal.classList.add('hidden');
    actionButtons.classList.remove('hidden');
    deleteConfirmation.classList.add('hidden');
    updateFormContainer.classList.add('hidden');
    currentStudentData = null;
}

/**
 * Handles row click: opens modal and sets data.
 */
function handleRowClick(student) {
    currentStudentData = student;
    
    modalTitle.textContent = `Actions for Student`;
    selectedId.textContent = student.idNo;
    selectedName.textContent = `${student.firstName} ${student.lastName}`;

    // Populate update form inputs for pre-filling
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

/**
 * Loads the list of registered students and renders them.
 */
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
                row.insertCell().textContent = student.firstName;
                row.insertCell().textContent = student.course;
                row.insertCell().textContent = `Year ${student.level}`;
                
                // Add click listener to the row
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => handleRowClick(student));
            });
        } else {
            console.error('Failed to load students:', data.error);
            countNumber.textContent = 'Error';
            emptyMessage.textContent = 'Failed to fetch data from server.';
            emptyMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        countNumber.textContent = 'Error';
        emptyMessage.textContent = 'Cannot connect to server.';
        emptyMessage.classList.remove('hidden');
    } finally {
        loadingMessage.classList.add('hidden');
    }
}


/**
 * Executes the Delete operation.
 */
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
            alert(`Deletion Failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        alert('Failed to connect to server for deletion.');
        console.error('Deletion error:', error);
    }
});


/**
 * Executes the Update operation.
 */
document.getElementById('confirm-update-btn').addEventListener('click', async () => {
    if (!currentStudentData) return;

    const updatedData = {
        firstName: updateInputs.firstName.value.trim(),
        lastName: updateInputs.lastName.value.trim(),
        course: updateInputs.course.value.trim(),
        yearLevel: updateInputs.yearLevel.value.trim()
    };

    if (Object.values(updatedData).some(val => val === '')) {
         alert('All update fields must be filled.');
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
            alert(`Update Failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        alert('Failed to connect to server for update.');
        console.error('Update error:', error);
    }
});


// Event Handlers for Modal Buttons
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

// Close modal handlers
document.querySelector('.close-btn').addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === actionModal) {
        closeModal();
    }
});

// Event Listener for Page
backButton.addEventListener('click', () => {
    window.location.href = 'index.html'; 
});

// Initial load
document.addEventListener('DOMContentLoaded', loadAndRenderStudents);