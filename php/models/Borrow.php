
<?php
class Borrow {
    // Database connection and table name
    private $conn;
    private $table_name = "emprunt";

    // Object properties
    public $id_emprunt;
    public $id_utilisateur;
    public $id_livre;
    public $date_emprunt;
    public $date_retour_prevu;
    public $date_retour_effectif;
    public $statut_emprunt;

    /**
     * Constructor with DB connection
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Create a new borrowing record
     * @return boolean True if successful, false otherwise
     */
    public function create() {
        // Query to insert a new borrowing record
        $query = "INSERT INTO " . $this->table_name . "
                (id_utilisateur, id_livre, date_emprunt, date_retour_prevu, date_retour_effectif, statut_emprunt)
                VALUES
                (:id_utilisateur, :id_livre, :date_emprunt, :date_retour_prevu, :date_retour_effectif, :statut_emprunt)";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        $this->id_livre = htmlspecialchars(strip_tags($this->id_livre));
        $this->date_emprunt = htmlspecialchars(strip_tags($this->date_emprunt));
        $this->date_retour_prevu = htmlspecialchars(strip_tags($this->date_retour_prevu));
        $this->date_retour_effectif = htmlspecialchars(strip_tags($this->date_retour_effectif));
        $this->statut_emprunt = htmlspecialchars(strip_tags($this->statut_emprunt));

        // Bind values
        $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);
        $stmt->bindParam(":id_livre", $this->id_livre);
        $stmt->bindParam(":date_emprunt", $this->date_emprunt);
        $stmt->bindParam(":date_retour_prevu", $this->date_retour_prevu);
        $stmt->bindParam(":date_retour_effectif", $this->date_retour_effectif);
        $stmt->bindParam(":statut_emprunt", $this->statut_emprunt);

        // Execute the query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Read all active borrowings for a user
     * @param int $userId User ID
     * @return PDOStatement
     */
    public function readActiveByUser($userId) {
        // Query to read active borrowings for a specific user
        $query = "SELECT e.id_emprunt, e.id_utilisateur, e.id_livre, e.date_emprunt, e.date_retour_prevu, e.date_retour_effectif, e.statut_emprunt,
                l.titre, l.auteur
                FROM " . $this->table_name . " e
                LEFT JOIN livre l ON e.id_livre = l.id_livre
                WHERE e.id_utilisateur = ? AND e.statut_emprunt = 'En cours'
                ORDER BY e.date_retour_prevu ASC";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize and bind user ID
        $userId = htmlspecialchars(strip_tags($userId));
        $stmt->bindParam(1, $userId);

        // Execute the query
        $stmt->execute();

        return $stmt;
    }

    /**
     * Update borrowing record to mark as returned
     * @param string $returnDate Return date
     * @return boolean True if successful, false otherwise
     */
    public function markAsReturned($returnDate) {
        // Query to update borrowing record
        $query = "UPDATE " . $this->table_name . "
                SET
                    date_retour_effectif = :date_retour_effectif,
                    statut_emprunt = 'Retourné'
                WHERE
                    id_emprunt = :id_emprunt";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->id_emprunt = htmlspecialchars(strip_tags($this->id_emprunt));
        $returnDate = htmlspecialchars(strip_tags($returnDate));

        // Bind values
        $stmt->bindParam(":date_retour_effectif", $returnDate);
        $stmt->bindParam(":id_emprunt", $this->id_emprunt);

        // Execute the query
        if($stmt->execute()) {
            // Add to borrowing history
            $this->addToHistory($returnDate);
            
            return true;
        }

        return false;
    }

