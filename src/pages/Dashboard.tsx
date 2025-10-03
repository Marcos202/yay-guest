import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  User as UserIcon, // Ícones para os cards
  Cake,
  Phone,
  CalendarDays,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Guest {
  id: string;
  nome_completo: string;
  idade: number;
  whatsapp: string; // Pode ser null
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
      // Correção de bug: Garante que a busca no WhatsApp não quebre se o valor for nulo
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
      guest.whatsapp || "N/A",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background"><div className="text-center space-y-4"><div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-muted-foreground">Carregando dashboard...</p></div></div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10"><div className="container mx-auto px-4 py-4 flex items-center justify-between"><h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Painel Administrativo</h1><Button onClick={handleLogout} variant="outline" className="gap-2"><LogOut className="h-4 w-4" />Sair</Button></div></header>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><Card className="shadow-card hover:shadow-glow transition-all duration-300 border-primary/20"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Confirmados</CardTitle><Users className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{guests.length}</div><p className="text-xs text-muted-foreground mt-1">pessoas confirmadas</p></CardContent></Card><Card className="shadow-card hover:shadow-glow transition-all duration-300 border-primary/20 md:col-span-2"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Distribuição por Faixa Etária</CardTitle><BarChart3 className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="flex flex-wrap gap-4">{ageGroups.map((group) => (<div key={group.range} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50"><span className="text-sm font-semibold text-primary">{group.range} anos:</span><span className="text-sm font-bold">{group.count}</span></div>))}</div></CardContent></Card></div>

        <Card className="shadow-elegant border-primary/20">
          <CardHeader><div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"><CardTitle className="text-2xl">Lista de Convidados</CardTitle><div className="flex gap-2 w-full sm:w-auto"><Button onClick={handleExportCSV} variant="outline" className="gap-2 flex-1 sm:flex-initial" disabled={filteredGuests.length === 0}><Download className="h-4 w-4" />Exportar CSV</Button></div></div><div className="relative mt-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por nome ou WhatsApp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11" /></div></CardHeader>
          <CardContent>
            {/* Tabela visível apenas em telas grandes (desktop) */}
            <div className="rounded-lg border overflow-hidden hidden md:block">
              <Table>
                <TableHeader><TableRow><TableHead className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => handleSort("nome_completo")}><div className="flex items-center gap-2">Nome{sortField === "nome_completo" && (<span>{sortDirection === "asc" ? "↑" : "↓"}</span>)}</div></TableHead><TableHead className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => handleSort("idade")}><div className="flex items-center gap-2">Idade{sortField === "idade" && (<span>{sortDirection === "asc" ? "↑" : "↓"}</span>)}</div></TableHead><TableHead>WhatsApp</TableHead><TableHead className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => handleSort("data_confirmacao")}><div className="flex items-center gap-2">Data de Confirmação{sortField === "data_confirmacao" && (<span>{sortDirection === "asc" ? "↑" : "↓"}</span>)}</div></TableHead></TableRow></TableHeader>
                <TableBody>{filteredGuests.length === 0 ? (<TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Nenhum convidado encontrado</TableCell></TableRow>) : (filteredGuests.map((guest) => (<TableRow key={guest.id} className="hover:bg-secondary/30"><TableCell className="font-medium">{guest.nome_completo}</TableCell><TableCell>{guest.idade}</TableCell><TableCell>{guest.whatsapp || "N/A"}</TableCell><TableCell>{formatDate(guest.data_confirmacao)}</TableCell></TableRow>)))}</TableBody>
              </Table>
            </div>
            {/* Lista de cards visível apenas em telas pequenas (mobile) */}
            <div className="md:hidden space-y-4">
              {filteredGuests.length === 0 ? (<div className="text-center py-12 text-muted-foreground">Nenhum convidado encontrado</div>) : (filteredGuests.map((guest) => (<div key={guest.id} className="p-4 border rounded-lg bg-card shadow-sm space-y-3"><div className="flex items-center gap-3 font-bold text-primary"><UserIcon className="h-5 w-5 flex-shrink-0" /><span>{guest.nome_completo}</span></div><div className="pl-8 text-sm text-muted-foreground space-y-2"><div className="flex items-center gap-2"><Cake className="h-4 w-4 flex-shrink-0" /><span>{guest.idade} anos</span></div><div className="flex items-center gap-2"><Phone className="h-4 w-4 flex-shrink-0" /><span>{guest.whatsapp || "Não informado"}</span></div><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 flex-shrink-0" /><span>{formatDate(guest.data_confirmacao)}</span></div></div></div>)))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
