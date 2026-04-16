import logo from "@/assets/logo.jpeg";

const Footer = () => (
  <footer className="border-t border-border py-10 px-6 md:px-16">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <img src={logo} alt="ChopTaLoc" className="h-10 rounded-md" />
        <span className="text-muted-foreground text-sm">© 2026 ChopTaLoc. Tous droits réservés.</span>
        <span className="text-muted-foreground text-sm">Design par Quentin OTT</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="#fleet" className="hover:text-primary transition-colors">Flotte</a>
        <a href="#features" className="hover:text-primary transition-colors">Services</a>
        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        <a href="/legal" className="hover:text-primary transition-colors font-medium underline decoration-primary/30 text-xs">Mentions Légales & RGPD</a>
      </div>
    </div>
  </footer>
);

export default Footer;
