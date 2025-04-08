
<?php
class WaitList {
    // Database connection and table name
    private $conn;
    private $table_name = "fileAttente";

    // Object properties
    public $id_fileAttente;
    public $id_livre;
    public $id_utilisateur;
    public $position;

    /**
     * Constructor with DB connection
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Add a user to the wait list for a book
     * @return boolean True if successful, false otherwise
     */
    public function addToWaitList() {
        // Get the current highest position for this book
        $query = "SELECT MAX(CAST(position AS UNSIGNED)) as max_position FROM " . $this->table_name . " WHERE id_livre = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_livre);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $currentMaxPosition = $row['max_position'];
        
        // Set the position to be one higher than the current max (or 1 if there are no entries)
        $newPosition = $currentMaxPosition ? $currentMaxPosition + 1 : 1;
        
        // Query to insert a new wait list entry
        $query = "INSERT INTO " . $this->table_name . "
                (id_livre, id_utilisateur, position)
                VALUES
                (:id_livre, :id_utilisateur, :position)";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->id_livre = htmlspecialchars(strip_tags($this->id_livre));
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        
        // Bind values
        $stmt->bindParam(":id_livre", $this->id_livre);
        $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);
        $stmt->bindParam(":position", $newPosition);

        // Execute the query
        if($stmt->execute()) {
            $this->position = $newPosition;
            return true;
        }

        return false;
    }

    /**
     * Remove a user from the wait list
     * @return boolean True if successful, false otherwise
     */
    public function removeFromWaitList() {
        // Get the current position of the user
        $query = "SELECT position FROM " . $this->table_name . " WHERE id_livre = ? AND id_utilisateur = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_livre);
        $stmt->bindParam(2, $this->id_utilisateur);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $currentPosition = $row['position'];
            
            // Begin transaction
            $this->conn->beginTransaction();
            
            try {
                // Delete the user from the wait list
                $deleteQuery = "DELETE FROM " . $this->table_name . " WHERE id_livre = ? AND id_utilisateur = ?";
                $deleteStmt = $this->conn->prepare($deleteQuery);
                $deleteStmt->bindParam(1, $this->id_livre);
                $deleteStmt->bindParam(2, $this->id_utilisateur);
                $deleteStmt->execute();
                
                // Update positions of users behind this one
                $updateQuery = "UPDATE " . $this->table_name . " 
                              SET position = CAST(position AS UNSIGNED) - 1 
                              WHERE id_livre = ? AND CAST(position AS UNSIGNED) > ?";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bindParam(1, $this->id_livre);
                $updateStmt->bindParam(2, $currentPosition);
                $updateStmt->execute();
                
                // Commit transaction
                $this->conn->commit();
                
                return true;
            } catch(Exception $e) {
                // Rollback transaction on error
                $this->conn->rollback();
                return false;
            }
        }
        
        return false;
    }

    /**
     * Get the next user in the wait list for a book
     * @param int $bookId Book ID
     * @return array|null User data or null if wait list is empty
     */
    public function getNextInLine($bookId) {
        // Query to get the user with the lowest position
        $query = "SELECT w.id_fileAttente, w.id_utilisateur, w.position, u.nom, u.prenom, u.email
                FROM " . $this->table_name . " w
                LEFT JOIN utilisateur u ON w.id_utilisateur = u.id_utilisateur
                WHERE w.id_livre = ?
                ORDER BY CAST(w.position AS UNSIGNED) ASC
                LIMIT 0,1";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind book ID
        $bookId = htmlspecialchars(strip_tags($bookId));
        $stmt->bindParam(1, $bookId);
        
        // Execute the query
        $stmt->execute();
        
        // Return user data if found
        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        return null;
    }

    /**
     * Get a user's position in the wait list for a book
     * @return int|false Position in wait list or false if not found
     */
    public function getUserPosition() {
        // Query to get the user's position
        $query = "SELECT position FROM " . $this->table_name . " 
                WHERE id_livre = ? AND id_utilisateur = ?";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind values
        $this->id_livre = htmlspecialchars(strip_tags($this->id_livre));
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        
        $stmt->bindParam(1, $this->id_livre);
        $stmt->bindParam(2, $this->id_utilisateur);
        
        // Execute the query
        $stmt->execute();
        
        // Return position if found
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row['position'];
        }
        
        return false;
    }

    /**
     * Check if a user is in the wait list for a book
     * @return boolean True if user is in wait list, false otherwise
     */
    public function isUserInWaitList() {
        // Query to check if user is in wait list
        $query = "SELECT id_fileAttente FROM " . $this->table_name . " 
                WHERE id_livre = ? AND id_utilisateur = ?";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind values
        $this->id_livre = htmlspecialchars(strip_tags($this->id_livre));
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        
        $stmt->bindParam(1, $this->id_livre);
        $stmt->bindParam(2, $this->id_utilisateur);
        
        // Execute the query
        $stmt->execute();
        
        // Return true if user is in wait list
        return ($stmt->rowCount() > 0);
    }
}
?>
