import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ImageIcon, Palette, RotateCcw, Save, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoadingState } from '../../../components/ui/LoadingState';
import { buildDefaultTenantBrandingDraft, buildTenantBrandingCssVariables, DEFAULT_BRANDING_COLORS } from '../brandingTheme';
import { resetTenantBranding, saveTenantBranding } from '../services/brandingApi';
import type { TenantBranding } from '../../../types';

type BrandingFormState = {
  display_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
};

const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_LOGO_SIZE_MB = 5;

function brandingToForm(branding: TenantBranding, fallbackName: string): BrandingFormState {
  return {
    display_name: branding.display_name || fallbackName,
    primary_color: branding.primary_color || DEFAULT_BRANDING_COLORS.primary,
    secondary_color: branding.secondary_color || DEFAULT_BRANDING_COLORS.secondary,
    accent_color: branding.accent_color || DEFAULT_BRANDING_COLORS.accent,
    background_color: branding.background_color || DEFAULT_BRANDING_COLORS.background,
    text_color: branding.text_color || DEFAULT_BRANDING_COLORS.text,
  };
}

function isValidHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith('#')) {
    return `#${trimmed.toUpperCase()}`;
  }

  const body = trimmed.slice(1);
  if (body.length === 3) {
    return `#${body
      .split('')
      .map((char) => char + char)
      .join('')
      .toUpperCase()}`;
  }

  return `#${body.toUpperCase()}`;
}

