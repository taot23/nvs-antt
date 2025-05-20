import * as React from "react";
import { format, subDays } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
  className?: string;
  onChange: (dateRange: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  onChange,
}: DateRangePickerProps) {
  const today = new Date();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(today, 30),
    to: today,
  });
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Predefined ranges
  const predefinedRanges = {
    today: {
      from: today,
      to: today,
    },
    yesterday: {
      from: subDays(today, 1),
      to: subDays(today, 1),
    },
    last7Days: {
      from: subDays(today, 6),
      to: today,
    },
    last30Days: {
      from: subDays(today, 29),
      to: today,
    },
    last90Days: {
      from: subDays(today, 89),
      to: today,
    },
  };

  const handleChange = (range: DateRange | undefined) => {
    setDate(range);
    onChange(range);
    if (range?.from && range?.to) {
      setIsPopoverOpen(false);
    }
  };

  const handlePredefinedSelect = (value: string) => {
    const rangeKey = value as keyof typeof predefinedRanges;
    if (predefinedRanges[rangeKey]) {
      const newRange = predefinedRanges[rangeKey];
      setDate(newRange);
      onChange(newRange);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um intervalo</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row gap-2 p-3 border-b">
            <Select
              onValueChange={handlePredefinedSelect}
              defaultValue="last30Days"
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="last7Days">Últimos 7 dias</SelectItem>
                <SelectItem value="last30Days">Últimos 30 dias</SelectItem>
                <SelectItem value="last90Days">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleChange}
            locale={ptBR}
            numberOfMonths={2}
            classNames={{
              caption_label: "text-sm font-medium",
              table: "w-full border-collapse space-y-1",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
              cell: cn(
                "text-center text-sm p-0 relative focus-within:relative focus-within:z-20"
              ),
              day: cn(
                "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md"
              ),
              day_selected: "bg-primary text-primary-foreground hover:bg-primary",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
          <div className="flex items-center justify-between p-3 border-t">
            <Button
              variant="ghost"
              onClick={() => setIsPopoverOpen(false)}
              className="text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setIsPopoverOpen(false)}
              className="text-sm"
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}