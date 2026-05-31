import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { contractsApi } from '../services/contractsApi';
import { LoadingState } from '../../../components/ui/LoadingState';

export function ContractTemplatePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPreview = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const content = await contractsApi.previewTemplate(parseInt(id));
        setHtmlContent(content);
        setError('');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error al cargar la vista previa');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [id]);

  const handlePrint = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  if (loading) {
    return <LoadingState message="Cargando vista previa..." fullScreen={true} />;
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700">
          {error}
        </div>
        <button
          onClick={() => navigate('/contracts/templates')}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Plantillas
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header - No se imprime */}
      <div className="print:hidden bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/contracts/templates')}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Vista Previa de Plantilla</span>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Contenido de la vista previa - Simulando una hoja de papel */}
      <div className="max-w-[21cm] mx-auto p-6 md:p-8">
        <div className="bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden" style={{ minHeight: '29.7cm' }}>
          {/* Renderizar HTML de forma segura en un iframe con estilos */}
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      line-height: 1.6;
                      color: #333;
                      padding: 2cm;
                      margin: 0;
                      background: white;
                    }
                    h1, h2, h3, h4, h5, h6 {
                      color: #1e293b;
                      margin-top: 1.5em;
                      margin-bottom: 0.5em;
                    }
                    h1 { font-size: 2em; border-bottom: 2px solid #3b82f6; padding-bottom: 0.3em; }
                    h2 { font-size: 1.5em; }
                    h3 { font-size: 1.25em; }
                    p { margin: 1em 0; text-align: justify; }
                    ul, ol { margin: 1em 0; padding-left: 2em; }
                    li { margin: 0.5em 0; }
                    table { 
                      width: 100%; 
                      border-collapse: collapse; 
                      margin: 1em 0;
                    }
                    th, td { 
                      border: 1px solid #cbd5e1; 
                      padding: 0.75em; 
                      text-align: left; 
                    }
                    th { 
                      background-color: #f1f5f9; 
                      font-weight: 600;
                      color: #1e293b;
                    }
                    .signature-section {
                      margin-top: 3em;
                      page-break-inside: avoid;
                    }
                    .signature-line {
                      border-top: 1px solid #000;
                      margin-top: 3em;
                      padding-top: 0.5em;
                      text-align: center;
                    }
                    @media print {
                      body { padding: 1cm; }
                      .no-print { display: none; }
                    }
                  </style>
                </head>
                <body>
                  ${htmlContent}
                </body>
              </html>
            `}
            title="Vista previa de plantilla"
            className="w-full border-0"
            sandbox="allow-same-origin"
            style={{ height: '29.7cm', display: 'block' }}
          />
        </div>
      </div>

      {/* Nota informativa - No se imprime */}
      <div className="print:hidden max-w-[21cm] mx-auto px-6 pb-8 mt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <strong>Nota:</strong> Esta es una vista previa con datos de ejemplo. El contrato real
          utilizará los datos del cliente y la solicitud de crédito correspondiente.
        </div>
      </div>
    </div>
  );
}
