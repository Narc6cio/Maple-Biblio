
<?php
class Reservation {
    // Database connection and table name
    private $conn;
    private $table_name = "reservation";

    // Object properties
    public $id_reservation;
    public $id_utilisateur;
    public $id_livre;
    public $date_reservation;
    public $statut;

    /**
     * Constructor with DB connection
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Create a new reservation
     * @return boolean True if successful, false otherwise
     */
    public function create() {
        // Query to insert a new reservation
        $query = "INSERT INTO " . $this->table_name . "
                (id_utilisateur, id_livre, date_reservation, statut)
                VALUES
                (:id_utilisateur, :id_livre, :date_reservation, :statut)";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        $this->id_livre = htmlspecialchars(strip_tags($this->id_livre));
        $this->date_reservation = htmlspecialchars(strip_tags($this->date_reservation));
        $this->statut = htmlspecialchars(strip_tags($this->statut));

        // Bind values
        $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);
        $stmt->bindParam(":id_livre", $this->id_livre);
        $stmt->bindParam(":date_reservation", $this->date_reservation);
        $stmt->bindParam(":statut", $this->statut);

        // Execute the query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Read all reservations for a user
     * @param int $userId User ID
     * @return PDOStatement
     */
    public function readByUser($userId) {
        // Query to read reservations for a specific user
        $query = "SELECT r.id_reservation, r.id_utilisateur, r.id_livre, r.date_reservation, r.statut,
                l.titre, l.auteur, l.disponibilite,
                (SELECT COUNT(*) FROM fileAttente WHERE id_livre = r.id_livre AND position < (SELECT position FROM fileAttente WHERE id_livre = r.id_livre AND id_utilisateur = r.id_utilisateur)) + 1 as position
                FROM " . $this->table_name . " r
                LEFT JOIN livre l ON r.id_livre = l.id_livre
                WHERE r.id_utilisateur = ?
                ORDER BY r.date_reservation DESC";

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
     * Read all reservations for a book
     * @param int $bookId Book ID
     * @return PDOStatement
     */
    public function readByBook($bookId) {
        // Query to read reservations for a specific book
        $query = "SELECT r.id_reservation, r.id_utilisateur, r.id_livre, r.date_reservation, r.statut,
                u.nom, u.prenom, u.email
                FROM " . $this->table_name . " r
                LEFT JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
                WHERE r.id_livre = ?
                ORDER BY r.date_reservation ASC";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize and bind book ID
        $bookId = htmlspecialchars(strip_tags($bookId));
        $stmt->bindParam(1, $bookId);

        // Execute the query
        $stmt->execute();

        return $stmt;
    }

    /**
     * Update reservation status
     * @param string $status New reservation status
     * @return boolean True if successful, false otherwise
     */
    public function updateStatus($status) {
        // Query to update reservation status
        $query = "UPDATE " . $this->table_name . "
                SET
                    statut = :statut
                WHERE
                    id_reservation = :id_reservation";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->id_reservation = htmlspecialchars(strip_tags($this->id_reservation));
        $status = htmlspecialchars(strip_tags($status));

        // Bind values
        $stmt->bindParam(":statut", $status);
        $stmt->bindParam(":id_reservation", $this->id_reservation);

        // Execute the query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Delete a reservation
     * @return boolean True if successful, false otherwise
     */
    public function delete() {
        // Query to delete a reservation
        $query = "DELETE FROM " . $this->table_name . " WHERE id_reservation = ?";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize and bind ID
        $this->id_reservation = htmlspecialchars(strip_tags($this->id_reservation));
        $stmt->bindParam(1, $this->id_reservation);

        // Execute the query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Check if a user already has a reservation for a book
     * @return boolean True if a reservation exists, false otherwise
     */
    public function checkExistingReservation() {
        // Query to check if a reservation already exists
        $query = "SELECT id_reservation
                FROM " . $this->table_name . "
                WHERE id_utilisateur = ? AND id_livre = ?
                LIMIT 0,1";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize and bind values
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        $this->id_livre = htmlspecialchars(strip_tags($this->id_livre));
        
        $stmt->bindParam(1, $this->id_utilisateur);
        $stmt->bindParam(2, $this->id_livre);

        // Execute the query
        $stmt->execute();

        // Get number of rows
        $num = $stmt->rowCount();

        // If reservation exists
        if($num > 0) {
            return true;
        }

        return false;
    }

    /**
     * Read one reservation
     * @return boolean True if successful, false otherwise
     */
    public function readOne() {
        // Query to read a single reservation
        $query = "SELECT id_reservation, id_utilisateur, id_livre, date_reservation, statut
                FROM " . $this->table_name . "
                WHERE id_reservation = ?
                LIMIT 0,1";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize and bind ID
        $this->id_reservation = htmlspecialchars(strip_tags($this->id_reservation));
        $stmt->bindParam(1, $this->id_reservation);

        // Execute the query
        $stmt->execute();

        // Get number of rows
        $num = $stmt->rowCount();

        // If reservation exists, assign values to object properties
        if($num > 0) {
            // Get record details
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            // Assign values to object properties
            $this->id_reservation = $row['id_reservation'];
            $this->id_utilisateur = $row['id_utilisateur'];
            $this->id_livre = $row['id_livre'];
            $this->date_reservation = $row['date_reservation'];
            $this->statut = $row['statut'];

            return true;
        }

        return false;
    }
}
?>
