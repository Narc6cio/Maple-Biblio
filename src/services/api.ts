
const API_BASE_URL = "http://localhost/bibliotheque/php/controllers";

const handleHttpErrors = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", response.status, errorText);
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  return response.json();
};

export const AuthService = {
  register: async (userData: {
    prenom: string;
    nom: string;
    email: string;
    mot_de_passe: string;
    confirmPassword: string;
    agreeTerms: boolean;
  }) => {
    try {
      const formData = new FormData();
      formData.append("action", "register");
      formData.append("prenom", userData.prenom);
      formData.append("nom", userData.nom);
      formData.append("email", userData.email);
      formData.append("mot_de_passe", userData.mot_de_passe);
      formData.append("confirmPassword", userData.confirmPassword);
      formData.append("agreeTerms", userData.agreeTerms ? "1" : "");

      console.log("Register request sent with data:", {
        prenom: userData.prenom,
        nom: userData.nom,
        email: userData.email
      });

      const response = await fetch(`${API_BASE_URL}/AuthController.php`, {
        method: "POST",
        body: formData,
      });

      return await handleHttpErrors(response);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  login: async (credentials: { email: string; mot_de_passe: string }) => {
    try {
      console.log("Login with credentials:", { email: credentials.email, password: "***" });
      
      const formData = new FormData();
      formData.append("action", "login");
      formData.append("email", credentials.email);
      formData.append("password", credentials.mot_de_passe);

      console.log("Login request sent with email:", credentials.email);
      const response = await fetch(`${API_BASE_URL}/AuthController.php`, {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login error response:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          return errorData;
        } catch (parseError) {
          throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }
      }

      const responseText = await response.text();
      console.log("Raw login response:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed login response:", data);
        return data;
      } catch (parseError) {
        console.error("Error parsing login response:", parseError);
        throw new Error(`Invalid response format: ${responseText}`);
      }
    } catch (error) {
      console.error("Login fetch error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const formData = new FormData();
      formData.append("action", "logout");

      const response = await fetch(`${API_BASE_URL}/AuthController.php`, {
        method: "POST",
        body: formData,
      });

      return await handleHttpErrors(response);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};

// User services
export const UserService = {
  // Get user profile
  getProfile: async (userId: number) => {
    const formData = new FormData();
    formData.append("action", "getUserProfile");
    formData.append("id_utilisateur", userId.toString());

    const response = await fetch(`${API_BASE_URL}/UserController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Update user profile
  updateProfile: async (profileData: {
    id_utilisateur: number;
    prenom: string;
    nom: string;
    email: string;
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
  }) => {
    const formData = new FormData();
    formData.append("action", "updateProfile");
    
    // Append all data to formData
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/UserController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },
};

// Book services
export const BookService = {
  // Get all books
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/BookController.php?action=getBooks`, {
        method: "GET",
      });
      
      return handleHttpErrors(response);
    } catch (error) {
      console.error("Error getting books:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error", 
        data: [] 
      };
    }
  },

  // Get a book by ID
  getById: async (bookId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/BookController.php?action=getBookById&id_livre=${bookId}`, {
        method: "GET",
      });
      
      return handleHttpErrors(response);
    } catch (error) {
      console.error("Error getting book by ID:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },

  // Search books by title, author, or category
  search: async (query: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/BookController.php?action=searchBooks&query=${encodeURIComponent(query)}`, {
        method: "GET",
      });
      
      return handleHttpErrors(response);
    } catch (error) {
      console.error("Error searching books:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error", 
        data: [] 
      };
    }
  },
};


// Borrow services
export const BorrowService = {
  // Get borrowed books by user ID
  getBorrowedBooks: async (userId: number) => {
    const formData = new FormData();
    formData.append("action", "getBorrowedBooks");
    formData.append("id_utilisateur", userId.toString());

    const response = await fetch(`${API_BASE_URL}/BorrowController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Get borrowing history by user ID
  getBorrowHistory: async (userId: number) => {
    const formData = new FormData();
    formData.append("action", "getBorrowHistory");
    formData.append("id_utilisateur", userId.toString());

    const response = await fetch(`${API_BASE_URL}/BorrowController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Borrow a book
  borrowBook: async (userId: number, bookId: number) => {
    const formData = new FormData();
    formData.append("action", "borrowBook");
    formData.append("id_utilisateur", userId.toString());
    formData.append("id_livre", bookId.toString());

    const response = await fetch(`${API_BASE_URL}/BorrowController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Return a book
  returnBook: async (borrowId: number) => {
    const formData = new FormData();
    formData.append("action", "returnBook");
    formData.append("id_emprunt", borrowId.toString());

    const response = await fetch(`${API_BASE_URL}/BorrowController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Extend a borrowing period
  extendBorrowing: async (borrowId: number) => {
    const formData = new FormData();
    formData.append("action", "extendBorrowing");
    formData.append("id_emprunt", borrowId.toString());

    const response = await fetch(`${API_BASE_URL}/BorrowController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Get reservations by user ID
  getReservations: async (userId: number) => {
    const formData = new FormData();
    formData.append("action", "getReservations");
    formData.append("id_utilisateur", userId.toString());

    const response = await fetch(`${API_BASE_URL}/BorrowController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Reserve a book
  reserveBook: async (userId: number, bookId: number) => {
    const formData = new FormData();
    formData.append("action", "reserveBook");
    formData.append("id_utilisateur", userId.toString());
    formData.append("id_livre", bookId.toString());

    const response = await fetch(`${API_BASE_URL}/BorrowController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Cancel a reservation
  cancelReservation: async (reservationId: number) => {
    const formData = new FormData();
    formData.append("action", "cancelReservation");
    formData.append("id_reservation", reservationId.toString());

    const response = await fetch(`${API_BASE_URL}/BorrowController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },
};

// Notification services
export const NotificationService = {
  // Get notifications by user ID
  getNotifications: async (userId: number) => {
    const formData = new FormData();
    formData.append("action", "getNotifications");
    formData.append("id_utilisateur", userId.toString());

    const response = await fetch(`${API_BASE_URL}/NotificationController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },

  // Mark a notification as read
  markAsRead: async (notificationId: number) => {
    const formData = new FormData();
    formData.append("action", "markAsRead");
    formData.append("id_notification", notificationId.toString());

    const response = await fetch(`${API_BASE_URL}/NotificationController.php`, {
      method: "POST",
      body: formData,
    });

    return handleHttpErrors(response);
  },
};
