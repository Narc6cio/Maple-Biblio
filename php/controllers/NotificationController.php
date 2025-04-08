<?php
// Include database and model files
include_once '../config/Database.php';
include_once '../models/Notification.php';

// Start session
session_start();

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate notification object
$notification = new Notification($db);

// Check if user is logged in
if(!isset($_SESSION['loggedIn']) || $_SESSION['loggedIn'] !== true) {
    sendResponse(false, "You must be logged in to perform this action");
    exit();
}

// Check request method
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Handle GET requests (retrieve notifications)
    if(isset($_GET['action'])) {
        switch($_GET['action']) {
            case 'getNotifications':
                // Get notifications for current user
                getNotifications($notification, $_SESSION['userId']);
                break;
            default:
                sendResponse(false, "Invalid action");
                break;
        }
    } else {
        sendResponse(false, "Action is required");
    }
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle POST requests (actions on notifications)
    if(isset($_POST['action'])) {
        switch($_POST['action']) {
            case 'deleteNotification':
                // Delete a notification
                if(isset($_POST['notificationId'])) {
                    deleteNotification($notification, $_POST['notificationId']);
                } else {
                    sendResponse(false, "Notification ID is required");
                }
                break;
            default:
                sendResponse(false, "Invalid action");
                break;
        }
    } else {
        sendResponse(false, "Action is required");
    }
} else {
    // Unsupported method
    http_response_code(405);
    sendResponse(false, "Method not allowed");
}

/**
 * Get notifications for a user
 * @param Notification $notification Notification object
 * @param int $userId User ID
 */
function getNotifications($notification, $userId) {
    // Get notifications from database
    $stmt = $notification->readByUser($userId);
    $num = $stmt->rowCount();
    
    if($num > 0) {
        // Notifications found
        $notifications_arr = [];
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $notification_item = [
                "id_notification" => $id_notification,
                "id_utilisateur" => $id_utilisateur,
                "messages" => $messages,
                "date_envoi" => $date_envoi,
                "types" => $types
            ];
            
            array_push($notifications_arr, $notification_item);
        }
        
        sendResponse(true, "{$num} notifications found", $notifications_arr);
    } else {
        // No notifications found
        sendResponse(true, "No notifications found", []);
    }
}

/**
 * Delete a notification
 * @param Notification $notification Notification object
 * @param int $notificationId Notification ID
 */
function deleteNotification($notification, $notificationId) {
    // Get notification details
    $notification->id_notification = $notificationId;
    
    // Delete notification
    if($notification->delete()) {
        sendResponse(true, "Notification deleted successfully");
    } else {
        sendResponse(false, "Failed to delete notification");
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
