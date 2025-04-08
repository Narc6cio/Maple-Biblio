
<?php
class User {
    private $conn;
    private $table_name = "utilisateur";

    public $id_utilisateur;
    public $nom;
    public $prenom;
    public $email;
    public $roles;
    public $mot_de_passe;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO $this->table_name
                (nom, prenom, email, roles, mot_de_passe)
                VALUES
                (:nom, :prenom, :email, :roles, :mot_de_passe)";

        $stmt = $this->conn->prepare($query);

        $this->nom = htmlspecialchars(strip_tags($this->nom));
        $this->prenom = htmlspecialchars(strip_tags($this->prenom));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->roles = htmlspecialchars(strip_tags($this->roles));
        $this->mot_de_passe = htmlspecialchars(strip_tags($this->mot_de_passe));

        $password_hash = password_hash($this->mot_de_passe, PASSWORD_BCRYPT);

        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":prenom", $this->prenom);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":roles", $this->roles);
        $stmt->bindParam(":mot_de_passe", $password_hash);

        // Execute the query
        try{
            if($stmt->execute()) {
                $this->id_utilisateur = $this->conn->lastInsertId();
                return true;
            }
        }
        catch(PDOException $e){
            error_log("Erreur lors de la création d'utilisateur : " . $e->getMessage());
        }

        return false;
    }

    public function emailExists() {
        $query = "SELECT id_utilisateur, nom, prenom, email, roles, mot_de_passe FROM $this->table_name WHERE email = ? LIMIT 1";

        $stmt = $this->conn->prepare($query);

        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(1, $this->email);

        $stmt->execute();

        $num = $stmt->rowCount();
        error_log("User::emailExists query returned {$num} rows for email: {$this->email} using {$this->table_name}");

        if($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
             
            error_log("User data found: " . print_r($row, true));

            $this->id_utilisateur = $row['id_utilisateur'];
            $this->nom = $row['nom'];
            $this->prenom = $row['prenom'];
            $this->email = $row['email'];
            $this->roles = $row['roles'];
            $this->mot_de_passe = $row['mot_de_passe'];

            return true;
        }

        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    nom = :nom,
                    prenom = :prenom,
                    email = :email
                WHERE
                    id_utilisateur = :id_utilisateur";

        $stmt = $this->conn->prepare($query);

        $this->nom = htmlspecialchars(strip_tags($this->nom));
        $this->prenom = htmlspecialchars(strip_tags($this->prenom));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));

        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":prenom", $this->prenom);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }


    public function updatePassword() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    mot_de_passe = :mot_de_passe
                WHERE
                    id_utilisateur = :id_utilisateur";

        $stmt = $this->conn->prepare($query);

        $this->mot_de_passe = htmlspecialchars(strip_tags($this->mot_de_passe));
        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));

        $password_hash = password_hash($this->mot_de_passe, PASSWORD_BCRYPT);

        $stmt->bindParam(":mot_de_passe", $password_hash);
        $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function readOne() {
        // Query to select a single user
        $query = "SELECT id_utilisateur, nom, prenom, email, roles
                FROM " . $this->table_name . "
                WHERE id_utilisateur = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);

        $this->id_utilisateur = htmlspecialchars(strip_tags($this->id_utilisateur));
        $stmt->bindParam(1, $this->id_utilisateur);

        $stmt->execute();

        $num = $stmt->rowCount();

        if($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id_utilisateur = $row['id_utilisateur'];
            $this->nom = $row['nom'];
            $this->prenom = $row['prenom'];
            $this->email = $row['email'];
            $this->roles = $row['roles'];

            return true;
        }

        return false;
    }
}
?>
