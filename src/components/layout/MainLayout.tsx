import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, BookOpen, Home } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

declare global{
  interface Window{
    checkAuthStatus : () => void;
  }
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveRoute = (path: string) => {
    return location.pathname === path ? "active" : "";
  };


  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    // Ensure we navigate to the React route
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">
              <span className="text-warning">Maple</span> Biblio
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className={`nav-link ${isActiveRoute("/")}`} to="/">
                    <Home className="inline-block mr-1 h-4 w-4" />
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActiveRoute("/books")}`}
                    to="/books"
                  >
                    <BookOpen className="inline-block mr-1 h-4 w-4" />
                    Books
                  </Link>
                </li>
                {isAuthenticated ? (
                  <>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${isActiveRoute("/my-account")}`}
                        to="/my-account"
                      >
                        <User className="inline-block mr-1 h-4 w-4" />
                        {user?.firstName}'s Account
                      </Link>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        href="#"
                        onClick={handleLogout}
                      >
                        <LogOut className="inline-block mr-1 h-4 w-4" />
                        Logout
                      </a>
                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActiveRoute("/login")}`}
                      to="/login"
                    >
                      <LogIn className="inline-block mr-1 h-4 w-4" />
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5>
                <span className="text-warning">Maple</span> Biblio
              </h5>
              <p>Your online library management system.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p>&copy; {new Date().getFullYear()} Maple Biblio. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;