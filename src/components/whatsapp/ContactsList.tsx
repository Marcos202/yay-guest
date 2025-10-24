import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users } from "lucide-react";
import { Contact } from "@/pages/WhatsAppSender";

interface ContactsListProps {
  contacts: Contact[];
  onContactsUpdate: (contacts: Contact[]) => void;
}

const ContactsList = ({ contacts, onContactsUpdate }: ContactsListProps) => {
  const toggleSelectAll = () => {
    const allSelected = contacts.every((c) => c.selected);
    onContactsUpdate(
      contacts.map((c) => ({ ...c, selected: !allSelected }))
    );
  };

  const toggleContact = (id: string) => {
    onContactsUpdate(
      contacts.map((c) =>
        c.id === id ? { ...c, selected: !c.selected } : c
      )
    );
  };

  const selectedCount = contacts.filter((c) => c.selected).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">
            Contatos Carregados ({contacts.length})
          </h2>
        </div>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selecionados
          </Badge>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 pb-3 border-b">
        <Checkbox
          id="select-all"
          checked={contacts.every((c) => c.selected)}
          onCheckedChange={toggleSelectAll}
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium cursor-pointer"
        >
          Selecionar todos
        </label>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              checked={contact.selected}
              onCheckedChange={() => toggleContact(contact.id)}
            />
            
            <MessageCircle className="h-5 w-5 text-primary shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{contact.nome}</p>
              <p className="text-sm text-muted-foreground">{contact.telefone}</p>
              {contact.observacao && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {contact.observacao}
                </p>
              )}
            </div>

            {contact.status && (
              <Badge
                variant={
                  contact.status === "enviado"
                    ? "default"
                    : contact.status === "falhou"
                    ? "destructive"
                    : "secondary"
                }
              >
                {contact.status}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ContactsList;
