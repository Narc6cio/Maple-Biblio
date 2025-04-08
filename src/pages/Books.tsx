import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { BookService } from "@/services/api";

interface Book {
  id_livre: number;
  titre: string;
  auteur: string;
  annee_publication: string;
  disponibilite: string;
  image_couverture?: string;
}

const Books = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchBooks();
  }, [availability, sortBy]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching books with filter:", availability, "and sort:", sortBy);
      
      const response = await BookService.getAll();
      
      if (response.success) {
        console.log("Books fetched:", response.data);
        setBooks(response.data || []);
      } else {
        setError("Failed to load books: " + response.message);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to load books. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      fetchBooks();
    } else {
      searchBooks(searchTerm);
    }
  };

  const searchBooks = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await BookService.search(query);
      
      if (response.success) {
        setBooks(response.data || []);
      } else {
        setError("Failed to search books: " + response.message);
      }
    } catch (err) {
      console.error("Error searching books:", err);
      setError("Failed to search books. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier les livres
  const filteredBooks = books
    .filter(book => 
      (book.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
       book.auteur.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (availability === "all" || 
       (availability === "available" && book.disponibilite === "Disponible") ||
       (availability === "unavailable" && book.disponibilite !== "Disponible"))
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.titre.localeCompare(b.titre);
      if (sortBy === "author") return a.auteur.localeCompare(b.auteur);
      if (sortBy === "year") return a.annee_publication.localeCompare(b.annee_publication);
      return 0;
    });

  const formatYear = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.getFullYear().toString();
  };

  return (
    <MainLayout>
      <section className="books-section py-5">
        <div className="container">
          <h1 className="mb-4">Our Book Collection</h1>
          
          {/* Search et filtres */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by title, author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  className="btn btn-warning" 
                  type="button"
                  onClick={handleSearch}
                >
                  <i className="bi bi-search"></i> Search
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 justify-content-md-end">
                <select 
                  className="form-select w-auto"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="all">All Books</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <select 
                  className="form-select w-auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="title">Sort by Title</option>
                  <option value="author">Sort by Author</option>
                  <option value="year">Sort by Year</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Message d'erreur */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {/* Indicateur de chargement */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading books...</p>
            </div>
          )}
          
          {/* Liste des livres */}
          {!loading && (
            <div className="row g-4">
              {filteredBooks.map(book => (
                <div key={book.id_livre} className="col-md-4 col-lg-3">
                  <div className="card h-100 book-card">
                    <div className={`book-availability ${book.disponibilite === 'Disponible' ? 'available' : 'unavailable'}`}>
                      {book.disponibilite}
                    </div>
                    <img 
                      src={
                        book.image_couverture || 
                        `https://placehold.co/300x450/FFC107/000000?text=${encodeURIComponent(book.titre)}`
                      } 
                      className="card-img-top" 
                      alt={`${book.titre} Cover`} 
                    />
                    <div className="card-body">
                      <h5 className="card-title">{book.titre}</h5>
                      <p className="card-text">{book.auteur}</p>
                      <p className="text-muted small">Published: {formatYear(book.annee_publication)}</p>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <button 
                        className="btn btn-warning w-100"
                        disabled={book.disponibilite !== 'Disponible'}
                      >
                        {book.disponibilite === 'Disponible' ? 'Reserve' : 'Join Waitlist'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredBooks.length === 0 && !loading && (
                <div className="col-12 text-center py-5">
                  <h3>No books found matching your search criteria.</h3>
                </div>
              )}
            </div>
          )}
          
          {/* Pagination (optionnelle) */}
          {filteredBooks.length > 0 && (
            <nav className="mt-5">
              <ul className="pagination justify-content-center">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex={-1} aria-disabled="true">Previous</a>
                </li>
                <li className="page-item active"><a className="page-link" href="#">1</a></li>
                <li className="page-item"><a className="page-link" href="#">2</a></li>
                <li className="page-item"><a className="page-link" href="#">3</a></li>
                <li className="page-item">
                  <a className="page-link" href="#">Next</a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Books;
