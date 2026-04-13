import HeroSection from "@/components/HeroSection";
import FleetSection from "@/components/FleetSection";
import FeaturesSection from "@/components/FeaturesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FleetSection />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
