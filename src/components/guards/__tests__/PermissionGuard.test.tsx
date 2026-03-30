import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PermissionGuard } from '../PermissionGuard'
import * as useAuthHook from '../../../features/auth/hooks/useAuth'

// Mock del hook useAuth
vi.mock('../../../features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock de Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Redirecting to {to}</div>,
  }
})

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar null mientras está cargando', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      hasPermission: vi.fn(),
      isLoading: true,
    } as any)

    const { container } = render(
      <BrowserRouter>
        <PermissionGuard permission="users.view">
          <div>Protected Content</div>
        </PermissionGuard>
      </BrowserRouter>
    )

    expect(container.firstChild).toBeNull()
  })

  it('debe mostrar el contenido si el usuario tiene el permiso', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(true),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <PermissionGuard permission="users.view">
          <div>Protected Content</div>
        </PermissionGuard>
      </BrowserRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('debe redirigir al dashboard si no tiene permiso y no hay fallback', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <PermissionGuard permission="users.delete">
          <div>Protected Content</div>
        </PermissionGuard>
      </BrowserRouter>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to /dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('debe redirigir a la ruta especificada si no tiene permiso', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <PermissionGuard permission="users.delete" redirectTo="/unauthorized">
          <div>Protected Content</div>
        </PermissionGuard>
      </BrowserRouter>
    )

    expect(screen.getByText('Redirecting to /unauthorized')).toBeInTheDocument()
  })

  it('debe mostrar el fallback si no tiene permiso y hay fallback', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <PermissionGuard
          permission="users.delete"
          fallback={<div>No tienes permiso</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      </BrowserRouter>
    )

    expect(screen.getByText('No tienes permiso')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('debe llamar a hasPermission con el permiso correcto', () => {
    const mockHasPermission = vi.fn().mockReturnValue(true)
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      hasPermission: mockHasPermission,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <PermissionGuard permission="users.create">
          <div>Protected Content</div>
        </PermissionGuard>
      </BrowserRouter>
    )

    expect(mockHasPermission).toHaveBeenCalledWith('users.create')
  })

  it('debe funcionar con permisos complejos', () => {
    const mockHasPermission = vi.fn((permission: string) => {
      return permission === 'roles.assign_permissions'
    })

    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      hasPermission: mockHasPermission,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <PermissionGuard permission="roles.assign_permissions">
          <div>Can assign permissions</div>
        </PermissionGuard>
      </BrowserRouter>
    )

    expect(screen.getByText('Can assign permissions')).toBeInTheDocument()
  })

  it('debe manejar múltiples PermissionGuards anidados', () => {
    const mockHasPermission = vi.fn().mockReturnValue(true)
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      hasPermission: mockHasPermission,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <PermissionGuard permission="users.view">
          <div>
            <span>Can view users</span>
            <PermissionGuard permission="users.create">
              <span>Can also create users</span>
            </PermissionGuard>
          </div>
        </PermissionGuard>
      </BrowserRouter>
    )

    expect(screen.getByText('Can view users')).toBeInTheDocument()
    expect(screen.getByText('Can also create users')).toBeInTheDocument()
    expect(mockHasPermission).toHaveBeenCalledWith('users.view')
    expect(mockHasPermission).toHaveBeenCalledWith('users.create')
  })
})
