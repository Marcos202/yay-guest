import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface FileUploadProps {
  onUpload: (contacts: any[]) => void;
}

const FileUpload = ({ onUpload }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatePhone = (phone: string): string | null => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10 || cleaned.length > 15) {
      return null;
    }
    return cleaned;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(fileExtension || "")) {
      toast.error("Formato inválido. Use .xlsx, .xls ou .csv");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const contacts: any[] = [];
      const errors: string[] = [];

      jsonData.forEach((row: any, index: number) => {
        const rowNumber = index + 2;
        const nome = row.nome || row.Nome || row.NOME;
        const telefone = row.telefone || row.Telefone || row.TELEFONE || row.whatsapp || row.WhatsApp;
        const observacao = row.observacao || row.Observacao || row.obs || "";

        if (!nome) {
          errors.push(`Linha ${rowNumber}: nome ausente`);
          return;
        }

        if (!telefone) {
          errors.push(`Linha ${rowNumber}: telefone ausente`);
          return;
        }

        const validPhone = validatePhone(String(telefone));
        if (!validPhone) {
          errors.push(`Linha ${rowNumber}: telefone inválido (${telefone})`);
          return;
        }

        contacts.push({
          id: `temp-${index}`,
          nome: String(nome),
          telefone: validPhone,
          observacao: String(observacao),
        });
      });

      if (errors.length > 0) {
        toast.error(`Erros encontrados:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... e mais ${errors.length - 5}` : ""}`);
      }

      if (contacts.length === 0) {
        toast.error("Nenhum contato válido encontrado no arquivo");
        return;
      }

      onUpload(contacts);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast.error("Erro ao processar arquivo. Verifique o formato.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Formatos aceitos: .xlsx, .xls, .csv</span>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Colunas obrigatórias:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>nome</strong>: Nome completo do contato</li>
            <li>• <strong>telefone</strong>: Número com código do país (ex: 5511998877766)</li>
            <li>• <strong>observacao</strong> (opcional): Informações adicionais</li>
          </ul>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          size="lg"
        >
          <Upload className="mr-2 h-5 w-5" />
          Selecionar Arquivo
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
