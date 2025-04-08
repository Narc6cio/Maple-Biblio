

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set user name in the dashboard
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = localStorage.getItem('userName') || 'User';
    }
    
    // Load user data
    loadUserData();
    
    // Add event listener for logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Initialize profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
});

/**
 * Load user data from server
 */
function loadUserData() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        console.error('User ID not found');
        return;
    }
    
    // Load dashboard data
    loadDashboardData(userId);
    
    // Load borrowed books
    loadBorrowedBooks(userId);
    
    // Load reservations
    loadReservations(userId);
    
    // Load history
    loadBorrowingHistory(userId);
    
    // Load recommendations
    loadRecommendations(userId);
    
    // Load notifications
    loadNotifications(userId);
    
    // Load profile data
    loadProfileData(userId);
}

/**
 * Load dashboard data
 */
function loadDashboardData(userId) {
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll use mock data
    
    // Set counts
    document.getElementById('borrowedCount').textContent = '2';
    document.getElementById('reservedCount').textContent = '1';
    document.getElementById('dueSoonCount').textContent = '1';
    document.getElementById('notificationsCount').textContent = '3';
    
    // Load recent activity
    const recentActivity = document.getElementById('recentActivity');
    if (recentActivity) {
        // In a real app, this would be populated with data from the server
        recentActivity.innerHTML = `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Book borrowed: <strong>Pride and Prejudice</strong></h6>
                    <small>3 days ago</small>
                </div>
                <p class="mb-1">Due date: July 12, 2023</p>
            </div>
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Book reserved: <strong>The Great Gatsby</strong></h6>
                    <small>5 days ago</small>
                </div>
                <p class="mb-1">Current queue position: 2</p>
            </div>
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Book returned: <strong>To Kill a Mockingbird</strong></h6>
                    <small>1 week ago</small>
                </div>
            </div>
        `;
    }
}

/**
 * Load borrowed books
 */
