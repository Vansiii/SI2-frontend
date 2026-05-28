import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Gavel,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  approveCollateral,
  approveCollateralValuation,
  getCollateralById,
  getCollateralDocuments,
  getCollateralValuations,
  rejectCollateral,
  releaseCollateral,
  uploadCollateralDocument,
  verifyCollateralDocument,
  createCollateralValuation,
} from '../services/garantiasApi';
import type {
  Collateral,
  CollateralDocument,
  CollateralValuation,
  PaginatedResponse,
} from '../types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  RELEASED: 'Liberado',
};

function formatCurrency(value?: string | null) {
  if (!value) return '-';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(parsed);
}

export function CollateralDetailPage() {
  const navigate = useNavigate();
  const { collateralId } = useParams<{ collateralId: string }>();
  const { hasPermission } = useAuth();

  const [collateral, setCollateral] = useState<Collateral | null>(null);
  const [documents, setDocuments] = useState<CollateralDocument[]>([]);
  const [valuations, setValuations] = useState<CollateralValuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [docType, setDocType] = useState('DEED');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docNotes, setDocNotes] = useState('');

  const [valuationForm, setValuationForm] = useState({
    valuation_type: 'INTERNAL',
    appraiser_name: '',
    valuation_date: '',
    appraised_value: '',
  });

  const canApprove = hasPermission('collaterals.approve');
  const canEdit = hasPermission('collaterals.edit');
  const canManageValuations = hasPermission('collaterals.manage_valuations');

  useEffect(() => {
    if (collateralId) {
      loadAll(Number(collateralId));
    }
  }, [collateralId]);

  async function loadAll(id: number) {
    setLoading(true);
    setError(null);
    try {
      const detail = await getCollateralById(id);
      setCollateral(detail);

      const docsResponse: PaginatedResponse<CollateralDocument> = await getCollateralDocuments(id);
      setDocuments(docsResponse.results || []);

      const valuationResponse: PaginatedResponse<CollateralValuation> = await getCollateralValuations(id);
      setValuations(valuationResponse.results || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar la garantia');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!collateral) return;
    const notes = window.prompt('Notas de aprobacion (opcional)');
    setBusy(true);
    try {
      const updated = await approveCollateral(collateral.id, notes || undefined);
      setCollateral(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo aprobar la garantia');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!collateral) return;
    const reason = window.prompt('Motivo de rechazo');
    if (!reason) return;
    setBusy(true);
    try {
      const updated = await rejectCollateral(collateral.id, reason);
      setCollateral(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo rechazar la garantia');
    } finally {
      setBusy(false);
    }
  }

  async function handleRelease() {
    if (!collateral) return;
    const notes = window.prompt('Notas de liberacion (opcional)');
    setBusy(true);
    try {
      const updated = await releaseCollateral(collateral.id, notes || undefined);
      setCollateral(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo liberar la garantia');
    } finally {
      setBusy(false);
    }
  }

  async function handleUploadDocument(event: React.FormEvent) {
    event.preventDefault();
    if (!collateral || !docFile) {
      return;
    }

    setBusy(true);
    try {
      await uploadCollateralDocument(collateral.id, {
        document_type: docType,
        file: docFile,
        notes: docNotes || undefined,
      });
      const docsResponse = await getCollateralDocuments(collateral.id);
      setDocuments(docsResponse.results || []);
      setDocFile(null);
      setDocNotes('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo subir el documento');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyDocument(documentId: number, isValid: boolean) {
    const notes = window.prompt('Notas de verificacion (opcional)');
    setBusy(true);
    try {
      await verifyCollateralDocument(documentId, isValid, notes || undefined);
      if (collateral) {
        const docsResponse = await getCollateralDocuments(collateral.id);
        setDocuments(docsResponse.results || []);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo verificar el documento');
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateValuation(event: React.FormEvent) {
    event.preventDefault();
    if (!collateral) return;

    setBusy(true);
    try {
      await createCollateralValuation(collateral.id, {
        collateral: collateral.id,
        valuation_type: valuationForm.valuation_type as CollateralValuation['valuation_type'],
        appraiser_name: valuationForm.appraiser_name,
        valuation_date: valuationForm.valuation_date,
        appraised_value: valuationForm.appraised_value,
      });
      const valuationResponse = await getCollateralValuations(collateral.id);
      setValuations(valuationResponse.results || []);
      setValuationForm({
        valuation_type: 'INTERNAL',
        appraiser_name: '',
        valuation_date: '',
        appraised_value: '',
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo crear la valuacion');
    } finally {
      setBusy(false);
    }
  }

  async function handleApproveValuation(valuationId: number) {
    setBusy(true);
    try {
      await approveCollateralValuation(valuationId);
      if (collateral) {
        const valuationResponse = await getCollateralValuations(collateral.id);
        setValuations(valuationResponse.results || []);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo aprobar la valuacion');
    } finally {
      setBusy(false);
    }
  }

  const statusLabel = collateral ? (collateral.status_display || STATUS_LABELS[collateral.status]) : '';

  if (loading) {
    return <LoadingState message="Cargando garantia..." fullScreen={true} />;
  }

  if (!collateral) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error || 'Garantia no encontrada'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/garantias')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAll(collateral.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              Garantia #{collateral.id}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Solicitud {collateral.loan_application_number || collateral.loan_application}</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {statusLabel}
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
          <div>
            <div className="text-xs uppercase text-slate-400">Tipo</div>
            <div className="font-semibold text-slate-900">{collateral.collateral_type_display || collateral.collateral_type}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Valor estimado</div>
            <div className="font-semibold text-slate-900">{formatCurrency(collateral.estimated_value)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Valor tasado</div>
            <div className="font-semibold text-slate-900">{formatCurrency(collateral.appraised_value)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Cobertura</div>
            <div className="font-semibold text-slate-900">
              {collateral.coverage_percentage ? `${collateral.coverage_percentage}%` : '-'}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Registrado por</div>
            <div className="font-semibold text-slate-900">{collateral.registered_by_name || 'N/D'}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Aprobado por</div>
            <div className="font-semibold text-slate-900">{collateral.approved_by_name || 'N/D'}</div>
          </div>
        </div>

        {canApprove && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={handleApprove}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Aprobar
            </button>
            <button
              onClick={handleReject}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50"
            >
              <Gavel className="h-4 w-4" />
              Rechazar
            </button>
            <button
              onClick={handleRelease}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
            >
              Liberar
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Documentos
          </h2>
        </div>

        {canEdit && (
          <form onSubmit={handleUploadDocument} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <select
              value={docType}
              onChange={(event) => setDocType(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="DEED">Escritura</option>
              <option value="APPRAISAL">Avaluo</option>
              <option value="PHOTOS">Fotos</option>
              <option value="INSURANCE">Seguro</option>
              <option value="REGISTRATION">Registro</option>
              <option value="OTHER">Otro</option>
            </select>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                onChange={(event) => setDocFile(event.target.files?.[0] || null)}
                className="text-sm"
              />
              <input
                type="text"
                placeholder="Notas (opcional)"
                value={docNotes}
                onChange={(event) => setDocNotes(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!docFile || busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Subir
            </button>
          </form>
        )}

        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">No hay documentos cargados.</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {doc.document_type_display || doc.document_type}
                  </div>
                  <div className="text-xs text-slate-500">{doc.uploaded_by_name || 'Sin responsable'}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {doc.signed_url && (
                    <a
                      href={doc.signed_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      Ver
                    </a>
                  )}
                  {canApprove && (
                    <>
                      <button
                        onClick={() => handleVerifyDocument(doc.id, true)}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                      >
                        Validar
                      </button>
                      <button
                        onClick={() => handleVerifyDocument(doc.id, false)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                      >
                        Marcar invalido
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Valuaciones</h2>

        {canManageValuations && (
          <form onSubmit={handleCreateValuation} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <select
              value={valuationForm.valuation_type}
              onChange={(event) => setValuationForm((prev) => ({ ...prev, valuation_type: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="INTERNAL">Interna</option>
              <option value="EXTERNAL">Externa</option>
              <option value="MARKET_COMPARISON">Comparativa</option>
            </select>
            <input
              type="text"
              placeholder="Tasador"
              value={valuationForm.appraiser_name}
              onChange={(event) => setValuationForm((prev) => ({ ...prev, appraiser_name: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={valuationForm.valuation_date}
              onChange={(event) => setValuationForm((prev) => ({ ...prev, valuation_date: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Valor"
              value={valuationForm.appraised_value}
              onChange={(event) => setValuationForm((prev) => ({ ...prev, appraised_value: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Guardar
            </button>
          </form>
        )}

        <div className="space-y-3">
          {valuations.length === 0 ? (
            <p className="text-sm text-slate-500">No hay valuaciones registradas.</p>
          ) : (
            valuations.map((valuation) => (
              <div
                key={valuation.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {valuation.valuation_type_display || valuation.valuation_type}
                  </div>
                  <div className="text-xs text-slate-500">{valuation.appraiser_name}</div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatCurrency(valuation.appraised_value)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{valuation.valuation_date}</span>
                  {canManageValuations && !valuation.approved_at && (
                    <button
                      onClick={() => handleApproveValuation(valuation.id)}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                    >
                      Aprobar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
