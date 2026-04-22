import { Building2, Edit2, MapPin, Power, Trash2, Users } from 'lucide-react';

import type { Branch } from '../types';

interface BranchTableProps {
  branches: Branch[];
  loading: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
}

export function BranchTable({ branches, loading, onEdit, onDelete }: BranchTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Cargando sucursales...
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-500">No hay sucursales registradas para este filtro.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sucursal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Asignaciones
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {branches.map((branch) => (
              <tr key={branch.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 align-top">
                  <div className="font-semibold text-slate-900">{branch.name}</div>
                  <div className="text-xs text-slate-500">
                    Creada: {new Date(branch.created_at).toLocaleDateString('es-BO')}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <div>{branch.address}</div>
                      <div className="text-xs text-slate-500">{branch.city}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-sm text-slate-700">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users className="h-3.5 w-3.5" />
                    {branch.assigned_users_count} usuarios
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {branch.assigned_operations_count} operaciones
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      branch.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {branch.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(branch)}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      title="Editar sucursal"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(branch)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      title="Desactivar sucursal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
