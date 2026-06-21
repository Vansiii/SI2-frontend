import { 
  CreditCard, Fingerprint, Mail, Database, BrainCircuit, 
  Building, Bell, LineChart, Calculator, PenTool, Landmark, Settings,
  CheckCircle2, XCircle, AlertCircle, Activity
} from 'lucide-react';
import type { ExternalIntegrationList } from '../types';

interface IntegrationCardProps {
  integration: ExternalIntegrationList;
  onView: (id: number) => void;
  onTest?: (id: number) => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onView,
  onTest,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      case 'ERROR':
        return { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: <XCircle className="w-4 h-4 mr-1" /> };
      case 'TESTING':
        return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertCircle className="w-4 h-4 mr-1" /> };
      default:
        return { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: <Activity className="w-4 h-4 mr-1" /> };
    }
  };

  const getTypeIcon = (type: string) => {
    const iconClass = "w-6 h-6 text-slate-600";
    switch (type) {
      case 'STRIPE':
      case 'PAYMENT_GATEWAY': return <CreditCard className={iconClass} />;
      case 'DIDIT': return <Fingerprint className={iconClass} />;
      case 'BREVO': return <Mail className={iconClass} />;
      case 'SUPABASE': return <Database className={iconClass} />;
      case 'GROQ': return <BrainCircuit className={iconClass} />;
      case 'CREDIT_BUREAU': return <Building className={iconClass} />;
      case 'NOTIFICATION': return <Bell className={iconClass} />;
      case 'BI_ANALYTICS': return <LineChart className={iconClass} />;
      case 'ACCOUNTING': return <Calculator className={iconClass} />;
      case 'DIGITAL_SIGNATURE': return <PenTool className={iconClass} />;
      case 'GOVERNMENT_API': return <Landmark className={iconClass} />;
      default: return <Settings className={iconClass} />;
    }
  };

  const statusConfig = getStatusConfig(integration.status);

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            {getTypeIcon(integration.integration_type)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{integration.name}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{integration.integration_type_display}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md border ${statusConfig.color}`}>
          {statusConfig.icon}
          {integration.status_display}
        </span>
        {integration.is_default && (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            Por defecto
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg mb-6 flex-grow">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Éxitos</span>
          <span className="text-xl font-bold text-emerald-600">{integration.success_count}</span>
          {integration.last_success_at && (
            <span className="text-[10px] text-slate-400 mt-1 truncate" title={new Date(integration.last_success_at).toLocaleString()}>
              Último: {new Date(integration.last_success_at).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Errores</span>
          <span className="text-xl font-bold text-rose-600">{integration.error_count}</span>
          {integration.last_error_at && (
            <span className="text-[10px] text-slate-400 mt-1 truncate" title={new Date(integration.last_error_at).toLocaleString()}>
              Último: {new Date(integration.last_error_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={() => onView(integration.id)}
          className="flex-1 min-w-[100px] px-3 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors focus:ring-2 focus:ring-slate-200 outline-none"
        >
          Ver detalles
        </button>
        {onTest && (
          <button
            onClick={() => onTest(integration.id)}
            className="flex-1 min-w-[100px] px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors focus:ring-2 focus:ring-blue-200 outline-none"
          >
            Probar API
          </button>
        )}
      </div>
    </div>
  );
};
