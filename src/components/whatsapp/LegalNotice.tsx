import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const LegalNotice = () => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">
        Aviso Legal - Leia com Atenção
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p className="font-medium">
          O uso desta ferramenta é de sua inteira responsabilidade. Ao utilizá-la,
          você concorda com os seguintes termos:
        </p>
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li>
            <strong>Consentimento obrigatório:</strong> Você deve ter autorização
            prévia de todos os contatos para enviar mensagens.
          </li>
          <li>
            <strong>Anti-spam:</strong> O envio de mensagens não solicitadas pode
            resultar em bloqueio permanente da sua conta WhatsApp.
          </li>
          <li>
            <strong>Conformidade com leis:</strong> Respeite a LGPD e outras
            legislações de proteção de dados vigentes.
          </li>
          <li>
            <strong>Opt-out:</strong> Sempre forneça uma forma clara dos
            destinatários cancelarem o recebimento de mensagens.
          </li>
          <li>
            <strong>Limites do WhatsApp:</strong> Respeite os limites de envio
            para evitar suspensão da conta (recomendado: máximo 60 mensagens/hora).
          </li>
        </ul>
        <p className="text-sm mt-3 font-medium">
          Esta ferramenta é fornecida "como está" sem garantias. O desenvolvedor
          não se responsabiliza por bloqueios, penalidades ou consequências legais
          decorrentes do uso inadequado.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default LegalNotice;
