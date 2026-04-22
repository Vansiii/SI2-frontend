import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { LimitWarningBanner } from '../../../components/subscription/LimitWarningBanner';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useAuth } from '../../auth/hooks/useAuth';
import { checkResourceLimit } from '../../../utils/subscriptionLimits';
import { BranchForm } from '../components/BranchForm';
import { BranchTable } from '../components/BranchTable';
import { createBranch, deactivateBranch, getBranches, updateBranch } from '../services/branchesApi';
import type { Branch, CreateBranchData } from '../types';

const PAGE_SIZE = 20;

type StatusFilter = 'all' | 'active' | 'inactive';

function isTenantAdminRole(roles: string[]) {
  return roles.some((role) => role.toLowerCase().includes('admin'));
}

export function BranchListPage() {
  const navigate = useNavigate();
  const { roles, userType } = useAuth();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const [limitWarning, setLimitWarning] = useState<{
    currentUsage: number;
    maxLimit: number;
    usagePercentage: number;
  } | null>(null);
  const [createBranchBlocked, setCreateBranchBlocked] = useState(false);
  const [createBranchBlockedMessage, setCreateBranchBlockedMessage] = useState<string | null>(null);

  const isTenantAdmin = useMemo(
    () => userType === 'tenant_user' && isTenantAdminRole(roles),
    [roles, userType]
  );

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isActiveFilter =
        statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false;

      const response = await getBranches({
        page: currentPage,
        page_size: PAGE_SIZE,
        is_active: isActiveFilter,
      });

      setBranches(response.results);
      setTotalPages(response.total_pages || 1);
      setTotalCount(response.count || 0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('No se pudieron cargar las sucursales.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  const loadBranchCreationLimit = useCallback(async () => {
    try {
      const limitCheck = await checkResourceLimit('branches');
      if (!limitCheck.allowed) {
        setCreateBranchBlocked(true);
        setCreateBranchBlockedMessage(
          limitCheck.message || 'Límite de sucursales alcanzado para tu plan.'
        );
        return;
      }

      setCreateBranchBlocked(false);
      setCreateBranchBlockedMessage(null);
    } catch {
      setCreateBranchBlocked(false);
      setCreateBranchBlockedMessage(null);
    }
  }, []);

  useEffect(() => {
    if (!isTenantAdmin) {
      navigate('/home', { replace: true });
      return;
    }

    loadBranches();
    loadBranchCreationLimit();
  }, [isTenantAdmin, loadBranches, loadBranchCreationLimit, navigate]);

  const openCreateForm = () => {
    if (createBranchBlocked) {
      const message = createBranchBlockedMessage || 'Límite de sucursales alcanzado para tu plan.';
      setError(message);
      setFormError(message);
      return;
    }

    setFormError(null);
    setFieldErrors({});
    setSelectedBranch(null);
    setIsFormOpen(true);
  };

  const openEditForm = (branch: Branch) => {
    setFormError(null);
    setFieldErrors({});
    setSelectedBranch(branch);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedBranch(null);
    setFormError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (data: CreateBranchData) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      setFormError(null);
      setFieldErrors({});

      if (!selectedBranch) {
        const limitCheck = await checkResourceLimit('branches');

        if (!limitCheck.allowed) {
          const limitMessage = limitCheck.message || 'Límite de sucursales alcanzado para tu plan.';
          setError(limitMessage);
          setFormError(limitMessage);
          return;
        }

        if (limitCheck.shouldWarn) {
          setLimitWarning({
            currentUsage: limitCheck.currentUsage,
            maxLimit: limitCheck.maxLimit,
            usagePercentage: limitCheck.usagePercentage,
          });
        }

        await createBranch(data);
        setSuccess('Sucursal creada exitosamente.');
      } else {
        await updateBranch(selectedBranch.id, data);
        setSuccess('Sucursal actualizada exitosamente.');
      }

      closeForm();
      await loadBranches();
      await loadBranchCreationLimit();
    } catch (err: unknown) {
      if (err instanceof Error && 'fieldErrors' in err) {
        const apiFieldErrors = (err as { fieldErrors?: Record<string, string> }).fieldErrors || {};
        setFieldErrors(apiFieldErrors);
        if (Object.keys(apiFieldErrors).length === 0) {
          setError(err.message);
          setFormError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
        setFormError(err.message);
      } else {
        const genericMessage = 'No se pudo guardar la sucursal.';
        setError(genericMessage);
        setFormError(genericMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    const confirmed = window.confirm(
      `¿Deseas desactivar la sucursal "${branch.name}"? Esta acción se puede revertir editando su estado.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const response = await deactivateBranch(branch.id);
      setSuccess(response.message || 'Sucursal desactivada exitosamente.');
      await loadBranches();
      await loadBranchCreationLimit();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('No se pudo desactivar la sucursal.');
      }
    }
  };

  const handleFilterChange = (nextFilter: StatusFilter) => {
    setStatusFilter(nextFilter);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingState message="Cargando sucursales..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Gestión de Sucursales
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalCount} {totalCount === 1 ? 'sucursal registrada' : 'sucursales registradas'}
          </p>
        </div>

        <div className="flex max-w-md flex-col items-start gap-2 md:items-end">
          <button
            onClick={openCreateForm}
            disabled={createBranchBlocked}
            title={createBranchBlockedMessage || undefined}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              createBranchBlocked
                ? 'cursor-not-allowed bg-slate-300 text-slate-600 shadow-none'
                : 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:shadow-[0_0_25px_rgba(37,99,235,0.35)]'
            }`}
          >
            <Plus className="h-4 w-4" />
            Nueva sucursal
          </button>

          {createBranchBlocked && createBranchBlockedMessage && (
            <p className="text-xs text-red-700 md:text-right">{createBranchBlockedMessage}</p>
          )}
        </div>
      </div>

      {limitWarning && (
        <LimitWarningBanner
          resourceType="sucursales"
          currentUsage={limitWarning.currentUsage}
          maxLimit={limitWarning.maxLimit}
          usagePercentage={limitWarning.usagePercentage}
          onClose={() => setLimitWarning(null)}
        />
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-medium text-slate-700" htmlFor="branch-status-filter">
            Filtrar por estado
          </label>
          <select
            id="branch-status-filter"
            value={statusFilter}
            onChange={(event) => handleFilterChange(event.target.value as StatusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      <BranchTable
        branches={branches}
        loading={loading}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-slate-600">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <BranchForm
          key={selectedBranch ? `edit-${selectedBranch.id}` : 'create'}
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={handleSubmit}
          branch={selectedBranch}
          submitting={submitting}
          fieldErrors={fieldErrors}
          submitError={formError}
        />
      )}
    </div>
  );
}
