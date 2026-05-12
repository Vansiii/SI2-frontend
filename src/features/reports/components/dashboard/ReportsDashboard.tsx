/**
 * Dashboard de reportes con acceso rápido a los 10 principales
 */
import { useState } from 'react';
import { BarChart3, List } from 'lucide-react';
import { QuickReportCard } from './QuickReportCard';
import type { ReportScope, ReportCategory } from '../../types';
import styles from './ReportsDashboard.module.css';

interface ReportsDashboardProps {
  scope: ReportScope;
  onSelectReport: (category: ReportCategory, reportType: string) => void;
  onViewCatalog: () => void;
}

// Los 10 reportes principales más importantes del sistema
const FEATURED_REPORTS = [
  // TENANT - Créditos (3)
  {
    reportType: 'loans_by_status',
    category: 'CREDITS' as ReportCategory,
    name: 'Créditos por Estado',
    description: 'Distribución de créditos según su estado actual',
    scope: 'TENANT' as ReportScope,
  },
  {
    reportType: 'loans_by_product',
    category: 'CREDITS' as ReportCategory,
    name: 'Créditos por Producto',
    description: 'Análisis de créditos agrupados por tipo de producto',
    scope: 'TENANT' as ReportScope,
  },
  {
    reportType: 'active_loans',
    category: 'CREDITS' as ReportCategory,
    name: 'Créditos Activos',
    description: 'Listado de todos los créditos actualmente vigentes',
    scope: 'TENANT' as ReportScope,
  },
  
  // TENANT - Productos (1)
  {
    reportType: 'credit_products_catalog',
    category: 'PRODUCTS' as ReportCategory,
    name: 'Catálogo de Productos',
    description: 'Lista de productos crediticios con parámetros y configuración',
    scope: 'TENANT' as ReportScope,
  },
  
  // TENANT - Sucursales (1)
  {
    reportType: 'branches_performance',
    category: 'BRANCHES' as ReportCategory,
    name: 'Rendimiento de Sucursales',
    description: 'Análisis comparativo del rendimiento de sucursales',
    scope: 'TENANT' as ReportScope,
  },
  
  // TENANT - Clientes (1)
  {
    reportType: 'customers_with_active_loans',
    category: 'CUSTOMERS' as ReportCategory,
    name: 'Clientes con Créditos Activos',
    description: 'Clientes que actualmente tienen créditos vigentes',
    scope: 'TENANT' as ReportScope,
  },
  
  // TENANT - Auditoría (1)
  {
    reportType: 'audit_logs_by_action',
    category: 'AUDIT' as ReportCategory,
    name: 'Logs de Auditoría',
    description: 'Registro de acciones del sistema para auditoría',
    scope: 'TENANT' as ReportScope,
  },
  
  // TENANT - Documentos (1)
  {
    reportType: 'applications_with_pending_documents',
    category: 'DOCUMENTS' as ReportCategory,
    name: 'Documentos Pendientes',
    description: 'Solicitudes con documentación incompleta',
    scope: 'TENANT' as ReportScope,
  },
  
  // SAAS - Suscripciones (1)
  {
    reportType: 'subscriptions_revenue_analysis',
    category: 'SUBSCRIPTIONS' as ReportCategory,
    name: 'Análisis de Ingresos',
    description: 'Análisis financiero de suscripciones y revenue',
    scope: 'SAAS' as ReportScope,
  },
  
  // SAAS - Usuarios (1)
  {
    reportType: 'users_by_role',
    category: 'USERS' as ReportCategory,
    name: 'Usuarios por Rol',
    description: 'Distribución de usuarios según roles asignados',
    scope: 'SAAS' as ReportScope,
  },
];

export function ReportsDashboard({
  scope,
  onSelectReport,
  onViewCatalog
}: ReportsDashboardProps) {
  // Filtrar reportes según el scope actual
  const filteredReports = FEATURED_REPORTS.filter(report => report.scope === scope);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <BarChart3 className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>Reportes Principales</h2>
            <p className={styles.subtitle}>
              Acceso rápido a los reportes más utilizados
            </p>
          </div>
        </div>
        <button onClick={onViewCatalog} className={styles.catalogButton}>
          <List className={styles.buttonIcon} />
          Ver Catálogo Completo
        </button>
      </div>

      {/* Grid de reportes */}
      <div className={styles.grid}>
        {filteredReports.map((report) => (
          <QuickReportCard
            key={report.reportType}
            reportType={report.reportType}
            name={report.name}
            description={report.description}
            category={report.category}
            onClick={() => onSelectReport(report.category, report.reportType)}
          />
        ))}
      </div>

      {/* Mensaje si no hay reportes */}
      {filteredReports.length === 0 && (
        <div className={styles.empty}>
          <p>No hay reportes principales disponibles para este scope</p>
          <button onClick={onViewCatalog} className={styles.emptyButton}>
            Ver Catálogo Completo
          </button>
        </div>
      )}
    </div>
  );
}
