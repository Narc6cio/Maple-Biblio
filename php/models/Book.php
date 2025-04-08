<?php
class Book {
    // Database connection and table name
    private $conn;
    private $table_name = "livre";

    // Object properties
    public $id_livre;
    public $titre;
    public $auteur;
    public $annee_publication;
    public $disponibilite;
    public $image_couverture;

    /**
     * Constructor with DB connection
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Read all books
     * @param string $filter Filter option (all, available, unavailable)
     * @param string $sort Sort option (title, author, year)
     * @return PDOStatement Query result
     */
    public function read($filter = 'all', $sort = 'title') {
        // Base query
        $query = "SELECT * FROM " . $this->table_name;
        
        // Add filter
        if ($filter === 'available') {
            $query .= " WHERE disponibilite = 'Disponible'";
        } else if ($filter === 'unavailable') {
            $query .= " WHERE disponibilite = 'Indisponible'";
        }
        
        // Add sorting
        if ($sort === 'title') {
            $query .= " ORDER BY titre";
        } else if ($sort === 'author') {
            $query .= " ORDER BY auteur";
        } else if ($sort === 'year') {
            $query .= " ORDER BY annee_publication";
        }
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Execute query
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Get a single book
     * @return boolean True if successful, false otherwise
     */
    public function readOne() {
        // Query to read a single record
        $query = "SELECT * FROM " . $this->table_name . " WHERE id_livre = ? LIMIT 0,1";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind ID
        $stmt->bindParam(1, $this->id_livre);
        
        // Execute query
        $stmt->execute();
        
        // Get row count
        $num = $stmt->rowCount();
        
        if ($num > 0) {
            // Get record details
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Set properties
            $this->titre = $row['titre'];
            $this->auteur = $row['auteur'];
            $this->annee_publication = $row['annee_publication'];
            $this->disponibilite = $row['disponibilite'];
            $this->image_couverture = $row['image_couverture'] ?? null;
            
            return true;
        }
        
        return false;
    }

    /**
     * Search books
     * @param string $query Search query
     * @param string $filter Filter option (all, available, unavailable)
     * @param string $sort Sort option (title, author, year)
     * @return PDOStatement Query result
     */
    public function search($query, $filter = 'all', $sort = 'title') {
        // Base search query
        $searchQuery = "SELECT * FROM " . $this->table_name . " WHERE (titre LIKE ? OR auteur LIKE ?)";
        
        // Add filter
        if ($filter === 'available') {
            $searchQuery .= " AND disponibilite = 'Disponible'";
        } else if ($filter === 'unavailable') {
            $searchQuery .= " AND disponibilite = 'Indisponible'";
        }
        
        // Add sorting
        if ($sort === 'title') {
            $searchQuery .= " ORDER BY titre";
        } else if ($sort === 'author') {
            $searchQuery .= " ORDER BY auteur";
        } else if ($sort === 'year') {
            $searchQuery .= " ORDER BY annee_publication";
        }
        
        // Prepare statement
        $stmt = $this->conn->prepare($searchQuery);
        
        // Bind search term
        $searchTerm = "%" . $query . "%";
        $stmt->bindParam(1, $searchTerm);
        $stmt->bindParam(2, $searchTerm);
        
        // Execute query
        $stmt->execute();
        
        return $stmt;
    }
}
?>
