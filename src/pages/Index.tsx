import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, User, Calendar, MapPin, LogIn } from "lucide-react";

interface Guest {
  nome_completo: string;
  idade: string;
  whatsapp: string;
}

const Index = () => {
  const [numGuests, setNumGuests] = useState<number>(1);
  const [guests, setGuests] = useState<Guest[]>([{ nome_completo: "", idade: "", whatsapp: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNumGuestsChange = (value: string) => {
    const num = parseInt(value);
    setNumGuests(num);
    setGuests((currentGuests) => {
      const newGuests = [...currentGuests];
      while (newGuests.length < num) {
        newGuests.push({ nome_completo: "", idade: "", whatsapp: "" });
      }
      return newGuests.slice(0, num);
    });
  };

  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    const newGuests = [...guests];
    newGuests[index][field] = value;
    setGuests(newGuests);
  };

  const formatWhatsApp = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const isFormValid = () => {
    if (guests.length === 0) return false;
    return guests.every(
      (guest) =>
        guest.nome_completo.trim().length >= 3 &&
        guest.idade.trim() !== "" &&
        parseInt(guest.idade) > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Por favor, preencha o Nome e a Idade de todos os convidados.");
      return;
    }

    setIsSubmitting(true);

    try {
      const guestsData = guests.map((guest) => ({
        nome_completo: guest.nome_completo.trim(),
        idade: parseInt(guest.idade),
        whatsapp: guest.whatsapp.trim() || null,
      }));

      const { error } = await supabase.from("convidados").insert(guestsData);
      if (error) throw error;

      setIsSuccess(true);
      toast.success("Presença confirmada com sucesso! Aguardamos você no evento.");

    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
      toast.error("Erro ao confirmar presença. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl bg-brand-card">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 space-y-6">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary">
                Presença Confirmada!
              </h2>
              <p className="text-lg text-brand-secondary">
                Obrigado por confirmar. Aguardamos você no evento!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <Link to="/auth" aria-label="Painel do Administrador">
        <Button 
          variant="ghost" 
          className="absolute top-4 right-4 z-20 gap-2 text-white bg-black/20 backdrop-blur-sm hover:bg-white/20 hover:text-white"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
        </Button>
      </Link>

      <div className="container max-w-3xl mx-auto sm:py-8 md:py-12 px-0 sm:px-4">
        
        <header
          className="relative w-full h-64 md:h-80 bg-cover bg-center sm:rounded-t-lg"
          style={{ backgroundImage: "url('https://podtocantins.com/wp-content/uploads/2025/10/Post-800-x-700-px.png')" }}
          aria-label="Banner do Evento"
        />

        <Card className="shadow-2xl bg-brand-card border-none rounded-none sm:rounded-b-lg">
          
          {/* CORREÇÃO: Endereço removido, deixando apenas a data */}
          <section className="text-center py-6 border-b border-brand-accent/50">
            <div className="flex justify-center items-center gap-2 text-brand-secondary">
              <Calendar className="h-4 w-4" />
              <span className="text-xs md:text-sm">25 e 26 de Outubro</span>
            </div>
          </section>

          <CardHeader className="text-center space-y-2 pt-6">
            <CardTitle className="text-3xl md:text-4xl text-brand-primary">
              Confirme sua Presença
            </CardTitle>
            <CardDescription className="text-base md:text-lg text-brand-secondary">
              Preencha os dados de todos os convidados que irão comparecer
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="num-guests" className="text-base font-semibold text-brand-secondary">
                  Quantas pessoas irão comparecer?
                </Label>
                <Select onValueChange={handleNumGuestsChange} value={numGuests.toString()}>
                  <SelectTrigger id="num-guests" className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "pessoa" : "pessoas"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6">
                {guests.map((guest, index) => (
                  <div key={index} className="border-t border-brand-accent/50 pt-6 space-y-4 animate-in fade-in-50 duration-500">
                    <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Convidado {index + 1}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor={`nome-${index}`}>Nome Completo *</Label>
                        <Input id={`nome-${index}`} value={guest.nome_completo} onChange={(e) => handleGuestChange(index, "nome_completo", e.target.value)} className="h-11" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`idade-${index}`}>Idade *</Label>
                        <Input id={`idade-${index}`} type="number" value={guest.idade} onChange={(e) => handleGuestChange(index, "idade", e.target.value)} className="h-11" min="1" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`whatsapp-${index}`}>WhatsApp (opcional)</Label>
                      <Input id={`whatsapp-${index}`} type="tel" placeholder="(00) 00000-0000" value={guest.whatsapp} onChange={(e) => handleGuestChange(index, "whatsapp", formatWhatsApp(e.target.value))} className="h-11" />
                    </div>
                  </div>
                ))}
              </div>

              {numGuests > 0 && (
                <Button type="submit" disabled={!isFormValid() || isSubmitting} className="w-full h-14 text-lg font-semibold bg-brand-primary text-white hover:bg-brand-primary/90" size="lg">
                  {isSubmitting ? "Enviando..." : "Enviar Confirmação"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
      
      <footer className="text-center py-8 px-4">
        <p className="text-sm text-brand-secondary/80">
          Sistema desenvolvido por Madala
        </p>
      </footer>
    </div>
  );
};

export default Index;
