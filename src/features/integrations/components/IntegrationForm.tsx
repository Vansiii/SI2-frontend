import { useState } from 'react';
import { 
  Save, X, Link as LinkIcon, Lock, Globe, FileJson, 
  AlignLeft, Type, ToggleLeft, Key, Info
} from 'lucide-react';
import type { ExternalIntegration, IntegrationType, IntegrationStatus } from '../types';

interface IntegrationFormProps {
  integration?: ExternalIntegration;
  onSubmit: (data: {
    integration_type: IntegrationType;
    name: string;
    description: string;
    status: IntegrationStatus;
    configuration: Record<string, any>;
    webhook_url: string;
    webhook_secret: string;
    is_default: boolean;
    notes: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  integration,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    integration_type: integration?.integration_type || 'STRIPE' as IntegrationType,
    name: integration?.name || '',
    description: integration?.description || '',
    status: integration?.status || 'ACTIVE' as IntegrationStatus,
    configuration: integration?.configuration || {},
    webhook_url: integration?.webhook_url || '',
    webhook_secret: integration?.webhook_secret || '',
    is_default: integration?.is_default || false,
    notes: integration?.notes || '',
  });

  const [configJson, setConfigJson] = useState(
    JSON.stringify(integration?.configuration || {}, null, 2)
  );
  const [jsonError, setJsonError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError('');
    
    try {
      const configuration = JSON.parse(configJson);
      onSubmit({
        ...formData,
        configuration,
      });
    } catch (error) {
      setJsonError('El JSON de configuración es inválido. Por favor, verifica la sintaxis.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Sección 1: Información General */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center">
          <Info className="w-4 h-4 mr-2 text-blue-500" />
          Información General
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <LinkIcon className="w-4 h-4 mr-1 text-slate-400" /> Tipo de Integración
            </label>
            <select
              name="integration_type"
              value={formData.integration_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
              required
            >
              <option value="STRIPE">Stripe - Pagos</option>
              <option value="DIDIT">Didit - Verificación Identidad</option>
              <option value="BREVO">Brevo - Email</option>
              <option value="SUPABASE">Supabase - Storage</option>
              <option value="GROQ">GroqCloud - IA</option>
              <option value="CREDIT_BUREAU">Bureau de Crédito</option>
              <option value="PAYMENT_GATEWAY">Gateway de Pagos</option>
              <option value="NOTIFICATION">Servicio de Notificaciones</option>
              <option value="BI_ANALYTICS">BI/Analytics</option>
              <option value="ACCOUNTING">Sistema Contable</option>
              <option value="DIGITAL_SIGNATURE">Firma Digital</option>
              <option value="GOVERNMENT_API">API Gubernamental</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <Type className="w-4 h-4 mr-1 text-slate-400" /> Nombre Identificador
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
              required
              placeholder="Ej: Stripe Producción"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <AlignLeft className="w-4 h-4 mr-1 text-slate-400" /> Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none resize-y min-h-[80px]"
              rows={2}
              placeholder="Breve descripción del propósito de esta integración..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <ToggleLeft className="w-4 h-4 mr-1 text-slate-400" /> Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="ERROR">Error</option>
              <option value="TESTING">En Prueba</option>
            </select>
          </div>

          <div className="flex items-center h-full pt-6">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_default ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_default ? 'transform translate-x-6' : ''}`}></div>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium text-slate-700">Integración Principal</span>
                <p className="text-xs text-slate-500">Usar por defecto para este tipo</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Sección 2: Configuración Técnica */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center">
          <Key className="w-4 h-4 mr-2 text-blue-500" />
          Configuración Técnica
        </h3>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
              <span className="flex items-center"><FileJson className="w-4 h-4 mr-1 text-slate-400" /> Credenciales (JSON)</span>
            </label>
            <div className="relative rounded-lg shadow-sm border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <div className="absolute top-0 left-0 bottom-0 w-8 bg-slate-100 border-r border-slate-300 flex flex-col items-center pt-3 text-xs text-slate-400 font-mono select-none">
                {configJson.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm resize-y min-h-[160px] outline-none"
                spellCheck="false"
              />
            </div>
            {jsonError ? (
              <p className="text-xs text-rose-500 mt-1.5 flex items-center"><X className="w-3 h-3 mr-1"/>{jsonError}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1.5">Introduce el JSON válido con tus API keys, secrets o endpoints.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Globe className="w-4 h-4 mr-1 text-slate-400" /> URL de Webhook
              </label>
              <input
                type="url"
                name="webhook_url"
                value={formData.webhook_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
                placeholder="https://tudominio.com/webhook"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Lock className="w-4 h-4 mr-1 text-slate-400" /> Secreto de Webhook
              </label>
              <input
                type="password"
                name="webhook_secret"
                value={formData.webhook_secret}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
                placeholder="whsec_..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1 px-1">
        <label className="text-sm font-medium text-slate-700">Notas Adicionales</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
          rows={2}
          placeholder="Comentarios internos sobre esta integración..."
        />
      </div>

      <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors shadow-sm focus:ring-2 focus:ring-slate-200 outline-none"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 outline-none flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Guardando cambios...' : integration ? 'Guardar Cambios' : 'Crear Integración'}
        </button>
      </div>
    </form>
  );
};
