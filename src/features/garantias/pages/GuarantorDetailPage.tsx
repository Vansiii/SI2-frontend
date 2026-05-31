import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UserSquare } from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useAuth } from '../../auth/hooks/useAuth';
import { approveGuarantor, getGuarantorById, rejectGuarantor } from '../services/garantiasApi';
import type { Guarantor } from '../types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

export function GuarantorDetailPage() {
  const navigate = useNavigate();
  const { guarantorId } = useParams<{ guarantorId: string }>();
  const { hasPermission } = useAuth();

  const [guarantor, setGuarantor] = useState<Guarantor | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canApprove = hasPermission('guarantors.approve');

  useEffect(() => {
    if (guarantorId) {
      loadGuarantor(Number(guarantorId));
    }
  }, [guarantorId]);

  async function loadGuarantor(id: number) {
    setLoading(true);
    setError(null);
    try {
      const detail = await getGuarantorById(id);
      setGuarantor(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar el garante');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!guarantor) return;
    setBusy(true);
    try {
      const updated = await approveGuarantor(guarantor.id);
      setGuarantor(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo aprobar el garante');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!guarantor) return;
    const reason = window.prompt('Motivo de rechazo');
    if (!reason) return;
    setBusy(true);
    try {
      const updated = await rejectGuarantor(guarantor.id, reason);
      setGuarantor(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo rechazar el garante');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingState message="Cargando garante..." fullScreen={true} />;
  }

  if (!guarantor) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error || 'Garante no encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/garantias/guarantors')}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UserSquare className="h-6 w-6 text-blue-600" />
              {guarantor.full_name || `${guarantor.first_name} ${guarantor.last_name}`}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Solicitud #{guarantor.loan_application}</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {guarantor.status_display || STATUS_LABELS[guarantor.status]}
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
          <div>
            <div className="text-xs uppercase text-slate-400">Documento</div>
            <div className="font-semibold text-slate-900">{guarantor.document_type} {guarantor.document_number}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Ingreso mensual</div>
            <div className="font-semibold text-slate-900">{guarantor.monthly_income}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Relacion</div>
            <div className="font-semibold text-slate-900">{guarantor.relationship_to_borrower}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-slate-600">
          <div>
            <div className="text-xs uppercase text-slate-400">Contacto</div>
            <div className="font-semibold text-slate-900">{guarantor.email}</div>
            <div className="text-slate-500">{guarantor.phone}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Direccion</div>
            <div className="font-semibold text-slate-900">{guarantor.address}</div>
            <div className="text-slate-500">{guarantor.city}, {guarantor.department}</div>
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
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
