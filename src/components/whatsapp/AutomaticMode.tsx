import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Zap } from "lucide-react";
import { Contact } from "@/pages/WhatsAppSender";

interface AutomaticModeProps {
  contacts: Contact[];
  campanhaId: string | null;
  isAuthenticated: boolean;
  onCheckAuth: () => Promise<boolean>;
}

const AutomaticMode = ({
  contacts,
  campanhaId,
  isAuthenticated,
  onCheckAuth,
}: AutomaticModeProps) => {
  return (
    <Card className="p-6 mt-4">
      <div className="flex items-start gap-3 mb-4">
        <Zap className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-semibold mb-2">Modo Automático</h3>
          <p className="text-sm text-muted-foreground">
            Disparo automático de mensagens via WhatsApp Web
          </p>
        </div>
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-2">Funcionalidade em Desenvolvimento</p>
          <p className="text-sm">
            O modo automático com login via QR code e disparos programados está em
            construção. Esta funcionalidade requer:
          </p>
          <ul className="text-sm mt-2 space-y-1 ml-4">
            <li>• Integração com WhatsApp Web via biblioteca whatsapp-web.js</li>
            <li>• Backend para gerenciar sessões e filas de envio</li>
            <li>• Sistema de agendamento e controle de intervalos</li>
            <li>• Logs detalhados de cada envio</li>
          </ul>
          <p className="text-sm mt-3 text-muted-foreground">
            Por enquanto, utilize o <strong>Modo Manual</strong> para enviar
            mensagens individuais ou em lote através do WhatsApp Web.
          </p>
        </AlertDescription>
      </Alert>

      <div className="mt-6 space-y-3">
        <div className="p-4 border rounded-lg bg-card">
          <h4 className="font-medium text-sm mb-2">Recursos Planejados:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Login via QR Code do WhatsApp Web</li>
            <li>✓ Templates com placeholders dinâmicos</li>
            <li>✓ Controle de intervalo entre mensagens</li>
            <li>✓ Taxa máxima de envios por minuto</li>
            <li>✓ Agendamento de campanhas</li>
            <li>✓ Logs completos de status de envio</li>
            <li>✓ Proteção contra bloqueios</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default AutomaticMode;
