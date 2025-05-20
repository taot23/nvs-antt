import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RecentExecution {
  id: number;
  report_id: number;
  user_id: number;
  created_at: string;
  status: string;
  execution_time: number;
  report_name: string;
  username: string;
}

interface RecentExecutionsProps {
  onViewExecution: (executionId: number) => void;
  limit?: number;
}

export function RecentExecutions({
  onViewExecution,
  limit = 5
}: RecentExecutionsProps) {
  const { data, isLoading, error } = useQuery<RecentExecution[]>({
    queryKey: ["/api/recent-executions", { limit }],
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-center text-destructive p-4">
          <p>Erro ao carregar execuções recentes.</p>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground p-4">
          <p>Nenhuma execução de relatório recente encontrada.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-background border-b">
        <h3 className="text-lg font-semibold">Execuções Recentes</h3>
        <p className="text-sm text-muted-foreground">
          Últimas execuções de relatórios no sistema
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Relatório</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell className="font-medium">
                  {execution.report_name}
                </TableCell>
                <TableCell>{execution.username}</TableCell>
                <TableCell>
                  {format(new Date(execution.created_at), "dd/MM/yy HH:mm", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={execution.status === "success" ? "default" : "destructive"}
                  >
                    {execution.status === "success" ? "Sucesso" : "Erro"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {execution.execution_time ? 
                    `${execution.execution_time.toFixed(2)}s` : 
                    "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewExecution(execution.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}