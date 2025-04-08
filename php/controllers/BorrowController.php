<?php
// Include database and model files
include_once '../config/Database.php';
include_once '../models/Borrow.php';
include_once '../models/Book.php';
include_once '../models/Reservation.php';
include_once '../models/Notification.php';

// Start session
session_start();

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate objects
$borrow = new Borrow($db);
$book = new Book($db);
$reservation = new Reservation($db);
$notification = new Notification($db);

// Check if user is logged in
if(!isset($_SESSION['loggedIn']) || $_SESSION['loggedIn'] !== true) {
    sendResponse(false, "You must be logged in to perform this action");
    exit();
}

// Check request method
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Handle GET requests (retrieve borrows)
    if(isset($_GET['action'])) {
        switch($_GET['action']) {
            case 'getActiveBorrows':
                // Get active borrows for current user
                getActiveBorrows($borrow, $_SESSION['userId']);
                break;
            case 'getBorrowHistory':
                // Get borrowing history for current user
                getBorrowHistory($borrow, $_SESSION['userId']);
                break;
            default:
                sendResponse(false, "Invalid action");
                break;
        }
    } else {
        sendResponse(false, "Action is required");
    }
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle POST requests (actions on borrows)
    if(isset($_POST['action'])) {
        switch($_POST['action']) {
            case 'borrowBook':
                // Borrow a book
                if(isset($_POST['bookId'])) {
                    borrowBook($borrow, $book, $reservation, $_SESSION['userId'], $_POST['bookId']);
                } else {
                    sendResponse(false, "Book ID is required");
                }
                break;
            case 'returnBook':
                // Return a book
                if(isset($_POST['borrowId'])) {
                    returnBook($borrow, $book, $_POST['borrowId']);
                } else {
                    sendResponse(false, "Borrow ID is required");
                }
                break;
            case 'extendBorrowing':
                // Extend borrowing period
                if(isset($_POST['borrowId'])) {
                    extendBorrowing($borrow, $_POST['borrowId']);
                } else {
                    sendResponse(false, "Borrow ID is required");
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
 * Get active borrows for a user
 * @param Borrow $borrow Borrow object
 * @param int $userId User ID
 */
function getActiveBorrows($borrow, $userId) {
    // Get active borrows from database
    $stmt = $borrow->readActiveByUser($userId);
    $num = $stmt->rowCount();
    
    if($num > 0) {
        // Borrows found
        $borrows_arr = [];
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $borrow_item = [
                "id_emprunt" => $id_emprunt,
                "id_utilisateur" => $id_utilisateur,
                "id_livre" => $id_livre,
                "titre" => $titre,
                "auteur" => $auteur,
                "date_emprunt" => $date_emprunt,
                "date_retour_prevu" => $date_retour_prevu,
                "statut_emprunt" => $statut_emprunt
            ];
            
            array_push($borrows_arr, $borrow_item);
        }
        
        sendResponse(true, "{$num} active borrows found", $borrows_arr);
    } else {
        // No borrows found
        sendResponse(true, "No active borrows found", []);
    }
}

/**
 * Get borrowing history for a user
 * @param Borrow $borrow Borrow object
 * @param int $userId User ID
 */
function getBorrowHistory($borrow, $userId) {
    // Get borrow history from database
    $stmt = $borrow->getHistoryByUser($userId);
    $num = $stmt->rowCount();
    
    if($num > 0) {
        // History found
        $history_arr = [];
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $history_item = [
                "id_historique" => $id_historique,
                "id_utilisateur" => $id_utilisateur,
                "id_livre" => $id_livre,
                "titre" => $titre,
                "auteur" => $auteur,
                "date_emprunt" => $date_emprunt,
                "date_retour_effectif" => $date_retour_effectif
            ];
            
            array_push($history_arr, $history_item);
        }
        
        sendResponse(true, "{$num} history records found", $history_arr);
    } else {
        // No history found
        sendResponse(true, "No borrowing history found", []);
    }
}

/**
 * Borrow a book
 * @param Borrow $borrow Borrow object
 * @param Book $book Book object
 * @param Reservation $reservation Reservation object
 * @param int $userId User ID
 * @param int $bookId Book ID
 */
function borrowBook($borrow, $book, $reservation, $userId, $bookId) {
    // Set properties
    $borrow->id_utilisateur = $userId;
    $borrow->id_livre = $bookId;
    
    // Check if book is already borrowed by the user
    if($borrow->isBookBorrowed()) {
        sendResponse(false, "You already have this book borrowed");
        return;
    }
    
    // Set book ID
    $book->id_livre = $bookId;
    
    // Get book details
    if($book->readOne()) {
        // Check if book is available
        if($book->disponibilite === 'Disponible') {
            // Set borrowing properties
            $borrow->date_emprunt = date('Y-m-d');
            
            // Set return date to 14 days from now
            $returnDate = new DateTime();
            $returnDate->add(new DateInterval('P14D'));
            $borrow->date_retour_prevu = $returnDate->format('Y-m-d');
            
            // Initialize return date (will be updated when book is returned)
            $borrow->date_retour_effectif = "0000-00-00";
            
            // Set status
            $borrow->statut_emprunt = 'En cours';
            
            // Begin transaction
            global $db;
            $db->beginTransaction();
            
            try {
                // Create borrowing record
                if($borrow->create()) {
                    // Update book availability
                    $book->updateAvailability('Indisponible');
                    
                    // Check if there was a reservation
                    $reservation->id_utilisateur = $userId;
                    $reservation->id_livre = $bookId;
                    
                    if($reservation->checkExistingReservation()) {
                        // Delete the reservation
                        $reservationsStmt = $reservation->readByUser($userId);
                        
                        while($row = $reservationsStmt->fetch(PDO::FETCH_ASSOC)) {
                            if($row['id_livre'] == $bookId) {
                                $reservation->id_reservation = $row['id_reservation'];
                                $reservation->delete();
                                break;
                            }
                        }
                    }
                    
                    // Commit transaction
                    $db->commit();
                    
                    sendResponse(true, "Book borrowed successfully", [
                        "return_date" => $borrow->date_retour_prevu
                    ]);
                } else {
                    // Rollback transaction
                    $db->rollback();
                    sendResponse(false, "Failed to borrow book");
                }
            } catch(Exception $e) {
                // Rollback transaction on error
                $db->rollback();
                sendResponse(false, "Error: " . $e->getMessage());
            }
        } else {
            sendResponse(false, "Book is not available for borrowing");
        }
    } else {
        sendResponse(false, "Book not found");
    }
}

/**
 * Return a book
 * @param Borrow $borrow Borrow object
 * @param Book $book Book object
 * @param int $borrowId Borrow ID
 */
function returnBook($borrow, $book, $borrowId) {
    // Set borrow ID
    $borrow->id_emprunt = $borrowId;
    
    // Get borrow details
    if($borrow->readOne()) {
        // Check if borrowing belongs to the current user
        if($borrow->id_utilisateur != $_SESSION['userId']) {
            sendResponse(false, "You can only return your own borrowed books");
            return;
        }
        
        // Check if book is already returned
        if($borrow->statut_emprunt !== 'En cours') {
            sendResponse(false, "This book has already been returned");
            return;
        }
        
        // Set book ID
        $book->id_livre = $borrow->id_livre;
        
        // Begin transaction
        global $db;
        $db->beginTransaction();
        
        try {
            // Mark as returned
            $returnDate = date('Y-m-d');
            if($borrow->markAsReturned($returnDate)) {
                // Get wait list object
                include_once '../models/WaitList.php';
                $waitList = new WaitList($db);
                
                // Check if there's someone in the wait list
                $nextInLine = $waitList->getNextInLine($borrow->id_livre);
                
                if($nextInLine) {
                    // There's someone in the wait list
                    // Create notification for that user
                    $notification = new Notification($db);
                    
                    // Get book details
                    $book->readOne();
                    
                    $notification->createAvailabilityNotification(
                        $nextInLine['id_utilisateur'],
                        $borrow->id_livre,
                        $book->titre
                    );
                    
                    // Update their reservation status
                    $reservation = new Reservation($db);
                    
                    // Find their reservation
                    $reservationsStmt = $reservation->readByUser($nextInLine['id_utilisateur']);
                    
                    while($row = $reservationsStmt->fetch(PDO::FETCH_ASSOC)) {
                        if($row['id_livre'] == $borrow->id_livre && $row['statut'] == 'En Attente') {
                            $reservation->id_reservation = $row['id_reservation'];
                            $reservation->updateStatus('Disponible');
                            break;
                        }
                    }
                } else {
                    // No one in wait list, update book availability
                    $book->updateAvailability('Disponible');
                }
                
                // Commit transaction
                $db->commit();
                
                sendResponse(true, "Book returned successfully");
            } else {
                // Rollback transaction
                $db->rollback();
                sendResponse(false, "Failed to return book");
            }
        } catch(Exception $e) {
            // Rollback transaction on error
            $db->rollback();
            sendResponse(false, "Error: " . $e->getMessage());
        }
    } else {
        sendResponse(false, "Borrowing record not found");
    }
}

/**
 * Extend borrowing period
 * @param Borrow $borrow Borrow object
 * @param int $borrowId Borrow ID
 */
function extendBorrowing($borrow, $borrowId) {
    // Set borrow ID
    $borrow->id_emprunt = $borrowId;
    
    // Get borrow details
    if($borrow->readOne()) {
        // Check if borrowing belongs to the current user
        if($borrow->id_utilisateur != $_SESSION['userId']) {
            sendResponse(false, "You can only extend your own borrowed books");
            return;
        }
        
        // Check if book is not returned
        if($borrow->statut_emprunt !== 'En cours') {
            sendResponse(false, "You can only extend active borrowings");
            return;
        }
        
        // Check if there's a reservation for this book
        $reservation = new Reservation($db);
        $book = new Book($db);
        
        $book->id_livre = $borrow->id_livre;
        $book->readOne();
        
        include_once '../models/WaitList.php';
        $waitList = new WaitList($db);
        
        // Check if there's someone in the wait list
        $nextInLine = $waitList->getNextInLine($borrow->id_livre);
        
        if($nextInLine) {
            sendResponse(false, "Cannot extend borrowing because there are other users waiting for this book");
            return;
        }
        
        // Calculate new return date (add 7 days to current return date)
        $currentReturnDate = new DateTime($borrow->date_retour_prevu);
        $currentReturnDate->add(new DateInterval('P7D'));
        $newReturnDate = $currentReturnDate->format('Y-m-d');
        
        // Extend borrowing
        if($borrow->extendBorrowing($newReturnDate)) {
            sendResponse(true, "Borrowing period extended successfully", [
                "new_return_date" => $newReturnDate
            ]);
        } else {
            sendResponse(false, "Failed to extend borrowing period");
        }
    } else {
        sendResponse(false, "Borrowing record not found");
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
