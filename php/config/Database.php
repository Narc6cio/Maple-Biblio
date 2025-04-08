
<?php
class Database {
    private $host = "localhost";
    private $db_name = "bibliothecaire";
    private $username = "root";
    private $password = "";
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
            error_log("Database connection established successfully");
            error_log("Connected to database: " . $this->db_name . " on host: " . $this->host);
            
            try {
                $testQuery = $this->conn->query("SELECT 1 FROM utilisateur LIMIT 1");
                $testQuery->execute();
                error_log("utilisateur table exists and is accessible");

                $columnsQuery = $this->conn->query("SHOW COLUMNS FROM utilisateur");
                $columns = $columnsQuery->fetchAll(PDO::FETCH_COLUMN);
                error_log("Table columns: " . implode(", ", $columns));
                
            } catch(PDOException $tableException) {
                error_log("Error accessing utilisateur table: " . $tableException->getMessage());
                error_log("You may need to create the utilisateur table with the following schema:");
                error_log("
                CREATE TABLE utilisateur (
                    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
                    nom VARCHAR(100) NOT NULL,
                    prenom VARCHAR(100) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    roles VARCHAR(50) NOT NULL DEFAULT 'user',
                    mot_de_passe VARCHAR(255) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                ");
            }
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
