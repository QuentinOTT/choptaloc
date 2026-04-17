import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/hooks/use-client-auth";
import { API_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Check, X, LogOut, User, Shield, Home, ArrowLeft, Clock, Eye, AlertCircle, Calendar, Edit, Save } from "lucide-react";

interface Document {
  id: string;
  type: "id_card_front" | "id_card_back" | "license_front" | "license_back" | "proof_of_address";
  fileName: string;
  fileUrl?: string;
  uploadedAt: string;
  isVerified: boolean;
  status: "pending" | "verified" | "rejected";
  rejectionReason?: string;
}

const documentLabels: Record<string, string> = {
  id_card_front: "Carte d'identité (Recto)",
  id_card_back: "Carte d'identité (Verso)",
  license_front: "Permis de conduire (Recto)",
  license_back: "Permis de conduire (Verso)",
  proof_of_address: "Justificatif de domicile",
  other: "Document complémentaire (Optionnel)",
};

const MANDATORY_DOCS = ['id_card_front', 'id_card_back', 'license_front', 'license_back', 'proof_of_address'];

const ClientDashboard = () => {
  const { user, logout, updateUser } = useClientAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
  });
  const [pendingUploads, setPendingUploads] = useState<Record<string, { file: File, base64: string }>>({});
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "documents" | "bookings">("profile");
  const [bookings, setBookings] = useState<any[]>([]);
  const [showEditBooking, setShowEditBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [modificationForm, setModificationForm] = useState({
    startDate: "",
    endDate: "",
    pickupLocation: "",
    dropoffLocation: "",
    notes: "",
  });
  const [userModifications, setUserModifications] = useState<any[]>([]);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 5 Mo). Veuillez compresser votre image ou utiliser un PDF.");
      return;
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsDataURL(file);
    });

    setPendingUploads(prev => ({
      ...prev,
      [docType]: { file, base64 }
    }));
  };

  const handleConfirmUpload = async (docType: string) => {
    const pending = pendingUploads[docType];
    if (!pending || !user) return;

    setUploading(true);

    try {
      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          type: docType,
          fileData: pending.base64,
          fileName: pending.file.name,
        }),
      });

      if (response.ok) {
        const newDocResult = await response.json();
        const newDocument: Document = {
          id: newDocResult.documentId.toString(),
          type: docType as any,
          fileName: pending.file.name,
          fileUrl: pending.base64,
          uploadedAt: new Date().toISOString(),
          isVerified: false,
          status: "pending",
        };
        
        const updatedDocs = [...documents, newDocument];
        setDocuments(updatedDocs);
        
        // Nettoyer l''upload en attente
        const newPending = { ...pendingUploads };
        delete newPending[docType];
        setPendingUploads(newPending);

        // Auto-vérification du compte
        const uploadedMandatoryCount = MANDATORY_DOCS.filter(type => 
          updatedDocs.some(d => d.type === type)
        ).length;

        if (uploadedMandatoryCount === MANDATORY_DOCS.length) {
            try {
              await fetch(`${API_URL}/users/${user.id}/verify-documents`, { method: 'POST' });
              alert("Bravo ! Tous vos documents sont envoyés. Votre compte est désormais en statut 'Vérifié'.");
              window.location.reload(); 
            } catch (e) { console.error(e); }
        } else {
            alert(`Document uploadé avec succès ! (${uploadedMandatoryCount}/${MANDATORY_DOCS.length} documents obligatoires fournis)`);
        }
      } else {
        alert("Erreur lors de l'upload du document");
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert("Erreur lors de l'upload du document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        const response = await fetch(`${API_URL}/documents/${docId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setDocuments(documents.filter((doc) => doc.id !== docId));
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error('Erreur suppression document:', error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const loadDocuments = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/documents/user/${user.id}`);
      const data = await response.json();
      const mapped = data.map((d: any) => ({
        id: d.id.toString(),
        type: d.document_type,
        fileName: d.file_name,
        fileUrl: d.file_path,
        uploadedAt: d.created_at,
        isVerified: d.is_verified,
        status: d.is_verified ? "verified" : (d.rejection_reason ? "rejected" : "pending"),
        rejectionReason: d.rejection_reason
      }));
      setDocuments(mapped);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      setDocuments([]);
    }
  };

  useEffect(() => {
    loadDocuments();
    
    // Charger les données du profil
    if (user) {
      // Initialiser avec les données de l'utilisateur
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: "",
        city: "",
        postalCode: "",
        country: "France",
      });

      // Charger les réservations du client depuis l'API
      fetch(`${API_URL}/bookings/user/${user.id}`)
        .then(res => res.json())
        .then(data => setBookings(data))
        .catch(err => {
          console.error('Erreur chargement réservations:', err);
          setBookings([]);
        });

      // Charger les demandes de modification du client
      fetch(`${API_URL}/bookings/modifications/user/${user.id}`)
        .then(res => res.json())
        .then(data => setUserModifications(data))
        .catch(err => {
          console.error('Erreur chargement modifications:', err);
          setUserModifications([]);
        });
    }
  }, [user]);

  const handleEnableTwoFactor = () => {
    if (user) {
      // Simuler l'activation du 2FA (en production, cela nécessiterait un backend)
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      alert("Double authentification activée !\n\nNote : En production, vous devriez scanner un QR Code avec Google Authenticator. Pour cette démo, le 2FA est simulé.");
    }
  };

  const handleDisableTwoFactor = () => {
    if (user) {
      if (confirm("Êtes-vous sûr de vouloir désactiver la double authentification ?")) {
        setTwoFactorEnabled(false);
        alert("Double authentification désactivée.");
      }
    }
  };

  const handleEditBooking = async () => {
    if (!editingBooking || !user) return;

    // Créer les modifications demandées
    const changes: Record<string, any> = {};
    if (modificationForm.startDate && modificationForm.startDate !== editingBooking.start_date) {
      changes.startDate = modificationForm.startDate;
    }
    if (modificationForm.endDate && modificationForm.endDate !== editingBooking.end_date) {
      changes.endDate = modificationForm.endDate;
    }
    if (modificationForm.pickupLocation && modificationForm.pickupLocation !== editingBooking.pickup_location) {
      changes.pickupLocation = modificationForm.pickupLocation;
    }
    if (modificationForm.dropoffLocation && modificationForm.dropoffLocation !== editingBooking.dropoff_location) {
      changes.dropoffLocation = modificationForm.dropoffLocation;
    }
    if (modificationForm.notes && modificationForm.notes !== editingBooking.notes) {
      changes.notes = modificationForm.notes;
    }

    if (Object.keys(changes).length === 0) {
      alert("Veuillez apporter au moins une modification");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bookings/${editingBooking.id}/modifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes,
          requestedBy: user.id
        })
      });

      if (response.ok) {
        setShowEditBooking(false);
        setEditingBooking(null);
        setModificationForm({
          startDate: "",
          endDate: "",
          pickupLocation: "",
          dropoffLocation: "",
          notes: "",
        });
        alert("Demande de modification envoyée avec succès ! Elle sera examinée par un administrateur.");
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error || 'Erreur lors de l\'envoi de la demande'}`);
      }
    } catch (error) {
      console.error('Erreur API:', error);
      alert("Erreur lors de l'envoi de la demande");
    }
  };

  const openEditModal = (booking: any) => {
    setEditingBooking(booking);
    // On utilise les noms de propriétés de la base de données (snake_case from backend)
    setModificationForm({
      startDate: booking.start_date?.split('T')[0] || "",
      endDate: booking.end_date?.split('T')[0] || "",
      pickupLocation: booking.pickup_location || "",
      dropoffLocation: booking.dropoff_location || "",
      notes: booking.notes || "",
    });
    setShowEditBooking(true);
  };

  const handleSaveProfile = () => {
    if (user) {
      updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      });
      setIsEditingProfile(false);
      alert("Profil mis à jour avec succès !");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Veuillez vous connecter</p>
            <Button className="mt-4" onClick={() => navigate("/client-auth")}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <Button onClick={() => navigate("/")} variant="ghost" className="gap-2 p-2 md:px-4 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Retour au site</span>
              </Button>
              {user?.role === "admin" && (
                <Button onClick={() => navigate("/admin")} variant="ghost" className="gap-2 p-2 md:px-4 text-primary hover:bg-primary/10">
                  <Shield className="w-4 h-4" />
                  <span className="hidden md:inline">Panel Admin</span>
                </Button>
              )}
              <h1 className="text-lg md:text-2xl font-bold ml-2">Mon Espace</h1>
            </div>
            <Button onClick={logout} variant="outline" className="gap-2 p-2 md:px-4 sm:hidden">
              <LogOut className="w-4 h-4" />
              <span className="hidden">Déconnexion</span>
            </Button>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <Button onClick={logout} variant="outline" className="gap-2 p-2 md:px-4">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-8 p-6 md:p-10 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight italic">Bienvenue, {user.firstName} ! 👋</h2>
              <p className="text-muted-foreground">Ravi de vous revoir. Retrouvez ici vos documents et vos réservations en cours.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-card/50 backdrop-blur-md border px-4 py-3 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Réservations</p>
                  <p className="text-xl font-black">{bookings.filter(b => b.status === 'confirmed').length}</p>
                </div>
              </div>
              <div className="bg-card/50 backdrop-blur-md border px-4 py-3 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Documents</p>
                  <p className="text-xl font-black">{documents.filter(d => d.status === 'verified').length}/{MANDATORY_DOCS.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "profile" | "documents" | "bookings")} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] h-auto p-1">
            <TabsTrigger value="profile" className="gap-2 flex-col md:flex-row items-center py-3 md:py-2 text-xs md:text-sm">
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Profil</span>
              <span className="md:hidden">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 relative flex-col md:flex-row items-center py-3 md:py-2 text-xs md:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Documents</span>
              <span className="md:hidden">Docs</span>
              {documents.filter(d => d.status === "rejected").length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs px-1 md:px-1.5 py-0.5">
                  {documents.filter(d => d.status === "rejected").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2 flex-col md:flex-row items-center py-3 md:py-2 text-xs md:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Réservations</span>
              <span className="md:hidden">Réserv.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8">
            {/* Informations du compte */}
            <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations du compte
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                {isEditingProfile ? "Annuler" : "Modifier"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Prénom</label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nom</label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Téléphone</label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Adresse</label>
                    <Input
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      placeholder="123 Rue de la République"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ville</label>
                    <Input
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Code postal</label>
                    <Input
                      value={profileData.postalCode}
                      onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                      placeholder="75001"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Pays</label>
                    <Input
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>Enregistrer</Button>
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Annuler</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prénom</p>
                    <p className="font-medium">{profileData.firstName || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium">{profileData.lastName || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{profileData.phone || "Non renseigné"}</p>
                  </div>
                  {(profileData.address || profileData.city || profileData.postalCode) && (
                    <>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p className="font-medium">
                          {profileData.address && `${profileData.address}, `}
                          {profileData.city && `${profileData.city}, `}
                          {profileData.postalCode && profileData.postalCode}
                          {profileData.country && `, ${profileData.country}`}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Statut du compte</p>
                    <Badge variant={user.isVerified ? "default" : "secondary"} className={user.isVerified ? "bg-green-500 hover:bg-green-600" : ""}>
                      {user.isVerified ? "Compte Vérifié" : "Documents manquants"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité du compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Double authentification (2FA)</p>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez une couche de sécurité supplémentaire avec Google Authenticator
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {twoFactorEnabled ? (
                    <>
                      <Badge variant="default" className="gap-1">
                        <Check className="w-3 h-3" />
                        Activé
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDisableTwoFactor}
                      >
                        Désactiver
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary">Désactivé</Badge>
                      <Button
                        size="sm"
                        onClick={() => setShowTwoFactorSetup(true)}
                      >
                        Activer
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {showTwoFactorSetup && (
                <div className="p-4 bg-secondary/50 rounded-lg space-y-4">
                  <h4 className="font-medium">Configuration de la double authentification</h4>
                  <div className="space-y-2 text-sm">
                    <p>1. Téléchargez Google Authenticator sur votre téléphone</p>
                    <p>2. Scannez le QR Code ci-dessous (simulé)</p>
                    <p>3. Entrez le code de vérification</p>
                  </div>
                  
                  <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                      <Shield className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    QR Code simulé - En production, un vrai QR Code serait généré
                  </p>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Code à 6 chiffres"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      maxLength={6}
                    />
                    <Button onClick={handleEnableTwoFactor}>
                      Activer
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTwoFactorSetup(false)}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>


        <TabsContent value="documents" className="space-y-8">
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents requis
                </CardTitle>
                <CardDescription>
                  Pour effectuer une réservation, vous devez fournir les documents suivants. 
                  Vos documents sont chiffrés et sécurisés.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(documentLabels).map(([type, label]) => {
                  const doc = documents.find((d) => d.type === type);
                  return (
                    <div
                      key={type}
                      className={`border-2 rounded-xl p-5 space-y-4 transition-all ${
                        doc?.status === "verified" 
                          ? "border-green-500/30 bg-green-500/5" 
                          : doc?.status === "rejected"
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-gray-200 bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            type.includes("id_card") 
                              ? "bg-blue-100 text-blue-600" 
                              : type.includes("license")
                              ? "bg-purple-100 text-purple-600"
                              : "bg-orange-100 text-orange-600"
                          }`}>
                            {type.includes("id_card") && <Shield className="w-5 h-5" />}
                            {type.includes("license") && <FileText className="w-5 h-5" />}
                            {type.includes("proof") && <Home className="w-5 h-5" />}
                          </div>
                          <span className="font-semibold text-lg">{label}</span>
                        </div>
                        {doc ? (
                          <Badge 
                            variant={doc.status === "verified" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"} 
                            className="gap-1 px-3 py-1"
                          >
                            {doc.status === "verified" ? (
                              <>
                                <Check className="w-3 h-3" />
                                Vérifié
                              </>
                            ) : doc.status === "rejected" ? (
                              <>
                                <X className="w-3 h-3" />
                                Refusé
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                En attente
                              </>
                            )}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="px-3 py-1">Non uploadé</Badge>
                        )}
                      </div>

                      {doc ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {doc.fileName} • {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="gap-1 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                              Supprimer
                            </Button>
                          </div>
                          
                          {/* Affichage de l'image */}
                          {doc.fileUrl && (
                            <div 
                              className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary transition-all"
                              onClick={() => setSelectedImage(doc.fileUrl!)}
                            >
                              <img
                                src={doc.fileUrl}
                                alt={doc.fileName}
                                className="max-w-full h-auto max-h-64 object-contain w-full"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-white text-center p-4">
                                  <Eye className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-sm font-medium">Cliquez pour agrandir</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Raison du refus */}
                          {doc.status === "rejected" && doc.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-semibold">Raison du refus :</p>
                                  <p className="text-sm mt-1">{doc.rejectionReason}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {pendingUploads[type] ? (
                            <div className="flex flex-col gap-3 p-3 border rounded-lg bg-primary/5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium truncate max-w-[200px]">{pendingUploads[type].file.name}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 w-7 p-0 text-red-500"
                                  onClick={() => {
                                    const newPending = { ...pendingUploads };
                                    delete newPending[type];
                                    setPendingUploads(newPending);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full gap-2"
                                onClick={() => handleConfirmUpload(type)}
                                disabled={uploading}
                              >
                                {uploading ? "Upload..." : "Valider et envoyer"}
                                <Save className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Input
                                type="file"
                                id={`upload-${type}`}
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileSelect(e, type)}
                                disabled={uploading}
                              />
                              <label
                                htmlFor={`upload-${type}`}
                                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                              >
                                <Upload className="w-5 h-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {uploading ? "Upload en cours..." : "Choisir un fichier"}
                                </span>
                              </label>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Informations de sécurité */}
            <Card className="bg-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  Sécurité et confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Vos documents sont chiffrés avant d'être stockés</p>
                <p>• Seuls les administrateurs autorisés peuvent accéder à vos documents</p>
                <p>• Tous les accès sont journalisés pour la traçabilité</p>
                <p>• Vos documents sont stockés sur des serveurs sécurisés (AWS S3)</p>
                <p>• Le justificatif de domicile doit dater de moins de 1 mois</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Mes réservations
                </CardTitle>
                <CardDescription>
                  Consultez le statut de vos demandes de réservation et demandez des modifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">Aucune réservation pour le moment</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate("/")}
                    >
                      Faire une réservation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const modRequest = userModifications.find(m => m.booking_id === booking.id && m.status === 'pending');
                      const lastRejectedMod = userModifications.find(m => m.booking_id === booking.id && m.status === 'rejected');
                      
                      return (
                      <Card key={booking.id} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Calendar className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">
                                  {booking.brand} {booking.model}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3" />
                                  DU {new Date(booking.start_date).toLocaleDateString("fr-FR")} AU {new Date(booking.end_date).toLocaleDateString("fr-FR")}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className="px-3" variant={
                              booking.status === "confirmed" ? "default" : 
                              booking.status === "cancelled" ? "destructive" : 
                              booking.status === "completed" ? "secondary" : "outline"
                            }>
                              {booking.status === "confirmed" ? "Confirmée" : 
                               booking.status === "cancelled" ? "Annulée" : 
                               booking.status === "completed" ? "Terminée" : "En attente"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4 border-y border-dashed border-gray-100 mt-2">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Prix total</p>
                              <p className="font-bold text-xl text-primary">{booking.total_price}€</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Récupération</p>
                              <p className="text-sm font-medium">{booking.pickup_location || "Agence"}</p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Retour</p>
                              <p className="text-sm font-medium">{booking.dropoff_location || "Agence"}</p>
                            </div>
                          </div>

                          {/* Affichage des demandes de modification */}
                          {modRequest && (
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2 text-blue-700 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Demande de modification en attente...</span>
                              </div>
                              <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">En cours</Badge>
                            </div>
                          )}

                          {lastRejectedMod && !modRequest && (
                            <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                              <div className="flex items-center gap-2 text-red-700 text-sm mb-1">
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-semibold">Modification refusée</span>
                              </div>
                              <p className="text-xs text-red-600 ml-6">{lastRejectedMod.rejection_reason}</p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <AlertCircle className="w-3 h-3" />
                              Ref: #{booking.id.toString().padStart(5, '0')}
                            </div>
                            {(booking.status === "confirmed" || booking.status === "pending") && !modRequest && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-colors"
                                onClick={() => openEditModal(booking)}
                              >
                                <Edit className="w-4 h-4" />
                                Demander une modification
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
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

      {/* Modal de modification de réservation */}
      <Dialog open={showEditBooking} onOpenChange={setShowEditBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander une modification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-start">Date de début</Label>
              <Input
                id="edit-start"
                type="date"
                value={modificationForm.startDate}
                onChange={(e) => setModificationForm({ ...modificationForm, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-end">Date de fin</Label>
              <Input
                id="edit-end"
                type="date"
                value={modificationForm.endDate}
                onChange={(e) => setModificationForm({ ...modificationForm, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-pickup">Lieu de récupération</Label>
              <Input
                id="edit-pickup"
                value={modificationForm.pickupLocation}
                onChange={(e) => setModificationForm({ ...modificationForm, pickupLocation: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-dropoff">Lieu de retour</Label>
              <Input
                id="edit-dropoff"
                value={modificationForm.dropoffLocation}
                onChange={(e) => setModificationForm({ ...modificationForm, dropoffLocation: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={modificationForm.notes}
                onChange={(e) => setModificationForm({ ...modificationForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEditBooking}>Envoyer la demande</Button>
              <Button variant="outline" onClick={() => setShowEditBooking(false)}>Annuler</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
