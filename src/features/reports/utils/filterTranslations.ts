/**
 * Traducciones de filtros y campos al español
 */

export const FILTER_LABELS: Record<string, string> = {
  // ========== CAMPOS GENERALES ==========
  'status': 'Estado',
  'risk_level': 'Nivel de Riesgo',
  'created_at': 'Fecha de Creación',
  'created_at_start': 'Fecha de Creación Desde',
  'created_at_end': 'Fecha de Creación Hasta',
  'updated_at': 'Fecha de Actualización',
  'is_active': 'Activo',
  
  // ========== CRÉDITOS ==========
  'application_number': 'Número de Solicitud',
  'credit_score': 'Puntaje de Crédito',
  'credit_score_min': 'Puntaje de Crédito Mínimo',
  'credit_score_max': 'Puntaje de Crédito Máximo',
  'requested_amount': 'Monto Solicitado',
  'requested_amount_min': 'Monto Solicitado Mínimo',
  'requested_amount_max': 'Monto Solicitado Máximo',
  'approved_amount': 'Monto Aprobado',
  'approved_amount_min': 'Monto Aprobado Mínimo',
  'approved_amount_max': 'Monto Aprobado Máximo',
  'term_months': 'Plazo (meses)',
  'term_months_min': 'Plazo Mínimo (meses)',
  'term_months_max': 'Plazo Máximo (meses)',
  'approved_term_months': 'Plazo Aprobado (meses)',
  'approved_interest_rate': 'Tasa de Interés Aprobada',
  'monthly_payment': 'Pago Mensual',
  'monthly_income': 'Ingreso Mensual',
  'monthly_income_min': 'Ingreso Mensual Mínimo',
  'monthly_income_max': 'Ingreso Mensual Máximo',
  'employment_type': 'Tipo de Empleo',
  'employment_status': 'Estado de Empleo',
  'debt_to_income_ratio': 'Ratio Deuda/Ingreso',
  'identity_verification_status': 'Estado de Verificación de Identidad',
  'documents_status': 'Estado de Documentos',
  'document_status': 'Estado del Documento',
  'submitted_at': 'Fecha de Envío',
  'submitted_at_start': 'Fecha de Envío Desde',
  'submitted_at_end': 'Fecha de Envío Hasta',
  'reviewed_at': 'Fecha de Revisión',
  'approved_at': 'Fecha de Aprobación',
  'approved_at_start': 'Fecha de Aprobación Desde',
  'approved_at_end': 'Fecha de Aprobación Hasta',
  'rejected_at': 'Fecha de Rechazo',
  'disbursed_at': 'Fecha de Desembolso',
  'purpose': 'Propósito',
  'assigned_to_id': 'Asignado a',
  
  // ========== SUCURSALES Y PRODUCTOS ==========
  'branch_id': 'Sucursal',
  'product_id': 'Producto',
  'product_type': 'Tipo de Producto',
  'approval_rate_min': 'Tasa de Aprobación Mínima (%)',
  'approval_rate_max': 'Tasa de Aprobación Máxima (%)',
  
  // ========== CLIENTES ==========
  'document_number': 'Número de Documento',
  'document_type': 'Tipo de Documento',
  'document_type_id': 'Tipo de Documento',
  'full_name': 'Nombre Completo',
  'email': 'Correo Electrónico',
  'mobile_phone': 'Teléfono Móvil',
  'phone': 'Teléfono',
  'birth_date': 'Fecha de Nacimiento',
  'birth_date_start': 'Fecha de Nacimiento Desde',
  'birth_date_end': 'Fecha de Nacimiento Hasta',
  'gender': 'Género',
  'client_type': 'Tipo de Cliente',
  'kyc_status': 'Estado KYC',
  'verified_at': 'Fecha de Verificación',
  'verified_at_start': 'Fecha de Verificación Desde',
  'verified_at_end': 'Fecha de Verificación Hasta',
  'city': 'Ciudad',
  'department': 'Departamento',
  'country': 'País',
  'has_active_loans': 'Tiene Créditos Activos',
  
  // ========== DOCUMENTOS ==========
  'application_status': 'Estado de Solicitud',
  'days_since_submission': 'Días desde Envío',
  'days_since_submission_min': 'Días desde Envío Mínimo',
  'days_since_submission_max': 'Días desde Envío Máximo',
  'completion_percentage': '% Completitud',
  'completion_percentage_min': '% Completitud Mínimo',
  'completion_percentage_max': '% Completitud Máximo',
  
  // ========== VERIFICACIÓN DE IDENTIDAD ==========
  'decision': 'Decisión',
  'provider': 'Proveedor',
  'started_at': 'Fecha de Inicio',
  'started_at_start': 'Fecha de Inicio Desde',
  'started_at_end': 'Fecha de Inicio Hasta',
  'completed_at': 'Fecha de Finalización',
  'completed_at_start': 'Fecha de Finalización Desde',
  'completed_at_end': 'Fecha de Finalización Hasta',
  'processing_time_min': 'Tiempo de Procesamiento Mínimo (min)',
  'processing_time_max': 'Tiempo de Procesamiento Máximo (min)',
  
  // ========== AUDITORÍA ==========
  'action': 'Acción',
  'user_id': 'Usuario',
  'ip_address': 'Dirección IP',
  'event_type': 'Tipo de Evento',
  'severity': 'Severidad',
  'resource_type': 'Tipo de Recurso',
  'resource_id': 'ID de Recurso',
  
  // ========== TENANTS (SAAS) ==========
  'institution_type': 'Tipo de Institución',
  'subscription_status': 'Estado de Suscripción',
  'plan_name': 'Plan',
  'users_count_min': 'Usuarios Mínimos',
  'users_count_max': 'Usuarios Máximos',
  'branches_count_min': 'Sucursales Mínimas',
  'branches_count_max': 'Sucursales Máximas',
  
  // ========== USUARIOS ==========
  'is_staff': 'Es Staff',
  'tenant_id': 'Tenant',
  'role': 'Rol',
  'last_login_start': 'Último Login Desde',
  'last_login_end': 'Último Login Hasta',
  'email_verified': 'Email Verificado',
  
  // ========== SUSCRIPCIONES ==========
  'payment_status': 'Estado de Pago',
  'plan_id': 'Plan',
  'start_date': 'Fecha de Inicio',
  'start_date_start': 'Fecha de Inicio Desde',
  'start_date_end': 'Fecha de Inicio Hasta',
  'end_date': 'Fecha de Fin',
  'end_date_start': 'Fecha de Fin Desde',
  'end_date_end': 'Fecha de Fin Hasta',
  'trial_end_date': 'Fin de Prueba',
  'trial_end_date_start': 'Fin de Prueba Desde',
  'trial_end_date_end': 'Fin de Prueba Hasta',
  'next_billing_date': 'Próxima Facturación',
  'next_billing_date_start': 'Próxima Facturación Desde',
  'next_billing_date_end': 'Próxima Facturación Hasta',
  'billing_cycle': 'Ciclo de Facturación',
  
  // ========== RANGOS ==========
  'date_range': 'Rango de Fechas',
  'date_field': 'Campo de Fecha',
  'amount_range': 'Rango de Monto',
};

