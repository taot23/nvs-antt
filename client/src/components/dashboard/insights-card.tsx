import { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle,
  Info,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface Insight {
  id: string | number;
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral" | "warning" | "info";
  trend?: {
    direction: "up" | "down" | "stable";
    value?: number;
  };
}

interface InsightsCardProps {
  title: string;
  description?: string;
  insights: Insight[];
  className?: string;
  isLoading?: boolean;
}

export function InsightsCard({
  title,
  description,
  insights,
  className,
  isLoading = false,
}: InsightsCardProps) {
  const getInsightIcon = (type: Insight["type"], trend?: Insight["trend"]): ReactNode => {
    // Se tiver tendência, mostrar ícone de tendência
    if (trend) {
      if (trend.direction === "up") {
        return <TrendingUp className="h-4 w-4" />;
      }
      if (trend.direction === "down") {
        return <TrendingDown className="h-4 w-4" />;
      }
      return <Minus className="h-4 w-4" />;
    }

    // Caso contrário, mostrar ícone baseado no tipo
    switch (type) {
      case "positive":
        return <CheckCircle className="h-4 w-4" />;
      case "negative":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getInsightBgColor = (type: Insight["type"]): string => {
    switch (type) {
      case "positive":
        return "bg-green-50 text-green-700 border-green-100";
      case "negative":
        return "bg-red-50 text-red-700 border-red-100";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "neutral":
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          // Estado de carregamento
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex items-start gap-3 p-3 border rounded-md"
            >
              <Skeleton className="h-4 w-4 mt-1" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))
        ) : insights.length === 0 ? (
          // Estado vazio
          <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
            <div>
              <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>Nenhum insight disponível para o período selecionado.</p>
            </div>
          </div>
        ) : (
          // Lista de insights
          insights.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "flex items-start gap-3 p-3 border rounded-md",
                getInsightBgColor(insight.type)
              )}
            >
              <div className="mt-1">{getInsightIcon(insight.type, insight.trend)}</div>
              <div>
                <h4 className="text-sm font-medium mb-1">{insight.title}</h4>
                <p className="text-xs">{insight.description}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}