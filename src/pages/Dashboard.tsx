import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  LogOut,
  Users,
  Search,
  Download,
  BarChart3,
  User as UserIcon,
  Cake,
  Phone,
  CalendarDays,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Guest {
  id: string;
  nome_completo: string;
  idade: number;
  whatsapp: string;
  data_confirmacao: string;
}

interface AgeGroup {
  range: string;
  count: number;
}

const Dashboard = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Guest>("data_confirmacao");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // State para a paginação
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    checkAuth();
    loadGuests();
    
    const channel = supabase
      .channel("convidados-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "convidados" }, loadGuests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterAndSortGuests();
    // Reseta para a primeira página sempre que a busca ou ordenação mudar
    setCurrentPage(1); 
  }, [guests, searchTerm, sortField, sortDirection]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadGuests = async () => {
    try {
      const { data, error } = await supabase.from("convidados").select("*").order("data_confirmacao", { ascending: false });
      if (error) throw error;
      setGuests(data || []);
      calculateAgeGroups(data || []);
    } catch (error) {
      console.error("Erro ao carregar convidados:", error);
      toast.error("Erro ao carregar dados dos convidados");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAgeGroups = (guestsList: Guest[]) => {
    const groups = [{ range: "0-17", count: 0 }, { range: "18-25", count: 0 }, { range: "26-35", count: 0 }, { range: "36-50", count: 0 }, { range: "51+", count: 0 }];
    guestsList.forEach((guest) => {
      const age = guest.idade;
      if (age < 18) groups[0].count++; else if (age <= 25) groups[1].count++; else if (age <= 35) groups[2].count++; else if (age <= 50) groups[3].count++; else groups[4].count++;
    });
    setAgeGroups(groups.filter((g) => g.count > 0));
  };

  const filterAndSortGuests = () => {
    let filtered = guests.filter((guest) =>
      guest.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.whatsapp && guest.whatsapp.includes(searchTerm))
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue === null || bValue === null) return 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    setFilteredGuests(filtered);
  };

  const handleSort = (field: keyof Guest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Nome Completo", "Idade", "WhatsApp", "Data de Confirmação"];
    const rows = filteredGuests.map((guest) => [
      guest.nome_completo,
      guest.idade.toString(),
      guest.whatsapp || "Não informado",
      new Date(guest.data_confirmacao).toLocaleString("pt-BR"),
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `convidados-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Lista exportada com sucesso!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logout realizado com sucesso");
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  // Lógica da Paginação
  const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background"><div className="text-center space-y-4"><div className="h-12 w-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-brand-secondary">Carregando dashboard...</p></div></div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-primary">
      <header className="border-b border-brand-accent/50 bg-brand-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-primary">
              Painel Administrativo
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/whatsapp-sender">
              <Button variant="outline" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm border-brand-accent/50"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-secondary">Total de Confirmados</CardTitle><Users className="h-5 w-5 text-brand-primary" /></CardHeader><CardContent><div className="text-3xl font-bold text-brand-primary">{guests.length}</div><p className="text-xs text-brand-secondary/80 mt-1">pessoas confirmadas</p></CardContent></Card>
          <Card className="shadow-sm border-brand-accent/50 md:col-span-2"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-brand-secondary">Distribuição por Faixa Etária</CardTitle><BarChart3 className="h-5 w-5 text-brand-primary" /></CardHeader><CardContent><div className="flex flex-wrap gap-4">{ageGroups.map((group) => (<div key={group.range} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-accent/50"><span className="text-sm font-semibold text-brand-primary">{group.range} anos:</span><span className="text-sm font-bold text-brand-primary">{group.count}</span></div>))}</div></CardContent></Card>
        </div>

        <Card className="shadow-sm border-brand-accent/50">
          <CardHeader><div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"><CardTitle className="text-2xl">Lista de Convidados</CardTitle><div className="flex gap-2 w-full sm:w-auto"><Button onClick={handleExportCSV} variant="outline" className="gap-2 flex-1 sm:flex-initial" disabled={filteredGuests.length === 0}><Download className="h-4 w-4" />Exportar CSV</Button></div></div><div className="relative mt-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" /><Input placeholder="Buscar por nome ou WhatsApp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11" /></div></CardHeader>
          <CardContent>
            {/* Tabela Desktop */}
            <div className="rounded-lg border border-brand-accent/50 overflow-hidden hidden md:block">
              <Table>
                <TableHeader><TableRow className="bg-brand-accent/30"><TableHead className="cursor-pointer hover:bg-brand-accent/50" onClick={() => handleSort("nome_completo")}><div className="flex items-center gap-2">Nome{sortField === "nome_completo" && (<span>{sortDirection === "asc" ? "↑" : "↓"}</span>)}</div></TableHead><TableHead className="cursor-pointer hover:bg-brand-accent/50" onClick={() => handleSort("idade")}><div className="flex items-center gap-2">Idade{sortField === "idade" && (<span>{sortDirection === "asc" ? "↑" : "↓"}</span>)}</div></TableHead><TableHead>WhatsApp</TableHead><TableHead className="cursor-pointer hover:bg-brand-accent/50" onClick={() => handleSort("data_confirmacao")}><div className="flex items-center gap-2">Data de Confirmação{sortField === "data_confirmacao" && (<span>{sortDirection === "asc" ? "↑" : "↓"}</span>)}</div></TableHead></TableRow></TableHeader>
                <TableBody>{paginatedGuests.length === 0 ? (<TableRow><TableCell colSpan={4} className="text-center py-12 text-brand-secondary">Nenhum convidado encontrado</TableCell></TableRow>) : (paginatedGuests.map((guest) => (<TableRow key={guest.id} className="hover:bg-brand-accent/20"><TableCell className="font-medium">{guest.nome_completo}</TableCell><TableCell>{guest.idade}</TableCell><TableCell>{guest.whatsapp || "Não informado"}</TableCell><TableCell>{formatDate(guest.data_confirmacao)}</TableCell></TableRow>)))}</TableBody>
              </Table>
            </div>
            {/* Lista Mobile */}
            <div className="md:hidden space-y-4">
              {paginatedGuests.length === 0 ? (<div className="text-center py-12 text-brand-secondary">Nenhum convidado encontrado</div>) : (paginatedGuests.map((guest) => (<div key={guest.id} className="p-4 border border-brand-accent/50 rounded-lg bg-brand-card shadow-sm space-y-3"><div className="flex items-center gap-3 font-bold text-brand-primary"><UserIcon className="h-5 w-5 flex-shrink-0" /><span>{guest.nome_completo}</span></div><div className="pl-8 text-sm text-brand-secondary space-y-2"><div className="flex items-center gap-2"><Cake className="h-4 w-4 flex-shrink-0" /><span>{guest.idade} anos</span></div><div className="flex items-center gap-2"><Phone className="h-4 w-4 flex-shrink-0" /><span>{guest.whatsapp || "Não informado"}</span></div><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 flex-shrink-0" /><span>{formatDate(guest.data_confirmacao)}</span></div></div></div>)))}
            </div>
            
            {/* Componente de Paginação */}
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((prev) => Math.max(prev - 1, 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 py-2 text-sm">Página {currentPage} de {totalPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((prev) => Math.min(prev + 1, totalPages)); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