export const FILTER_PLACEHOLDERS: Record<string, string> = {
  'status': 'Seleccione uno o más estados',
  'risk_level': 'Seleccione nivel de riesgo',
  'branch_id': 'Seleccione sucursal',
  'product_id': 'Seleccione producto',
  'employment_type': 'Seleccione tipo de empleo',
  'kyc_status': 'Seleccione estado KYC',
  'document_type': 'Seleccione tipo de documento',
  'identity_verification_status': 'Seleccione estado de verificación',
  'institution_type': 'Seleccione tipo de institución',
  'subscription_status': 'Seleccione estado de suscripción',
  'payment_status': 'Seleccione estado de pago',
  'plan_id': 'Seleccione plan',
  'tenant_id': 'Seleccione tenant',
  'date_range': 'Seleccione rango de fechas',
  'created_at': 'Seleccione fecha',
  'default': 'Ingrese valor',
};

export const CHART_TYPE_LABELS: Record<string, string> = {
  'donut': 'Dona',
  'pie': 'Pastel',
  'bar': 'Barras',
  'horizontal_bar': 'Barras Horizontales',
  'line': 'Líneas',
  'area': 'Área',
  'gauge': 'Medidor',
  'stacked_bar': 'Barras Apiladas',
};

export const BUTTON_LABELS = {
  preview: 'Vista Previa',
  generate: 'Generar Reporte',
  export: 'Exportar',
  excel: 'Excel',
  csv: 'CSV',
  pdf: 'PDF',
  clear: 'Limpiar todo',
  close: 'Cerrar',
  search: 'Buscar...',
  selectAll: 'Seleccionar todo',
  deselectAll: 'Deseleccionar todo',
};

export const MESSAGE_LABELS = {
  loading: 'Cargando...',
  loadingOptions: 'Cargando opciones...',
  loadingConfig: 'Cargando configuración del reporte...',
  generating: 'Generando...',
  error: 'Error',
  errorLoadingConfig: 'Error al cargar la configuración del reporte',
  errorGenerating: 'Error al generar el reporte',
  errorExporting: 'Error al exportar el reporte',
  noFilters: 'No hay filtros disponibles para este reporte',
  noData: 'No hay datos para mostrar',
  activeFilters: 'activo',
  activeFiltersPlural: 'activos',
  filters: 'Filtros',
  chartType: 'Tipo de Gráfico',
  reportGenerated: 'Reporte generado exitosamente',
};

/**
 * Obtiene el label traducido de un campo
 */
export function getFilterLabel(field: string): string {
  return FILTER_LABELS[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Obtiene el placeholder traducido de un campo
 */
export function getFilterPlaceholder(field: string): string {
  return FILTER_PLACEHOLDERS[field] || FILTER_PLACEHOLDERS.default;
}

/**
 * Obtiene el label traducido de un tipo de gráfico
 */
export function getChartTypeLabel(chartType: string): string {
  return CHART_TYPE_LABELS[chartType.toLowerCase()] || chartType;
}
