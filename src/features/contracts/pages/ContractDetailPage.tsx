import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  Calendar,
  DollarSign,
  FileSignature
} from 'lucide-react';
import { fetchContract, downloadContractPDF, fetchSignatureStatus, fetchPaymentSummary } from '../services/contractsApi';
import type { Contract, SignatureStatus, PaymentSummary } from '../types';
import { ContractStatusBadge } from '../components/ContractStatusBadge';
import { ContractSignatureModal } from '../components/ContractSignatureModal';
import { AmortizationTable } from '../components/AmortizationTable';
import { LoadingState } from '../../../components/ui/LoadingState';

type TabType = 'info' | 'signatures' | 'amortization' | 'documents';

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadContract = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await fetchContract(parseInt(id, 10));
      setContract(data);
      
      // Cargar datos adicionales
      const [sigStatus, paySummary] = await Promise.all([
        fetchSignatureStatus(parseInt(id, 10)),
        fetchPaymentSummary(parseInt(id, 10))
      ]);
      setSignatureStatus(sigStatus);
      setPaymentSummary(paySummary);
      
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar el contrato');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContract();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      setDownloading(true);
      await downloadContractPDF(parseInt(id, 10));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al descargar el PDF');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleSignatureComplete = () => {
    setShowSignatureModal(false);
    loadContract(); // Recargar datos
  };

  if (loading) {
    return <LoadingState message="Cargando contrato..." fullScreen={true} />;
  }

  if (error || !contract) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error || 'Contrato no encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/contracts"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Contrato {contract.contract_number}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Cliente: {contract.loan_application.client_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ContractStatusBadge status={contract.status} />
          {contract.pdf_url && (
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all font-medium text-sm"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Descargando...' : 'Descargar PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-4">
          <nav className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('signatures')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'signatures'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Firmas
            </button>
            <button
              onClick={() => setActiveTab('amortization')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'amortization'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Tabla de Amortización
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Información General */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Términos Financieros */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Términos Financieros
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Monto Principal</div>
                    <div className="text-xl font-bold text-slate-900">
                      Bs. {parseFloat(contract.principal_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Tasa de Interés</div>
                    <div className="text-xl font-bold text-slate-900">
                      {contract.interest_rate}% anual
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Plazo</div>
                    <div className="text-xl font-bold text-slate-900">
                      {contract.term_months} meses
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Cuota Mensual</div>
                    <div className="text-xl font-bold text-slate-900">
                      Bs. {parseFloat(contract.monthly_payment).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas Importantes */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Fechas Importantes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Fecha del Contrato</div>
                    <div className="text-base font-semibold text-slate-900">
                      {new Date(contract.contract_date).toLocaleDateString('es-BO')}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Fecha de Inicio</div>
                    <div className="text-base font-semibold text-slate-900">
                      {new Date(contract.start_date).toLocaleDateString('es-BO')}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Fecha de Finalización</div>
                    <div className="text-base font-semibold text-slate-900">
                      {new Date(contract.end_date).toLocaleDateString('es-BO')}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Primer Pago</div>
                    <div className="text-base font-semibold text-slate-900">
                      {new Date(contract.first_payment_date).toLocaleDateString('es-BO')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de Pagos */}
              {paymentSummary && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Resumen de Pagos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="text-xs text-green-600 mb-1">Pagos Realizados</div>
                      <div className="text-xl font-bold text-green-700">
                        {paymentSummary.paid_payments} / {paymentSummary.total_payments}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Bs. {parseFloat(paymentSummary.total_paid).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <div className="text-xs text-yellow-600 mb-1">Pagos Pendientes</div>
                      <div className="text-xl font-bold text-yellow-700">
                        {paymentSummary.pending_payments}
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">
                        Bs. {parseFloat(paymentSummary.total_pending).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="text-xs text-blue-600 mb-1">Progreso</div>
                      <div className="text-xl font-bold text-blue-700">
                        {paymentSummary.completion_percentage.toFixed(1)}%
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${paymentSummary.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Firmas */}
          {activeTab === 'signatures' && (
            <div className="space-y-6">
              {/* Estado de Firmas */}
              {signatureStatus && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Estado de Firmas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      {signatureStatus.borrower_signed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900">Prestatario</div>
                        <div className="text-xs text-slate-500">
                          {signatureStatus.borrower_signed ? 'Firmado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                    {signatureStatus.guarantors_required > 0 && (
                      <div className="flex items-center gap-3">
                        {signatureStatus.guarantors_signed === signatureStatus.guarantors_required ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900">Garantes</div>
                          <div className="text-xs text-slate-500">
                            {signatureStatus.guarantors_signed} / {signatureStatus.guarantors_required} firmados
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {signatureStatus.institution_signed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900">Institución</div>
                        <div className="text-xs text-slate-500">
                          {signatureStatus.institution_signed ? 'Firmado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de firma */}
                  {!signatureStatus.borrower_signed && (
                    <button
                      onClick={() => setShowSignatureModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all font-medium text-sm"
                    >
                      <FileSignature className="h-4 w-4" />
                      Firmar Contrato
                    </button>
                  )}
                </div>
              )}

              {/* Historial de Firmas */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Historial de Firmas</h3>
                <div className="space-y-3">
                  {contract.signatures.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No hay firmas registradas aún
                    </div>
                  ) : (
                    contract.signatures.map((signature) => (
                      <div key={signature.id} className="bg-slate-50 rounded-xl p-4 flex items-start gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">{signature.signer_name}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {signature.signer_type_display} • {signature.signature_method_display}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {new Date(signature.signed_at).toLocaleString('es-BO')} • IP: {signature.ip_address}
                          </div>
                        </div>
                        {signature.identity_verified && (
                          <div className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                            Verificado
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Tabla de Amortización */}
          {activeTab === 'amortization' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tabla de Amortización</h3>
              <AmortizationTable schedule={contract.amortization_schedule} />
            </div>
          )}
        </div>
      </div>

      {/* Modal de Firma */}
      {showSignatureModal && (
        <ContractSignatureModal
          contract={contract}
          onClose={() => setShowSignatureModal(false)}
          onSuccess={handleSignatureComplete}
        />
      )}
    </div>
  );
}
