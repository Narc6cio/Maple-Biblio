<?php
// Include database and model files
include_once '../config/Database.php';
include_once '../models/Book.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Allow cross-origin requests from the frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get data from request
$data = json_decode(file_get_contents("php://input"), true);
if($data){
    $_POST = array_merge($_POST, $data);
}

// Debug logging
error_log("BookController.php called with action: " . (isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : 'none')));

// Process the request based on the action
$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

switch($action) {
    case 'getBooks':
        getBooks($db);
        break;
    case 'getBookById':
        if(isset($_POST['id_livre']) || isset($_GET['id_livre'])) {
            $bookId = isset($_POST['id_livre']) ? $_POST['id_livre'] : $_GET['id_livre'];
            getBookById($db, $bookId);
        } else {
            sendResponse(false, "Book ID is required");
        }
        break;
    case 'searchBooks':
        $query = isset($_POST['query']) ? $_POST['query'] : (isset($_GET['query']) ? $_GET['query'] : '');
        $filter = isset($_POST['filter']) ? $_POST['filter'] : (isset($_GET['filter']) ? $_GET['filter'] : 'all');
        $sort = isset($_POST['sort']) ? $_POST['sort'] : (isset($_GET['sort']) ? $_GET['sort'] : 'title');
        searchBooks($db, $query, $filter, $sort);
        break;
    default:
        // Default to getting all books if no action specified
        getBooks($db);
        break;
}

/**
 * Get all books
 * @param PDO $db Database connection
 */
function getBooks($db) {
    // Create a book object
    $book = new Book($db);
    
    // Get filter and sort parameters
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'title';
    
    // Get books
    $stmt = $book->read($filter, $sort);
    $num = $stmt->rowCount();
    
    if($num > 0) {
        // Books array
        $books_arr = [];
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $book_item = [
                "id_livre" => $id_livre,
                "titre" => $titre,
                "auteur" => $auteur,
                "annee_publication" => $annee_publication,
                "disponibilite" => $disponibilite,
                "image_couverture" => $image_couverture ?? "https://placehold.co/300x450/FFC107/000000?text=" . urlencode($titre)
            ];
            
            array_push($books_arr, $book_item);
        }
        
        sendResponse(true, "{$num} books found", $books_arr);
    } else {
        sendResponse(true, "No books found", []);
    }
}

/**
 * Get a book by ID
 * @param PDO $db Database connection
 * @param int $bookId Book ID
 */
function getBookById($db, $bookId) {
    // Create a book object
    $book = new Book($db);
    
    // Set ID
    $book->id_livre = $bookId;
    
    // Get the book
    if($book->readOne()) {
        $book_item = [
            "id_livre" => $book->id_livre,
            "titre" => $book->titre,
            "auteur" => $book->auteur,
            "annee_publication" => $book->annee_publication,
            "disponibilite" => $book->disponibilite,
            "image_couverture" => $book->image_couverture ?? "https://placehold.co/300x450/FFC107/000000?text=" . urlencode($book->titre)
        ];
        
        sendResponse(true, "Book found", $book_item);
    } else {
        sendResponse(false, "Book not found");
    }
}

/**
 * Search books
 * @param PDO $db Database connection
 * @param string $query Search query
 * @param string $filter Filter option (all, available, unavailable)
 * @param string $sort Sort option (title, author, year)
 */
function searchBooks($db, $query, $filter, $sort) {
    // Create a book object
    $book = new Book($db);
    
    // Search books
    $stmt = $book->search($query, $filter, $sort);
    $num = $stmt->rowCount();
    
    if($num > 0) {
        // Books array
        $books_arr = [];
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $book_item = [
                "id_livre" => $id_livre,
                "titre" => $titre,
                "auteur" => $auteur,
                "annee_publication" => $annee_publication,
                "disponibilite" => $disponibilite,
                "image_couverture" => $image_couverture ?? "https://placehold.co/300x450/FFC107/000000?text=" . urlencode($titre)
            ];
            
            array_push($books_arr, $book_item);
        }
        
        sendResponse(true, "{$num} books found", $books_arr);
    } else {
        sendResponse(true, "No books found", []);
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
    
    // Debug logging
    error_log("Sending response: " . json_encode($response));
    
    // Send JSON response
    echo json_encode($response);
    exit();
}
?>