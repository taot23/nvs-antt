import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRangePickerProps {
  value?: DateRange | undefined;
  onValueChange: (range: DateRange | undefined) => void;
  className?: string;
  align?: "center" | "start" | "end";
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onValueChange,
  className,
  align = "start",
  placeholder = "Selecione um período",
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(value.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="range"
            selected={value}
            onSelect={onValueChange}
            initialFocus
            locale={ptBR}
            numberOfMonths={2}
            className="rounded-md border"
          />
          <div className="flex justify-end gap-2 p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onValueChange(undefined)}
            >
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                // Fechar o popover (usando programaticamente)
                const button = document.getElementById("date");
                if (button) button.click();
              }}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}