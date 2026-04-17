import logo from "@/assets/logoagence.png";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/hooks/use-client-auth";
import { User } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useClientAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
      </div>

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-16 py-4 md:py-6">
        <button
          onClick={() => {
            if (user?.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          title={user?.role === "admin" ? "Administration" : "ChopTaLoc"}
        >
          <img src={logo} alt="ChopTaLoc" className="h-10 md:h-14 lg:h-20 rounded-lg" />
        </button>
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs md:text-sm font-medium tracking-wide">
          <a href="#fleet" className="text-foreground/70 hover:text-primary transition-colors">Flotte</a>
          <a href="#services" className="text-foreground/70 hover:text-primary transition-colors">Services</a>
          <a href="#features" className="text-foreground/70 hover:text-primary transition-colors">Avantages</a>
          <a href="#faq" className="text-foreground/70 hover:text-primary transition-colors">FAQ</a>
          <a href="#contact" className="text-foreground/70 hover:text-primary transition-colors">Contact</a>
          <button
            onClick={() => navigate("/client-auth")}
            className="text-foreground/70 hover:text-primary transition-colors"
          >
            Espace Client
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <button
              onClick={() => navigate("/client-dashboard")}
              className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xs md:text-sm hover:brightness-110 transition-all"
            >
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <span className="hidden md:inline">
                {user.firstName} {user.lastName?.[0] || ''}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/client-auth")}
              className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xs md:text-sm hover:brightness-110 transition-all"
              title="Connexion / Espace Client"
            >
              <User className="w-4 h-4 md:hidden" />
              <span className="hidden md:inline">Connexion</span>
            </button>
          )}
          <a
            href="#fleet"
            className="inline-flex md:hidden px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:brightness-110 transition-all"
          >
            Réserver
          </a>
          <a
            href="#fleet"
            className="hidden md:inline-flex px-4 md:px-6 py-2 md:py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs md:text-sm hover:brightness-110 transition-all"
          >
            Réserver
          </a>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <p className="text-primary font-semibold tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm mb-3 md:mb-4">
            Avec ChopTaLoc Service
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black leading-tight mb-4 md:mb-6">
            Louez l'Excellence,{" "}
            <span className="text-gradient-orange">Pilotez l'Émotion</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 md:mb-10">
            Des véhicules premium à votre portée. Découvrez une expérience de location haut de gamme, sans compromis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <a
              href="#fleet"
              className="px-6 md:px-10 py-3 md:py-4 rounded-lg glass font-semibold text-sm md:text-lg hover:bg-secondary transition-all"
            >
              Voir nos véhicules disponibles
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
