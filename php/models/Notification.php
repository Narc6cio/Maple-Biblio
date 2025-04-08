
<?php
class Notification {
    // Database connection and table name
    private $conn;
    private $table_name = "notification";

    // Object properties
    public $id_notification;
    public $id_utilisateur;
    public $messages;
    public $date_envoi;
    public $types;

    /**
     * Constructor with DB connection
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Create a new notification
     * @return boolean True if successful, false otherwise
     */
    public function create() {
        // Query to insert a new notification
        $query = "INSERT INTO " . $this->table_name . "
                (id_utilisateur, messages, date_envoi, types)
                VALUES
                (:id_utilisateur, :messages, :date_envoi, :types)";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        $this->messages = htmlspecialchars(strip_tags($this->messages));
        $this->date_envoi = htmlspecialchars(strip_tags($this->date_envoi));
        $this->types = htmlspecialchars(strip_tags($this->types));

        // Bind values
        $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);
        $stmt->bindParam(":messages", $this->messages);
        $stmt->bindParam(":date_envoi", $this->date_envoi);
        $stmt->bindParam(":types", $this->types);

        // Execute the query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Read all notifications for a user
     * @param int $userId User ID
     * @return PDOStatement
     */
    public function readByUser($userId) {
        // Query to read notifications for a specific user
        $query = "SELECT id_notification, id_utilisateur, messages, date_envoi, types
                FROM " . $this->table_name . "
                WHERE id_utilisateur = ?
                ORDER BY date_envoi DESC";

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
     * Create book availability notification
     * @param int $userId User ID
     * @param int $bookId Book ID
     * @param string $bookTitle Book title
     * @return boolean True if successful, false otherwise
     */
    public function createAvailabilityNotification($userId, $bookId, $bookTitle) {
        $this->id_utilisateur = $userId;
        $this->messages = "The book '{$bookTitle}' that you reserved is now available for pickup. You have 3 days to borrow this book before your reservation expires.";
        $this->date_envoi = date('Y-m-d');
        $this->types = "availability";

        return $this->create();
    }

    /**
     * Create return reminder notification
     * @param int $userId User ID
     * @param int $bookId Book ID
     * @param string $bookTitle Book title
     * @param string $dueDate Due date
     * @return boolean True if successful, false otherwise
     */
    public function createReturnReminderNotification($userId, $bookId, $bookTitle, $dueDate) {
        $this->id_utilisateur = $userId;
        $this->messages = "Reminder: The book '{$bookTitle}' is due to be returned on {$dueDate}. Please return it on time.";
        $this->date_envoi = date('Y-m-d');
        $this->types = "reminder";

        return $this->create();
    }

    /**
     * Delete a notification
     * @return boolean True if successful, false otherwise
     */
    public function delete() {
        // Query to delete a notification
        $query = "DELETE FROM " . $this->table_name . " WHERE id_notification = ?";

        // Prepare the query
        $stmt = $this->conn->prepare($query);

        // Sanitize and bind ID
        $this->id_notification = htmlspecialchars(strip_tags($this->id_notification));
        $stmt->bindParam(1, $this->id_notification);

        // Execute the query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?>
