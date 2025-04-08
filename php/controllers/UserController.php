<?php
// Include database and model files
include_once '../config/Database.php';
include_once '../models/User.php';

// Start session
session_start();

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate user object
$user = new User($db);

// Check if user is logged in
if(!isset($_SESSION['loggedIn']) || $_SESSION['loggedIn'] !== true) {
    sendResponse(false, "You must be logged in to perform this action");
    exit();
}

// Check if action is set
if(isset($_POST['action'])) {
    switch($_POST['action']) {
        case 'updateProfile':
            // Process profile update
            updateProfile($user);
            break;
        case 'changePassword':
            // Process password change
            changePassword($user);
            break;
        default:
            // Invalid action
            sendResponse(false, "Invalid action");
            break;
    }
} else if(isset($_GET['action'])) {
    switch($_GET['action']) {
        case 'getProfile':
            // Get user profile
            getProfile($user);
            break;
        default:
            // Invalid action
            sendResponse(false, "Invalid action");
            break;
    }
} else {
    // No action specified
    sendResponse(false, "No action specified");
}

/**
 * Update user profile
 * @param User $user User object
 */
function updateProfile($user) {
    // Set user ID from session
    $user->id_utilisateur = $_SESSION['userId'];
    
    // Get input data
    $user->nom = isset($_POST['nom']) ? $_POST['nom'] : "";
    $user->prenom = isset($_POST['prenom']) ? $_POST['prenom'] : "";
    $user->email = isset($_POST['email']) ? $_POST['email'] : "";
    
    // Validate input
    if(empty($user->nom) || empty($user->prenom) || empty($user->email)) {
        sendResponse(false, "Please fill all required fields");
        return;
    }
    
    // Update user profile
    if($user->update()) {
        // Update session data
        $_SESSION['userName'] = $user->prenom . ' ' . $user->nom;
        $_SESSION['userEmail'] = $user->email;
        
        sendResponse(true, "Profile updated successfully");
    } else {
        sendResponse(false, "Failed to update profile");
    }
}

/**
 * Change user password
 * @param User $user User object
 */
function changePassword($user) {
    // Set user ID from session
    $user->id_utilisateur = $_SESSION['userId'];
    
    // Get input data
    $currentPassword = isset($_POST['currentPassword']) ? $_POST['currentPassword'] : "";
    $newPassword = isset($_POST['newPassword']) ? $_POST['newPassword'] : "";
    $confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : "";
    
    // Validate input
    if(empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
        sendResponse(false, "Please fill all required fields");
        return;
    }
    
    if($newPassword !== $confirmPassword) {
        sendResponse(false, "New passwords do not match");
        return;
    }
    
    // Get user data to verify current password
    if($user->readOne()) {
        // Verify current password
        if(password_verify($currentPassword, $user->mot_de_passe)) {
            // Set new password
            $user->mot_de_passe = $newPassword;
            
            // Update password
            if($user->updatePassword()) {
                sendResponse(true, "Password changed successfully");
            } else {
                sendResponse(false, "Failed to change password");
            }
        } else {
            sendResponse(false, "Current password is incorrect");
        }
    } else {
        sendResponse(false, "User not found");
    }
}

/**
 * Get user profile
 * @param User $user User object
 */
function getProfile($user) {
    // Set user ID from session
    $user->id_utilisateur = $_SESSION['userId'];
    
    // Get user data
    if($user->readOne()) {
        // Create profile array
        $profile_arr = [
            "id_utilisateur" => $user->id_utilisateur,
            "nom" => $user->nom,
            "prenom" => $user->prenom,
            "email" => $user->email,
            "roles" => $user->roles
        ];
        
        sendResponse(true, "Profile retrieved successfully", $profile_arr);
    } else {
        sendResponse(false, "User not found");
    }
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
    
    // Send JSON response
    echo json_encode($response);
    exit();
}
?>
