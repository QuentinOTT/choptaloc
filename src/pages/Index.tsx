import HeroSection from "@/components/HeroSection";
import FleetSection from "@/components/FleetSection";
import FeaturesSection from "@/components/FeaturesSection";
import ServicesSection from "@/components/ServicesSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

import { useSettings } from "@/context/SettingsContext";

const Index = () => {
  const { settings, isLoading } = useSettings();

  if (isLoading) return null;

  const maintenanceMode = settings.maintenance_mode === 'true';
  const vacationMode = settings.vacation_mode === 'true';
  const vacationStart = settings.vacation_start;
  const vacationEnd = settings.vacation_end;
  const alertMessage = settings.alert_message;

  const isCurrentlyOnVacation = () => {
    if (!vacationMode || !vacationStart || !vacationEnd) return false;
    const now = new Date();
    const start = new Date(vacationStart);
    const end = new Date(vacationEnd);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  };

  const onVacation = isCurrentlyOnVacation();

  return (
    <div className="min-h-screen bg-background relative">
      {maintenanceMode && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-primary animate-pulse">🛠️</span>
            </div>
            <h1 className="text-3xl font-black">Maintenance en cours</h1>
            <p className="text-muted-foreground">
              Notre site est actuellement en cours de maintenance pour vous offrir une meilleure expérience. Nous serons de retour très bientôt !
            </p>
            {alertMessage && (
              <div className="bg-secondary/50 p-4 rounded-lg border border-primary/20 italic text-sm">
                "{alertMessage}"
              </div>
            )}
          </div>
        </div>
      )}

      {onVacation && !maintenanceMode && (
        <div id="vacation-overlay" className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6 glass p-10 rounded-3xl border-yellow-500/20 shadow-2xl">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl animate-bounce">🏖️</span>
            </div>
            <h1 className="text-3xl font-black">L'agence est en pause</h1>
            <p className="text-muted-foreground">
              Nous sommes actuellement fermés pour congés du <span className="font-bold text-foreground">{new Date(vacationStart!).toLocaleDateString("fr-FR")}</span> au <span className="font-bold text-foreground">{new Date(vacationEnd!).toLocaleDateString("fr-FR")}</span> inclus.
            </p>
            <p className="text-sm text-yellow-600 font-medium">
              Les réservations ne sont pas possibles pendant cette période.
            </p>
            <button 
              onClick={() => {
                // Optionnel: permettre de voir le site quand même
                const el = document.getElementById('vacation-overlay');
                if (el) el.style.display = 'none';
              }}
              className="text-xs underline text-muted-foreground"
            >
              Fermer cet avis et consulter la flotte
            </button>
          </div>
        </div>
      )}

      {alertMessage && !maintenanceMode && (
        <div id="site-alert" className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground py-2 md:py-3 px-4 text-center text-xs md:text-sm font-semibold shadow-lg animate-fade-in-down flex items-center justify-center gap-3">
          <span className="animate-bounce">📢</span>
          {alertMessage}
          <button 
            onClick={() => {
              const el = document.getElementById('site-alert');
              if (el) el.style.display = 'none';
            }}
            className="ml-4 hover:opacity-70 transition-opacity"
            id="site-alert-close"
          >
            ✕
          </button>
        </div>
      )}

      <HeroSection />
      <FleetSection />
      <ServicesSection />
      <FeaturesSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
