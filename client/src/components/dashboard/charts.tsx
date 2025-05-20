import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { ptBR } from "date-fns/locale";

interface ChartCardProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, className, children }: ChartCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

interface SalesAreaChartProps {
  data: Array<{ date: string; value: number }>;
  isLoading?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

export function SalesAreaChart({
  data,
  isLoading = false,
  className,
  title = "Evolução de Vendas",
  description = "Valor total de vendas por data",
}: SalesAreaChartProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <ChartCard
      title={title}
      description={description}
      className={className}
    >
      {isLoading ? (
        <div className="w-full h-[300px] flex items-center justify-center p-6">
          <Skeleton className="h-full w-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível para o período selecionado.
        </div>
      ) : (
        <div className="p-6 pt-0 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Valor"]}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f680"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

interface PerformanceBarChartProps {
  data: Array<{ name: string; value: number }>;
  isLoading?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

export function PerformanceBarChart({
  data,
  isLoading = false,
  className,
  title = "Desempenho dos Vendedores",
  description = "Valor total de vendas por vendedor",
}: PerformanceBarChartProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <ChartCard
      title={title}
      description={description}
      className={className}
    >
      {isLoading ? (
        <div className="w-full h-[300px] flex items-center justify-center p-6">
          <Skeleton className="h-full w-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível para o período selecionado.
        </div>
      ) : (
        <div className="p-6 pt-0 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Valor"]}
                labelFormatter={(label) => `Vendedor: ${label}`}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

interface StatusPieChartProps {
  data: Array<{ name: string; value: number }>;
  isLoading?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

export function StatusPieChart({
  data,
  isLoading = false,
  className,
  title = "Status das Vendas",
  description = "Distribuição de vendas por status",
}: StatusPieChartProps) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <ChartCard
      title={title}
      description={description}
      className={className}
    >
      {isLoading ? (
        <div className="w-full h-[300px] flex items-center justify-center p-6">
          <Skeleton className="h-full w-full rounded-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível para o período selecionado.
        </div>
      ) : (
        <div className="p-6 pt-0 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} vendas`, "Quantidade"]} />
              <Legend verticalAlign="bottom" align="center" layout="horizontal" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}