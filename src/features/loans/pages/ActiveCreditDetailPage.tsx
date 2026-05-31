import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Receipt, Clock, RefreshCw, RotateCcw, Shield,
  FileText, Calendar, HelpCircle,
} from 'lucide-react';
import {
  getActiveCredit,
  getActiveCreditSummary,
  getActiveCreditSchedule,
  getActiveCreditPayments,
  getStatusHistory,
  getStatusColor,
  getInstallmentStatusColor,
  getPaymentStatusColor,
  formatCurrency,
  formatDate,
  getCreditSupportRequests,
} from '../services/activeCreditApi';
import type {
  ActiveCreditDetail,
  CreditSummary,
  Installment,
  PaymentListItem,
  StatusHistory,
  SupportRequest,
} from '../types/activeCredit.types';
import PaymentRegisterModal from '../components/PaymentRegisterModal';
import GracePeriodModal from '../components/GracePeriodModal';
import RestructuringModal from '../components/RestructuringModal';
import SupportRequestReviewModal from '../components/SupportRequestReviewModal';
import PaymentDetailModal from '../components/PaymentDetailModal';

type Tab = 'summary' | 'schedule' | 'payments' | 'history' | 'support';

export default function ActiveCreditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [credit, setCredit] = useState<ActiveCreditDetail | null>(null);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [schedule, setSchedule] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGraceModal, setShowGraceModal] = useState(false);
  const [showRestructureModal, setShowRestructureModal] = useState(false);
  const [showSupportReviewModal, setShowSupportReviewModal] = useState(false);
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<SupportRequest | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  useEffect(() => {
    if (id) loadAll(Number(id));
  }, [id]);

  // Check for tab param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'register-payment') {
      setShowPaymentModal(true);
      searchParams.delete('tab');
      setSearchParams(searchParams);
    }
  }, []);

  async function loadAll(creditId: number) {
    setLoading(true);
    setError(null);
    try {
      const [creditData, summaryData, scheduleData, paymentsData, historyData, supportData] = await Promise.all([
        getActiveCredit(creditId),
        getActiveCreditSummary(creditId),
        getActiveCreditSchedule(creditId),
        getActiveCreditPayments(creditId),
        getStatusHistory(creditId),
        getCreditSupportRequests(creditId).catch(() => []),
      ]);
      setCredit(creditData);
      setSummary(summaryData);
      setSchedule(scheduleData || []);
      setPayments(paymentsData || []);
      setStatusHistory(historyData || []);
      setSupportRequests(supportData || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar crédito');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          Cargando detalle de crédito...
        </div>
      </div>
    );
  }

  if (error || !credit) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error || 'Crédito no encontrado'}</p>
          <Link to="/active-credits" className="text-blue-600 hover:underline mt-2 inline-block">
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'summary', label: 'Resumen', icon: <FileText className="h-4 w-4" /> },
    { key: 'schedule', label: 'Cronograma', icon: <Calendar className="h-4 w-4" /> },
    { key: 'payments', label: 'Pagos', icon: <Receipt className="h-4 w-4" /> },
    { key: 'history', label: 'Historial', icon: <Clock className="h-4 w-4" /> },
    { key: 'support', label: 'Solicitudes', icon: <HelpCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/active-credits" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{credit.credit_number}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(credit.status)}`}>
                {credit.status_display}
              </span>
              {credit.days_in_arrears > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  {credit.days_in_arrears} días de mora
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {credit.client_name} · {credit.product_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
          >
            <Receipt className="h-4 w-4" /> Registrar Pago
          </button>
          <button
            onClick={() => setShowGraceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Shield className="h-4 w-4" /> Gracia
          </button>
          <button
            onClick={() => setShowRestructureModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
          >
            <RotateCcw className="h-4 w-4" /> Reestructurar
          </button>
          <button
            onClick={() => loadAll(credit.id)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Monto Aprobado', value: formatCurrency(summary.approved_amount), color: 'text-slate-700' },
            { label: 'Saldo Insoluto', value: formatCurrency(summary.current_balance), color: 'text-blue-700 font-bold' },
            { label: 'Total Pagado', value: formatCurrency(summary.total_paid), color: 'text-emerald-700' },
            { label: 'Próximo Pago', value: summary.next_installment ? formatCurrency(summary.next_installment.total_amount) : '—', color: 'text-purple-700' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className={`text-xl ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Financial details */}
      {credit && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Tasa Anual', value: `${credit.annual_interest_rate}%` },
            { label: 'Plazo', value: `${credit.term_periods} cuotas` },
            { label: 'Frecuencia', value: credit.payment_frequency_name },
            { label: 'Amortización', value: credit.amortization_system_name },
            { label: 'Desembolso', value: formatDate(credit.disbursement_date) },
          ].map((info) => (
            <div key={info.label} className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">{info.label}</p>
              <p className="text-sm font-medium text-slate-700">{info.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {summary && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Progreso de pagos</span>
            <span className="text-sm font-medium text-slate-700">
              {summary.paid_installments} / {summary.total_installments} cuotas ({summary.progress_percentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${summary.progress_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'summary' && summary && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Capital Pagado', value: formatCurrency(summary.principal_paid) },
                { label: 'Interés Pagado', value: formatCurrency(summary.interest_paid) },
                { label: 'Comisiones Pagadas', value: formatCurrency(summary.fees_paid) },
                { label: 'Penalidades Pagadas', value: formatCurrency(summary.penalty_paid) },
                { label: 'Fecha Inicio', value: formatDate(credit.first_payment_date) },
                { label: 'Vencimiento Final', value: formatDate(credit.maturity_date) },
                { label: 'Próximo Vencimiento', value: formatDate(credit.next_due_date) },
                { label: 'Días en Mora', value: credit.days_in_arrears > 0 ? `${credit.days_in_arrears} días` : '0' },
                { label: 'Cuotas Pagadas', value: `${summary.paid_installments} de ${summary.total_installments}` },
                { label: 'Cuotas Vencidas', value: summary.overdue_installments.toString() },
              ].map((d) => (
                <div key={d.label} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">{d.label}</span>
                  <span className="font-medium text-slate-700">{d.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-slate-600">#</th>
                    <th className="px-3 py-2 text-left text-slate-600">Vencimiento</th>
                    <th className="px-3 py-2 text-right text-slate-600">Capital</th>
                    <th className="px-3 py-2 text-right text-slate-600">Interés</th>
                    <th className="px-3 py-2 text-right text-slate-600">Seguro</th>
                    <th className="px-3 py-2 text-right text-slate-600">Total</th>
                    <th className="px-3 py-2 text-right text-slate-600">Pagado</th>
                    <th className="px-3 py-2 text-right text-slate-600">Saldo</th>
                    <th className="px-3 py-2 text-center text-slate-600">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-medium text-slate-700">{inst.installment_number}</td>
                      <td className="px-3 py-2 text-slate-600">{formatDate(inst.due_date)}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(inst.principal_amount)}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(inst.interest_amount)}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(inst.insurance_amount)}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700">{formatCurrency(inst.total_amount)}</td>
                      <td className="px-3 py-2 text-right text-emerald-600">{formatCurrency(inst.paid_amount)}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(inst.closing_balance)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getInstallmentStatusColor(inst.status)}`}>
                          {inst.status_display}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              {payments.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No hay pagos registrados</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-600">Fecha</th>
                      <th className="px-3 py-2 text-left text-slate-600">Canal</th>
                      <th className="px-3 py-2 text-left text-slate-600">Método</th>
                      <th className="px-3 py-2 text-right text-slate-600">Monto</th>
                      <th className="px-3 py-2 text-left text-slate-600">Comprobante</th>
                      <th className="px-3 py-2 text-center text-slate-600">Estado</th>
                      <th className="px-3 py-2 text-left text-slate-600">Registrado por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPaymentId(p.id)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-2 text-slate-600">{formatDate(p.payment_date)}</td>
                        <td className="px-3 py-2 text-slate-600">{p.channel_display}</td>
                        <td className="px-3 py-2 text-slate-600">{p.method_display || p.method}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-700">{formatCurrency(p.amount)}</td>
                        <td className="px-3 py-2 text-slate-600">{p.reference_number}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(p.status)}`}>
                            {p.status_display}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{p.registered_by_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              {statusHistory.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No hay historial de cambios</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-600">Fecha</th>
                      <th className="px-3 py-2 text-left text-slate-600">Estado Anterior</th>
                      <th className="px-3 py-2 text-left text-slate-600">Nuevo Estado</th>
                      <th className="px-3 py-2 text-left text-slate-600">Responsable</th>
                      <th className="px-3 py-2 text-left text-slate-600">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statusHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-slate-600">{formatDate(h.created_at)}</td>
                        <td className="px-3 py-2 text-slate-500">{h.previous_status || '—'}</td>
                        <td className="px-3 py-2 font-medium text-slate-700">{h.new_status}</td>
                        <td className="px-3 py-2 text-slate-600">{h.changed_by_name}</td>
                        <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate">{h.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <div className="overflow-x-auto">
              {supportRequests.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No hay solicitudes de apoyo para este crédito</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-600">Fecha</th>
                      <th className="px-3 py-2 text-left text-slate-600">Tipo</th>
                      <th className="px-3 py-2 text-left text-slate-600">Cliente</th>
                      <th className="px-3 py-2 text-left text-slate-600">Motivo</th>
                      <th className="px-3 py-2 text-left text-slate-600">Meses</th>
                      <th className="px-3 py-2 text-center text-slate-600">Estado</th>
                      <th className="px-3 py-2 text-center text-slate-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supportRequests.map((sr) => (
                      <tr key={sr.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-slate-600">{formatDate(sr.created_at)}</td>
                        <td className="px-3 py-2 text-slate-700 font-medium">{sr.request_type_display}</td>
                        <td className="px-3 py-2 text-slate-600">{sr.client_name}</td>
                        <td className="px-3 py-2 text-slate-600 max-w-[120px] truncate">{sr.description}</td>
                        <td className="px-3 py-2 text-center text-slate-600">{sr.requested_months || '—'}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            sr.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            sr.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                            sr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            sr.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sr.status_display}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => { setSelectedSupportRequest(sr); setShowSupportReviewModal(true); }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Revisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentRegisterModal
          creditId={credit.id}
          creditNumber={credit.credit_number}
          currencyId={credit.currency || 1}
          currencyCode={credit.currency_code}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => { setShowPaymentModal(false); loadAll(credit.id); }}
        />
      )}

      {showGraceModal && (
        <GracePeriodModal
          creditId={credit.id}
          creditNumber={credit.credit_number}
          onClose={() => setShowGraceModal(false)}
          onSuccess={() => { setShowGraceModal(false); loadAll(credit.id); }}
        />
      )}

      {showRestructureModal && (
        <RestructuringModal
          creditId={credit.id}
          creditNumber={credit.credit_number}
          currentRate={parseFloat(credit.annual_interest_rate)}
          currentTerm={credit.term_periods}
          onClose={() => setShowRestructureModal(false)}
          onSuccess={() => { setShowRestructureModal(false); loadAll(credit.id); }}
        />
      )}

      {showSupportReviewModal && selectedSupportRequest && (
        <SupportRequestReviewModal
          request={selectedSupportRequest}
          onClose={() => { setShowSupportReviewModal(false); setSelectedSupportRequest(null); }}
          onSuccess={() => { setShowSupportReviewModal(false); setSelectedSupportRequest(null); loadAll(credit.id); }}
        />
      )}

      {selectedPaymentId && (
        <PaymentDetailModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
    </div>
  );
}
