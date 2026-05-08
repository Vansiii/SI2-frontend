import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ImageIcon, Palette, RotateCcw, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoadingState } from '../../../components/ui/LoadingState';
import { FileUpload } from '../../../components/ui/FileUpload';
import { ColorPicker } from '../../../components/ui/ColorPicker';
import { ColorPaletteSuggestions } from '../../../components/ui/ColorPaletteSuggestions';
import { buildDefaultTenantBrandingDraft, buildTenantBrandingCssVariables, DEFAULT_BRANDING_COLORS } from '../brandingTheme';
import { resetTenantBranding } from '../services/brandingApi';
import { useBranding } from '../hooks/useBranding';
import type { TenantBranding } from '../../../types';

type BrandingFormState = {
  display_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
};

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
  const {
    isUploading,
    deletingFile,
    error: uploadError,
    clearError,
    uploadLogo,
    uploadFavicon,
    uploadCover,
    deleteFile,
    updateColors,
  } = useBranding();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<BrandingFormState>(
    buildDefaultTenantBrandingDraft(institution?.name || 'Sistema')
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof BrandingFormState, string>>>({});

  useEffect(() => {
    if (userType === 'saas_admin') {
      navigate('/home');
    }
  }, [navigate, userType]);

  useEffect(() => {
    if (tenantBranding && institution) {
      setForm(brandingToForm(tenantBranding, institution.name));
      setLoading(false);
      return;
    }

    if (institution) {
      setForm(buildDefaultTenantBrandingDraft(institution.name));
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [institution, tenantBranding]);

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
    clearError();
  };

  const updateField = (field: keyof BrandingFormState, value: string) => {
    clearMessages();
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleUploadLogo = async (file: File) => {
    clearMessages();
    try {
      const updatedBranding = await uploadLogo(file);
      setSuccess('Logo subido exitosamente');
      await refreshTenantBranding();
      if (updatedBranding) {
        setForm(brandingToForm(updatedBranding, institution?.name || updatedBranding.display_name));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el logo');
    }
  };

  const handleUploadFavicon = async (file: File) => {
    clearMessages();
    try {
      const updatedBranding = await uploadFavicon(file);
      setSuccess('Favicon subido exitosamente');
      await refreshTenantBranding();
      if (updatedBranding) {
        setForm(brandingToForm(updatedBranding, institution?.name || updatedBranding.display_name));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el favicon');
    }
  };

  const handleUploadCover = async (file: File) => {
    clearMessages();
    try {
      const updatedBranding = await uploadCover(file);
      setSuccess('Cover subido exitosamente');
      await refreshTenantBranding();
      if (updatedBranding) {
        setForm(brandingToForm(updatedBranding, institution?.name || updatedBranding.display_name));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el cover');
    }
  };

  const handleDeleteLogo = async () => {
    clearMessages();
    try {
      const updatedBranding = await deleteFile('logo');
      setSuccess('Logo eliminado exitosamente');
      await refreshTenantBranding();
      if (updatedBranding) {
        setForm(brandingToForm(updatedBranding, institution?.name || updatedBranding.display_name));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el logo');
    }
  };

  const handleDeleteFavicon = async () => {
    clearMessages();
    try {
      const updatedBranding = await deleteFile('favicon');
      setSuccess('Favicon eliminado exitosamente');
      await refreshTenantBranding();
      if (updatedBranding) {
        setForm(brandingToForm(updatedBranding, institution?.name || updatedBranding.display_name));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el favicon');
    }
  };

  const handleDeleteCover = async () => {
    clearMessages();
    try {
      const updatedBranding = await deleteFile('cover');
      setSuccess('Cover eliminado exitosamente');
      await refreshTenantBranding();
      if (updatedBranding) {
        setForm(brandingToForm(updatedBranding, institution?.name || updatedBranding.display_name));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el cover');
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof BrandingFormState, string>> = {};

    if (!form.display_name.trim()) {
      nextErrors.display_name = 'El nombre visible es obligatorio.';
    }

    (['primary_color', 'secondary_color', 'accent_color', 'background_color', 'text_color'] as const).forEach((field) => {
      const value = form[field];
      if (!isValidHexColor(value)) {
        nextErrors[field] = 'Ingresa un color HEX válido.';
      }
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      clearMessages();
      
      const updatedBranding = await updateColors({
        display_name: form.display_name.trim(),
        primary_color: normalizeHex(form.primary_color),
        secondary_color: normalizeHex(form.secondary_color),
        accent_color: normalizeHex(form.accent_color),
        background_color: normalizeHex(form.background_color),
        text_color: normalizeHex(form.text_color),
      });

      setSuccess('Colores actualizados exitosamente');
      await refreshTenantBranding();
      
      if (updatedBranding) {
        setForm(brandingToForm(updatedBranding, institution?.name || updatedBranding.display_name));
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
      setSuccess(response.message);
      await refreshTenantBranding();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible restaurar los valores por defecto.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPalette = (colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }) => {
    clearMessages();
    setForm((current) => ({
      ...current,
      primary_color: colors.primary,
      secondary_color: colors.secondary,
      accent_color: colors.accent,
      background_color: colors.background,
      text_color: colors.text,
    }));
    setSuccess('Paleta aplicada. Recuerda guardar los cambios.');
  };

  const renderLogo = () => {
    const source = tenantBranding?.logo_url;

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

  const displayError = error || uploadError;

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
                <p className="text-sm text-slate-500 mt-1">Configura el logo, favicon, cover y colores del tenant con Supabase Storage.</p>
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

        {displayError && (
          <div className="mt-5">
            <Alert variant="error">{displayError}</Alert>
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
          {/* Paletas sugeridas */}
          <ColorPaletteSuggestions
            onApplyPalette={handleApplyPalette}
            currentColors={{
              primary: form.primary_color,
              secondary: form.secondary_color,
              accent: form.accent_color,
              background: form.background_color,
              text: form.text_color,
            }}
          />

          {/* Datos de marca */}
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

            <div className="space-y-4">
              <ColorPicker
                id="primary_color"
                label="Color primario"
                value={form.primary_color}
                onChange={(value) => updateField('primary_color', value)}
                error={fieldErrors.primary_color}
                placeholder="#2563EB"
                description="Color principal de la marca, usado en botones y elementos destacados"
              />
              
              <ColorPicker
                id="secondary_color"
                label="Color secundario"
                value={form.secondary_color}
                onChange={(value) => updateField('secondary_color', value)}
                error={fieldErrors.secondary_color}
                placeholder="#0F172A"
                description="Color complementario para textos y elementos secundarios"
              />
              
              <ColorPicker
                id="accent_color"
                label="Color de acento"
                value={form.accent_color}
                onChange={(value) => updateField('accent_color', value)}
                error={fieldErrors.accent_color}
                placeholder="#0EA5E9"
                description="Color para resaltar elementos interactivos y notificaciones"
              />
              
              <ColorPicker
                id="background_color"
                label="Color de fondo/superficie"
                value={form.background_color}
                onChange={(value) => updateField('background_color', value)}
                error={fieldErrors.background_color}
                placeholder="#F8FAFC"
                description="Color de fondo principal de la aplicación"
              />
              
              <ColorPicker
                id="text_color"
                label="Color de texto principal"
                value={form.text_color}
                onChange={(value) => updateField('text_color', value)}
                error={fieldErrors.text_color}
                placeholder="#0F172A"
                description="Color del texto principal en toda la aplicación"
              />
            </div>
          </div>

          {/* Archivos de branding */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6 md:p-7 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Archivos de branding</h2>
              <p className="text-sm text-slate-500 mt-1">Los archivos se almacenan en Supabase Storage de forma segura.</p>
            </div>

            <FileUpload
              label="Logo principal"
              accept="image/png,image/jpeg,image/webp"
              maxSizeMB={5}
              currentUrl={tenantBranding?.logo_url}
              onUpload={handleUploadLogo}
              onDelete={tenantBranding?.logo_url ? handleDeleteLogo : undefined}
              disabled={isUploading || deletingFile !== null}
              isDeleting={deletingFile === 'logo'}
              description="Formato: PNG, JPG, WEBP • Máximo: 5 MB"
              previewShape="square"
            />

            <FileUpload
              label="Favicon"
              accept="image/png,image/x-icon"
              maxSizeMB={1}
              currentUrl={tenantBranding?.favicon_url}
              onUpload={handleUploadFavicon}
              onDelete={tenantBranding?.favicon_url ? handleDeleteFavicon : undefined}
              disabled={isUploading || deletingFile !== null}
              isDeleting={deletingFile === 'favicon'}
              description="Formato: PNG, ICO • Máximo: 1 MB • Recomendado: 32x32px"
              previewShape="square"
            />

            <FileUpload
              label="Cover / Banner"
              accept="image/png,image/jpeg,image/webp"
              maxSizeMB={10}
              currentUrl={tenantBranding?.cover_url}
              onUpload={handleUploadCover}
              onDelete={tenantBranding?.cover_url ? handleDeleteCover : undefined}
              disabled={isUploading || deletingFile !== null}
              isDeleting={deletingFile === 'cover'}
              description="Formato: PNG, JPG, WEBP • Máximo: 10 MB • Recomendado: 1920x400px"
              previewShape="rectangle"
            />
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6 md:p-7">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Ayuda rápida</h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Los colores aceptan solo HEX. Se normalizan automáticamente al guardar.</li>
              <li>• Los archivos se almacenan en Supabase Storage con URLs firmadas.</li>
              <li>• El logo se muestra en el navbar, el favicon en la pestaña del navegador.</li>
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
          <Button type="button" variant="secondary" onClick={handleReset} disabled={saving || isUploading || deletingFile !== null}>
            <RotateCcw className="h-4 w-4" />
            Restaurar por defecto
          </Button>
          <Button type="submit" isLoading={saving} form="tenant-branding-form" formNoValidate disabled={isUploading || deletingFile !== null}>
            <Save className="h-4 w-4" />
            Guardar colores
          </Button>
        </div>
      </div>
    </div>
  );
}
