
document.addEventListener('DOMContentLoaded', function() {
    // Load books on page load
    loadBooks();
    
    // Add event listeners
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchBooks);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBooks();
            }
        });
    }
    
    const filterAvailability = document.getElementById('filterAvailability');
    if (filterAvailability) {
        filterAvailability.addEventListener('change', loadBooks);
    }
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', loadBooks);
    }
});

/**
 * Load books from the server with filtering and sorting
 */
function loadBooks() {
    const booksList = document.getElementById('booksList');
    const filterValue = document.getElementById('filterAvailability').value;
    const sortValue = document.getElementById('sortBy').value;
    
    // Show loading state
    booksList.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-warning" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    setTimeout(() => {
        // Simulate fetching books from server
        fetch('php/controllers/BookController.php?action=getBooks&filter=' + filterValue + '&sort=' + sortValue)
            .then(response => {
                // Note: In the actual implementation, you would parse the JSON response
                // For now, we'll simulate a successful fetch with mock data
                return {
                    success: true,
                    books: getMockBooks()
                };
            })
            .then(data => {
                if (data.success) {
                    displayBooks(data.books);
                } else {
                    booksList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load books. Please try again later.</div></div>';
                }
            })
            .catch(error => {
                console.error('Error loading books:', error);
                booksList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load books. Please try again later.</div></div>';
            });
    }, 800); // Simulate network delay
}

/**
 * Display books in the UI
 */
function displayBooks(books) {
    const booksList = document.getElementById('booksList');
    
    // Clear current books
    booksList.innerHTML = '';
    
    if (books.length === 0) {
        booksList.innerHTML = '<div class="col-12"><div class="alert alert-info">No books found matching your criteria.</div></div>';
        return;
    }
    
    // Add each book to the UI
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'col-md-4 col-lg-3';
        
        const availabilityClass = book.disponibilite === 'Disponible' ? 'available' : 'unavailable';
        const buttonDisabled = book.disponibilite !== 'Disponible' ? 'disabled' : '';
        
        bookCard.innerHTML = `
            <div class="card h-100 book-card">
                <div class="book-availability ${availabilityClass}">${book.disponibilite}</div>
                <img src="https://placehold.co/300x450/FFC107/000000?text=${book.titre.replace(' ', '+')}" class="card-img-top" alt="${book.titre}">
                <div class="card-body">
                    <h5 class="card-title">${book.titre}</h5>
                    <p class="card-text">${book.auteur}</p>
                    <p class="text-muted small">Published: ${formatDate(book.annee_publication)}</p>
                </div>
                <div class="card-footer bg-white border-top-0">
                    <a href="#" class="btn btn-warning w-100 ${buttonDisabled}" onclick="reserveBook(${book.id_livre})">${book.disponibilite === 'Disponible' ? 'Reserve' : 'Join Wait List'}</a>
                </div>
            </div>
        `;
        
        booksList.appendChild(bookCard);
    });
}

/**
 * Search books based on user input
 */
function searchBooks() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm === '') {
        loadBooks();
        return;
    }
    
    const booksList = document.getElementById('booksList');
    
    // Show loading state
    booksList.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-warning" role="status"><span class="visually-hidden">Searching...</span></div></div>';
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll simulate the response with a timeout
    setTimeout(() => {
        // Get all mock books
        const allBooks = getMockBooks();
        
        // Filter books based on search term
        const filteredBooks = allBooks.filter(book => {
            return book.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   book.auteur.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        // Display filtered books
        displayBooks(filteredBooks);
    }, 800); // Simulate network delay
}

/**
 * Reserve a book
 */
function reserveBook(bookId) {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    
    if (!isLoggedIn) {
        window.location.href = 'login.html?redirect=books.html';
        return;
    }
    
    // In a real app, this would send a request to the server to reserve the book
    // For this example, we'll simulate a reservation
    alert('Book reservation functionality would be implemented here, connecting to the PHP backend.');
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.getFullYear();
}

/**
 * Get mock books data for demonstration
 */
function getMockBooks() {
    return [
        {
            id_livre: 1,
            titre: 'Pride and Prejudice',
            auteur: 'Jane Austen',
            annee_publication: '1813-01-28',
            disponibilite: 'Disponible'
        },
        {
            id_livre: 2,
            titre: 'To Kill a Mockingbird',
            auteur: 'Harper Lee',
            annee_publication: '1960-07-11',
            disponibilite: 'Indisponible'
        },
        {
            id_livre: 3,
            titre: '1984',
            auteur: 'George Orwell',
            annee_publication: '1949-06-08',
            disponibilite: 'Disponible'
        },
        {
            id_livre: 4,
            titre: 'The Great Gatsby',
            auteur: 'F. Scott Fitzgerald',
            annee_publication: '1925-04-10',
            disponibilite: 'Disponible'
        },
        {
            id_livre: 5,
            titre: 'Hamlet',
            auteur: 'William Shakespeare',
            annee_publication: '1603-01-01',
            disponibilite: 'Indisponible'
        },
        {
            id_livre: 6,
            titre: 'War and Peace',
            auteur: 'Leo Tolstoy',
            annee_publication: '1869-01-01',
            disponibilite: 'Disponible'
        },
        {
            id_livre: 7,
            titre: 'The Odyssey',
            auteur: 'Homer',
            annee_publication: '1800-01-01',
            disponibilite: 'Disponible'
        },
        {
            id_livre: 8,
            titre: 'Moby Dick',
            auteur: 'Herman Melville',
            annee_publication: '1851-10-18',
            disponibilite: 'Indisponible'
        }
    ];
}
