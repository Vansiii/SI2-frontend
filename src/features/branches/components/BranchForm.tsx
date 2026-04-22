import { useState } from 'react';
import { Building2, MapPin, Save } from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import type { Branch, CreateBranchData } from '../types';

interface BranchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBranchData) => Promise<void>;
  branch?: Branch | null;
  submitting?: boolean;
  fieldErrors?: Record<string, string>;
  submitError?: string | null;
}

export function BranchForm({
  isOpen,
  onClose,
  onSubmit,
  branch,
  submitting = false,
  fieldErrors = {},
  submitError = null,
}: BranchFormProps) {
  const isEditing = Boolean(branch);

  const [formData, setFormData] = useState({
    name: branch?.name ?? '',
    address: branch?.address ?? '',
    city: branch?.city ?? '',
    is_active: branch?.is_active ?? true,
  });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido.';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida.';
    }

    setLocalErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      is_active: formData.is_active,
    });
  };

  const mergedErrors = {
    ...localErrors,
    ...fieldErrors,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <Input
          id="branch-name"
          label="Nombre de la sucursal"
          placeholder="Ej: Sucursal Central"
          icon={<Building2 className="h-4 w-4" />}
          value={formData.name}
          onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
          error={mergedErrors.name}
          disabled={submitting}
        />

        <Input
          id="branch-address"
          label="Dirección"
          placeholder="Ej: Av. Principal #123"
          icon={<MapPin className="h-4 w-4" />}
          value={formData.address}
          onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
          error={mergedErrors.address}
          disabled={submitting}
        />

        <Input
          id="branch-city"
          label="Ciudad"
          placeholder="Ej: La Paz"
          value={formData.city}
          onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))}
          error={mergedErrors.city}
          disabled={submitting}
        />

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, is_active: event.target.checked }))
            }
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          Sucursal activa
        </label>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={submitting}>
            <Save className="h-4 w-4" />
            {isEditing ? 'Guardar Cambios' : 'Crear Sucursal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
