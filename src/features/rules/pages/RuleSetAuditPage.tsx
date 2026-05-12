import { useParams, useNavigate } from 'react-router-dom';
import { 
  History, 
  ArrowLeft, 
  User, 
  Monitor, 
  Globe, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  Layers
} from 'lucide-react';
import { useRuleSetAudit, useRuleSet } from '../hooks/useRuleSets';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent } from '../../../components/ui/Card';
import { LoadingState } from '../../../components/ui/LoadingState';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

/**
 * Página de Auditoría de Conjunto de Reglas
 * Muestra el historial detallado de cambios de una estrategia específica
 */
export function RuleSetAuditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ruleSetId = parseInt(id || '0');

  const { data: ruleSet, isLoading: isLoadingRuleSet } = useRuleSet(ruleSetId);
  const { data: audits, isLoading: isLoadingAudit, error } = useRuleSetAudit(ruleSetId);

  const isLoading = isLoadingRuleSet || isLoadingAudit;

  if (isLoading) return <LoadingState message="Cargando historial de auditoría..." />;

  if (error || !ruleSet) {
    return (
      <div className="p-12 text-center bg-rose-50 rounded-3xl border border-rose-100 mx-6 mt-6">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-rose-900">Error al cargar la auditoría</h2>
        <p className="text-rose-600 mt-2">No se pudo encontrar la información solicitada.</p>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/admin/credit-rules')} 
          className="mt-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Reglas
        </Button>
      </div>
    );
  }

  const getChangeTypeStyles = (type: string) => {
    switch (type) {
      case 'CREATED': return { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle className="h-4 w-4" /> };
      case 'ACTIVATED': return { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Shield className="h-4 w-4" /> };
      case 'ARCHIVED': return { bg: 'bg-slate-50', text: 'text-slate-700', icon: <Clock className="h-4 w-4" /> };
      default: return { bg: 'bg-amber-50', text: 'text-amber-700', icon: <History className="h-4 w-4" /> };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/admin/credit-rules')}
            className="flex items-center text-xs font-bold text-(--tenant-primary) hover:underline mb-2 uppercase tracking-widest"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Volver a Estrategias
          </button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-(--tenant-primary-soft) flex items-center justify-center text-(--tenant-primary)">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Auditoría de Estrategia</h1>
              <p className="text-slate-500 font-medium">
                Historial completo de <span className="text-slate-900 font-bold">{ruleSet.name}</span> (v{ruleSet.version})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <Badge variant={ruleSet.status === 'ACTIVE' ? 'success' : 'secondary'} className="px-4 py-1 rounded-xl font-black uppercase tracking-tighter">
            {ruleSet.status}
          </Badge>
          <div className="h-8 w-[1px] bg-slate-100 mx-1" />
          <div className="text-right pr-2">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Creado el</p>
            <p className="text-xs font-bold text-slate-700">
              {format(new Date(ruleSet.created_at), "d 'de' MMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Audit Timeline */}
      <div className="relative space-y-6">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-slate-100 hidden md:block" />

        {audits?.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
            <Layers className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No hay registros de auditoría para esta estrategia.</p>
          </div>
        ) : (
          audits?.map((audit: any, index: number) => {
            const styles = getChangeTypeStyles(audit.change_type);
            return (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-0 md:pl-16"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-[21px] top-6 h-3 w-3 rounded-full border-2 border-white shadow-sm ring-4 ring-slate-50 z-10 hidden md:block ${styles.bg.replace('50', '500')}`} />
                
                <Card className="border-slate-100 hover:border-(--tenant-primary-soft) transition-all duration-300 shadow-sm hover:shadow-xl">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Left: Change Info */}
                      <div className="flex-1 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${styles.bg} ${styles.text}`}>
                            {styles.icon}
                            {audit.change_type}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            {format(new Date(audit.created_at), "HH:mm:ss", { locale: es })}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {audit.field_name ? `Cambio en: ${audit.field_name}` : 'Acción General'}
                          </h4>
                          {audit.notes && (
                            <p className="text-slate-500 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              {audit.notes}
                            </p>
                          )}
                        </div>

                        {/* Values Comparison */}
                        {(audit.old_value || audit.new_value) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Anterior</span>
                              <div className="bg-rose-50 text-rose-700 px-3 py-2 rounded-xl text-xs font-mono break-all line-through opacity-70">
                                {JSON.stringify(audit.old_value)}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nuevo Valor</span>
                              <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-mono break-all font-bold">
                                {JSON.stringify(audit.new_value)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Metadata Sidebar */}
                      <div className="lg:w-72 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Realizado por</p>
                              <p className="text-xs font-bold text-slate-700 truncate max-w-[160px]">
                                {audit.changed_by_name || 'Sistema'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                              <Globe className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Dirección IP</p>
                              <p className="text-xs font-mono font-bold text-slate-700">
                                {audit.ip_address || 'Interna'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                              <Monitor className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Dispositivo</p>
                              <p className="text-[10px] font-medium text-slate-500 truncate group relative cursor-help">
                                {audit.user_agent || 'N/A'}
                                <span className="invisible group-hover:visible absolute z-50 p-2 bg-slate-900 text-white rounded-lg text-[9px] -top-12 left-0 w-64 break-all shadow-xl">
                                  {audit.user_agent}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Fecha</p>
                              <p className="text-xs font-bold text-slate-700">
                                {format(new Date(audit.created_at), "d 'de' MMM, yyyy", { locale: es })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RuleSetAuditPage;