    /**
     * Extend borrowing period
     * @param string $newReturnDate New expected return date
     * @return boolean True if successful, false otherwise
     */
    public function extendBorrowing($newReturnDate) {
        // Query to update return date
        $query = "UPDATE " . $this->table_name . "
                SET
                    date_retour_prevu = :date_retour_prevu
                WHERE
                    id_emprunt = :id_emprunt";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->id_emprunt = htmlspecialchars(strip_tags($this->id_emprunt));
        $newReturnDate = htmlspecialchars(strip_tags($newReturnDate));

        // Bind values
        $stmt->bindParam(":date_retour_prevu", $newReturnDate);
        $stmt->bindParam(":id_emprunt", $this->id_emprunt);

        // Execute the query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Add borrowing record to history
     * @param string $returnDate Return date
     * @return boolean True if successful, false otherwise
     */
    private function addToHistory($returnDate) {
        // Query to get borrowing details
        $query = "SELECT id_utilisateur, id_livre, date_emprunt FROM " . $this->table_name . " WHERE id_emprunt = ?";
        
        // Prepare query
        $stmt = $this->conn->prepare($query);
        
        // Bind ID
        $stmt->bindParam(1, $this->id_emprunt);
        
        // Execute query
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Insert into history table
            $historyQuery = "INSERT INTO historiqueEmprunts (id_utilisateur, id_livre, date_emprunt, date_retour_effectif)
                            VALUES (:id_utilisateur, :id_livre, :date_emprunt, :date_retour_effectif)";
            
            $historyStmt = $this->conn->prepare($historyQuery);
            
            // Bind values
            $historyStmt->bindParam(":id_utilisateur", $row['id_utilisateur']);
            $historyStmt->bindParam(":id_livre", $row['id_livre']);
            $historyStmt->bindParam(":date_emprunt", $row['date_emprunt']);
            $historyStmt->bindParam(":date_retour_effectif", $returnDate);
            
            // Execute query
            return $historyStmt->execute();
        }
        
        return false;
    }

    /**
     * Get borrowing history for a user
     * @param int $userId User ID
     * @return PDOStatement
     */
    public function getHistoryByUser($userId) {
        // Query to get borrowing history
        $query = "SELECT h.id_historique, h.id_utilisateur, h.id_livre, h.date_emprunt, h.date_retour_effectif,
                l.titre, l.auteur
                FROM historiqueEmprunts h
                LEFT JOIN livre l ON h.id_livre = l.id_livre
                WHERE h.id_utilisateur = ?
                ORDER BY h.date_retour_effectif DESC";
        
        // Prepare query
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind user ID
        $userId = htmlspecialchars(strip_tags($userId));
        $stmt->bindParam(1, $userId);
        
        // Execute query
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Check if a book is currently borrowed by a user
     * @return boolean True if book is borrowed, false otherwise
     */
    public function isBookBorrowed() {
        // Query to check if book is borrowed
        $query = "SELECT id_emprunt FROM " . $this->table_name . " 
                WHERE id_livre = ? AND id_utilisateur = ? AND statut_emprunt = 'En cours'
                LIMIT 0,1";
        
        // Prepare query
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind values
        $this->id_livre = htmlspecialchars(strip_tags($this->id_livre));
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        
        $stmt->bindParam(1, $this->id_livre);
        $stmt->bindParam(2, $this->id_utilisateur);
        
        // Execute query
        $stmt->execute();
        
        // Return true if book is borrowed
        return ($stmt->rowCount() > 0);
    }

    /**
     * Read one borrowing record
     * @return boolean True if successful, false otherwise
     */
    public function readOne() {
        // Query to read a single borrowing record
        $query = "SELECT id_emprunt, id_utilisateur, id_livre, date_emprunt, date_retour_prevu, date_retour_effectif, statut_emprunt
                FROM " . $this->table_name . "
                WHERE id_emprunt = ?
                LIMIT 0,1";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize and bind ID
        $this->id_emprunt = htmlspecialchars(strip_tags($this->id_emprunt));
        $stmt->bindParam(1, $this->id_emprunt);

        // Execute the query
        $stmt->execute();

        // Get number of rows
        $num = $stmt->rowCount();

        // If borrowing record exists, assign values to object properties
        if($num > 0) {
            // Get record details
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            // Assign values to object properties
            $this->id_emprunt = $row['id_emprunt'];
            $this->id_utilisateur = $row['id_utilisateur'];
            $this->id_livre = $row['id_livre'];
            $this->date_emprunt = $row['date_emprunt'];
            $this->date_retour_prevu = $row['date_retour_prevu'];
            $this->date_retour_effectif = $row['date_retour_effectif'];
            $this->statut_emprunt = $row['statut_emprunt'];

            return true;
        }

        return false;
    }
}
?>
