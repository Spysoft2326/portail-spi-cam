"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";

interface Enterprise {
  id: string;
  referenceSPI: string;
  denomination: string;
  sigle: string | null;
  formeJuridique: string | null;
  capitalSocial: number | null;
  adresse: string | null;
  ville: string | null;
  region: string | null;
  telephone: string | null;
  email: string | null;
  siteWeb: string | null;
  secteurActivite: string | null;
  produitsPrincipaux: string | null;
  statut: string;
  estExportateur: boolean;
  createdAt: string;
}

const mapSecteurToCategorie = (secteur: string | null): string => {
  if (!secteur) return "Autre";
  const s = secteur.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (s.includes("metallurgie") || s.includes("industrie") || s.includes("manufacture") || s.includes("textile") || s.includes("bois") || s.includes("chimie") || s.includes("plastique") || s.includes("ceramique") || s.includes("mecanique") || s.includes("electronique") || s.includes("aluminium") || s.includes("acier") || s.includes("ciment")) return "Industrie";
  if (s.includes("agro") || s.includes("agriculture") || s.includes("elevage") || s.includes("peche") || s.includes("forest") || s.includes("palmier") || s.includes("cacao") || s.includes("cafe") || s.includes("coton") || s.includes("banane") || s.includes("ananas") || s.includes("huile")) return "Agriculture";
  if (s.includes("finance") || s.includes("banque") || s.includes("assurance") || s.includes("service") || s.includes("consulting") || s.includes("informatique") || s.includes("education") || s.includes("sante") || s.includes("immobilier") || s.includes("juridique") || s.includes("comptable") || s.includes("audit") || s.includes("bureautique") || s.includes("logistique") || s.includes("fret")) return "Services";
  if (s.includes("commerce") || s.includes("distribution") || s.includes("import") || s.includes("export") || s.includes("vente") || s.includes("supermarche") || s.includes("boutique") || s.includes("negoce")) return "Commerce";
  if (s.includes("transport") || s.includes("logistique") || s.includes("maritime") || s.includes("aerien") || s.includes("routier") || s.includes("ferroviaire") || s.includes("port") || s.includes("douane")) return "Transport";
  if (s.includes("energie") || s.includes("electricite") || s.includes("eau") || s.includes("petrole") || s.includes("gaz") || s.includes("solaire") || s.includes("hydro") || s.includes("charbon") || s.includes("nucleaire")) return "Énergie";
  if (s.includes("telecom") || s.includes("telecommunication") || s.includes("telephonie") || s.includes("internet") || s.includes("mobile") || s.includes("reseau") || s.includes("communication") || s.includes("media")) return "Télécommunications";
  if (s.includes("construction") || s.includes("batiment") || s.includes("travaux") || s.includes("public") || s.includes("genie civil") || s.includes("route") || s.includes("pont") || s.includes("promotion")) return "Construction";
  if (s.includes("mine") || s.includes("minier") || s.includes("extraction") || s.includes("or") || s.includes("diamant") || s.includes("bauxite") || s.includes("fer") || s.includes("manganese") || s.includes("uranium") || s.includes("carriere")) return "Mines";
  if (s.includes("tourisme") || s.includes("hotel") || s.includes("restaurant") || s.includes("hebergement") || s.includes("voyage") || s.includes("loisir") || s.includes("culture") || s.includes("evenement")) return "Tourisme";
  
  return "Autre";
};

const CATEGORIES = [
  "Industrie", "Agriculture", "Services", "Commerce", "Transport",
  "Énergie", "Télécommunications", "Construction", "Mines", "Tourisme"
];

// Composants UI inline
const Button = ({ children, onClick, className = "", variant = "default", size = "default" }: any) => {
  const baseClass = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
  const variants: any = { default: "bg-primary text-primary-foreground hover:bg-primary/90", ghost: "hover:bg-accent hover:text-accent-foreground", outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80" };
  const sizes: any = { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", icon: "h-10 w-10" };
  return <button onClick={onClick} className={`${baseClass} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}>{children}</button>;
};

const Input = ({ className = "", ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

const Badge = ({ children, className = "", variant = "default" }: any) => {
  const variants: any = { default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80", outline: "text-foreground" };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant] || variants.default} ${className}`}>{children}</span>;
};

const Card = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }: any) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Table = ({ children }: any) => <div className="relative w-full overflow-auto"><table className="w-full caption-bottom text-sm">{children}</table></div>;
const TableHeader = ({ children }: any) => <thead className="[&_tr]:border-b">{children}</thead>;
const TableBody = ({ children }: any) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
const TableRow = ({ children, className = "" }: any) => <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>;
const TableHead = ({ children, className = "" }: any) => <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
const TableCell = ({ children, className = "" }: any) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>;

