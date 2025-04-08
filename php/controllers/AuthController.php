<?php
include_once '../config/Database.php';
include_once '../models/User.php';

session_start();

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if($data){
    $_POST = array_merge($_POST, $data);
}

error_log("AuthController.php called with action: " . (isset($_POST['action']) ? $_POST['action'] : 'none'));
error_log("POST data: " . print_r($_POST, true));

if(isset($_POST['action'])) {
    switch($_POST['action']) {
        case 'login':
            login($user);
            break;
        case 'register':
            register($user);
            break;
        case 'logout':
            logout();
            break;
        default:
            sendResponse(false, "Invalid action");
            break;
    }
} else {
    sendResponse(false, "No action specified");
}

function login($user) {
    $user->email = isset($_POST['email']) ? $_POST['email'] : "";
    $password = isset($_POST['password']) ? $_POST['password'] : "";
    error_log("Login attempt with email: {$user->email}");

    if(empty($user->email) || empty($password)) {
        error_log("Missing email or password");
        sendResponse(false, "Please provide email and password");
        return;
    }

    if($user->emailExists()) {
        error_log("Email exists, verifying password");
        error_log("Stored password hash: " . $user->mot_de_passe);
        error_log("Attempting to verify password: " . substr($password, 0, 3) . "***");

        if(password_verify($password, $user->mot_de_passe)) {
            error_log("Password verified successfully");
            
            $_SESSION['loggedIn'] = true;
            $_SESSION['userId'] = $user->id_utilisateur;
            $_SESSION['userName'] = $user->prenom . ' ' . $user->nom;
            $_SESSION['userEmail'] = $user->email;
            $_SESSION['userRole'] = $user->roles;

            if(isset($_POST['rememberMe']) && $_POST['rememberMe'] == '1') {
                $rememberToken = bin2hex(random_bytes(32));
                setcookie('rememberMe', $rememberToken, time() + (86400 * 30), "/");
            }
            
            sendResponse(true, "Login successful", [
                'userId' => $user->id_utilisateur,
                'userName' => $user->prenom . ' ' . $user->nom,
                'userRole' => $user->roles
            ]);
        } else {
            error_log("Password verification failed");
            error_log("Raw password provided: " . $password);
            error_log("Hash in database: " . $user->mot_de_passe);
            sendResponse(false, "Invalid email or password");
        }
    } else {
        error_log("Email not found: {$user->email}");
        sendResponse(false, "Invalid email or password");
    }
}

function register($user) {
    $user->nom = isset($_POST['nom']) ? $_POST['nom'] : (isset($_POST['lastName']) ? $_POST['lastName'] : "");
    $user->prenom = isset($_POST['prenom']) ? $_POST['prenom'] : (isset($_POST['firstName']) ? $_POST['firstName'] : "");
    $user->email = isset($_POST['email']) ? $_POST['email'] : "";
    $user->mot_de_passe = isset($_POST['mot_de_passe']) ? $_POST['mot_de_passe'] : (isset($_POST['password']) ? $_POST['password'] : "");
    $confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : "";
    $agreeTerms = isset($_POST['agreeTerms']) ? $_POST['agreeTerms'] : "";

    $user->roles = "user";
    
    // Validate input
    if(empty($user->nom) || empty($user->prenom) || empty($user->email) || empty($user->mot_de_passe)) {
        sendResponse(false, "Please fill all required fields");
        return;
    }
    
    if($user->mot_de_passe !== $confirmPassword) {
        sendResponse(false, "Passwords do not match");
        return;
    }
    
    if(empty($agreeTerms)) {
        sendResponse(false, "You must agree to the terms of service");
        return;
    }
    
    // Check if email already exists
    if($user->emailExists()) {
        sendResponse(false, "Email already exists");
        return;
    }
    
    // Create the user
    if($user->create()) {
        // Auto login after registration
        if($user->emailExists()) {
            // Create session
            $_SESSION['loggedIn'] = true;
            $_SESSION['userId'] = $user->id_utilisateur;
            $_SESSION['userName'] = $user->prenom . ' ' . $user->nom;
            $_SESSION['userEmail'] = $user->email;
            $_SESSION['userRole'] = $user->roles;
            
            sendResponse(true, "Registration successful", [
                'userId' => $user->id_utilisateur,
                'userName' => $user->prenom . ' ' . $user->nom,
                'userRole' => $user->roles
            ]);
        } else {
            sendResponse(true, "Registration successful. Please log in");
        }
    } else {
        sendResponse(false, "Registration failed");
    }
}

/**
 * Process user logout
 */
function logout() {
    // Clear session
    session_unset();
    session_destroy();
    
    // Clear remember me cookie
    if(isset($_COOKIE['rememberMe'])) {
        setcookie('rememberMe', '', time() - 3600, "/");
    }
    
    sendResponse(true, "Logout successful");
}

/**
 * Send JSON response
 * @param boolean $success Success status
 * @param string $message Response message
 * @param array $data Additional data
 */
function sendResponse($success, $message, $data = []) {
    // Set response code
    http_response_code($success ? 200 : 400);
    
    // Create response array
    $response = [
        "success" => $success,
        "message" => $message
    ];
    
    // Add additional data
    if(!empty($data)) {
        $response["data"] = $data;
    }
    
    // Debug logging
    error_log("Sending response: " . json_encode($response));
    
    // Send JSON response
    echo json_encode($response);
    exit();
}
?>