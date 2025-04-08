import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Bienvenue chez <span className="text-warning">Maple Biblio</span></h1>
              <p className="lead mb-4">Your gateway to thousands of books. Reserve, borrow, and discover your next favorite read with our online library management system.</p>
              <div className="d-flex gap-3">
                <Link to="/books" className="btn btn-warning btn-lg">Browse Books</Link>
                <Link to="/register" className="btn btn-outline-dark btn-lg">Sign Up</Link>
              </div>
            </div>
            <div className="col-lg-6">
              <img 
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&q=85&w=1200&h=800&fit=crop" 
                alt="Library" 
                className="img-fluid rounded shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Our Features</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: "60px", height: "60px" }}>
                    <i className="bi bi-book fs-3"></i>
                  </div>
                  <h5 className="card-title">Online Reservations</h5>
                  <p className="card-text">Reserve books online and check their real-time availability.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: "60px", height: "60px" }}>
                    <i className="bi bi-bell fs-3"></i>
                  </div>
                  <h5 className="card-title">Automatic Notifications</h5>
                  <p className="card-text">Receive alerts about book availability and return reminders.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: "60px", height: "60px" }}>
                    <i className="bi bi-lightbulb fs-3"></i>
                  </div>
                  <h5 className="card-title">Personalized Suggestions</h5>
                  <p className="card-text">Get book recommendations based on your reading history.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
