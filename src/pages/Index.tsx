import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, User, Calendar, MapPin } from "lucide-react";
import eventBanner from "@/assets/event-banner.jpg";

interface Guest {
  nome_completo: string;
  idade: string;
  whatsapp: string;
}

const Index = () => {
  const [numGuests, setNumGuests] = useState<number>(0);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNumGuestsChange = (value: string) => {
    const num = parseInt(value);
    setNumGuests(num);
    setGuests(
      Array.from({ length: num }, () => ({
        nome_completo: "",
        idade: "",
        whatsapp: "",
      }))
    );
  };

  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    const newGuests = [...guests];
    newGuests[index][field] = value;
    setGuests(newGuests);
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const isFormValid = () => {
    return guests.every(
      (guest) =>
        guest.nome_completo.trim() !== "" &&
        guest.idade !== "" &&
        parseInt(guest.idade) > 0 &&
        guest.whatsapp.replace(/\D/g, "").length === 11
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error("Por favor, preencha todos os campos corretamente");
      return;
    }

    setIsSubmitting(true);

    try {
      const guestsData = guests.map((guest) => ({
        nome_completo: guest.nome_completo.trim(),
        idade: parseInt(guest.idade),
        whatsapp: guest.whatsapp,
      }));

      const { error } = await supabase.from("convidados").insert(guestsData);

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Presença confirmada com sucesso! Aguardamos você no evento.");
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setNumGuests(0);
        setGuests([]);
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
      toast.error("Erro ao confirmar presença. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Banner do Evento */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        <img
          src={eventBanner}
          alt="Banner do Evento"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground drop-shadow-lg">
            Confirmação de Presença
          </h1>
          <div className="flex flex-wrap gap-4 mt-4 text-primary-foreground/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm md:text-base">Em Breve</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-sm md:text-base">Local a Confirmar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {!isSuccess ? (
          <Card className="shadow-elegant bg-gradient-card border-none">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl md:text-4xl bg-gradient-primary bg-clip-text text-transparent">
                Confirme sua Presença
              </CardTitle>
              <CardDescription className="text-base md:text-lg">
                Preencha os dados de todos os convidados que irão comparecer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Seleção de Número de Convidados */}
              <div className="space-y-2">
                <Label htmlFor="num-guests" className="text-lg font-semibold">
                  Quantas pessoas irão comparecer?
                </Label>
                <Select onValueChange={handleNumGuestsChange}>
                  <SelectTrigger id="num-guests" className="h-12 text-lg">
                    <SelectValue placeholder="Selecione o número de convidados" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "pessoa" : "pessoas"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Formulários Dinâmicos */}
              {numGuests > 0 && (
                <div className="space-y-6">
                  {guests.map((guest, index) => (
                    <Card
                      key={index}
                      className="p-6 space-y-4 shadow-card hover:shadow-glow transition-all duration-300 border-primary/20"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold text-primary">
                          Convidado {index + 1}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`nome-${index}`}>Nome Completo *</Label>
                        <Input
                          id={`nome-${index}`}
                          placeholder="Digite o nome completo"
                          value={guest.nome_completo}
                          onChange={(e) =>
                            handleGuestChange(index, "nome_completo", e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`idade-${index}`}>Idade *</Label>
                        <Input
                          id={`idade-${index}`}
                          type="number"
                          placeholder="Digite a idade"
                          value={guest.idade}
                          onChange={(e) =>
                            handleGuestChange(index, "idade", e.target.value)
                          }
                          className="h-11"
                          min="1"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`whatsapp-${index}`}>WhatsApp *</Label>
                        <Input
                          id={`whatsapp-${index}`}
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={guest.whatsapp}
                          onChange={(e) =>
                            handleGuestChange(
                              index,
                              "whatsapp",
                              formatWhatsApp(e.target.value)
                            )
                          }
                          className="h-11"
                          required
                        />
                      </div>
                    </Card>
                  ))}

                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting}
                    className="w-full h-14 text-lg font-semibold shadow-glow hover:shadow-elegant transition-all duration-300"
                    size="lg"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Confirmação"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-elegant bg-gradient-card border-none">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="h-24 w-24 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="h-12 w-12 text-success" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Presença Confirmada!
                </h2>
                <p className="text-lg text-muted-foreground">
                  Aguardamos você no evento. Até breve!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
