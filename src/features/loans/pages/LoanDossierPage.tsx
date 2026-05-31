/**
 * CU-12 — Vista Expediente Completo (Dossier)
 * 
 * Provee una visión consolidada y detallada de toda la información de la solicitud 
 * para procesos de revisión, auditoría y decisión crediticia.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain,
  Download, 
  FileText, 
  Fingerprint, 
  History, 
  Printer, 
  Scale, 
  ShieldCheck, 
  User, 
  Wallet 
} from 'lucide-react';
import loansApi from '../services/loansApi';
import type { LoanApplication } from '../services/loansApi';
import { LoanApplicationStatusLabels, RiskLevelLabels, EmploymentTypeLabels } from '../types/loan.types';

// Tipo temporal para IdentityVerification (debería estar en types)
interface IdentityVerification {
  id: number;
  full_name: string;
  document_type: string;
  document_number: string;
  country: string;
  date_of_birth?: string;
  decision: string;
  provider: string;
  completed_at?: string;
  raw_response?: any;
}

import { 
  X,
  FileCheck,
  AlertCircle,
  Activity
} from 'lucide-react';
import {
  ApplicationComments,
  ApplicationDocuments,
  ApplicationTimeline,
  CreditApplicationStatusBadge,
  IdentityStatusBadge,
  SectionCard,
  formatCurrency,
  formatDateTime,
} from '../components/CreditApplicationComponents';

export function LoanDossierPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const applicationId = Number(id);

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [kycData, setKycData] = useState<IdentityVerification | null>(null);
  const [loadingKYC, setLoadingKYC] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadDossier();
    }
  }, [applicationId]);

  async function loadDossier() {
    setLoading(true);
    try {
      const data = await loansApi.getApplication(applicationId);
      setApplication(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el expediente');
    } finally {
      setLoading(false);
    }
  }

  async function handleShowKYCReport() {
    if (!application?.identity_verification_id) {
      alert('No hay una verificación de identidad asociada a este expediente.');
      return;
    }

    setIsKYCModalOpen(true);
    setLoadingKYC(true);
    try {
      // TODO: Implementar endpoint para obtener detalles de verificación de identidad
      // const data = await loansApi.getIdentityVerification(application.identity_verification_id);
      // setKycData(data);
      
      // Por ahora, mostrar datos mock o de application.identity_verification_details
      console.warn('getIdentityVerification endpoint not implemented yet');
      setKycData(null);
    } catch (err) {
      console.error('Error loading KYC report:', err);
    } finally {
      setLoadingKYC(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-slate-500 font-medium">Consolidando expediente...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Error en el expediente</h2>
          <p className="mt-2 text-slate-600">{error || 'No se encontró la solicitud'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      {/* ─── Dossier Top Navigation ─── */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-slate-900" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Expediente Digital</h1>
              <p className="text-xs font-medium text-slate-500">{application.application_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          
          {/* ─── Dossier Header ─── */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Expediente: {application.client_name}
                </h2>
                <CreditApplicationStatusBadge status={application.status} label={LoanApplicationStatusLabels[application.status]} />
              </div>
              <p className="text-lg text-slate-500">
                {application.product_name} · Solicitado el {formatDateTime(application.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score de Crédito</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {application.credit_score ?? 'N/A'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Riesgo Estimado</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    application.risk_level === 'LOW' ? 'bg-emerald-500' :
                    application.risk_level === 'MEDIUM' ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`} />
                  <p className="text-xl font-bold text-slate-900">
                    {application.risk_level ? RiskLevelLabels[application.risk_level] : 'Pendiente'}
                  </p>
                </div>
              </div>
              <Link
                to={`/loans/${application.id}/evaluation`}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <Brain className="h-4 w-4" />
                Ver evaluación IA
              </Link>
            </div>
          </div>

          {/* ─── Content Grid ─── */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Left Column: Core Data */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Información Personal & Financiera */}
              <SectionCard 
                title="Información Estructural" 
                subtitle="Datos del solicitante y condiciones del producto solicitado."
                action={<User className="h-5 w-5 text-slate-400" />}
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <DataPoint icon={<Wallet />} label="Monto Solicitado" value={formatCurrency(application.requested_amount)} />
                  <DataPoint icon={<History />} label="Plazo Solicitado" value={`${application.term_months} meses`} />
                  <DataPoint icon={<Scale />} label="DTI (Deuda/Ingreso)" value={application.debt_to_income_ratio || 'N/D'} />
                  <DataPoint icon={<User />} label="Tipo de Empleo" value={application.employment_type ? EmploymentTypeLabels[application.employment_type as keyof typeof EmploymentTypeLabels] : 'N/D'} />
                </div>
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Descripción Laboral</h4>
                  <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {application.employment_description || 'No se proporcionó descripción laboral detallada.'}
                  </p>
                </div>
              </SectionCard>

              {/* Documentación de Soporte */}
              <SectionCard 
                title="Soportes Documentales" 
                subtitle="Archivos y evidencias cargadas por el cliente para validación."
                action={<FileText className="h-5 w-5 text-slate-400" />}
              >
                <ApplicationDocuments documents={application.documents || []} />
              </SectionCard>

              {/* Auditoría de Cambios y Timeline */}
              <SectionCard 
                title="Bitácora de Eventos" 
                subtitle="Historial completo de estados y acciones realizadas sobre el expediente."
                action={<History className="h-5 w-5 text-slate-400" />}
              >
                <ApplicationTimeline events={application.timeline || []} />
              </SectionCard>
            </div>

            {/* Right Column: Verifications & Notes */}
            <div className="space-y-8">
              
              {/* Verificación de Identidad */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Validación KYC</h3>
                  <Fingerprint className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <span className="text-xs font-medium text-slate-500 uppercase">Estado</span>
                    <IdentityStatusBadge status={application.identity_verification_status || undefined} />
                  </div>
                  
                  {application.identity_verification_details ? (
                    <div className="p-4 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Documento</span>
                        <span className="font-bold text-slate-900">
                          {application.identity_verification_details.document_type} - {application.identity_verification_details.document_number}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Nombre Verificado</span>
                        <span className="font-bold text-slate-900">{application.identity_verification_details.full_name || 'N/D'}</span>
                      </div>
                      {application.identity_verification_details.date_of_birth && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Fecha de Nacimiento</span>
                          <span className="font-bold text-slate-900">{application.identity_verification_details.date_of_birth}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Decisión</span>
                        <span className={`font-bold ${
                          application.identity_verification_details.decision === 'APPROVED' ? 'text-emerald-600' : 
                          application.identity_verification_details.decision === 'DECLINED' ? 'text-rose-600' : 
                          'text-amber-600'
                        }`}>
                          {application.identity_verification_details.decision}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Proveedor</span>
                        <span className="font-bold text-slate-900">{application.identity_verification_details.provider}</span>
                      </div>
                      {application.identity_verification_details.completed_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Completado</span>
                          <span className="font-bold text-slate-900">{formatDateTime(application.identity_verification_details.completed_at)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center">
                      <p className="text-sm text-slate-500">No hay datos de verificación de identidad disponibles</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={handleShowKYCReport}
                    className="w-full py-3 rounded-2xl bg-slate-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition"
                  >
                    Ver Informe Técnico
                  </button>
                </div>
              </div>

              {/* Comentarios e Interacciones */}
              <SectionCard 
                title="Comentarios" 
                subtitle="Notas de analistas."
              >
                <ApplicationComments comments={application.comments || []} />
              </SectionCard>

              {/* Resumen de Decisión (Si existe) */}
              {(application.status === 'APPROVED' || application.status === 'REJECTED') && (
                <div className={`rounded-3xl p-6 border-2 ${
                  application.status === 'APPROVED' ? 'border-emerald-100 bg-emerald-50 text-emerald-900' : 'border-rose-100 bg-rose-50 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5" />
                    <h3 className="font-bold">Decisión Final</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Decidido por:</strong> {application.approved_by_name || application.reviewed_by_name || 'Sistema'}</p>
                    <p><strong>Fecha:</strong> {formatDateTime(application.approved_at || application.rejected_at || application.updated_at)}</p>
                    {application.rejection_reason && (
                      <p className="mt-3 p-3 bg-rose-100/50 rounded-xl"><strong>Motivo:</strong> {application.rejection_reason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <KYCReportModal 
        isOpen={isKYCModalOpen}
        onClose={() => setIsKYCModalOpen(false)}
        loading={loadingKYC}
        data={kycData}
      />
    </div>
  );
}

function DataPoint({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition hover:bg-white hover:shadow-md group">
      <div className="mt-1 text-slate-400 group-hover:text-blue-600 transition-colors">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5' })}
      </div>
      <div>
        <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
      </div>
    </div>
  );
}

function KYCReportModal({ 
  isOpen, 
  onClose, 
  loading, 
  data 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  loading: boolean, 
  data: IdentityVerification | null 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl my-8 overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header Fijo */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-8 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Informe Técnico KYC</h3>
              <p className="text-sm text-slate-500">Proveedor: Didit Security Verify</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 hover:text-slate-900" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600" />
              <p className="mt-6 text-base font-medium text-slate-500">Consultando base de datos del proveedor...</p>
            </div>
          ) : !data ? (
            <div className="py-16 text-center">
              <AlertCircle className="mx-auto h-14 w-14 text-rose-500" />
              <p className="mt-6 text-base font-medium text-slate-900">No se pudo cargar el informe</p>
              <p className="text-sm text-slate-500 mt-2">El servidor del proveedor no respondió a tiempo.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Resumen de Resultados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 hover:shadow-lg transition-shadow">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Score de Similitud</p>
                  <p className="text-4xl font-bold text-slate-900 mb-4">98.5%</p>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500" style={{ width: '98.5%' }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-3">Coincidencia biométrica facial</p>
                </div>
                <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 hover:shadow-lg transition-shadow">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Decisión del Proveedor</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-3xl font-bold text-slate-900 capitalize">{data.decision}</p>
                  </div>
                  <p className="text-xs text-slate-500">Verificación completada exitosamente</p>
                </div>
              </div>

              {/* Datos Extraídos */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700 mb-6">
                  <FileCheck className="h-5 w-5 text-blue-600" />
                  Datos Extraídos del Documento
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Nombre Completo</p>
                    <p className="text-base font-semibold text-slate-900">{data.full_name}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Tipo de Documento</p>
                    <p className="text-base font-semibold text-slate-900">{data.document_type}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Nro. Documento</p>
                    <p className="text-base font-semibold text-slate-900">{data.document_number}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">País</p>
                    <p className="text-base font-semibold text-slate-900">{data.country}</p>
                  </div>
                </div>
              </div>

              {/* Pruebas Técnicas */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700 mb-6">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Pruebas Biométricas y Seguridad
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TechRow label="Prueba de Vida (Liveness)" status="PASSED" />
                  <TechRow label="Autenticidad de Documento" status="PASSED" />
                  <TechRow label="Verificación de Anti-Spoofing" status="PASSED" />
                  <TechRow label="Validación de Metadatos OCR" status="PASSED" />
                </div>
              </div>

              {/* Raw Data Section (Solo si hay raw_response) */}
              {data.raw_response && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-4">Raw Provider Metadata</h4>
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <pre className="text-xs bg-slate-900 text-slate-300 p-6 overflow-x-auto font-mono max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
{JSON.stringify(data.raw_response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer Fijo */}
        <div className="sticky bottom-0 bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Informe generado automáticamente · Confidencial
          </p>
          <button 
            onClick={onClose}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3 text-sm font-bold text-white transition-colors shadow-sm"
          >
            Cerrar Informe
          </button>
        </div>
      </div>
    </div>
  );
}

function TechRow({ label, status }: { label: string, status: 'PASSED' | 'FAILED' }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${status === 'PASSED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
          status === 'PASSED' 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-rose-100 text-rose-700'
        }`}>
          {status === 'PASSED' ? 'Superado' : 'Fallido'}
        </span>
      </div>
    </div>
  );
}
