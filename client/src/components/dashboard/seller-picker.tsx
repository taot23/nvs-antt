import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SalesBySeller } from "@/hooks/use-dashboard-data";

interface SellerPickerProps {
  className?: string;
  sellers?: SalesBySeller[];
  isLoading?: boolean;
  onChange: (sellerId: number | undefined) => void;
  selectedSellerId?: number;
}

export function SellerPicker({
  className,
  sellers = [],
  isLoading = false,
  onChange,
  selectedSellerId,
}: SellerPickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Verificar se sellers está definido e contém vendedores
  const hasSellers = Array.isArray(sellers) && sellers.length > 0;

  // Encontrar o nome do vendedor selecionado
  const selectedSellerName = React.useMemo(() => {
    if (!selectedSellerId || !hasSellers) return "Todos os vendedores";
    const seller = sellers.find(s => s.sellerId === selectedSellerId);
    return seller ? seller.sellerName : "Todos os vendedores";
  }, [selectedSellerId, sellers, hasSellers]);

  const handleSellerChange = (value: string) => {
    if (value === "all") {
      onChange(undefined);
    } else {
      onChange(Number(value));
    }
    setIsPopoverOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="seller"
            variant={"outline"}
            className={cn(
              "w-[250px] justify-start text-left font-normal",
              !selectedSellerId && "text-muted-foreground"
            )}
            disabled={isLoading || !hasSellers}
          >
            <Users className="mr-2 h-4 w-4" />
            {isLoading ? "Carregando..." : selectedSellerName}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Select
            onValueChange={handleSellerChange}
            value={selectedSellerId ? String(selectedSellerId) : "all"}
            disabled={isLoading || !hasSellers}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {hasSellers && 
                sellers.map((seller) => (
                  <SelectItem 
                    key={seller.sellerId} 
                    value={String(seller.sellerId)}
                  >
                    {seller.sellerName}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </PopoverContent>
      </Popover>
    </div>
  );
}