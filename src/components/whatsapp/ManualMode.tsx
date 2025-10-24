import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, ExternalLink } from "lucide-react";
import { Contact } from "@/pages/WhatsAppSender";
import { supabase } from "@/integrations/supabase/client";

interface ManualModeProps {
  contacts: Contact[];
  campanhaId: string | null;
  onContactsUpdate: (contacts: Contact[]) => void;
}

const ManualMode = ({ contacts, campanhaId, onContactsUpdate }: ManualModeProps) => {
  const [message, setMessage] = useState("Olá {{nome}}, tudo bem?");

  const replaceVariables = (template: string, contact: Contact): string => {
    return template
      .replace(/\{\{nome\}\}/g, contact.nome)
      .replace(/\{\{observacao\}\}/g, contact.observacao || "");
  };

  const sendSingle = async (contact: Contact) => {
    const personalizedMessage = replaceVariables(message, contact);
    const encodedMessage = encodeURIComponent(personalizedMessage);
    const url = `https://wa.me/${contact.telefone}?text=${encodedMessage}`;
    
    window.open(url, "_blank");

    if (campanhaId) {
      await supabase.from("envios_whatsapp").insert({
        campanha_id: campanhaId,
        contato_id: contact.id,
        status: "enviado",
        mensagem_enviada: personalizedMessage,
      });
    }

    onContactsUpdate(
      contacts.map((c) =>
        c.id === contact.id ? { ...c, status: "enviado" } : c
      )
    );
  };

  const sendSelected = async () => {
    const selected = contacts.filter((c) => c.selected);
    if (selected.length === 0) {
      toast.error("Selecione ao menos um contato");
      return;
    }

    const confirmed = confirm(
      `Abrir ${selected.length} conversas no WhatsApp?`
    );
    if (!confirmed) return;

    for (const contact of selected) {
      await sendSingle(contact);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    toast.success(`${selected.length} conversas abertas!`);
  };

  return (
    <Card className="p-6 mt-4">
      <div className="space-y-6">
        <div>
          <Label htmlFor="message-template">Mensagem Padrão</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Use <code className="bg-muted px-1 rounded">{"{{nome}}"}</code> e{" "}
            <code className="bg-muted px-1 rounded">{"{{observacao}}"}</code> como
            placeholders
          </p>
          <Textarea
            id="message-template"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Preview da Mensagem:</p>
          <p className="text-sm whitespace-pre-wrap">
            {contacts.length > 0
              ? replaceVariables(message, contacts[0])
              : "Carregue contatos para ver o preview"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={sendSelected}
            className="flex-1"
            disabled={!contacts.some((c) => c.selected)}
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar para Selecionados
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (contacts.length > 0) sendSingle(contacts[0]);
            }}
            disabled={contacts.length === 0}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Testar com 1 Contato
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Modo manual: Abre uma nova aba do WhatsApp Web para cada contato
          selecionado
        </p>
      </div>
    </Card>
  );
};

export default ManualMode;
