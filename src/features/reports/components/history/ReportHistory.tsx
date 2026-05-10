/**
 * Componente principal de historial de reportes
 */
import { useState } from 'react';
import type { GeneratedReport, ReportStatus, ReportScope } from '../../types';
import { ReportHistoryFilters } from './ReportHistoryFilters';
import { ReportHistoryTable } from './ReportHistoryTable';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ReportHistoryProps {
  reports: GeneratedReport[];
  loading: boolean;
  onDownload: (report: GeneratedReport) => void;
  onViewDetails: (report: GeneratedReport) => void;
}

export function ReportHistory({ reports = [], loading, onDownload, onViewDetails }: ReportHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [scopeFilter, setScopeFilter] = useState<ReportScope | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Obtener categorías únicas
  const categories = Array.from(new Set(reports.map((r) => r.category))).sort();

  // Filtrar reportes
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.report_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
    const matchesScope = scopeFilter === 'ALL' || report.scope === scopeFilter;
    const matchesCategory = !categoryFilter || report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesScope && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <ReportHistoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        scopeFilter={scopeFilter}
        onScopeChange={setScopeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      {/* Contador de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{filteredReports.length}</span> de{' '}
          <span className="font-medium">{reports.length}</span> reportes
        </p>
      </div>

      {/* Tabla */}
      <ReportHistoryTable
        reports={filteredReports}
        onDownload={onDownload}
        onViewDetails={onViewDetails}
      />
    </div>
  );
}