const useToast = () => ({ toast: ({ title, description, variant }: any) => { console.log(`[Toast ${variant}] ${title}: ${description}`); } });

export default function EntreprisesContent() {
  const [enterprises, setEnterprises] = useState<<Enterprise[]>([]);
  const [filteredEnterprises, setFilteredEnterprises] = useState<<Enterprise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, categories: {} as Record<string, number> });
  const { toast } = useToast();
  const router = useRouter();

  const fetchEnterprises = async () => {
    try {
      const response = await fetch("/api/entreprises");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setEnterprises(data.enterprises || []);
      setFilteredEnterprises(data.enterprises || []);
      
      const all = data.enterprises || [];
      const categories: Record<string, number> = {};
      CATEGORIES.forEach(c => categories[c] = 0);
      
      all.forEach((e: Enterprise) => {
        const cat = mapSecteurToCategorie(e.secteurActivite);
        if (categories[cat] !== undefined) categories[cat]++; else categories["Autre"] = (categories["Autre"] || 0) + 1;
      });
      
      setStats({ total: all.length, categories });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les entreprises", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEnterprises(); }, []);

  useEffect(() => {
    let filtered = enterprises;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => e.denomination?.toLowerCase().includes(q) || e.sigle?.toLowerCase().includes(q) || e.ville?.toLowerCase().includes(q) || e.secteurActivite?.toLowerCase().includes(q) || e.referenceSPI?.toLowerCase().includes(q));
    }
    if (selectedCategory) filtered = filtered.filter((e) => mapSecteurToCategorie(e.secteurActivite) === selectedCategory);
    setFilteredEnterprises(filtered);
  }, [searchQuery, selectedCategory, enterprises]);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;
    try {
      const response = await fetch(`/api/entreprises/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
      toast({ title: "Succès", description: "Entreprise supprimée avec succès" });
      fetchEnterprises();
    } catch (error) { toast({ title: "Erreur", description: "Impossible de supprimer l'entreprise", variant: "destructive" }); }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "ACTIF": return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case "INACTIF": return <Badge className="bg-red-100 text-red-800">Inactif</Badge>;
      case "SUSPENDU": return <Badge className="bg-yellow-100 text-yellow-800">Suspendu</Badge>;
      default: return <Badge>{statut}</Badge>;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Annuaire des Entreprises</h1><p className="text-muted-foreground">{stats.total} entreprises répertoriées dans la base SPI-CAM</p></div>
        <Button onClick={() => router.push("/dashboard/entreprises/nouvelle")}><Plus className="mr-2 h-4 w-4" />Nouvelle Entreprise</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {CATEGORIES.map((cat) => (
          <Card key={cat} className={`cursor-pointer transition-colors ${selectedCategory === cat ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{cat}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.categories[cat] || 0}</div><p className="text-xs text-muted-foreground">entreprises</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher par nom, sigle, ville, secteur..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        {selectedCategory && <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory(null)}>{selectedCategory} ×</Badge>}
      </div>

      <Card><CardContent className="p-0">
        <Table><TableHeader><TableRow><TableHead>Réf. SPI</TableHead><TableHead>Dénomination</TableHead><TableHead>Secteur</TableHead><TableHead>Ville</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredEnterprises.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune entreprise trouvée</TableCell></TableRow> : filteredEnterprises.map((enterprise) => (
              <TableRow key={enterprise.id}>
                <TableCell className="font-medium">{enterprise.referenceSPI}</TableCell>
                <TableCell><div className="font-medium">{enterprise.denomination}</div>{enterprise.sigle && <div className="text-sm text-muted-foreground">{enterprise.sigle}</div>}</TableCell>
                <TableCell><Badge variant="outline">{mapSecteurToCategorie(enterprise.secteurActivite)}</Badge>{enterprise.secteurActivite && enterprise.secteurActivite !== mapSecteurToCategorie(enterprise.secteurActivite) && <div className="text-xs text-muted-foreground mt-1">{enterprise.secteurActivite}</div>}</TableCell>
                <TableCell>{enterprise.ville || "-"}</TableCell>
                <TableCell>{getStatutBadge(enterprise.statut)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/entreprises/${enterprise.id}`)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/entreprises/${enterprise.id}/modifier`)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(enterprise.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