function loadBorrowedBooks(userId) {
    const borrowedBooksTable = document.getElementById('borrowedBooksTable');
    if (!borrowedBooksTable) return;
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll use mock data
    const borrowedBooks = [
        {
            id_emprunt: 1,
            titre: 'Pride and Prejudice',
            auteur: 'Jane Austen',
            date_emprunt: '2023-06-12',
            date_retour_prevu: '2023-07-12',
            id_livre: 1
        },
        {
            id_emprunt: 2,
            titre: 'The Odyssey',
            auteur: 'Homer',
            date_emprunt: '2023-06-20',
            date_retour_prevu: '2023-07-20',
            id_livre: 7
        }
    ];
    
    // Populate the table
    const tbody = borrowedBooksTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    borrowedBooks.forEach(book => {
        const row = document.createElement('tr');
        
        // Calculate if due soon (within 7 days)
        const dueDate = new Date(book.date_retour_prevu);
        const today = new Date();
        const daysDifference = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const dueSoonClass = daysDifference <= 7 ? 'text-danger fw-bold' : '';
        
        row.innerHTML = `
            <td>${book.titre}</td>
            <td>${book.auteur}</td>
            <td>${formatDate(book.date_emprunt)}</td>
            <td class="${dueSoonClass}">${formatDate(book.date_retour_prevu)}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning" onclick="extendBorrowing(${book.id_emprunt})">Extend</button>
                <button class="btn btn-sm btn-outline-dark" onclick="returnBook(${book.id_emprunt})">Return</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Load reservations
 */
function loadReservations(userId) {
    const reservationsTable = document.getElementById('reservationsTable');
    if (!reservationsTable) return;
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll use mock data
    const reservations = [
        {
            id_reservation: 1,
            titre: 'The Great Gatsby',
            auteur: 'F. Scott Fitzgerald',
            date_reservation: '2023-06-10',
            statut: 'En Attente',
            position: 2,
            id_livre: 4
        }
    ];
    
    // Populate the table
    const tbody = reservationsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        
        // Determine the badge color based on status
        let statusBadgeClass = 'bg-warning text-dark';
        if (reservation.statut === 'Disponible') {
            statusBadgeClass = 'bg-success text-white';
        } else if (reservation.statut === 'Annulée') {
            statusBadgeClass = 'bg-danger text-white';
        }
        
        row.innerHTML = `
            <td>${reservation.titre}</td>
            <td>${reservation.auteur}</td>
            <td>${formatDate(reservation.date_reservation)}</td>
            <td><span class="badge ${statusBadgeClass}">${reservation.statut}</span></td>
            <td>${reservation.position}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="cancelReservation(${reservation.id_reservation})">Cancel</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Load borrowing history
 */
function loadBorrowingHistory(userId) {
    const historyTable = document.getElementById('historyTable');
    if (!historyTable) return;
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll use mock data
    const history = [
        {
            id_historique: 1,
            titre: 'To Kill a Mockingbird',
            auteur: 'Harper Lee',
            date_emprunt: '2023-05-05',
            date_retour_effectif: '2023-06-01'
        },
        {
            id_historique: 2,
            titre: 'Hamlet',
            auteur: 'William Shakespeare',
            date_emprunt: '2023-04-10',
            date_retour_effectif: '2023-05-08'
        },
        {
            id_historique: 3,
            titre: '1984',
            auteur: 'George Orwell',
            date_emprunt: '2023-03-15',
            date_retour_effectif: '2023-04-12'
        }
    ];
    
    // Populate the table
    const tbody = historyTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    history.forEach(book => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${book.titre}</td>
            <td>${book.auteur}</td>
            <td>${formatDate(book.date_emprunt)}</td>
            <td>${formatDate(book.date_retour_effectif)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Load book recommendations
 */
function loadRecommendations(userId) {
    const recommendationsList = document.getElementById('recommendationsList');
    if (!recommendationsList) return;
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll use mock data
    const recommendations = [
        {
            id_livre: 9,
            titre: 'Jane Eyre',
            auteur: 'Charlotte Brontë',
            disponibilite: 'Disponible'
        },
        {
            id_livre: 10,
            titre: 'Wuthering Heights',
            auteur: 'Emily Brontë',
            disponibilite: 'Disponible'
        },
        {
            id_livre: 11,
            titre: 'Great Expectations',
            auteur: 'Charles Dickens',
            disponibilite: 'Indisponible'
        }
    ];
    
    // Populate the recommendations
    recommendationsList.innerHTML = '';
    
    recommendations.forEach(book => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        
        const availabilityText = book.disponibilite === 'Disponible' ? 'Reserve' : 'Join Wait List';
        const buttonDisabled = book.disponibilite !== 'Disponible' ? 'disabled' : '';
        
        col.innerHTML = `
            <div class="card h-100">
                <img src="https://placehold.co/300x450/FFC107/000000?text=${book.titre.replace(' ', '+')}" class="card-img-top" alt="${book.titre}">
                <div class="card-body">
                    <h5 class="card-title">${book.titre}</h5>
                    <p class="card-text">${book.auteur}</p>
                    <div class="d-grid">
                        <a href="#" class="btn btn-outline-warning ${buttonDisabled}" onclick="reserveBook(${book.id_livre})">${availabilityText}</a>
                    </div>
                </div>
            </div>
        `;
        
        recommendationsList.appendChild(col);
    });
}

/**
 * Load notifications
 */
function loadNotifications(userId) {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll use mock data
    const notifications = [
        {
            id_notification: 1,
            messages: 'The book you reserved is now available for pickup.',
            date_envoi: '2023-06-22',
            types: 'availability',
            titre: 'The Great Gatsby'
        },
        {
            id_notification: 2,
            messages: 'This book is due in 3 days. Please return it on time.',
            date_envoi: '2023-06-21',
            types: 'reminder',
            titre: 'Pride and Prejudice'
        },
        {
            id_notification: 3,
            messages: 'Thank you for returning the book.',
            date_envoi: '2023-06-01',
            types: 'return',
            titre: 'To Kill a Mockingbird'
        }
    ];
    
    // Populate the notifications
    notificationsList.innerHTML = '';
    
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action';
        
        // Format the date
        const notificationDate = new Date(notification.date_envoi);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        let dateText;
        if (notificationDate.toDateString() === today.toDateString()) {
            dateText = 'Today';
        } else if (notificationDate.toDateString() === yesterday.toDateString()) {
            dateText = 'Yesterday';
        } else {
            dateText = formatDate(notification.date_envoi);
        }
        
        // Set title based on notification type
        let title;
        if (notification.types === 'availability') {
            title = `Book Available: <strong>${notification.titre}</strong>`;
        } else if (notification.types === 'reminder') {
            title = `Return Reminder: <strong>${notification.titre}</strong>`;
        } else if (notification.types === 'return') {
            title = `Return Confirmation: <strong>${notification.titre}</strong>`;
        } else {
            title = `Notification: <strong>${notification.titre}</strong>`;
        }
        
        item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${title}</h6>
                <small>${dateText}</small>
            </div>
            <p class="mb-1">${notification.messages}</p>
        `;
        
        notificationsList.appendChild(item);
    });
}

/**
 * Load profile data
 */
function loadProfileData(userId) {
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll use mock data
    const userData = {
        id_utilisateur: 1,
        nom: 'Doe',
        prenom: 'John',
        email: 'user@example.com'
    };
    
    // Populate the profile form
    const firstNameInput = document.getElementById('updateFirstName');
    const lastNameInput = document.getElementById('updateLastName');
    const emailInput = document.getElementById('updateEmail');
    
    if (firstNameInput) firstNameInput.value = userData.prenom;
    if (lastNameInput) lastNameInput.value = userData.nom;
    if (emailInput) emailInput.value = userData.email;
}

/**
 * Handle profile update
 */
function handleProfileUpdate(e) {
    e.preventDefault();
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll simulate a profile update
    
    // Show a success message
    alert('Profile updated successfully!');
}

/**
 * Handle user logout
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Clear authentication data
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

/**
 * Extend a book borrowing period
 */
function extendBorrowing(borrowingId) {
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll simulate extending the borrowing period
    alert('Book borrowing period extended successfully!');
    
    // Reload borrowed books
    loadBorrowedBooks(localStorage.getItem('userId'));
}

/**
 * Return a borrowed book
 */
function returnBook(borrowingId) {
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll simulate returning the book
    alert('Book marked as returned. Please return the physical book to the library.');
    
    // Reload borrowed books
    loadBorrowedBooks(localStorage.getItem('userId'));
}

/**
 * Cancel a book reservation
 */
function cancelReservation(reservationId) {
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll simulate canceling the reservation
    alert('Reservation canceled successfully!');
    
    // Reload reservations
    loadReservations(localStorage.getItem('userId'));
}

/**
 * Reserve a book from recommendations
 */
function reserveBook(bookId) {
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll simulate reserving the book
    alert('Book reserved successfully!');
    
    // Reload recommendations
    loadRecommendations(localStorage.getItem('userId'));
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
