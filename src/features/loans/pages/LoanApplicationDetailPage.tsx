/**
 * Página de detalle de solicitud de crédito
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getLoanApplication,
  getLoanApplicationDocuments,
  getLoanApplicationComments,
  getStatusColor,
  getRiskLevelColor,
  formatApplicationNumber,
  getAvailableActions,
  type LoanApplication,
  type LoanApplicationDocument,
  type LoanApplicationComment,
} from '../services/loansApi';
import { SubmitApplicationModal } from '../components/SubmitApplicationModal';
import { ReviewApplicationModal } from '../components/ReviewApplicationModal';
import { ApproveApplicationModal } from '../components/ApproveApplicationModal';
import { RejectApplicationModal } from '../components/RejectApplicationModal';
import { DisburseApplicationModal } from '../components/DisburseApplicationModal';
import { DocumentList } from '../components/DocumentList';
import { CommentList } from '../components/CommentList';

export default function LoanApplicationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [documents, setDocuments] = useState<LoanApplicationDocument[]>([]);
  const [comments, setComments] = useState<LoanApplicationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de modales
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplicationData();
    }
  }, [id]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [appData, docsData, commentsData] = await Promise.all([
        getLoanApplication(parseInt(id!)),
        getLoanApplicationDocuments(parseInt(id!)),
        getLoanApplicationComments(parseInt(id!)),
      ]);
      
      setApplication(appData);
      setDocuments(docsData);
      setComments(commentsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'edit':
        navigate(`/loans/${id}/edit`);
        break;
      case 'submit':
        setShowSubmitModal(true);
        break;
      case 'review':
      case 'calculate-score':
        setShowReviewModal(true);
        break;
      case 'approve':
        setShowApproveModal(true);
        break;
      case 'reject':
        setShowRejectModal(true);
        break;
      case 'disburse':
        setShowDisburseModal(true);
        break;
    }
  };

  const handleModalSuccess = () => {
    // Recargar datos después de una acción exitosa
    loadApplicationData();
  };

  const getStatusBadge = (status: string, statusDisplay: string) => {
    const color = getStatusColor(status);
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      emerald: 'bg-emerald-100 text-emerald-800',
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray}`}>
        {statusDisplay}
      </span>
    );
  };

  const getRiskBadge = (riskLevel: string | undefined, riskLevelDisplay: string | undefined) => {
    if (!riskLevel || !riskLevelDisplay) return null;
    
    const color = getRiskLevelColor(riskLevel);
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray}`}>
        {riskLevelDisplay}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || 'Solicitud no encontrada'}</p>
          <button
            onClick={() => navigate('/loans')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver a Solicitudes
          </button>
        </div>
      </div>
    );
  }

  const availableActions = getAvailableActions(application);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/loans')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Solicitudes
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Solicitud {formatApplicationNumber(application.application_number)}
            </h1>
            <p className="text-gray-600 mt-2">
              Creada el {new Date(application.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {getStatusBadge(application.status, application.status_display)}
            {getRiskBadge(application.risk_level, application.risk_level_display)}
          </div>
        </div>
      </div>

      {/* Acciones */}
      {availableActions.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Acciones Disponibles</h3>
          <div className="flex flex-wrap gap-3">
            {availableActions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleActionClick(action.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  action.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                  action.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                  action.color === 'yellow' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                  action.color === 'red' ? 'bg-red-600 text-white hover:bg-red-700' :
                  action.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                  action.color === 'emerald' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                  'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos de la Solicitud */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información de la Solicitud</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Cliente</h3>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {application.client_detail?.full_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Documento: {application.client_detail?.document_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {application.client_detail?.email || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Producto</h3>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {application.product_detail?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tipo: {application.product_detail?.product_type || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tasa: {application.product_detail?.interest_rate || 'N/A'}% anual
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles Financieros */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles Financieros</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-700 mb-2">Monto Solicitado</h3>
                <p className="text-2xl font-bold text-blue-900">
                  ${parseFloat(application.requested_amount).toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {application.term_months} meses
                </p>
              </div>
              
              {application.approved_amount && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-700 mb-2">Monto Aprobado</h3>
                  <p className="text-2xl font-bold text-green-900">
                    ${parseFloat(application.approved_amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {application.approved_term_months} meses
                  </p>
                </div>
              )}
              
              {application.monthly_payment && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-700 mb-2">Cuota Mensual</h3>
                  <p className="text-2xl font-bold text-purple-900">
                    ${parseFloat(application.monthly_payment).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    Tasa: {application.approved_interest_rate || application.product_detail?.interest_rate}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Evaluación de Riesgo */}
          {(application.credit_score || application.debt_to_income_ratio) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Evaluación de Riesgo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {application.credit_score && (
                  <div className="text-center">
                    <h3 className="font-medium text-gray-700 mb-2">Score Crediticio</h3>
                    <div className="text-3xl font-bold text-blue-600">
                      {application.credit_score}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Sobre 1000 puntos
                    </div>
                  </div>
                )}
                
                {application.debt_to_income_ratio && (
                  <div className="text-center">
                    <h3 className="font-medium text-gray-700 mb-2">Ratio Deuda/Ingreso</h3>
                    <div className="text-3xl font-bold text-orange-600">
                      {parseFloat(application.debt_to_income_ratio).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Capacidad de pago
                    </div>
                  </div>
                )}
                
                {application.risk_level && (
                  <div className="text-center">
                    <h3 className="font-medium text-gray-700 mb-2">Nivel de Riesgo</h3>
                    <div className="flex justify-center">
                      {getRiskBadge(application.risk_level, application.risk_level_display)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Propósito y Notas */}
          {(application.purpose || application.notes || application.rejection_reason) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Observaciones</h2>
              
              {application.purpose && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Propósito del Crédito</h3>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                    {application.purpose}
                  </p>
                </div>
              )}
              
              {application.notes && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Notas de Evaluación</h3>
                  <p className="text-gray-900 bg-blue-50 rounded-lg p-3">
                    {application.notes}
                  </p>
                </div>
              )}
              
              {application.rejection_reason && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-700 mb-2">Motivo de Rechazo</h3>
                  <p className="text-red-900 bg-red-50 rounded-lg p-3">
                    {application.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Documentos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos</h2>
            <DocumentList 
              applicationId={application.id}
              documents={documents}
              onDocumentUploaded={loadApplicationData}
            />
          </div>

          {/* Comentarios */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comentarios</h2>
            <CommentList 
              applicationId={application.id}
              comments={comments}
              onCommentAdded={loadApplicationData}
            />
          </div>
        </div>

        {/* Timeline y Información Adicional */}
        <div className="space-y-6">
          {/* Timeline de Estados */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-gray-400 rounded-full mt-2"></div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Solicitud Creada</p>
                  <p className="text-sm text-gray-500">
                    {new Date(application.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {application.submitted_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Solicitud Enviada</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              {application.reviewed_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Solicitud Revisada</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.reviewed_at).toLocaleString()}
                    </p>
                    {application.reviewed_by_detail && (
                      <p className="text-sm text-gray-500">
                        Por: {application.reviewed_by_detail.first_name} {application.reviewed_by_detail.last_name}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {application.approved_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Solicitud Aprobada</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.approved_at).toLocaleString()}
                    </p>
                    {application.approved_by_detail && (
                      <p className="text-sm text-gray-500">
                        Por: {application.approved_by_detail.first_name} {application.approved_by_detail.last_name}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {application.rejected_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Solicitud Rechazada</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.rejected_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              {application.disbursed_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 bg-emerald-500 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Crédito Desembolsado</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.disbursed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Producto */}
          {application.product_detail && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Producto</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Rango de Monto:</span>
                  <p className="text-gray-900">
                    ${parseFloat(application.product_detail.min_amount).toLocaleString()} - 
                    ${parseFloat(application.product_detail.max_amount).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Rango de Plazo:</span>
                  <p className="text-gray-900">
                    {application.product_detail.min_term_months} - {application.product_detail.max_term_months} meses
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Tasa de Interés:</span>
                  <p className="text-gray-900">
                    {application.product_detail.interest_rate}% anual
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showSubmitModal && (
        <SubmitApplicationModal
          applicationId={application.id}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      
      {showReviewModal && (
        <ReviewApplicationModal
          applicationId={application.id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      
      {showApproveModal && (
        <ApproveApplicationModal
          applicationId={application.id}
          application={application}
          onClose={() => setShowApproveModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      
      {showRejectModal && (
        <RejectApplicationModal
          applicationId={application.id}
          onClose={() => setShowRejectModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      
      {showDisburseModal && (
        <DisburseApplicationModal
          applicationId={application.id}
          application={application}
          onClose={() => setShowDisburseModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}