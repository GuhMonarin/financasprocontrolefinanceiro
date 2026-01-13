import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { MonthData, generateExportData, ExportReportData } from '@/hooks/useTransactionsMultiMonth';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: MonthData[];
  disabled?: boolean;
}

export const ExportButton = memo(function ExportButton({ data, disabled }: ExportButtonProps) {
  const handleExport = useCallback(() => {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const exportData = generateExportData(data);
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado com sucesso!');
  }, [data]);

  const handleExportCSV = useCallback(() => {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const exportData = generateExportData(data);
    
    // Build CSV content
    const lines: string[] = [];
    
    // Header section
    lines.push('Relatório Financeiro');
    lines.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
    lines.push('');
    
    // Summary section
    lines.push('RESUMO');
    lines.push(`Total Receitas,${exportData.summary.totalIncome.toFixed(2)}`);
    lines.push(`Total Despesas,${exportData.summary.totalExpense.toFixed(2)}`);
    lines.push(`Saldo Líquido,${exportData.summary.netBalance.toFixed(2)}`);
    lines.push(`Média Mensal Receitas,${exportData.summary.averageMonthlyIncome.toFixed(2)}`);
    lines.push(`Média Mensal Despesas,${exportData.summary.averageMonthlyExpense.toFixed(2)}`);
    lines.push('');
    
    // Monthly data
    lines.push('DADOS MENSAIS');
    lines.push('Mês,Receitas,Despesas,Saldo');
    exportData.monthlyData.forEach(m => {
      lines.push(`${m.month},${m.income.toFixed(2)},${m.expense.toFixed(2)},${m.balance.toFixed(2)}`);
    });
    lines.push('');
    
    // Category totals
    lines.push('DESPESAS POR CATEGORIA');
    lines.push('Categoria,Total,Média Mensal');
    exportData.categoryTotals.expense.forEach(c => {
      lines.push(`${c.name},${c.total.toFixed(2)},${c.average.toFixed(2)}`);
    });
    lines.push('');
    
    lines.push('RECEITAS POR CATEGORIA');
    lines.push('Categoria,Total,Média Mensal');
    exportData.categoryTotals.income.forEach(c => {
      lines.push(`${c.name},${c.total.toFixed(2)},${c.average.toFixed(2)}`);
    });

    const csvContent = lines.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Relatório CSV exportado com sucesso!');
  }, [data]);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={disabled || data.length === 0}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">CSV</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={disabled || data.length === 0}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">JSON</span>
      </Button>
    </div>
  );
});
