import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Types for our dashboard data
interface BookData {
  id: number;
  title: string;
  author: string;
  borrowedDate: string;
  dueDate: string;
}

interface ReservationData {
  id: number;
  title: string;
  author: string;
  reservationDate: string;
  status: 'En Attente' | 'Disponible' | 'Annulée';
  position: number;
}

interface HistoryData {
  id: number;
  title: string;
  author: string;
  borrowedDate: string;
  returnedDate: string;
}

interface NotificationData {
  id: number;
  message: string;
  date: string;
  type: 'availability' | 'reminder' | 'return';
  title: string;
}

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

const MyAccount = () => {
  // State for user data
  const [borrowedBooks, setBorrowedBooks] = useState<BookData[]>([]);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setTimeout(() => {
          setBorrowedBooks([
            {
              id: 1,
              title: 'The Great Gatsby',
              author: 'F. Scott Fitzgerald',
              borrowedDate: '2023-06-15',
              dueDate: '2023-07-15'
            }
          ]);
          
          setReservations([
            {
              id: 1,
              title: 'To Kill a Mockingbird',
              author: 'Harper Lee',
              reservationDate: '2023-06-10',
              status: 'En Attente',
              position: 2
            }
          ]);
          
          setHistory([
            {
              id: 1,
              title: 'Pride and Prejudice',
              author: 'Jane Austen',
              borrowedDate: '2023-05-01',
              returnedDate: '2023-05-30'
            }
          ]);
          
          setNotifications([
            {
              id: 1,
              message: 'Your reserved book is now available for pickup.',
              date: '2023-06-20',
              type: 'availability',
              title: 'To Kill a Mockingbird'
            }
          ]);
          
          setProfile({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          });
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur s'est produite lors du chargement des données. Veuillez réessayer.",
        });
      }
    };

    fetchUserData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Handle actions
  const handleExtendBorrowing = (id: number) => {
    toast({
      title: "Période prolongée",
      description: "La période d'emprunt a été prolongée avec succès.",
    });
  };

  const handleReturnBook = (id: number) => {
    toast({
      title: "Livre retourné",
      description: "Le livre a été marqué comme retourné. Merci de le rendre à la bibliothèque.",
    });
  };

  const handleCancelReservation = (id: number) => {
    toast({
      title: "Réservation annulée",
      description: "Votre réservation a été annulée avec succès.",
    });
  };

  return (
    <MainLayout>
      <div className="container py-5">
        <h1 className="mb-4">Mon Compte</h1>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3">Chargement de vos informations...</p>
          </div>
        ) : (
          <Tabs defaultValue="dashboard">
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="borrowed">Livres Empruntés</TabsTrigger>
              <TabsTrigger value="reservations">Réservations</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="profile">Profil</TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard">
              <Card>
                <CardHeader>
                  <CardTitle>Bienvenue, {profile.firstName}!</CardTitle>
                  <CardDescription>Voici un aperçu de votre activité de bibliothèque</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <div className="card border-warning h-100">
                        <div className="card-body text-center">
                          <h5 className="card-title text-muted">Livres Empruntés</h5>
                          <p className="display-4 fw-bold text-warning">{borrowedBooks.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-warning h-100">
                        <div className="card-body text-center">
                          <h5 className="card-title text-muted">Réservations</h5>
                          <p className="display-4 fw-bold text-warning">{reservations.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-warning h-100">
                        <div className="card-body text-center">
                          <h5 className="card-title text-muted">Historique</h5>
                          <p className="display-4 fw-bold text-warning">{history.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-warning h-100">
                        <div className="card-body text-center">
                          <h5 className="card-title text-muted">Notifications</h5>
                          <p className="display-4 fw-bold text-warning">{notifications.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Borrowed Books */}
            <TabsContent value="borrowed">
              <Card>
                <CardHeader>
                  <CardTitle>Livres Empruntés</CardTitle>
                  <CardDescription>Les livres que vous avez actuellement empruntés</CardDescription>
                </CardHeader>
                <CardContent>
                  {borrowedBooks.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>Date d'emprunt</th>
                            <th>Date de retour</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {borrowedBooks.map(book => (
                            <tr key={book.id}>
                              <td>{book.title}</td>
                              <td>{book.author}</td>
                              <td>{formatDate(book.borrowedDate)}</td>
                              <td>{formatDate(book.dueDate)}</td>
                              <td>
                                <Button variant="outline" className="me-2" onClick={() => handleExtendBorrowing(book.id)}>
                                  Prolonger
                                </Button>
                                <Button variant="outline" onClick={() => handleReturnBook(book.id)}>
                                  Retourner
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4">Vous n'avez aucun livre emprunté actuellement.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reservations */}
            <TabsContent value="reservations">
              <Card>
                <CardHeader>
                  <CardTitle>Réservations</CardTitle>
                  <CardDescription>Vos réservations en cours</CardDescription>
                </CardHeader>
                <CardContent>
                  {reservations.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>Date de réservation</th>
                            <th>Statut</th>
                            <th>Position</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map(reservation => (
                            <tr key={reservation.id}>
                              <td>{reservation.title}</td>
                              <td>{reservation.author}</td>
                              <td>{formatDate(reservation.reservationDate)}</td>
                              <td>
                                <span className={`badge ${
                                  reservation.status === 'Disponible' 
                                    ? 'bg-success' 
                                    : reservation.status === 'Annulée' 
                                      ? 'bg-danger' 
                                      : 'bg-warning text-dark'
                                }`}>
                                  {reservation.status}
                                </span>
                              </td>
                              <td>{reservation.position}</td>
                              <td>
                                <Button variant="outline" onClick={() => handleCancelReservation(reservation.id)}>
                                  Annuler
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4">Vous n'avez aucune réservation en cours.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des Emprunts</CardTitle>
                  <CardDescription>Vos emprunts passés</CardDescription>
                </CardHeader>
                <CardContent>
                  {history.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>Date d'emprunt</th>
                            <th>Date de retour</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map(item => (
                            <tr key={item.id}>
                              <td>{item.title}</td>
                              <td>{item.author}</td>
                              <td>{formatDate(item.borrowedDate)}</td>
                              <td>{formatDate(item.returnedDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4">Vous n'avez aucun historique d'emprunt.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Vos alertes et notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length > 0 ? (
                    <div className="list-group">
                      {notifications.map(notification => (
                        <div key={notification.id} className="list-group-item list-group-item-action">
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">
                              {notification.type === 'availability' && `Livre disponible: `}
                              {notification.type === 'reminder' && `Rappel de retour: `}
                              {notification.type === 'return' && `Confirmation de retour: `}
                              <strong>{notification.title}</strong>
                            </h6>
                            <small>{formatDate(notification.date)}</small>
                          </div>
                          <p className="mb-1">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4">Vous n'avez aucune notification.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du Profil</CardTitle>
                  <CardDescription>Gérez vos informations personnelles</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Profil mis à jour",
                      description: "Vos informations ont été mises à jour avec succès.",
                    });
                  }}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Prénom</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nom</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </div>
                    
                    <hr />
                    
                    <h5>Changer le mot de passe</h5>
                    
                    <div className="mb-3">
                      <label className="form-label">Mot de passe actuel</label>
                      <input type="password" className="form-control" />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Nouveau mot de passe</label>
                      <input type="password" className="form-control" />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Confirmer le nouveau mot de passe</label>
                      <input type="password" className="form-control" />
                    </div>
                    
                    <div className="d-grid">
                      <button type="submit" className="btn btn-warning">Sauvegarder les changements</button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default MyAccount;
