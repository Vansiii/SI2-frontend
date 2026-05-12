/**
 * Tarjeta de acceso rápido a reporte
 */
import { FileText, TrendingUp, Users, FileCheck, Shield, Building2, CreditCard, Package, BarChart3, AlertCircle, DollarSign } from 'lucide-react';
import styles from './QuickReportCard.module.css';

interface QuickReportCardProps {
  reportType: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  onClick: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  // Créditos
  'loans_by_status': <CreditCard className={styles.icon} />,
  'loans_by_product': <FileText className={styles.icon} />,
  'active_loans': <TrendingUp className={styles.icon} />,
  'loans_by_branch': <Building2 className={styles.icon} />,
  
  // Clientes
  'customers_registered': <Users className={styles.icon} />,
  'customers_with_active_loans': <Users className={styles.icon} />,
  
  // Documentos
  'applications_with_pending_documents': <FileCheck className={styles.icon} />,
  
  // Verificación
  'verifications_by_status': <Shield className={styles.icon} />,
  
  // Productos
  'credit_products_catalog': <Package className={styles.icon} />,
  
  // Sucursales
  'branches_performance': <Building2 className={styles.icon} />,
  'branches_by_city': <Building2 className={styles.icon} />,
  
  // Auditoría
  'audit_logs_by_action': <AlertCircle className={styles.icon} />,
  'security_events_by_type': <Shield className={styles.icon} />,
  
  // Suscripciones
  'subscriptions_revenue_analysis': <DollarSign className={styles.icon} />,
  'subscription_plans_comparison': <BarChart3 className={styles.icon} />,
  
  // Usuarios
  'users_by_role': <Users className={styles.icon} />,
  'tenants_by_plan': <Building2 className={styles.icon} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'CREDITS': '#0088FE',
  'CUSTOMERS': '#00C49F',
  'DOCUMENTS': '#FFBB28',
  'IDENTITY_VERIFICATION': '#FF8042',
  'PRODUCTS': '#8B5CF6',
  'BRANCHES': '#10B981',
  'AUDIT': '#EF4444',
  'TENANTS': '#8884D8',
  'USERS': '#82CA9D',
  'SUBSCRIPTIONS': '#F59E0B',
  'STORAGE': '#6366F1',
  'RULES': '#EC4899',
  'ANALYTICS': '#14B8A6',
};

export function QuickReportCard({
  reportType,
  name,
  description,
  category,
  onClick
}: QuickReportCardProps) {
  const icon = ICON_MAP[reportType] || <FileText className={styles.icon} />;
  const color = CATEGORY_COLORS[category] || '#666666';

  return (
    <button
      onClick={onClick}
      className={styles.card}
      style={{ '--category-color': color } as React.CSSProperties}
    >
      <div className={styles.iconContainer}>
        {icon}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.description}>{description}</p>
        <span className={styles.category}>{category}</span>
      </div>
    </button>
  );
}
