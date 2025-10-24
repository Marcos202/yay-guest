import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, ArrowLeft } from "lucide-react";
import FileUpload from "@/components/whatsapp/FileUpload";
import ContactsList from "@/components/whatsapp/ContactsList";
import ManualMode from "@/components/whatsapp/ManualMode";
import AutomaticMode from "@/components/whatsapp/AutomaticMode";
import LegalNotice from "@/components/whatsapp/LegalNotice";

export interface Contact {
  id: string;
  nome: string;
  telefone: string;
  observacao?: string;
  status?: string;
  selected?: boolean;
}

const WhatsAppSender = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campanhaId, setCampanhaId] = useState<string | null>(null);
  const [mode, setMode] = useState<"manual" | "automatico">("manual");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleFileUpload = async (uploadedContacts: Contact[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para usar esta funcionalidade");
        navigate("/auth");
        return;
      }

      // Criar campanha
      const { data: campanha, error: campanhaError } = await supabase
        .from("campanhas")
        .insert({
          user_id: user.id,
          nome: `Campanha ${new Date().toLocaleDateString()}`,
          mensagem_template: "Olá {{nome}}, tudo bem?",
          modo: mode,
        })
        .select()
        .single();

      if (campanhaError) throw campanhaError;

      setCampanhaId(campanha.id);

      // Inserir contatos
      const contatosToInsert = uploadedContacts.map((c) => ({
        campanha_id: campanha.id,
        nome: c.nome,
        telefone: c.telefone,
        observacao: c.observacao || null,
      }));

      const { data: contatosData, error: contatosError } = await supabase
        .from("contatos")
        .insert(contatosToInsert)
        .select();

      if (contatosError) throw contatosError;

      setContacts(
        contatosData.map((c) => ({
          id: c.id,
          nome: c.nome,
          telefone: c.telefone,
          observacao: c.observacao || "",
          status: "pendente",
          selected: false,
        }))
      );

      toast.success(`${contatosData.length} contatos carregados com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao processar arquivo:", error);
      toast.error(error.message || "Erro ao processar arquivo");
    }
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    return !!user;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">WhatsApp Sender</h1>
            <p className="text-muted-foreground mt-2">
              Envie mensagens em massa via WhatsApp de forma segura e eficiente
            </p>
          </div>
        </div>

        <LegalNotice />

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Carregar Contatos</h2>
          </div>
          <FileUpload onUpload={handleFileUpload} />
        </Card>

        {contacts.length > 0 && (
          <>
            <ContactsList
              contacts={contacts}
              onContactsUpdate={setContacts}
            />

            <Tabs value={mode} onValueChange={(v) => setMode(v as "manual" | "automatico")} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Modo Manual</TabsTrigger>
                <TabsTrigger value="automatico">Modo Automático</TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <ManualMode
                  contacts={contacts}
                  campanhaId={campanhaId}
                  onContactsUpdate={setContacts}
                />
              </TabsContent>

              <TabsContent value="automatico">
                <AutomaticMode
                  contacts={contacts}
                  campanhaId={campanhaId}
                  isAuthenticated={isAuthenticated}
                  onCheckAuth={checkAuth}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSender;
