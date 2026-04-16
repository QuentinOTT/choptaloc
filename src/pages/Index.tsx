import HeroSection from "@/components/HeroSection";
import FleetSection from "@/components/FleetSection";
import FeaturesSection from "@/components/FeaturesSection";
import ServicesSection from "@/components/ServicesSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  const alertMessage = localStorage.getItem('alertMessage');
  const maintenanceMode = localStorage.getItem('maintenanceMode') === 'true';

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
