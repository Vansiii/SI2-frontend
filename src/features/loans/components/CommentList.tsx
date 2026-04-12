/**
 * Componente para listar y agregar comentarios de solicitud de crédito
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addLoanApplicationComment, type LoanApplicationComment } from '../services/loansApi';

interface FormData {
  comment: string;
  is_internal: boolean;
}

interface CommentListProps {
  applicationId: number;
  comments: LoanApplicationComment[];
  onCommentAdded: () => void;
}

export function CommentList({ applicationId, comments, onCommentAdded }: CommentListProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      is_internal: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await addLoanApplicationComment(
        applicationId,
        data.comment,
        data.is_internal
      );
      
      // Limpiar formulario
      reset();
      setShowForm(false);
      
      // Notificar al padre
      onCommentAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar el comentario');
    } finally {
      setLoading(false);
    }
  };

  const getCommentIcon = (isInternal: boolean) => {
    if (isInternal) {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con botón para agregar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Comentarios ({comments.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Comentario
        </button>
      </div>

      {/* Formulario para agregar comentario */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Nuevo Comentario</h4>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo de comentario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Comentario
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('is_internal')}
                    value="true"
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Interno (Solo visible para el equipo)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('is_internal')}
                    value="false"
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Externo (Visible para el cliente)
                  </span>
                </label>
              </div>
            </div>

            {/* Comentario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario *
              </label>
              <textarea
                {...register('comment')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Escribe tu comentario aquí..."
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  reset();
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Agregar Comentario'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de comentarios */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">No hay comentarios</p>
          <p className="text-gray-500">Agrega comentarios para documentar el proceso</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                {getCommentIcon(comment.is_internal)}
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {comment.user_name}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        comment.is_internal
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {comment.is_internal ? 'Interno' : 'Externo'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}