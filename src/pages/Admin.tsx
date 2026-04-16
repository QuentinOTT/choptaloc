import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/hooks/use-client-auth";
import { useAvailabilities } from "@/hooks/use-availabilities";
import { API_URL } from "@/config/api";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import GlobalCalendar from "@/components/GlobalCalendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Car, Calendar, Users, Settings, LogOut, Trash2, Edit, Check, XCircle, ArrowLeft, DollarSign, ChevronUp, ChevronDown, User, FileText, Shield, Key } from "lucide-react";

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
  tag?: string;
  color?: string;
  licensePlate?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useClientAuth();
  const { blockDatesForBooking } = useAvailabilities();

  // État pour les réservations
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [bookingPages, setBookingPages] = useState(1);
  const BOOKING_LIMIT = 20;
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCarForCalendar, setSelectedCarForCalendar] = useState<Car | null>(null);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [showUnavailableCarsSetting, setShowUnavailableCarsSetting] = useState(() => {
    return localStorage.getItem('showUnavailableCars') === 'true';
  });

  // Nouvelles fonctionnalités de paramètres
  const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');
  const [vacationMode, setVacationMode] = useState(() => localStorage.getItem('vacationMode') === 'true');
  const [vacationStart, setVacationStart] = useState(() => localStorage.getItem('vacationStart') || '');
  const [vacationEnd, setVacationEnd] = useState(() => localStorage.getItem('vacationEnd') || '');
  const [globalSiteDiscount, setGlobalSiteDiscount] = useState(() => localStorage.getItem('globalSiteDiscount') || '0');
  const [minBookingDays, setMinBookingDays] = useState(() => localStorage.getItem('minBookingDays') || '1');
  const [alertMessage, setAlertMessage] = useState(() => localStorage.getItem('alertMessage') || '');
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(() => localStorage.getItem('enableEmailAlerts') !== 'false');

  const handleMaintenanceToggle = (val: boolean) => {
    setMaintenanceMode(val);
    localStorage.setItem('maintenanceMode', String(val));
    alert(val ? "Mode maintenance activé" : "Mode maintenance désactivé");
  };

  const handleVacationToggle = (val: boolean) => {
    setVacationMode(val);
    localStorage.setItem('vacationMode', String(val));
  };

  const saveGlobalSettings = () => {
    localStorage.setItem('globalSiteDiscount', globalSiteDiscount);
    localStorage.setItem('minBookingDays', minBookingDays);
    localStorage.setItem('alertMessage', alertMessage);
    localStorage.setItem('enableEmailAlerts', String(enableEmailAlerts));
    localStorage.setItem('vacationStart', vacationStart);
    localStorage.setItem('vacationEnd', vacationEnd);
    alert("Paramètres globaux enregistrés avec succès !");
  };

  // Charger les données depuis l'API
  useEffect(() => {
    if (isAuthenticated) {
      // Charger les réservations (paginées)
      fetchBookings(1);

      // Charger les voitures
      fetch(`${API_URL}/cars`)
        .then(res => res.json())
        .then(data => {
          const mappedCars = data.map((c: any) => ({
            id: c.id.toString(),
            brand: c.brand,
            model: c.model,
            price: parseFloat(c.price_per_day),
            weeklyPrice: c.weekly_price ? parseFloat(c.weekly_price) : undefined,
            monthlyPrice: c.monthly_price ? parseFloat(c.monthly_price) : undefined,
            isAvailable: Boolean(c.is_available),
            imageUrl: c.image_url || '',
            tag: c.tag || undefined,
            color: c.color || undefined,
            licensePlate: c.license_plate || undefined,
          }));
          setCars(Array.isArray(data) ? mappedCars : []);
        })
        .catch(err => {
          console.error('Erreur chargement voitures:', err);
          setCars([]);
        });

      // Charger les utilisateurs
      fetch(`${API_URL}/users`)
        .then(res => res.json())
        .then(data => setUsers(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Erreur chargement utilisateurs:', err);
          setUsers([]);
        });

      // Charger les documents
      fetch(`${API_URL}/documents`)
        .then(res => res.json())
        .then(data => {
          const mappedDocs = data.map((d: any) => ({
            id: d.id.toString(),
            user_id: d.user_id.toString(),
            userId: d.user_id.toString(),
            type: d.document_type,
            fileName: d.file_name,
            fileUrl: d.file_path,
            uploadedAt: d.created_at,
            status: d.is_verified ? "verified" : "pending"
          }));
          setUserDocuments(Array.isArray(data) ? mappedDocs : []);
        })
        .catch(err => {
          console.error('Erreur chargement documents:', err);
          setUserDocuments([]);
        });

      // Charger les messages de contact
      fetch(`${API_URL}/contact`)
        .then(res => res.json())
        .then(data => setContactMessages(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Erreur chargement messages:', err);
          setContactMessages([]);
        });

      // Charger les demandes de modification
      fetch(`${API_URL}/bookings/modifications/all`)
        .then(res => res.json())
        .then(data => {
          const mappedModifications = data.map((m: any) => ({
            id: m.id.toString(),
            bookingId: m.booking_id.toString(),
            requestedBy: m.requested_by.toString(),
            requestedAt: m.created_at,
            changes: m.changes,
            status: m.status,
            rejectionReason: m.rejection_reason
          }));
          setModificationRequests(mappedModifications);
        })
        .catch(err => {
          console.error('Erreur chargement modifications:', err);
          setModificationRequests([]);
        });
    }
  }, [isAuthenticated]);

  const fetchBookings = (page: number) => {
    fetch(`${API_URL}/bookings?page=${page}&limit=${BOOKING_LIMIT}`)
      .then(res => res.json())
      .then(resData => {
        const { data, pagination } = resData || {};
        if (!Array.isArray(data)) {
          setBookings([]);
          return;
        }
        const mappedBookings = data.map((b: any) => ({
          id: b.id.toString(),
          carId: b.car_id.toString(),
          carBrand: b.brand || '',
          carModel: b.model || '',
          userName: [b.first_name, b.last_name].filter(Boolean).join(' ') || '',
          userEmail: b.email || '',
          userPhone: b.phone || '',
          userId: b.user_id?.toString(),
          startDate: typeof b.start_date === 'string'
            ? b.start_date.slice(0, 10)
            : new Date(b.start_date).toISOString().slice(0, 10),
          endDate: typeof b.end_date === 'string'
            ? b.end_date.slice(0, 10)
            : new Date(b.end_date).toISOString().slice(0, 10),
          pickupTime: b.pickup_time || undefined,
          dropoffTime: b.dropoff_time || undefined,
          pickupLocation: b.pickup_location || undefined,
          dropoffLocation: b.dropoff_location || undefined,
          totalPrice: b.total_price,
          status: b.status,
          createdAt: b.created_at,
          notes: b.notes,
        }));
        setBookings(mappedBookings);
        setBookingPage(pagination?.page || 1);
        setBookingTotal(pagination?.total || 0);
        setBookingPages(pagination?.pages || 1);
      })
      .catch(err => {
        console.error('Erreur chargement réservations:', err);
        setBookings([]);
      });
  };

  const handleShowUnavailableCarsChange = (value: boolean) => {
    setShowUnavailableCarsSetting(value);
    localStorage.setItem('showUnavailableCars', value.toString());
  };

  // Vérifier si l'utilisateur a le rôle admin
  const isAdmin = user?.role === "admin";

  const updateBookingStatus = async (bookingId: string, newStatus: Booking["status"]) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    // Si on essaie de confirmer une réservation, vérifier les conflits
    if (newStatus === "confirmed") {
      const conflicts = bookings.filter(b => 
        b.id !== bookingId &&
        b.status === "confirmed" &&
        b.carId === booking.carId &&
        ((b.startDate <= booking.endDate && b.endDate >= booking.startDate))
      );
      
      if (conflicts.length > 0) {
        const conflictList = conflicts.map(c => 
          `• Réservation du ${c.startDate} au ${c.endDate} (ID: ${c.id})`
        ).join('\n');
        
        alert(`⚠️ ATTENTION - CONFLIT DE RÉSERVATION\n\nCette réservation empiète sur les dates suivantes déjà acceptées :\n\n${conflictList}\n\nVeuillez vérifier avant de confirmer.`);
        return;
      }
    }
    
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const updatedBookings = bookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        );
        setBookings(updatedBookings);
        
        // Si la réservation est confirmée, bloquer les dates dans le calendrier
        if (newStatus === "confirmed" && booking) {
          blockDatesForBooking(booking.carId, booking.startDate, booking.endDate, booking.dropoffTime);
        }
      } else {
        console.error('Erreur mise à jour statut réservation');
      }
    } catch (error) {
      console.error('Erreur API:', error);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const updatedBookings = bookings.filter(b => b.id !== bookingId);
          setBookings(updatedBookings);
        } else {
          console.error('Erreur suppression réservation');
        }
      } catch (error) {
        console.error('Erreur API:', error);
      }
    }
  };

  const toggleCarAvailability = async (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    
    const newAvailability = !car.isAvailable;
    
    try {
      // Appeler l'API pour mettre à jour la disponibilité
      const response = await fetch(`${API_URL}/cars/${carId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newAvailability })
      });
      
      if (response.ok) {
        const updatedCars = cars.map(c => 
          c.id === carId ? { ...c, isAvailable: newAvailability } : c
        );
        setCars(updatedCars);
      } else {
        console.error('Erreur mise à jour disponibilité');
      }
    } catch (error) {
      console.error('Erreur API:', error);
    }
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

  // Rediriger vers la page de connexion si non connecté ou non admin
  if (!isAuthenticated || !isAdmin) {
    navigate("/client-auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Admin */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button onClick={() => navigate("/")} variant="ghost" className="gap-2 p-2 md:px-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Retour au site</span>
            </Button>
            <h1 className="text-lg md:text-2xl font-bold">Administration</h1>
          </div>
          <Button onClick={logout} variant="outline" className="gap-2 p-2 md:px-4">
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Déconnexion</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-[950px] h-auto p-1">
            <TabsTrigger value="bookings" className="gap-2 relative flex flex-col md:flex-row items-center py-3 md:py-2 text-[10px] md:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Réservations</span>
              <span className="md:hidden">Réserv.</span>
              {(bookings.filter(b => b.status === "pending").length + modificationRequests.filter(m => m.status === "pending").length) > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs px-1 md:px-1.5 py-0.5">
                  {bookings.filter(b => b.status === "pending").length + modificationRequests.filter(m => m.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cars" className="gap-2 relative flex flex-col md:flex-row items-center py-3 md:py-2 text-[10px] md:text-sm">
              <Car className="w-4 h-4" />
              <span className="hidden md:inline">Véhicules</span>
              <span className="md:hidden">Véhic.</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 relative flex flex-col md:flex-row items-center py-3 md:py-2 text-[10px] md:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Utilisateurs</span>
              <span className="md:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="global-calendar" className="gap-2 relative flex flex-col md:flex-row items-center py-3 md:py-2 text-[10px] md:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Calendrier Global</span>
              <span className="md:hidden">Calendrier</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2 relative flex flex-col md:flex-row items-center py-3 md:py-2 text-[10px] md:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Messagerie</span>
              <span className="md:hidden">Msg</span>
              {contactMessages.filter(m => !m.is_read).length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs px-1 md:px-1.5 py-0.5">
                  {contactMessages.filter(m => !m.is_read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 relative flex flex-col md:flex-row items-center py-3 md:py-2 text-[10px] md:text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Réglages</span>
              <span className="md:hidden">Réglages</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2 relative flex flex-col md:flex-row items-center py-3 md:py-2 text-[10px] md:text-sm">
              <DollarSign className="w-4 h-4" />
              <span className="hidden md:inline">Statistiques</span>
              <span className="md:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Réservations */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold">Gestion des réservations</h2>
              <div className="flex items-center gap-2 md:gap-3">
                <Badge variant="secondary" className="text-xs md:text-sm">{bookings.length} réservation(s)</Badge>
                <Button onClick={() => setShowAddBooking(!showAddBooking)} className="gap-2 text-xs md:text-sm py-2 md:py-2">
                  {showAddBooking ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  <span className="hidden md:inline">{showAddBooking ? 'Fermer' : 'Ajouter une réservation'}</span>
                  <span className="md:hidden">{showAddBooking ? 'Fermer' : 'Ajouter'}</span>
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
                    onClick={async () => {
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

                        try {
                          const response = await fetch(`${API_URL}/bookings`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              car_id: carId,
                              user_id: null,
                              start_date: startDate,
                              end_date: endDate,
                              pickup_time: pickupTime,
                              dropoff_time: dropoffTime,
                              total_price: totalPrice,
                              status: 'confirmed',
                              notes: notes,
                              driver_license_number: licenseNumber,
                              driver_license_date: licenseDate,
                              pickup_location: 'Réservation manuelle',
                              dropoff_location: 'Réservation manuelle',
                              first_name: name,
                              email: email,
                              phone: phone
                            })
                          });

                          if (response.ok) {
                            const result = await response.json();
                            const newBooking: Booking = {
                              id: result.insertId.toString(),
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
                            
                            // Bloquer les dates dans le calendrier
                            blockDatesForBooking(carId, startDate, endDate, dropoffTime);

                            alert('Réservation ajoutée avec succès !');

                            // Reset form
                            (document.getElementById('new-booking-name') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-email') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-phone') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-start') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-end') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-pickup-time') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-dropoff-time') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-license') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-license-date') as HTMLInputElement).value = '';
                            (document.getElementById('new-booking-notes') as HTMLInputElement).value = '';
                            
                            setShowAddBooking(false);
                          } else {
                            alert('Erreur lors de l\'ajout de la réservation');
                          }
                        } catch (error) {
                          console.error('Erreur API:', error);
                          alert('Erreur lors de l\'ajout de la réservation');
                        }
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
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base md:text-lg">
                                {booking.carBrand} {booking.carModel}
                              </h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {getStatusLabel(booking.status)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
                              <div>
                                <p className="text-muted-foreground">Client</p>
                                <p className="font-medium">{booking.userName}</p>
                                <p className="text-muted-foreground text-xs">{booking.userEmail}</p>
                                <p className="text-muted-foreground text-xs">{booking.userPhone}</p>
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
                              <div className="mt-2">
                                <p className="text-muted-foreground text-xs">Notes:</p>
                                <p className="text-xs">{booking.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const user = users.find((u: any) => u.email === booking.userEmail);
                              if (user) {
                                alert(`Profil du client:\n\nNom: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\nTéléphone: ${user.phone}\nVérifié: ${user.email_verified ? 'Oui' : 'Non'}`);
                              }
                            }}
                            className="gap-2 text-xs md:text-sm w-full sm:w-auto"
                          >
                            <User className="w-4 h-4" />
                            <span className="hidden md:inline">Voir le profil</span>
                            <span className="md:hidden">Profil</span>
                          </Button>
                          
                          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                            {booking.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                  className="gap-2 text-xs md:text-sm flex-1 sm:flex-none"
                                >
                                  <Check className="w-4 h-4" />
                                  <span className="hidden md:inline">Confirmer</span>
                                  <span className="md:hidden">Confirmer</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBookingStatus(booking.id, "cancelled")}
                                  className="gap-2 text-xs md:text-sm flex-1 sm:flex-none"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span className="hidden md:inline">Refuser</span>
                                  <span className="md:hidden">Refuser</span>
                                </Button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, "completed")}
                                className="gap-2 text-xs md:text-sm flex-1 sm:flex-none"
                              >
                                <Check className="w-4 h-4" />
                                <span className="hidden md:inline">Marquer terminée</span>
                                <span className="md:hidden">Terminer</span>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBooking(booking.id)}
                              className="gap-2 text-xs md:text-sm flex-1 sm:flex-none"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden md:inline">Supprimer</span>
                              <span className="md:hidden">Supprimer</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Pagination Controls */}
                {bookingPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t">
                    <p className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">
                      Page {bookingPage} sur {bookingPages} (Total: {bookingTotal})
                    </p>
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={bookingPage === 1}
                        onClick={() => fetchBookings(bookingPage - 1)}
                        className="text-xs md:text-sm"
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={bookingPage === bookingPages}
                        onClick={() => fetchBookings(bookingPage + 1)}
                        className="text-xs md:text-sm"
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
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
                                    onClick={async () => {
                                      // Appliquer les modifications à la réservation
                                      if (booking) {
                                        try {
                                          // 1. Mettre à jour la réservation
                                          const updateBookingRes = await fetch(`${API_URL}/bookings/${booking.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(request.changes)
                                          });
                                          
                                          if (updateBookingRes.ok) {
                                            // 2. Mettre à jour le statut de la demande de modification
                                            const updateRequestRes = await fetch(`${API_URL}/bookings/modifications/${request.id}/status`, {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ status: 'approved' })
                                            });

                                            if (updateRequestRes.ok) {
                                              const updatedBookings = bookings.map(b =>
                                                b.id === request.bookingId ? { ...b, ...request.changes } : b
                                              );
                                              setBookings(updatedBookings);
                                              
                                              const updatedRequests = modificationRequests.map(r =>
                                                r.id === request.id ? { ...r, status: "approved" as const } : r
                                              );
                                              setModificationRequests(updatedRequests);
                                              alert("Modification approuvée avec succès !");
                                            } else {
                                              alert("Erreur lors du changement de statut de la demande");
                                            }
                                          } else {
                                            const errorData = await updateBookingRes.json();
                                            alert(`Erreur lors de la mise à jour de la réservation: ${errorData.error || ''}`);
                                          }
                                        } catch (error) {
                                          console.error('Erreur API:', error);
                                          alert("Erreur lors de l'approbation");
                                        }
                                      }
                                    }}
                                  >
                                    Approuver
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                      const reason = prompt("Raison du refus :");
                                      if (reason) {
                                        try {
                                          const response = await fetch(`${API_URL}/bookings/modifications/${request.id}/status`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
                                          });

                                          if (response.ok) {
                                            const updatedRequests = modificationRequests.map(r =>
                                              r.id === request.id ? { ...r, status: "rejected" as const, rejectionReason: reason } : r
                                            );
                                            setModificationRequests(updatedRequests);
                                            alert("Modification refusée");
                                          } else {
                                            alert("Erreur lors du refus");
                                          }
                                        } catch (error) {
                                          console.error('Erreur API:', error);
                                          alert("Erreur lors du refus");
                                        }
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold">Gestion des véhicules</h2>
              <div className="flex items-center gap-2 md:gap-3">
                <Badge variant="secondary" className="text-xs md:text-sm">{cars.length} véhicule(s)</Badge>
                <Button onClick={() => setShowAddCar(!showAddCar)} className="gap-2 text-xs md:text-sm py-2 md:py-2">
                  {showAddCar ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  <span className="hidden md:inline">{showAddCar ? 'Fermer' : 'Ajouter un véhicule'}</span>
                  <span className="md:hidden">{showAddCar ? 'Fermer' : 'Ajouter'}</span>
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
                    onClick={async () => {
                      const brand = (document.getElementById('new-car-brand') as HTMLInputElement).value;
                      const model = (document.getElementById('new-car-model') as HTMLInputElement).value;
                      const price = parseInt((document.getElementById('new-car-price') as HTMLInputElement).value);
                      const weeklyPrice = parseInt((document.getElementById('new-car-weekly-price') as HTMLInputElement).value);
                      const monthlyPrice = parseInt((document.getElementById('new-car-monthly-price') as HTMLInputElement).value);
                      const imageUrl = (document.getElementById('new-car-image') as HTMLInputElement).value;

                      if (brand && model && price) {
                        try {
                          const response = await fetch(`${API_URL}/cars`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              brand,
                              model,
                              tag: 'Disponible maintenant',
                              price_per_day: price,
                              image_url: imageUrl || '/assets/placeholder.png',
                              specs: ['Automatique', '5 places', 'Essence', 'Climatisation'],
                              is_available: true
                            })
                          });

                          if (response.ok) {
                            const result = await response.json();
                            const newCar: Car = {
                              id: result.insertId.toString(),
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
                            alert('Erreur lors de l\'ajout du véhicule');
                          }
                        } catch (error) {
                          console.error('Erreur API:', error);
                          alert('Erreur lors de l\'ajout du véhicule');
                        }
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
                        variant="outline"
                        onClick={() => {
                          setSelectedCarForCalendar(car);
                          setShowCalendar(true);
                        }}
                      >
                        <Calendar className="w-4 h-4" />
                        Calendrier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
                            try {
                              const response = await fetch(`${API_URL}/cars/${car.id}`, {
                                method: 'DELETE'
                              });

                              if (response.ok) {
                                const updatedCars = cars.filter(c => c.id !== car.id);
                                setCars(updatedCars);
                              } else {
                                alert('Erreur lors de la suppression');
                              }
                            } catch (error) {
                              console.error('Erreur API:', error);
                              alert('Erreur lors de la suppression');
                            }
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
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion des clients</h2>
              <Badge variant="secondary">{users.length} client(s)</Badge>
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

            {users.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucun client pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {users
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
                          className="cursor-pointer hover:bg-secondary/50 transition-colors p-4 md:p-6"
                          onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base md:text-lg">{user.firstName} {user.lastName}</CardTitle>
                                <CardDescription className="text-xs md:text-sm">{user.email}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3">
                              <Badge variant={user.emailVerified ? "default" : "secondary"} className="text-xs md:text-sm">
                                {user.emailVerified ? "Vérifié" : "Non vérifié"}
                              </Badge>
                              <Badge variant="outline" className="text-xs md:text-sm">
                                {userDocs.length} doc(s)
                              </Badge>
                              <Button size="sm" variant="ghost" className="p-1 md:p-2">
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

                            {/* Actions administrateur */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Actions administrateur
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    if (confirm(`Réinitialiser le mot de passe de ${user.firstName} ${user.lastName} ?`)) {
                                      try {
                                        const response = await fetch(`${API_URL}/users/${user.id}/reset-password`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ newPassword: 'Choptaloc2026' })
                                        });
                                        if (response.ok) {
                                          alert("Mot de passe réinitialisé avec succès !");
                                        } else {
                                          alert("Erreur lors de la réinitialisation");
                                        }
                                      } catch (error) {
                                        console.error('Erreur API:', error);
                                        alert("Erreur lors de la réinitialisation");
                                      }
                                    }
                                  }}
                                >
                                  <Key className="w-4 h-4" />
                                  Réinitialiser mot de passe
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.role === "admin" ? "destructive" : "default"}
                                  onClick={async () => {
                                    const newRole = user.role === "admin" ? "user" : "admin";
                                    if (confirm(`Changer le rôle de ${user.firstName} ${user.lastName} de ${user.role} à ${newRole} ?`)) {
                                      try {
                                        const response = await fetch(`${API_URL}/users/${user.id}/role`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ role: newRole })
                                        });
                                        if (response.ok) {
                                          const updatedUsers = users.map(u => 
                                            u.id === user.id ? { ...u, role: newRole } : u
                                          );
                                          setUsers(updatedUsers);
                                          alert(`Rôle changé en ${newRole} avec succès !`);
                                        } else {
                                          alert("Erreur lors du changement de rôle");
                                        }
                                      } catch (error) {
                                        console.error('Erreur API:', error);
                                        alert("Erreur lors du changement de rôle");
                                      }
                                    }
                                  }}
                                >
                                  <Shield className="w-4 h-4" />
                                  {user.role === "admin" ? "Rétrograder" : "Promouvoir"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={async () => {
                                    if (confirm(`Supprimer le compte de ${user.firstName} ${user.lastName} ? Cette action est irréversible !`)) {
                                      try {
                                        const response = await fetch(`${API_URL}/users/${user.id}`, {
                                          method: 'DELETE'
                                        });
                                        if (response.ok) {
                                          const updatedUsers = users.filter(u => u.id !== user.id);
                                          setUsers(updatedUsers);
                                          alert("Compte supprimé avec succès !");
                                        } else {
                                          alert("Erreur lors de la suppression");
                                        }
                                      } catch (error) {
                                        console.error('Erreur API:', error);
                                        alert("Erreur lors de la suppression");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Supprimer
                                </Button>
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
                                            onClick={async () => {
                                              try {
                                                const response = await fetch(`${API_URL}/documents/${doc.id}/status`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ status: 'verified' })
                                                });
                                                
                                                if (response.ok) {
                                                  const updatedDocs = userDocuments.map((d: any) =>
                                                    d.id === doc.id ? { ...d, status: "verified", isVerified: true, rejectionReason: undefined } : d
                                                  );
                                                  setUserDocuments(updatedDocs);
                                                  alert("Document vérifié avec succès !");
                                                } else {
                                                  alert("Erreur lors de la vérification");
                                                }
                                              } catch (error) {
                                                console.error('Erreur API:', error);
                                                alert("Erreur lors de la vérification");
                                              }
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
                                              alert("Vérification annulée");
                                            }}
                                          >
                                            Annuler
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={async () => {
                                            const reason = prompt("Raison du refus :");
                                            if (reason) {
                                              try {
                                                const response = await fetch(`${API_URL}/documents/${doc.id}/status`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
                                                });
                                                
                                                if (response.ok) {
                                                  const updatedDocs = userDocuments.map((d: any) =>
                                                    d.id === doc.id ? { ...d, status: "rejected", isVerified: false, rejectionReason: reason } : d
                                                  );
                                                  setUserDocuments(updatedDocs);
                                                  alert("Document refusé");
                                                } else {
                                                  alert("Erreur lors du refus");
                                                }
                                              } catch (error) {
                                                console.error('Erreur API:', error);
                                                alert("Erreur lors du refus");
                                              }
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
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`${API_URL}/users/${user.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ emailVerified: true })
                                      });
                                      
                                      if (response.ok) {
                                        const updatedUsers = users.map((u: any) =>
                                          u.id === user.id ? { ...u, emailVerified: true } : u
                                        );
                                        setUsers(updatedUsers);
                                        alert("Compte vérifié avec succès !");
                                      } else {
                                        alert("Erreur lors de la vérification");
                                      }
                                    } catch (error) {
                                      console.error('Erreur API:', error);
                                      alert("Erreur lors de la vérification");
                                    }
                                  }}
                                >
                                  Vérifier le compte
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  if (confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${user.firstName} ${user.lastName} ?`)) {
                                    try {
                                      const response = await fetch(`${API_URL}/users/${user.id}`, {
                                        method: 'DELETE'
                                      });
                                      
                                      if (response.ok) {
                                        const updatedUsers = users.filter(u => u.id !== user.id);
                                        setUsers(updatedUsers);
                                        
                                        const updatedDocs = userDocuments.filter((doc: any) => doc.userId !== user.id);
                                        setUserDocuments(updatedDocs);
                                      } else {
                                        alert("Erreur lors de la suppression");
                                      }
                                    } catch (error) {
                                      console.error('Erreur API:', error);
                                      alert("Erreur lors de la suppression");
                                    }
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
                        onClick={async () => {
                          const dailyInput = document.getElementById(`price-${car.id}`) as HTMLInputElement;
                          const weeklyInput = document.getElementById(`weekly-price-${car.id}`) as HTMLInputElement;
                          const monthlyInput = document.getElementById(`monthly-price-${car.id}`) as HTMLInputElement;
                          
                          const newDailyPrice = parseInt(dailyInput.value);
                          const newWeeklyPrice = parseInt(weeklyInput.value);
                          const newMonthlyPrice = parseInt(monthlyInput.value);
                          
                          if (newDailyPrice && newDailyPrice > 0) {
                            try {
                              const response = await fetch(`${API_URL}/cars/${car.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  price_per_day: newDailyPrice,
                                  weekly_price: newWeeklyPrice,
                                  monthly_price: newMonthlyPrice
                                })
                              });
                              
                              if (response.ok) {
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
                                alert(`Prix de ${car.brand} ${car.model} mis à jour`);
                              } else {
                                alert("Erreur lors de la mise à jour");
                              }
                            } catch (error) {
                              console.error('Erreur API:', error);
                              alert("Erreur lors de la mise à jour");
                            }
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

          {/* Tab Calendrier Global */}
          <TabsContent value="global-calendar" className="space-y-4">
            <h2 className="text-xl font-semibold">Calendrier Global - Tous les véhicules</h2>
            {/* Scroll horizontal sur mobile pour le Gantt */}
            <div className="overflow-x-auto">
              <div style={{ minWidth: 720 }}>
                <GlobalCalendar cars={cars} bookings={bookings} />
              </div>
            </div>
          </TabsContent>

          {/* Tab Messagerie */}
          <TabsContent value="messages" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Messagerie</h2>
              <Badge variant="secondary">{contactMessages.length} message(s)</Badge>
            </div>

            {contactMessages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucun message pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((message) => (
                  <Card key={message.id} className={`${!message.is_read ? 'border-orange-500 bg-orange-50/5' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{message.name}</CardTitle>
                            <CardDescription className="text-xs">{message.email}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!message.is_read && (
                            <Badge variant="default" className="text-xs">Non lu</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {new Date(message.created_at).toLocaleDateString("fr-FR")}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const response = await fetch(`${API_URL}/contact/${message.id}/read`, {
                                  method: 'PUT'
                                });
                                if (response.ok) {
                                  const updatedMessages = contactMessages.map(m => 
                                    m.id === message.id ? { ...m, is_read: true } : m
                                  );
                                  setContactMessages(updatedMessages);
                                }
                              } catch (error) {
                                console.error('Erreur:', error);
                              }
                            }}
                          >
                            Marquer comme lu
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {message.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Téléphone:</span>
                            <span>{message.phone}</span>
                          </div>
                        )}
                        {message.subject && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Sujet:</span>
                            <span className="font-medium">{message.subject}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground text-sm mb-1">Message:</p>
                          <p className="text-sm bg-secondary/30 p-3 rounded-lg">{message.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab Réglages */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">Réglages de l'application</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Affichage & Accès</CardTitle>
                  <CardDescription>Contrôlez la visibilité et l'accès au site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Afficher les véhicules indisponibles</h4>
                      <p className="text-xs text-muted-foreground">
                        Visibilité des véhicules prochainement en ligne
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showUnavailableCarsSetting}
                        onChange={(e) => handleShowUnavailableCarsChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Mode Maintenance</h4>
                      <p className="text-xs text-muted-foreground">
                        Désactive les réservations pour les clients
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => handleMaintenanceToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Alertes Email Admin</h4>
                      <p className="text-xs text-muted-foreground">
                        Recevoir une alerte pour chaque nouveau message
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableEmailAlerts}
                        onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Mode Vacances / Pause</h4>
                      <p className="text-xs text-muted-foreground">
                        Indique que l'agence est fermée temporairement
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vacationMode}
                        onChange={(e) => handleVacationToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>

                  {vacationMode && (
                    <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Début</label>
                          <Input 
                            type="date" 
                            value={vacationStart} 
                            onChange={(e) => setVacationStart(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Fin</label>
                          <Input 
                            type="date" 
                            value={vacationEnd} 
                            onChange={(e) => setVacationEnd(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Politique Commerciale</CardTitle>
                  <CardDescription>Règles de réservation et promotions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Réduction globale (%)</label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={globalSiteDiscount} 
                        onChange={(e) => setGlobalSiteDiscount(e.target.value)}
                        placeholder="Ex: 10" 
                      />
                      <span className="flex items-center bg-secondary px-3 rounded-lg border">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Durée minimale de location (jours)</label>
                    <Input 
                      type="number" 
                      value={minBookingDays} 
                      onChange={(e) => setMinBookingDays(e.target.value)}
                      placeholder="Ex: 1" 
                    />
                  </div>

                  <Button className="w-full mt-2" onClick={saveGlobalSettings}>
                    <Check className="w-4 h-4 mr-2" />
                    Enregistrer les règles
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Communication Site</CardTitle>
                  <CardDescription>Message d'alerte affiché sur tout le site pour les clients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message de bandeau (BETA)</label>
                    <textarea 
                      className="w-full min-h-[100px] p-3 rounded-lg border bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      placeholder="Ex: Nous sommes fermés du 1er au 15 août. Les réservations restent possibles pour après cette date."
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={saveGlobalSettings}>
                      Publier le message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Statistiques */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-xl font-semibold">Statistiques & Revenus</h2>

            {/* KPIs principaux */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total réservations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total réservations</CardDescription>
                  <CardTitle className="text-3xl">{bookingTotal || bookings.length}</CardTitle>
                </CardHeader>
              </Card>

              {/* CA total confirmé + terminé */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Chiffre d'affaires total</CardDescription>
                  <CardTitle className="text-3xl text-green-600">
                    {bookings
                      .filter(b => b.status === "confirmed" || b.status === "completed")
                      .reduce((s, b) => s + (Number(b.totalPrice) || 0), 0)
                      .toFixed(0)}€
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* CA du mois courant */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>CA mois en cours</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">
                    {(() => {
                      const now = new Date();
                      return bookings
                        .filter(b =>
                          (b.status === "confirmed" || b.status === "completed") &&
                          b.startDate.slice(0, 7) === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`
                        )
                        .reduce((s, b) => s + (Number(b.totalPrice) || 0), 0)
                        .toFixed(0);
                    })()}€
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Durée moyenne de location */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Durée moyenne</CardDescription>
                  <CardTitle className="text-3xl">
                    {(() => {
                      const done = bookings.filter(b => b.status === "confirmed" || b.status === "completed");
                      if (!done.length) return "—";
                      const avg = done.reduce((s, b) => {
                        const d = (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000;
                        return s + Math.max(1, d);
                      }, 0) / done.length;
                      return `${avg.toFixed(1)}j`;
                    })()}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Taux d'occupation par véhicule */}
            <Card>
              <CardHeader>
                <CardTitle>Taux d'occupation par véhicule</CardTitle>
                <CardDescription>
                  Calculé sur les 30 derniers jours (réservations confirmées + terminées)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cars.map(car => {
                    const now = new Date();
                    const past30start = new Date(now); past30start.setDate(past30start.getDate() - 30);
                    const carBookings = bookings.filter(b =>
                      b.carId === car.id &&
                      (b.status === "confirmed" || b.status === "completed")
                    );
                    // Compter les jours occupés dans les 30 derniers jours
                    const bookedDays = new Set<string>();
                    carBookings.forEach(b => {
                      const s = new Date(b.startDate), e = new Date(b.endDate);
                      const cur = new Date(Math.max(s.getTime(), past30start.getTime()));
                      const end = new Date(Math.min(e.getTime(), now.getTime()));
                      while (cur <= end) {
                        bookedDays.add(cur.toISOString().slice(0,10));
                        cur.setDate(cur.getDate() + 1);
                      }
                    });
                    const rate = Math.round((bookedDays.size / 30) * 100);
                    const revenue = carBookings.reduce((s, b) => s + (Number(b.totalPrice) || 0), 0);
                    return (
                      <div key={car.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{car.brand} {car.model}</span>
                          <span className="text-muted-foreground">{rate}% · {revenue.toFixed(0)}€</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${rate}%`,
                              background: rate > 70 ? '#22c55e' : rate > 40 ? '#f97316' : '#94a3b8'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {cars.length === 0 && <p className="text-muted-foreground text-sm">Aucun véhicule</p>}
                </div>
              </CardContent>
            </Card>

            {/* Répartition par statut */}
            <div className="grid md:grid-cols-3 gap-4">
              {(["pending","confirmed","cancelled","completed"] as const).map(s => {
                const count = bookings.filter(b => b.status === s).length;
                const labels: Record<string,string> = {pending:"En attente",confirmed:"Confirmées",cancelled:"Annulées",completed:"Terminées"};
                const colors: Record<string,string> = {pending:"text-amber-600",confirmed:"text-emerald-600",cancelled:"text-red-600",completed:"text-sky-600"};
                return (
                  <Card key={s}>
                    <CardHeader className="pb-2">
                      <CardDescription>{labels[s]}</CardDescription>
                      <CardTitle className={`text-3xl ${colors[s]}`}>{count}</CardTitle>
                    </CardHeader>
                  </Card>
                );
              })}
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

      {/* Modal pour afficher le calendrier de disponibilité */}
      {showCalendar && selectedCarForCalendar && (
        <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Calendrier de disponibilité - {selectedCarForCalendar.brand} {selectedCarForCalendar.model}
              </DialogTitle>
              <DialogDescription>
                Visualisez les disponibilités de ce véhicule
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <GlobalCalendar 
                cars={[selectedCarForCalendar]} 
                bookings={bookings.filter(b => b.carId === selectedCarForCalendar.id)} 
              />
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCalendar(false)}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Admin;
