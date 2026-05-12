import { useState, useMemo } from 'react';

import { 
  Sliders, 
  Shield, 
  Settings, 
  FileText, 
  GitBranch, 
  Gauge,
  Activity,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { RuleSetListPage } from './RuleSetListPage';
import { EligibilityRuleListPage } from './EligibilityRuleListPage';
import { ProductParameterListPage } from './ProductParameterListPage';
import { DocumentRequirementListPage } from './DocumentRequirementListPage';
import { WorkflowStageListPage } from './WorkflowStageListPage';
import { DecisionThresholdListPage } from './DecisionThresholdListPage';

import { CatalogsManagementPage } from '../../catalogs/pages/CatalogsManagementPage';
import { useRuleSets } from '../hooks/useRuleSets';
import { useDecisionThresholds } from '../hooks/useDecisionThresholds';

type TabId = 'rule-sets' | 'eligibility' | 'parameters' | 'requirements' | 'workflow' | 'thresholds' | 'catalogs';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Sliders;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'rule-sets',
    label: 'Conjuntos',
    icon: Sliders,
    description: 'Gestión de versiones y estados globales.',
  },
  {
    id: 'catalogs',
    label: 'Tipos de Productos',
    icon: Database,
    description: 'Tipos de productos crediticios.',
  },
  {
    id: 'eligibility',
    label: 'Elegibilidad',
    icon: Shield,
    description: 'Criterios automáticos de pre-aprobación.',
  },
  {
    id: 'parameters',
    label: 'Parámetros',
    icon: Settings,
    description: 'Límites de montos, plazos y tasas.',
  },
  {
    id: 'requirements',
    label: 'Documentos',
    icon: FileText,
    description: 'Catálogo de tipos de documentos.',
  },
  {
    id: 'workflow',
    label: 'Workflow',
    icon: GitBranch,
    description: 'Etapas de aprobación y flujos.',
  },
  {
    id: 'thresholds',
    label: 'Umbrales',
    icon: Gauge,
    description: 'Puntos de corte para scoring automático.',
  },
];

export function RulesManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>('rule-sets');
  const { data: ruleSets } = useRuleSets();
  const { thresholds } = useDecisionThresholds();

  const stats = useMemo(() => {
    const sets = Array.isArray(ruleSets) ? ruleSets : [];
    return [
      { 
        label: 'Conjuntos Activos', 
        value: sets.filter(s => s.status === 'ACTIVE').length, 
        icon: CheckCircle2, 
        color: 'text-green-600',
        bg: 'bg-green-50'
      },
      { 
        label: 'En Borrador', 
        value: sets.filter(s => s.status === 'DRAFT').length, 
        icon: Activity, 
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      },
      { 
        label: 'Umbrales Config.', 
        value: Array.isArray(thresholds) ? thresholds.length : 0, 
        icon: AlertCircle, 
        color: 'text-purple-600',
        bg: 'bg-purple-50'
      },
    ];
  }, [ruleSets, thresholds]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rule-sets': 
        return (
          <motion.div
            key="rule-sets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <RuleSetListPage embedded />
          </motion.div>
        );
      case 'catalogs': 
        return (
          <motion.div
            key="catalogs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CatalogsManagementPage embedded />
          </motion.div>
        );
      case 'eligibility': 
        return (
          <motion.div
            key="eligibility"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <EligibilityRuleListPage embedded />
          </motion.div>
        );
      case 'parameters': 
        return (
          <motion.div
            key="parameters"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ProductParameterListPage embedded />
          </motion.div>
        );
      case 'requirements': 
        return (
          <motion.div
            key="requirements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DocumentRequirementListPage embedded />
          </motion.div>
        );
      case 'workflow': 
        return (
          <motion.div
            key="workflow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <WorkflowStageListPage embedded />
          </motion.div>
        );
      case 'thresholds': 
        return (
          <motion.div
            key="thresholds"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DecisionThresholdListPage embedded />
          </motion.div>
        );
      default: 
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header with Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-(--tenant-primary-soft) opacity-50 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-(--tenant-primary) font-bold text-xs tracking-wider uppercase">
              <Settings className="h-3.5 w-3.5" />
              Motor de Reglas
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Administración de Crédito
            </h1>
            <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
              Optimiza el proceso de evaluación configurando reglas inteligentes y flujos de trabajo personalizados.
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className={`flex flex-col p-3.5 rounded-xl border border-slate-100 ${stat.bg} min-w-[130px] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xl font-black text-slate-900">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Minimalist Pill Style */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
        <nav className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap
                  ${isActive ? 'text-(--tenant-on-primary)' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
                `}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-(--tenant-on-primary)' : 'text-slate-400'}`} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-(--tenant-primary) -z-10 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-(--tenant-primary)" />
          <span className="text-xs font-bold text-slate-500 tracking-wide">
            {tabs.find(t => t.id === activeTab)?.description}
          </span>
        </div>
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

