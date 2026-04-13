import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAvailabilities } from "@/hooks/use-availabilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Car, Calendar, Users, Settings, LogOut, Trash2, Edit, Check, XCircle, ArrowLeft, DollarSign, ChevronUp, ChevronDown, User, FileText } from "lucide-react";

const documentLabels: Record<string, string> = {
  id_card_front: "Carte d'identité - Recto",
  id_card_back: "Carte d'identité - Verso",
  license_front: "Permis de conduire - Recto",
  license_back: "Permis de conduire - Verso",
  proof_of_address: "Justificatif de domicile",
};

interface Booking {
  id: string;
  carId: string;
  carBrand: string;
  carModel: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userId?: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  dropoffTime?: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  driverLicenseNumber?: string;
  driverLicenseDate?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  createdAt: string;
  notes?: string;
  modificationRequests?: ModificationRequest[];
}

interface ModificationRequest {
  id: string;
  bookingId: string;
  requestedBy: string; // userId
  requestedAt: string;
  changes: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  isAvailable: boolean;
  imageUrl: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout, isLoading } = useAdminAuth();
  const { blockDatesForBooking } = useAvailabilities();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // État pour les réservations
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [modificationRequests, setModificationRequests] = useState<ModificationRequest[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showAddCar, setShowAddCar] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [bookingTab, setBookingTab] = useState<"new" | "modifications">("new");

  // Charger les données depuis localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const storedBookings = localStorage.getItem("bookings");
      const storedCars = localStorage.getItem("adminCars");
      const storedUsers = localStorage.getItem("users");
      const storedDocuments = localStorage.getItem("userDocuments");
      const storedModifications = localStorage.getItem("modificationRequests");
      
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      }
      
      if (storedCars) {
        setCars(JSON.parse(storedCars));
      } else {
        // Initialiser avec les voitures par défaut
        const defaultCars: Car[] = [
          { id: "1", brand: "Mercedes", model: "Classe A", price: 89, isAvailable: true, imageUrl: "/assets/Mercedesbachée.png" },
          { id: "2", brand: "Volkswagen", model: "Golf 8 R", price: 129, isAvailable: false, imageUrl: "/assets/goldbachée.png" },
          { id: "3", brand: "Audi", model: "RS3", price: 189, isAvailable: false, imageUrl: "/assets/Rs3bachée.png" },
          { id: "4", brand: "Renault", model: "Clio V", price: 49, isAvailable: true, imageUrl: "/assets/ClioVbleu.png" }
        ];
        setCars(defaultCars);
        localStorage.setItem("adminCars", JSON.stringify(defaultCars));
      }

      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }

      if (storedDocuments) {
        setUserDocuments(JSON.parse(storedDocuments));
      }

      if (storedModifications) {
        setModificationRequests(JSON.parse(storedModifications));
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      setLoginError("Email ou mot de passe incorrect");
    }
  };

  const updateBookingStatus = (bookingId: string, newStatus: Booking["status"]) => {
    const booking = bookings.find(b => b.id === bookingId);
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    );
    
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    
    // Si la réservation est confirmée, bloquer les dates dans le calendrier
    if (newStatus === "confirmed" && booking) {
      blockDatesForBooking(booking.carId, booking.startDate, booking.endDate, booking.dropoffTime);
    }
  };

  const deleteBooking = (bookingId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      const updatedBookings = bookings.filter(b => b.id !== bookingId);
      setBookings(updatedBookings);
      localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    }
  };

  const toggleCarAvailability = (carId: string) => {
    const updatedCars = cars.map(c => 
      c.id === carId ? { ...c, isAvailable: !c.isAvailable } : c
    );
    setCars(updatedCars);
    localStorage.setItem("adminCars", JSON.stringify(updatedCars));
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "confirmed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: Booking["status"]) => {
    switch (status) {
      case "pending": return "En attente";
      case "confirmed": return "Confirmée";
      case "cancelled": return "Annulée";
      case "completed": return "Terminée";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Administration ChopTaLoc</CardTitle>
            <CardDescription>Connectez-vous pour accéder au panneau d'administration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && (
                <p className="text-red-500 text-sm">{loginError}</p>
              )}
              <Button type="submit" className="w-full">
                Se connecter
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Email: admin@choptaloc.com</p>
              <p>Mot de passe: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Admin */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/")} variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour au site
            </Button>
            <h1 className="text-2xl font-bold">Administration ChopTaLoc</h1>
          </div>
          <Button onClick={logout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="bookings" className="gap-2 relative">
              <Calendar className="w-4 h-4" />
              Réservations
              {(bookings.filter(b => b.status === "pending").length + modificationRequests.filter(m => m.status === "pending").length) > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  {bookings.filter(b => b.status === "pending").length + modificationRequests.filter(m => m.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cars" className="gap-2">
              <Car className="w-4 h-4" />
              Véhicules
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="w-4 h-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="prices" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Prix
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <Settings className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          {/* Tab Réservations */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion des réservations</h2>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{bookings.length} réservation(s)</Badge>
                <Button onClick={() => setShowAddBooking(!showAddBooking)} className="gap-2">
                  {showAddBooking ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {showAddBooking ? 'Fermer' : 'Ajouter une réservation'}
                </Button>
              </div>
            </div>

            {/* Sous-onglets pour les réservations */}
            <Tabs value={bookingTab} onValueChange={(value) => setBookingTab(value as "new" | "modifications")} className="space-y-4">
              <TabsList>
                <TabsTrigger value="new">Nouvelles demandes</TabsTrigger>
                <TabsTrigger value="modifications">Demandes de modification</TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4">

            {/* Formulaire d'ajout de réservation manuelle */}
            {showAddBooking && (
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter une réservation manuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom du client</label>
                      <Input id="new-booking-name" placeholder="ex: Jean Dupont" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input id="new-booking-email" type="email" placeholder="ex: jean@email.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Téléphone</label>
                      <Input id="new-booking-phone" placeholder="ex: 0612345678" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Véhicule</label>
                      <select id="new-booking-car" className="w-full px-3 py-2 border rounded-md">
                        {cars.map(car => (
                          <option key={car.id} value={car.id}>
                            {car.brand} {car.model}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date de début</label>
                      <Input id="new-booking-start" type="date" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date de fin</label>
                      <Input id="new-booking-end" type="date" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Heure de récupération</label>
                      <Input id="new-booking-pickup-time" type="time" defaultValue="10:00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Heure de retour</label>
                      <Input id="new-booking-dropoff-time" type="time" defaultValue="10:00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Numéro de permis</label>
                      <Input id="new-booking-license" placeholder="ex: 123456789012" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date du permis</label>
                      <Input id="new-booking-license-date" type="date" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">Notes</label>
                      <Input id="new-booking-notes" placeholder="Notes additionnelles..." />
                    </div>
                  </div>
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      const name = (document.getElementById('new-booking-name') as HTMLInputElement).value;
                      const email = (document.getElementById('new-booking-email') as HTMLInputElement).value;
                      const phone = (document.getElementById('new-booking-phone') as HTMLInputElement).value;
                      const carId = (document.getElementById('new-booking-car') as HTMLSelectElement).value;
                      const startDate = (document.getElementById('new-booking-start') as HTMLInputElement).value;
                      const endDate = (document.getElementById('new-booking-end') as HTMLInputElement).value;
                      const pickupTime = (document.getElementById('new-booking-pickup-time') as HTMLInputElement).value;
                      const dropoffTime = (document.getElementById('new-booking-dropoff-time') as HTMLInputElement).value;
                      const licenseNumber = (document.getElementById('new-booking-license') as HTMLInputElement).value;
                      const licenseDate = (document.getElementById('new-booking-license-date') as HTMLInputElement).value;
                      const notes = (document.getElementById('new-booking-notes') as HTMLInputElement).value;

                      if (name && email && phone && carId && startDate && endDate) {
                        const car = cars.find(c => c.id === carId);
                        if (!car) return;

                        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        const totalPrice = days * car.price;

                        const newBooking: Booking = {
                          id: `booking-${Date.now()}`,
                          carId,
                          carBrand: car.brand,
                          carModel: car.model,
                          userName: name,
                          userEmail: email,
                          userPhone: phone,
                          startDate,
                          endDate,
                          pickupTime,
                          dropoffTime,
                          totalPrice,
                          status: 'confirmed',
                          driverLicenseNumber: licenseNumber,
                          driverLicenseDate: licenseDate,
                          pickupLocation: 'Réservation manuelle',
                          dropoffLocation: 'Réservation manuelle',
                          notes,
                          createdAt: new Date().toISOString()
                        };

                        const updatedBookings = [...bookings, newBooking];
                        setBookings(updatedBookings);
                        localStorage.setItem('bookings', JSON.stringify(updatedBookings));
                        
                        // Bloquer les dates dans le calendrier
                        blockDatesForBooking(carId, startDate, endDate, dropoffTime);

                        alert('Réservation ajoutée avec succès !');

                        // Reset form
                        (document.getElementById('new-booking-name') as HTMLInputElement).value = '';
                        (document.getElementById('new-booking-email') as HTMLInputElement).value = '';
                        (document.getElementById('new-booking-phone') as HTMLInputElement).value = '';
                        (document.getElementById('new-booking-start') as HTMLInputElement).value = '';
                        (document.getElementById('new-booking-end') as HTMLInputElement).value = '';
                        (document.getElementById('new-booking-license') as HTMLInputElement).value = '';
                        (document.getElementById('new-booking-license-date') as HTMLInputElement).value = '';
                        (document.getElementById('new-booking-notes') as HTMLInputElement).value = '';
                        
                        setShowAddBooking(false);
                      } else {
                        alert('Veuillez remplir tous les champs obligatoires');
                      }
                    }}
                  >
                    Ajouter la réservation
                  </Button>
                </CardContent>
              </Card>
            )}

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucune réservation pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {booking.carBrand} {booking.carModel}
                            </h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Client</p>
                              <p className="font-medium">{booking.userName}</p>
                              <p className="text-muted-foreground">{booking.userEmail}</p>
                              <p className="text-muted-foreground">{booking.userPhone}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Dates</p>
                              <p className="font-medium">
                                {new Date(booking.startDate).toLocaleDateString('fr-FR')} - {new Date(booking.endDate).toLocaleDateString('fr-FR')}
                              </p>
                              <p className="text-muted-foreground">Prix: {booking.totalPrice}€</p>
                            </div>
                          </div>
                          {booking.notes && (
                            <div>
                              <p className="text-muted-foreground text-sm">Notes:</p>
                              <p className="text-sm">{booking.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                className="gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Confirmer
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, "cancelled")}
                                className="gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Refuser
                              </Button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "completed")}
                              className="gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Marquer terminée
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteBooking(booking.id)}
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
              </TabsContent>

              <TabsContent value="modifications" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Demandes de modification</h3>
                  <Badge variant="secondary">{modificationRequests.length} demande(s)</Badge>
                </div>

                {modificationRequests.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">Aucune demande de modification pour le moment</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {modificationRequests.map((request) => {
                      const booking = bookings.find(b => b.id === request.bookingId);
                      return (
                        <Card key={request.id}>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    Modification de {booking?.carBrand} {booking?.carModel}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Par: {users.find(u => u.id === request.requestedBy)?.firstName} {users.find(u => u.id === request.requestedBy)?.lastName}
                                  </p>
                                </div>
                                <Badge variant={
                                  request.status === "approved" ? "default" : 
                                  request.status === "rejected" ? "destructive" : "secondary"
                                }>
                                  {request.status === "approved" ? "Approuvée" : 
                                   request.status === "rejected" ? "Refusée" : "En attente"}
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Date de demande</p>
                                  <p>{new Date(request.requestedAt).toLocaleDateString("fr-FR")}</p>
                                </div>
                                {request.status === "rejected" && request.rejectionReason && (
                                  <div>
                                    <p className="text-muted-foreground">Raison du refus</p>
                                    <p className="text-destructive">{request.rejectionReason}</p>
                                  </div>
                                )}
                              </div>

                              <div>
                                <p className="text-muted-foreground mb-2">Modifications demandées :</p>
                                <div className="bg-secondary/30 p-3 rounded-lg">
                                  {Object.entries(request.changes).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                      <strong>{key}:</strong> {JSON.stringify(value)}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {request.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      // Approuver la modification
                                      const updatedRequests = modificationRequests.map(r =>
                                        r.id === request.id ? { ...r, status: "approved" as const } : r
                                      );
                                      setModificationRequests(updatedRequests);
                                      localStorage.setItem("modificationRequests", JSON.stringify(updatedRequests));
                                      
                                      // Appliquer les modifications à la réservation
                                      if (booking) {
                                        const updatedBookings = bookings.map(b =>
                                          b.id === request.bookingId ? { ...b, ...request.changes } : b
                                        );
                                        setBookings(updatedBookings);
                                        localStorage.setItem("bookings", JSON.stringify(updatedBookings));
                                      }
                                      alert("Modification approuvée !");
                                    }}
                                  >
                                    Approuver
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      const reason = prompt("Raison du refus :");
                                      if (reason) {
                                        const updatedRequests = modificationRequests.map(r =>
                                          r.id === request.id ? { ...r, status: "rejected" as const, rejectionReason: reason } : r
                                        );
                                        setModificationRequests(updatedRequests);
                                        localStorage.setItem("modificationRequests", JSON.stringify(updatedRequests));
                                        alert("Modification refusée");
                                      }
                                    }}
                                  >
                                    Refuser
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Tab Véhicules */}
          <TabsContent value="cars" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion des véhicules</h2>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{cars.length} véhicule(s)</Badge>
                <Button onClick={() => setShowAddCar(!showAddCar)} className="gap-2">
                  {showAddCar ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {showAddCar ? 'Fermer' : 'Ajouter un véhicule'}
                </Button>
              </div>
            </div>

            {/* Formulaire d'ajout de voiture */}
            {showAddCar && (
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter un véhicule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Marque</label>
                      <Input id="new-car-brand" placeholder="ex: Renault" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Modèle</label>
                      <Input id="new-car-model" placeholder="ex: Clio V" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prix journalier (€)</label>
                      <Input id="new-car-price" type="number" min="0" placeholder="ex: 49" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prix hebdomadaire (€)</label>
                      <Input id="new-car-weekly-price" type="number" min="0" placeholder="ex: 300" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prix mensuel (€)</label>
                      <Input id="new-car-monthly-price" type="number" min="0" placeholder="ex: 1200" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">URL de l'image</label>
                      <Input id="new-car-image" placeholder="ex: /assets/renault.png" />
                    </div>
                  </div>
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      const brand = (document.getElementById('new-car-brand') as HTMLInputElement).value;
                      const model = (document.getElementById('new-car-model') as HTMLInputElement).value;
                      const price = parseInt((document.getElementById('new-car-price') as HTMLInputElement).value);
                      const weeklyPrice = parseInt((document.getElementById('new-car-weekly-price') as HTMLInputElement).value);
                      const monthlyPrice = parseInt((document.getElementById('new-car-monthly-price') as HTMLInputElement).value);
                      const imageUrl = (document.getElementById('new-car-image') as HTMLInputElement).value;

                      if (brand && model && price) {
                        const newCar: Car = {
                          id: `car-${Date.now()}`,
                          brand,
                          model,
                          price,
                          weeklyPrice: weeklyPrice || price * 7,
                          monthlyPrice: monthlyPrice || price * 30,
                          isAvailable: true,
                          imageUrl: imageUrl || '/assets/placeholder.png'
                        };
                        const updatedCars = [...cars, newCar];
                        setCars(updatedCars);
                        localStorage.setItem('cars', JSON.stringify(updatedCars));
                        alert('Véhicule ajouté avec succès !');
                        
                        // Reset form
                        (document.getElementById('new-car-brand') as HTMLInputElement).value = '';
                        (document.getElementById('new-car-model') as HTMLInputElement).value = '';
                        (document.getElementById('new-car-price') as HTMLInputElement).value = '';
                        (document.getElementById('new-car-weekly-price') as HTMLInputElement).value = '';
                        (document.getElementById('new-car-monthly-price') as HTMLInputElement).value = '';
                        (document.getElementById('new-car-image') as HTMLInputElement).value = '';
                        
                        setShowAddCar(false);
                      } else {
                        alert('Veuillez remplir au moins la marque, le modèle et le prix');
                      }
                    }}
                  >
                    Ajouter le véhicule
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map((car) => (
                <Card key={car.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{car.brand} {car.model}</CardTitle>
                      <Badge variant={car.isAvailable ? "default" : "secondary"}>
                        {car.isAvailable ? "Disponible" : "Indisponible"}
                      </Badge>
                    </div>
                    <CardDescription>{car.price}€ / jour</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={car.isAvailable ? "destructive" : "default"}
                        onClick={() => toggleCarAvailability(car.id)}
                        className="flex-1"
                      >
                        {car.isAvailable ? "Rendre indisponible" : "Rendre disponible"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
                            const updatedCars = cars.filter(c => c.id !== car.id);
                            setCars(updatedCars);
                            localStorage.setItem('cars', JSON.stringify(updatedCars));
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab Clients */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion des clients</h2>
              <Badge variant="secondary">{users.filter(u => u.role === 'user').length} client(s)</Badge>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Input
                placeholder="Rechercher un client par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>

            {users.filter(u => u.role === 'user').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucun client pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {users
                  .filter(u => u.role === 'user')
                  .filter(user => 
                    searchTerm === "" || 
                    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => {
                    const userDocs = userDocuments.filter((doc: any) => doc.userId === user.id);
                    const isExpanded = expandedUser === user.id;
                    return (
                      <Card key={user.id} className="overflow-hidden">
                        <CardHeader 
                          className="cursor-pointer hover:bg-secondary/50 transition-colors"
                          onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={user.emailVerified ? "default" : "secondary"}>
                                {user.emailVerified ? "Vérifié" : "Non vérifié"}
                              </Badge>
                              <Badge variant="outline">
                                {userDocs.length} document(s)
                              </Badge>
                              <Button size="sm" variant="ghost">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {isExpanded && (
                          <CardContent className="border-t pt-4 space-y-6">
                            {/* Informations personnelles */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Informations personnelles
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4 text-sm bg-secondary/30 p-4 rounded-lg">
                                <div>
                                  <p className="text-muted-foreground">Email</p>
                                  <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Téléphone</p>
                                  <p className="font-medium">{user.phone || "Non renseigné"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Date de création</p>
                                  <p className="font-medium">{new Date(user.createdAt || Date.now()).toLocaleDateString("fr-FR")}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Statut compte</p>
                                  <Badge variant={user.emailVerified ? "default" : "secondary"}>
                                    {user.emailVerified ? "Vérifié" : "Non vérifié"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Documents */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Documents ({userDocs.length}/5)
                              </h4>
                              {userDocs.length === 0 ? (
                                <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg">
                                  Aucun document uploadé
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  {userDocs.map((doc: any) => (
                                    <div key={doc.id} className="border p-4 rounded-lg space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium">{doc.fileName}</p>
                                          <p className="text-muted-foreground text-xs">
                                            {documentLabels[doc.type] || doc.type} - {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge variant={
                                            doc.status === "verified" ? "default" : 
                                            doc.status === "rejected" ? "destructive" : "secondary"
                                          }>
                                            {doc.status === "verified" ? "Vérifié" : 
                                             doc.status === "rejected" ? "Refusé" : "En attente"}
                                          </Badge>
                                        </div>
                                      </div>

                                      {/* Affichage de l'image */}
                                      {doc.fileUrl && (
                                        <div 
                                          className="border rounded-lg p-2 cursor-pointer hover:border-primary transition-colors"
                                          onClick={() => setSelectedImage(doc.fileUrl)}
                                        >
                                          <img
                                            src={doc.fileUrl}
                                            alt={doc.fileName}
                                            className="max-w-full h-auto max-h-48 object-contain"
                                          />
                                          <p className="text-xs text-center text-muted-foreground mt-2">Cliquez pour agrandir</p>
                                        </div>
                                      )}

                                      {/* Raison du refus */}
                                      {doc.status === "rejected" && doc.rejectionReason && (
                                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                                          <strong>Raison du refus :</strong> {doc.rejectionReason}
                                        </div>
                                      )}

                                      {/* Actions */}
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {doc.status !== "verified" && (
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              const updatedDocs = userDocuments.map((d: any) =>
                                                d.id === doc.id ? { ...d, status: "verified", isVerified: true, rejectionReason: undefined } : d
                                              );
                                              setUserDocuments(updatedDocs);
                                              localStorage.setItem("userDocuments", JSON.stringify(updatedDocs));
                                              alert("Document vérifié avec succès !");
                                            }}
                                          >
                                            Vérifier
                                          </Button>
                                        )}
                                        {doc.status === "verified" && (
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                              const updatedDocs = userDocuments.map((d: any) =>
                                                d.id === doc.id ? { ...d, status: "pending", isVerified: false } : d
                                              );
                                              setUserDocuments(updatedDocs);
                                              localStorage.setItem("userDocuments", JSON.stringify(updatedDocs));
                                              alert("Vérification annulée");
                                            }}
                                          >
                                            Annuler
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            const reason = prompt("Raison du refus (ex: photo mauvaise qualité, fausse carte, etc.) :");
                                            if (reason) {
                                              const updatedDocs = userDocuments.map((d: any) =>
                                                d.id === doc.id ? { ...d, status: "rejected", isVerified: false, rejectionReason: reason } : d
                                              );
                                              setUserDocuments(updatedDocs);
                                              localStorage.setItem("userDocuments", JSON.stringify(updatedDocs));
                                              alert("Document refusé");
                                            }
                                          }}
                                        >
                                          Refuser
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions globales */}
                            <div className="flex gap-2 pt-4 border-t">
                              {!user.emailVerified && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const updatedUsers = users.map((u: any) =>
                                      u.id === user.id ? { ...u, emailVerified: true } : u
                                    );
                                    setUsers(updatedUsers);
                                    localStorage.setItem("users", JSON.stringify(updatedUsers));
                                    alert("Compte vérifié avec succès !");
                                  }}
                                >
                                  Vérifier le compte
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${user.firstName} ${user.lastName} ?`)) {
                                    const updatedUsers = users.filter(u => u.id !== user.id);
                                    setUsers(updatedUsers);
                                    localStorage.setItem("users", JSON.stringify(updatedUsers));
                                    
                                    const updatedDocs = userDocuments.filter((doc: any) => doc.userId !== user.id);
                                    setUserDocuments(updatedDocs);
                                    localStorage.setItem("userDocuments", JSON.stringify(updatedDocs));
                                  }
                                }}
                              >
                                Supprimer le compte
                              </Button>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          {/* Tab Prix */}
          <TabsContent value="prices" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion des prix</h2>
              <Badge variant="secondary">{cars.length} véhicule(s)</Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map((car) => (
                <Card key={car.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{car.brand} {car.model}</CardTitle>
                      <Badge variant="outline">
                        {car.price}€ / jour
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Prix journalier (€ / jour)
                        </label>
                        <Input
                          type="number"
                          defaultValue={car.price}
                          min="0"
                          step="1"
                          id={`price-${car.id}`}
                          placeholder="Prix journalier"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Prix hebdomadaire (€ / semaine)
                        </label>
                        <Input
                          type="number"
                          defaultValue={car.weeklyPrice || car.price * 7}
                          min="0"
                          step="1"
                          id={`weekly-price-${car.id}`}
                          placeholder="Prix hebdomadaire"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Prix mensuel (€ / mois)
                        </label>
                        <Input
                          type="number"
                          defaultValue={car.monthlyPrice || car.price * 30}
                          min="0"
                          step="1"
                          id={`monthly-price-${car.id}`}
                          placeholder="Prix mensuel"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const dailyInput = document.getElementById(`price-${car.id}`) as HTMLInputElement;
                          const weeklyInput = document.getElementById(`weekly-price-${car.id}`) as HTMLInputElement;
                          const monthlyInput = document.getElementById(`monthly-price-${car.id}`) as HTMLInputElement;
                          
                          const newDailyPrice = parseInt(dailyInput.value);
                          const newWeeklyPrice = parseInt(weeklyInput.value);
                          const newMonthlyPrice = parseInt(monthlyInput.value);
                          
                          if (newDailyPrice && newDailyPrice > 0) {
                            const updatedCars = cars.map(c =>
                              c.id === car.id 
                                ? { 
                                    ...c, 
                                    price: newDailyPrice,
                                    weeklyPrice: newWeeklyPrice || newDailyPrice * 7,
                                    monthlyPrice: newMonthlyPrice || newDailyPrice * 30
                                  } 
                                : c
                            );
                            setCars(updatedCars);
                            localStorage.setItem("cars", JSON.stringify(updatedCars));
                            alert(`Prix de ${car.brand} ${car.model} mis à jour`);
                          }
                        }}
                        className="w-full"
                      >
                        Mettre à jour les prix
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab Statistiques */}
          <TabsContent value="stats" className="space-y-4">
            <h2 className="text-xl font-semibold">Statistiques</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total réservations</CardDescription>
                  <CardTitle className="text-3xl">{bookings.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>En attente</CardDescription>
                  <CardTitle className="text-3xl">{bookings.filter(b => b.status === "pending").length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Confirmées</CardDescription>
                  <CardTitle className="text-3xl">{bookings.filter(b => b.status === "confirmed").length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Revenus estimés</CardDescription>
                  <CardTitle className="text-3xl">
                    {bookings
                      .filter(b => b.status === "confirmed" || b.status === "completed")
                      .reduce((sum, b) => sum + b.totalPrice, 0)}€
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal pour afficher l'image en grand */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <img
              src={selectedImage}
              alt="Document agrandi"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
