import logo from "@/assets/logoagence.png";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
      </div>

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-16 py-6">
        <button 
          onClick={() => navigate("/admin")}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          title="Administration"
        >
          <img src={logo} alt="ChopTaLoc" className="h-14 md:h-20 rounded-lg" />
        </button>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/client-auth")}
            className="hidden md:inline-flex px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:brightness-110 transition-all"
          >
            Connexion
          </button>
          <a
            href="#contact"
            className="hidden md:inline-flex px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
          >
            Réserver
          </a>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <p className="text-primary font-semibold tracking-[0.3em] uppercase text-sm mb-4">
            Avec ChopTaLoc
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Louez l'Excellence,{" "}
            <span className="text-gradient-orange">Pilotez l'Émotion</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Des véhicules premium à votre portée. Découvrez une expérience de location haut de gamme, sans compromis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#fleet"
              className="px-10 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg glow-orange hover:brightness-110 transition-all"
            >
              Découvrir la Flotte
            </a>
            <a
              href="#contact"
              className="px-10 py-4 rounded-lg glass font-semibold text-lg hover:bg-secondary transition-all"
            >
              Nous Contacter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
