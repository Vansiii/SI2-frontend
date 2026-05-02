import type { CSSProperties } from 'react';
import type { TenantBranding } from '../../types';

export const DEFAULT_BRANDING_COLORS = {
  primary: '#2563EB',
  secondary: '#0F172A',
  accent: '#0EA5E9',
  background: '#F8FAFC',
  text: '#0F172A',
};

export function buildDefaultTenantBrandingDraft(institutionName: string) {
  return {
    display_name: institutionName,
    primary_color: DEFAULT_BRANDING_COLORS.primary,
    secondary_color: DEFAULT_BRANDING_COLORS.secondary,
    accent_color: DEFAULT_BRANDING_COLORS.accent,
    background_color: DEFAULT_BRANDING_COLORS.background,
    text_color: DEFAULT_BRANDING_COLORS.text,
  };
}

function expandShortHex(hex: string): string {
  const value = hex.replace('#', '').trim();
  if (value.length === 3) {
    return value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return value;
}

function parseHexColor(hex: string): { red: number; green: number; blue: number } | null {
  const normalized = expandShortHex(hex);
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function toRgbString(hex: string): string {
  const parsed = parseHexColor(hex);
  if (!parsed) {
    return '0, 0, 0';
  }

  return `${parsed.red}, ${parsed.green}, ${parsed.blue}`;
}

function mixWithWhite(hex: string, amount: number): string {
  const parsed = parseHexColor(hex);
  if (!parsed) {
    return hex;
  }

  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(parsed.red)}, ${mix(parsed.green)}, ${mix(parsed.blue)})`;
}

function mixWithBlack(hex: string, amount: number): string {
  const parsed = parseHexColor(hex);
  if (!parsed) {
    return hex;
  }

  const mix = (channel: number) => Math.round(channel * (1 - amount));
  return `rgb(${mix(parsed.red)}, ${mix(parsed.green)}, ${mix(parsed.blue)})`;
}

function getReadableForeground(hex: string): string {
  const parsed = parseHexColor(hex);
  if (!parsed) {
    return '#FFFFFF';
  }

  const luminance = (0.299 * parsed.red) + (0.587 * parsed.green) + (0.114 * parsed.blue);
  return luminance > 160 ? '#0F172A' : '#FFFFFF';
}

export function buildTenantBrandingCssVariables(
  branding?: Pick<TenantBranding, 'primary_color' | 'secondary_color' | 'accent_color' | 'background_color' | 'text_color'> | null
): CSSProperties {
  const primary = branding?.primary_color || DEFAULT_BRANDING_COLORS.primary;
  const secondary = branding?.secondary_color || DEFAULT_BRANDING_COLORS.secondary;
  const accent = branding?.accent_color || DEFAULT_BRANDING_COLORS.accent;
  const background = branding?.background_color || DEFAULT_BRANDING_COLORS.background;
  const text = branding?.text_color || DEFAULT_BRANDING_COLORS.text;

  return {
    '--tenant-primary': primary,
    '--tenant-primary-hover': mixWithBlack(primary, 0.12),
    '--tenant-primary-soft': `rgba(${toRgbString(primary)}, 0.12)`,
    '--tenant-secondary': secondary,
    '--tenant-secondary-hover': mixWithBlack(secondary, 0.12),
    '--tenant-secondary-soft': `rgba(${toRgbString(secondary)}, 0.12)`,
    '--tenant-accent': accent,
    '--tenant-accent-soft': `rgba(${toRgbString(accent)}, 0.12)`,
    '--tenant-background': background,
    '--tenant-surface': '#FFFFFF',
    '--tenant-text': text,
    '--tenant-on-primary': getReadableForeground(primary),
    '--tenant-primary-ring': mixWithWhite(primary, 0.18),
  } as CSSProperties;
}

export function applyTenantBrandingToDocument(
  branding?: Pick<TenantBranding, 'primary_color' | 'secondary_color' | 'accent_color' | 'background_color' | 'text_color'> | null
): void {
  const root = document.documentElement;
  const variables = buildTenantBrandingCssVariables(branding);

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, String(value));
  });
}