export function TenantBrandingPage() {
  const navigate = useNavigate();
  const { institution, tenantBranding, refreshTenantBranding, userType } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<BrandingFormState>(
    buildDefaultTenantBrandingDraft(institution?.name || 'Sistema')
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof BrandingFormState | 'logo', string>>>({});

  useEffect(() => {
    if (userType === 'saas_admin') {
      navigate('/home');
    }
  }, [navigate, userType]);

  useEffect(() => {
    if (tenantBranding && institution) {
      setForm(brandingToForm(tenantBranding, institution.name));
      setCurrentLogoUrl(tenantBranding.logo_url || null);
      setLoading(false);
      return;
    }

    if (institution) {
      setForm(buildDefaultTenantBrandingDraft(institution.name));
      setCurrentLogoUrl(null);
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [institution, tenantBranding]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const previewStyles = useMemo(() => {
    return buildTenantBrandingCssVariables({
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      accent_color: form.accent_color,
      background_color: form.background_color,
      text_color: form.text_color,
    });
  }, [form]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const updateField = (field: keyof BrandingFormState, value: string) => {
    clearMessages();
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    setFieldErrors((current) => ({ ...current, logo: undefined }));

    const file = event.target.files?.[0] || null;
    if (!file) {
      setLogoFile(null);
      setLogoPreviewUrl(null);
      return;
    }

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setFieldErrors((current) => ({ ...current, logo: 'Formato no permitido. Usa PNG, JPG, JPEG, WEBP o SVG.' }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      setFieldErrors((current) => ({ ...current, logo: 'El logo no puede superar los 5 MB.' }));
      event.target.value = '';
      return;
    }

    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof BrandingFormState | 'logo', string>> = {};

    if (!form.display_name.trim()) {
      nextErrors.display_name = 'El nombre visible es obligatorio.';
    }

    (['primary_color', 'secondary_color', 'accent_color', 'background_color', 'text_color'] as const).forEach((field) => {
      const value = form[field];
      if (!isValidHexColor(value)) {
        nextErrors[field] = 'Ingresa un color HEX válido.';
      }
    });

    if (logoFile) {
      if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
        nextErrors.logo = 'Formato no permitido. Usa PNG, JPG, JPEG, WEBP o SVG.';
      }
      if (logoFile.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
        nextErrors.logo = 'El logo no puede superar los 5 MB.';
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (): FormData => {
    const payload = new FormData();
    payload.append('display_name', form.display_name.trim());
    payload.append('primary_color', normalizeHex(form.primary_color));
    payload.append('secondary_color', normalizeHex(form.secondary_color));
    payload.append('accent_color', normalizeHex(form.accent_color));
    payload.append('background_color', normalizeHex(form.background_color));
    payload.append('text_color', normalizeHex(form.text_color));
    payload.append('is_active', 'true');

    if (logoFile) {
      payload.append('logo', logoFile);
    }

    return payload;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      clearMessages();
      const response = await saveTenantBranding(buildPayload());
      setSuccess(response.message);
      setCurrentLogoUrl(response.branding.logo_url || currentLogoUrl);
      setLogoFile(null);
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(null);
      }
      await refreshTenantBranding();
      if (response.branding) {
        setForm(brandingToForm(response.branding, institution?.name || response.branding.display_name));
        setCurrentLogoUrl(response.branding.logo_url || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible guardar la personalización.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Restaurar la apariencia por defecto del tenant?')) {
      return;
    }

    try {
      setSaving(true);
      clearMessages();
      const response = await resetTenantBranding();
      setForm(brandingToForm(response.branding, institution?.name || response.branding.display_name));
      setCurrentLogoUrl(null);
      setLogoFile(null);
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(null);
      }
      setSuccess(response.message);
      await refreshTenantBranding();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible restaurar los valores por defecto.');
    } finally {
      setSaving(false);
    }
  };

  const renderLogo = () => {
    const source = logoPreviewUrl || currentLogoUrl;

    if (source) {
      return (
        <img
          src={source}
          alt={form.display_name}
          className="h-14 w-14 rounded-2xl object-contain bg-white border border-slate-200 p-2 shadow-sm"
        />
      );
    }

    return (
      <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-(--tenant-primary) text-(--tenant-on-primary) font-bold shadow-md">
        {form.display_name.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return <LoadingState message="Cargando personalización visual..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </button>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5" />
          White label del tenant
        </span>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 md:p-7 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Personalización Visual</h1>
                <p className="text-sm text-slate-500 mt-1">Configura el logo, nombre visible y colores del tenant sin intervención técnica.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            {renderLogo()}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Tenant actual</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{institution?.name}</p>
              <p className="text-xs text-slate-500 truncate">Vista previa en tiempo real</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {success && (
          <div className="mt-5">
            <Alert variant="success">{success}</Alert>
          </div>
        )}
      </div>

      <form id="tenant-branding-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6 md:p-7 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Datos de marca</h2>
              <p className="text-sm text-slate-500 mt-1">Estos datos se aplican solo al tenant actual y se persistirán en backend.</p>
            </div>

            <Input
              id="display_name"
              label="Nombre visible de la entidad financiera"
              value={form.display_name}
              onChange={(event) => updateField('display_name', event.target.value)}
              error={fieldErrors.display_name}
              placeholder="Ej. Banco Central de Crédito"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="logo">
                Logo principal
              </label>
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex items-center gap-4">
                  {renderLogo()}
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Formato admitido: PNG, JPG, JPEG, WEBP o SVG</p>
                    <p>Tamaño máximo: {MAX_LOGO_SIZE_MB} MB</p>
                  </div>
                </div>
                <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors w-fit cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Seleccionar logo
                  <input
                    id="logo"
                    type="file"
                    accept={ALLOWED_LOGO_TYPES.join(',')}
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>
                {fieldErrors.logo && <p className="text-xs text-red-600">{fieldErrors.logo}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="primary_color"
                label="Color primario"
                value={form.primary_color}
                onChange={(event) => updateField('primary_color', event.target.value)}
                error={fieldErrors.primary_color}
                placeholder="#2563EB"
              />
              <Input
                id="secondary_color"
                label="Color secundario"
                value={form.secondary_color}
                onChange={(event) => updateField('secondary_color', event.target.value)}
                error={fieldErrors.secondary_color}
                placeholder="#0F172A"
              />
              <Input
                id="accent_color"
                label="Color de acento"
                value={form.accent_color}
                onChange={(event) => updateField('accent_color', event.target.value)}
                error={fieldErrors.accent_color}
                placeholder="#0EA5E9"
              />
              <Input
                id="background_color"
                label="Color de fondo/superficie"
                value={form.background_color}
                onChange={(event) => updateField('background_color', event.target.value)}
                error={fieldErrors.background_color}
                placeholder="#F8FAFC"
              />
              <Input
                id="text_color"
                label="Color de texto principal"
                value={form.text_color}
                onChange={(event) => updateField('text_color', event.target.value)}
                error={fieldErrors.text_color}
                placeholder="#0F172A"
              />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6 md:p-7">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Ayuda rápida</h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Los colores aceptan solo HEX. Se normalizan automáticamente al guardar.</li>
              <li>• El logo se almacena aislado por tenant y no afecta a otras entidades.</li>
              <li>• La vista previa se actualiza en tiempo real antes de persistir.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6 sticky top-6">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5" style={previewStyles}>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-(--tenant-background) shadow-sm">
                <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 bg-(--tenant-surface)">
                <div className="flex items-center gap-3 min-w-0">
                  {renderLogo()}
                  <div className="min-w-0">
                      <p className="text-sm font-semibold text-(--tenant-text) truncate">{form.display_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">Navbar / identidad</p>
                  </div>
                </div>
                  <div className="h-2.5 w-2.5 rounded-full bg-(--tenant-accent)" />
              </div>

              <div className="grid grid-cols-[82px_1fr] min-h-65">
                  <aside className="bg-(--tenant-surface) border-r border-slate-200 p-3 space-y-2">
                    <div className="h-8 rounded-lg bg-(--tenant-primary) text-(--tenant-on-primary) flex items-center justify-center text-[10px] font-bold">INICIO</div>
                    <div className="h-8 rounded-lg bg-(--tenant-primary-soft) text-(--tenant-primary) flex items-center justify-center text-[10px] font-semibold">GESTIÓN</div>
                  <div className="h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-medium">OTROS</div>
                </aside>

                <main className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-(--tenant-surface) p-3 shadow-sm">
                      <div className="h-2.5 w-20 rounded-full bg-slate-200 mb-3" />
                      <div className="h-16 rounded-xl bg-slate-100 mb-3" />
                      <div className="flex items-center justify-between">
                        <div className="h-2.5 w-16 rounded-full bg-slate-200" />
                          <div className="h-8 w-8 rounded-full bg-(--tenant-accent-soft)" />
                      </div>
                    </div>
                      <div className="rounded-2xl border border-slate-200 bg-(--tenant-surface) p-3 shadow-sm">
                      <div className="h-2.5 w-24 rounded-full bg-slate-200 mb-3" />
                      <div className="h-16 rounded-xl bg-slate-100 mb-3" />
                      <div className="flex items-center justify-between">
                        <div className="h-2.5 w-14 rounded-full bg-slate-200" />
                          <div className="h-8 w-8 rounded-full bg-(--tenant-primary-soft)" />
                      </div>
                    </div>
                  </div>

                    <div className="rounded-2xl border border-slate-200 bg-(--tenant-surface) p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="h-2.5 w-28 rounded-full bg-slate-200 mb-2" />
                        <div className="h-2.5 w-36 rounded-full bg-slate-100" />
                      </div>
                      <button
                        type="button"
                        className="rounded-xl px-4 py-2 text-xs font-semibold"
                        style={{ backgroundColor: 'var(--tenant-primary)', color: 'var(--tenant-on-primary)' }}
                      >
                        Botón principal
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-20 rounded-xl bg-(--tenant-primary-soft)" />
                      <div className="h-20 rounded-xl bg-(--tenant-secondary-soft)" />
                      <div className="h-20 rounded-xl bg-(--tenant-accent-soft)" />
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Estado de la vista previa
            </div>
            <p className="text-sm text-slate-600">Los cambios se reflejan en esta pantalla antes de guardar y se aplican al layout una vez persistidos.</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">Navbar</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">Sidebar</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">Botones</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">Cards</span>
            </div>
          </div>
        </div>
      </form>

      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-slate-500">
          El sistema conservará los valores por defecto si no se guarda configuración personalizada.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button type="button" variant="secondary" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4" />
            Restaurar por defecto
          </Button>
          <Button type="submit" isLoading={saving} form="tenant-branding-form" formNoValidate>
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
