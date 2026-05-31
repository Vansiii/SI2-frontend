import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Save, Eye, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchTemplate, createTemplate, updateTemplate } from '../services/contractsApi';
import type { ContractTemplate } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';
import { apiClient } from '../../../utils/apiClient';

interface Product {
  id: number;
  name: string;
}

interface TemplateFormData {
  name: string;
  code: string;
  product: number;  // Ahora es obligatorio
  template_content: string;
  description: string;
  version: string;
  is_active: boolean;
  requires_guarantor_signature: boolean;
  terms_and_conditions: string;
}

export function ContractTemplateFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    code: '',
    product: null,
    template_content: '',
    description: '',
    version: '1.0',
    is_active: true,
    requires_guarantor_signature: false,
    terms_and_conditions: '',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Opciones de firma
  const [signatureOptions, setSignatureOptions] = useState({
    showDate: true,
    showBorrowerSignature: true,
    showInstitutionSignature: true,
    showGuarantorSignature: false,
    dateFormat: 'center' as 'center' | 'left' | 'right'
  });
  
  // Estado para el editor visual
  const [contractSections, setContractSections] = useState([
    {
      id: 1,
      title: 'OBJETO DEL CONTRATO',
      content: 'Por medio del presente contrato, EL PRESTAMISTA otorga a EL PRESTATARIO un préstamo por el monto de {{principal_amount}} (Monto Principal), correspondiente al producto {{product_name}}.',
      type: 'clause' as const
    },
    {
      id: 2,
      title: 'CONDICIONES FINANCIERAS',
      content: 'El préstamo se otorga bajo las siguientes condiciones:\n• Monto del Préstamo: {{principal_amount}}\n• Tasa de Interés Anual: {{interest_rate}}\n• Plazo: {{term_months}}\n• Cuota Mensual: {{monthly_payment}}\n• Monto Total a Pagar: {{total_amount}}',
      type: 'clause' as const
    },
    {
      id: 3,
      title: 'PLAZO Y FORMA DE PAGO',
      content: 'El préstamo tendrá una vigencia desde el {{start_date}} hasta el {{end_date}}. El primer pago vence el {{first_payment_date}}, y los pagos subsecuentes vencerán el mismo día de cada mes.',
      type: 'clause' as const
    }
  ]);

  useEffect(() => {
    loadProducts();
    if (isEditing && id) {
      loadTemplate(parseInt(id, 10));
    }
  }, [id, isEditing]);
  
  // Generar HTML automáticamente desde las secciones
  useEffect(() => {
    const generateHTML = () => {
      const selectedProduct = products.find(p => p.id === formData.product);
      const productName = selectedProduct?.name || 'Producto Crediticio';
      
      let html = `<div style="text-align: center; margin-bottom: 2em;">
  <h1>${formData.name || 'CONTRATO DE PRÉSTAMO'}</h1>
  <p><strong>Código:</strong> ${formData.code || '[CÓDIGO]'}</p>
  <p><strong>Versión:</strong> ${formData.version || '1.0'}</p>
  <p><strong>Producto:</strong> ${productName}</p>
  <p><strong>Número de Contrato:</strong> {{contract_number}}</p>
</div>

${formData.description ? `<div style="margin-bottom: 2em; padding: 1em; background-color: #f8fafc; border-left: 4px solid #3b82f6;">
  <p style="margin: 0; font-style: italic; color: #475569;">${formData.description}</p>
</div>

` : ''}
<div style="margin-bottom: 2em;">
  <h2>PARTES DEL CONTRATO</h2>
  
  <p><strong>EL PRESTAMISTA:</strong></p>
  <p>
    <strong>Nombre:</strong> {{institution_name}}<br>
    <strong>NIT:</strong> {{institution_nit}}<br>
    <strong>Dirección:</strong> {{institution_address}}<br>
    <strong>Teléfono:</strong> {{institution_phone}}<br>
    <strong>Email:</strong> {{institution_email}}
  </p>

  <p><strong>EL PRESTATARIO:</strong></p>
  <p>
    <strong>Nombre:</strong> {{borrower_name}}<br>
    <strong>Documento:</strong> {{borrower_document}}<br>
    <strong>Dirección:</strong> {{borrower_address}}<br>
    <strong>Teléfono:</strong> {{borrower_phone}}<br>
    <strong>Email:</strong> {{borrower_email}}
  </p>
</div>

`;

      contractSections.forEach((section, index) => {
        const clauseNumber = ['PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SÉPTIMA', 'OCTAVA', 'NOVENA', 'DÉCIMA'][index] || `${index + 1}`;
        
        // Convertir saltos de línea y bullets a HTML
        let content = section.content
          .replace(/\n•/g, '<br>•')
          .replace(/\n/g, '<br>');
        
        html += `<div style="margin-bottom: 2em;">
  <h2>CLÁUSULA ${clauseNumber}: ${section.title}</h2>
  <p>${content}</p>
</div>

`;
      });

      // Agregar términos y condiciones si existen
      if (formData.terms_and_conditions && formData.terms_and_conditions.trim()) {
        html += `<div style="margin-bottom: 2em; margin-top: 3em; padding-top: 2em; border-top: 2px solid #cbd5e1;">
  <h2>TÉRMINOS Y CONDICIONES</h2>
  <p style="font-size: 0.9em; line-height: 1.6;">${formData.terms_and_conditions.replace(/\n/g, '<br>')}</p>
</div>

`;
      }

      // Fecha del contrato
      if (signatureOptions.showDate) {
        const dateAlign = signatureOptions.dateFormat === 'center' ? 'center' : signatureOptions.dateFormat === 'left' ? 'left' : 'right';
        html += `<div style="margin-top: 4em;">
  <p style="text-align: ${dateAlign};">
    <strong>Fecha del Contrato:</strong> {{contract_date}}
  </p>
</div>

`;
      }

      // Sección de firmas
      const signatures = [];
      if (signatureOptions.showInstitutionSignature) {
        signatures.push(`  <div style="text-align: center; width: ${signatureOptions.showBorrowerSignature || signatureOptions.showGuarantorSignature ? '45%' : '100%'};">
    <div style="border-top: 1px solid #000; padding-top: 0.5em; margin-top: 3em;">
      <strong>{{institution_name}}</strong><br>
      <small>EL PRESTAMISTA</small>
    </div>
  </div>`);
      }
      
      if (signatureOptions.showBorrowerSignature) {
        signatures.push(`  <div style="text-align: center; width: ${signatureOptions.showInstitutionSignature || signatureOptions.showGuarantorSignature ? '45%' : '100%'};">
    <div style="border-top: 1px solid #000; padding-top: 0.5em; margin-top: 3em;">
      <strong>{{borrower_name}}</strong><br>
      <small>EL PRESTATARIO</small>
    </div>
  </div>`);
      }
      
      if (signatureOptions.showGuarantorSignature) {
        signatures.push(`  <div style="text-align: center; width: ${signatures.length > 0 ? '45%' : '100%'};">
    <div style="border-top: 1px solid #000; padding-top: 0.5em; margin-top: 3em;">
      <strong>{{guarantor_name}}</strong><br>
      <small>EL GARANTE</small>
    </div>
  </div>`);
      }

      if (signatures.length > 0) {
        html += `<div style="margin-top: 4em; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 2em;">
${signatures.join('\n')}
</div>`;
      }

      setFormData(prev => ({ ...prev, template_content: html }));
    };
    
    if (products.length > 0 || !isEditing) {
      generateHTML();
    }
  }, [contractSections, formData.name, formData.code, formData.version, formData.product, formData.description, formData.terms_and_conditions, products, isEditing, signatureOptions]);

  const loadProducts = async () => {
    try {
      const response = await apiClient.get<{ results: Product[] }>('/products/');
      // La API devuelve una respuesta paginada con los productos en 'results'
      if (response && Array.isArray(response.results)) {
        setProducts(response.results);
      } else if (Array.isArray(response)) {
        // Por si acaso la API devuelve un array directo
        setProducts(response);
      } else {
        console.error('La respuesta de productos no tiene el formato esperado:', response);
        setProducts([]);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
      setProducts([]);
    }
  };

  const loadTemplate = async (templateId: number) => {
    try {
      const data = await fetchTemplate(templateId);
      setFormData({
        name: data.name,
        code: data.code,
        product: data.product,
        template_content: data.template_content,
        description: data.description,
        version: data.version,
        is_active: data.is_active,
        requires_guarantor_signature: data.requires_guarantor_signature,
        terms_and_conditions: data.terms_and_conditions,
      });
      
      // Sincronizar opciones de firma
      setSignatureOptions(prev => ({
        ...prev,
        showGuarantorSignature: data.requires_guarantor_signature
      }));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar la plantilla');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validar que se haya seleccionado un producto
    if (!formData.product) {
      setError('Debe seleccionar un producto crediticio');
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing && id) {
        await updateTemplate(parseInt(id, 10), formData);
      } else {
        await createTemplate(formData);
      }
      navigate('/contracts/templates');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Hubo un error al guardar la plantilla.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'product') {
      setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value, 10) : null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const insertVariable = (variable: string, sectionId: number) => {
    setContractSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: section.content + ` {{${variable}}}`
        };
      }
      return section;
    }));
  };
  
  const addSection = () => {
    const newId = Math.max(...contractSections.map(s => s.id), 0) + 1;
    setContractSections(prev => [...prev, {
      id: newId,
      title: 'NUEVA CLÁUSULA',
      content: 'Contenido de la cláusula...',
      type: 'clause' as const
    }]);
  };
  
  const removeSection = (id: number) => {
    setContractSections(prev => prev.filter(s => s.id !== id));
  };
  
  const updateSection = (id: number, field: 'title' | 'content', value: string) => {
    setContractSections(prev => prev.map(section => {
      if (section.id === id) {
        return { ...section, [field]: value };
      }
      return section;
    }));
  };
  
  const moveSectionUp = (id: number) => {
    setContractSections(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index > 0) {
        const newSections = [...prev];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        return newSections;
      }
      return prev;
    });
  };
  
  const moveSectionDown = (id: number) => {
    setContractSections(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index < prev.length - 1) {
        const newSections = [...prev];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        return newSections;
      }
      return prev;
    });
  };

  if (loading) {
    return <LoadingState message="Cargando plantilla..." fullScreen={true} />;
  }

  const availableVariables = [
    {
      category: 'Institución',
      variables: [
        { key: 'institution_name', label: 'Nombre de la Institución' },
        { key: 'institution_address', label: 'Dirección' },
        { key: 'institution_nit', label: 'NIT/RUC' },
        { key: 'institution_phone', label: 'Teléfono' },
        { key: 'institution_email', label: 'Email' },
      ]
    },
    {
      category: 'Prestatario',
      variables: [
        { key: 'borrower_name', label: 'Nombre Completo' },
        { key: 'borrower_document', label: 'Documento de Identidad' },
        { key: 'borrower_address', label: 'Dirección' },
        { key: 'borrower_email', label: 'Email' },
        { key: 'borrower_phone', label: 'Teléfono' },
      ]
    },
    {
      category: 'Contrato',
      variables: [
        { key: 'contract_number', label: 'Número de Contrato' },
        { key: 'contract_date', label: 'Fecha del Contrato' },
        { key: 'start_date', label: 'Fecha de Inicio' },
        { key: 'end_date', label: 'Fecha de Finalización' },
      ]
    },
    {
      category: 'Términos Financieros',
      variables: [
        { key: 'principal_amount', label: 'Monto del Préstamo' },
        { key: 'interest_rate', label: 'Tasa de Interés (%)' },
        { key: 'term_months', label: 'Plazo (meses)' },
        { key: 'monthly_payment', label: 'Cuota Mensual' },
        { key: 'total_amount', label: 'Monto Total a Pagar' },
        { key: 'first_payment_date', label: 'Fecha Primer Pago' },
      ]
    },
    {
      category: 'Garante',
      variables: [
        { key: 'guarantor_name', label: 'Nombre del Garante' },
        { key: 'guarantor_document', label: 'Documento del Garante' },
      ]
    },
    {
      category: 'Producto',
      variables: [
        { key: 'product_name', label: 'Nombre del Producto' },
        { key: 'product_description', label: 'Descripción del Producto' },
      ]
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/contracts/templates"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              {isEditing ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {isEditing
                ? 'Actualiza la plantilla de contrato.'
                : 'Define una nueva plantilla HTML personalizable.'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre de la Plantilla *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                placeholder="Ej. Contrato de Crédito Personal"
              />
            </div>

            <div>
              <label htmlFor="code" className="mb-2 block text-sm font-semibold text-slate-700">
                Código *
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                placeholder="Ej. CONT-PERSONAL-V1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="version" className="mb-2 block text-sm font-semibold text-slate-700">
                Versión *
              </label>
              <input
                id="version"
                name="version"
                type="text"
                required
                value={formData.version}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                placeholder="Ej. 1.0"
              />
            </div>

            <div>
              <label htmlFor="product" className="mb-2 block text-sm font-semibold text-slate-700">
                Producto Crediticio *
              </label>
              <select
                id="product"
                name="product"
                required
                value={formData.product || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              >
                <option value="">Seleccione un producto crediticio</option>
                {Array.isArray(products) && products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Cada plantilla debe estar asociada a un producto específico
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm resize-none"
              placeholder="Describe el propósito de esta plantilla..."
            />
          </div>

          {/* Editor Visual de Cláusulas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-700">
                Cláusulas del Contrato *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                >
                  <Plus className="h-3 w-3" />
                  Agregar Cláusula
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg transition-all"
                >
                  <Eye className="h-3 w-3" />
                  {showPreview ? 'Ocultar' : 'Ver'} Preview
                </button>
              </div>
            </div>

            {/* Secciones editables */}
            <div className="space-y-4 mb-4">
              {contractSections.map((section, index) => (
                <div key={section.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Título de la cláusula"
                      />
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => moveSectionUp(section.id)}
                        disabled={index === 0}
                        className="p-1 text-slate-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover arriba"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSectionDown(section.id)}
                        disabled={index === contractSections.length - 1}
                        className="p-1 text-slate-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover abajo"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder="Contenido de la cláusula... Usa {{variable}} para insertar datos dinámicos"
                  />
                  
                  {/* Variables rápidas para esta sección */}
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Insertar variable:</p>
                    <div className="flex flex-wrap gap-1">
                      {availableVariables.flatMap(g => g.variables).slice(0, 8).map((variable) => (
                        <button
                          key={variable.key}
                          type="button"
                          onClick={() => insertVariable(variable.key, section.id)}
                          className="px-2 py-0.5 text-[10px] bg-white border border-slate-300 rounded text-slate-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all"
                          title={variable.label}
                        >
                          {variable.key}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* HTML generado (oculto) */}
            <input type="hidden" name="template_content" value={formData.template_content} />

            {showPreview && (
              <div className="mt-4 bg-slate-100 rounded-xl p-6">
                <div className="max-w-[21cm] mx-auto">
                  <div className="bg-white rounded-lg shadow-lg border border-slate-300 overflow-hidden" style={{ minHeight: '29.7cm' }}>
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="UTF-8">
                            <style>
                              * {
                                box-sizing: border-box;
                              }
                              body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                line-height: 1.8;
                                color: #1e293b;
                                padding: 2cm;
                                margin: 0;
                                background: white;
                                font-size: 11pt;
                              }
                              h1 {
                                font-size: 1.8em;
                                color: #0f172a;
                                margin: 0 0 0.5em 0;
                                padding-bottom: 0.3em;
                                border-bottom: 3px solid #3b82f6;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                              }
                              h2 {
                                font-size: 1.2em;
                                color: #334155;
                                margin: 1.5em 0 0.8em 0;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.3px;
                              }
                              h3 {
                                font-size: 1.1em;
                                color: #475569;
                                margin: 1.2em 0 0.6em 0;
                                font-weight: 600;
                              }
                              p {
                                margin: 0.8em 0;
                                text-align: justify;
                                line-height: 1.8;
                              }
                              strong {
                                font-weight: 600;
                                color: #0f172a;
                              }
                              ul, ol {
                                margin: 1em 0;
                                padding-left: 2.5em;
                                line-height: 1.8;
                              }
                              li {
                                margin: 0.6em 0;
                              }
                              table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 1.5em 0;
                              }
                              th, td {
                                border: 1px solid #cbd5e1;
                                padding: 0.8em;
                                text-align: left;
                              }
                              th {
                                background-color: #f1f5f9;
                                font-weight: 600;
                                color: #1e293b;
                              }
                              .signature-section {
                                margin-top: 4em;
                                page-break-inside: avoid;
                              }
                              .signature-line {
                                border-top: 2px solid #000;
                                margin-top: 4em;
                                padding-top: 0.5em;
                                text-align: center;
                              }
                              br {
                                display: block;
                                margin: 0.3em 0;
                                content: "";
                              }
                              div {
                                display: block;
                              }
                              small {
                                font-size: 0.85em;
                                color: #64748b;
                              }
                              @media print {
                                body {
                                  padding: 1cm;
                                }
                              }
                            </style>
                          </head>
                          <body>
                            ${formData.template_content
                              .replace(/\{\{institution_name\}\}/g, 'Banco Ejemplo S.A.')
                              .replace(/\{\{institution_address\}\}/g, 'Av. Principal 123, Ciudad')
                              .replace(/\{\{institution_nit\}\}/g, '123456789-0')
                              .replace(/\{\{institution_phone\}\}/g, '+591 2 1234567')
                              .replace(/\{\{institution_email\}\}/g, 'info@bancoejemplo.com')
                              .replace(/\{\{borrower_name\}\}/g, 'Juan Pérez García')
                              .replace(/\{\{borrower_document\}\}/g, '12345678')
                              .replace(/\{\{borrower_address\}\}/g, 'Calle Secundaria 456, Zona Norte')
                              .replace(/\{\{borrower_email\}\}/g, 'juan.perez@email.com')
                              .replace(/\{\{borrower_phone\}\}/g, '+591 7 9876543')
                              .replace(/\{\{contract_number\}\}/g, 'CONT-2024-0001')
                              .replace(/\{\{contract_date\}\}/g, '15 de Enero de 2024')
                              .replace(/\{\{start_date\}\}/g, '20 de Enero de 2024')
                              .replace(/\{\{end_date\}\}/g, '20 de Enero de 2026')
                              .replace(/\{\{principal_amount\}\}/g, 'Bs. 50,000.00')
                              .replace(/\{\{interest_rate\}\}/g, '12.5%')
                              .replace(/\{\{term_months\}\}/g, '24 meses')
                              .replace(/\{\{monthly_payment\}\}/g, 'Bs. 2,358.50')
                              .replace(/\{\{total_amount\}\}/g, 'Bs. 56,604.00')
                              .replace(/\{\{first_payment_date\}\}/g, '20 de Febrero de 2024')
                              .replace(/\{\{guarantor_name\}\}/g, 'María López Rodríguez')
                              .replace(/\{\{guarantor_document\}\}/g, '87654321')
                              .replace(/\{\{product_name\}\}/g, 'Crédito Personal')
                              .replace(/\{\{product_description\}\}/g, 'Préstamo personal con tasa fija')
                            }
                          </body>
                        </html>
                      `}
                      title="Vista previa de plantilla"
                      className="w-full border-0"
                      sandbox="allow-same-origin"
                      style={{ height: '29.7cm', display: 'block' }}
                    />
                  </div>
                  <div className="mt-3 text-center text-xs text-slate-500">
                    Vista previa con datos de ejemplo
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Términos y Condiciones */}
          <div>
            <label
              htmlFor="terms_and_conditions"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Términos y Condiciones
            </label>
            <textarea
              id="terms_and_conditions"
              name="terms_and_conditions"
              rows={5}
              value={formData.terms_and_conditions}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm resize-y"
              placeholder="Términos y condiciones legales del contrato..."
            />
          </div>

          {/* Opciones de Firma y Fecha */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Configuración de Firmas y Fecha</h3>
            
            <div className="space-y-3">
              {/* Mostrar fecha */}
              <div className="flex items-center gap-3">
                <input
                  id="showDate"
                  type="checkbox"
                  checked={signatureOptions.showDate}
                  onChange={(e) => setSignatureOptions(prev => ({ ...prev, showDate: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="showDate" className="text-sm text-slate-700 cursor-pointer">
                  Mostrar fecha del contrato
                </label>
              </div>

              {/* Alineación de fecha */}
              {signatureOptions.showDate && (
                <div className="ml-7 flex items-center gap-4">
                  <span className="text-xs text-slate-600">Alineación:</span>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="dateFormat"
                      value="left"
                      checked={signatureOptions.dateFormat === 'left'}
                      onChange={(e) => setSignatureOptions(prev => ({ ...prev, dateFormat: 'left' }))}
                      className="h-3 w-3"
                    />
                    Izquierda
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="dateFormat"
                      value="center"
                      checked={signatureOptions.dateFormat === 'center'}
                      onChange={(e) => setSignatureOptions(prev => ({ ...prev, dateFormat: 'center' }))}
                      className="h-3 w-3"
                    />
                    Centro
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="dateFormat"
                      value="right"
                      checked={signatureOptions.dateFormat === 'right'}
                      onChange={(e) => setSignatureOptions(prev => ({ ...prev, dateFormat: 'right' }))}
                      className="h-3 w-3"
                    />
                    Derecha
                  </label>
                </div>
              )}

              {/* Firmas */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">Firmas a incluir:</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      id="showInstitutionSignature"
                      type="checkbox"
                      checked={signatureOptions.showInstitutionSignature}
                      onChange={(e) => setSignatureOptions(prev => ({ ...prev, showInstitutionSignature: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="showInstitutionSignature" className="text-sm text-slate-700 cursor-pointer">
                      Firma del Prestamista (Institución)
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="showBorrowerSignature"
                      type="checkbox"
                      checked={signatureOptions.showBorrowerSignature}
                      onChange={(e) => setSignatureOptions(prev => ({ ...prev, showBorrowerSignature: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="showBorrowerSignature" className="text-sm text-slate-700 cursor-pointer">
                      Firma del Prestatario
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="showGuarantorSignature"
                      type="checkbox"
                      checked={signatureOptions.showGuarantorSignature}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSignatureOptions(prev => ({ ...prev, showGuarantorSignature: checked }));
                        // Sincronizar con el campo del modelo
                        setFormData(prev => ({ ...prev, requires_guarantor_signature: checked }));
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="showGuarantorSignature" className="text-sm text-slate-700 cursor-pointer">
                      Firma del Garante
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-3 pt-2">
            {isEditing && (
              <div className="flex items-center gap-3">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Plantilla activa
                </label>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/contracts/templates"
              className="flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white/50 hover:bg-slate-50 transition-all font-medium text-sm w-full sm:w-auto"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex justify-center items-center gap-2 px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {submitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Plantilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
