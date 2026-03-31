import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from '../AuthContext'
import type { ReactNode } from 'react'
import * as tokenManager from '../../utils/tokenManager'
import * as apiClient from '../../utils/apiClient'

// Mock de los módulos
vi.mock('../../utils/tokenManager', () => ({
  getAccessToken: vi.fn(),
  clearTokens: vi.fn(),
  saveTokens: vi.fn(),
}))

vi.mock('../../utils/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Inicialización', () => {
    it('debe inicializar con valores por defecto', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue(null)

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.institution).toBeNull()
      expect(result.current.role).toBeNull()
      expect(result.current.userType).toBeNull()
      expect(result.current.roles).toEqual([])
      expect(result.current.permissions).toEqual([])
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('debe cargar sesión desde localStorage si existe token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }
      const mockInstitution = {
        id: 1,
        name: 'Test Institution',
        slug: 'test-inst',
      }

      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('institution', JSON.stringify(mockInstitution))
      localStorage.setItem('role', 'admin')
      localStorage.setItem('userType', 'tenant_user')
      localStorage.setItem('roles', JSON.stringify(['admin']))
      localStorage.setItem('permissions', JSON.stringify(['users.view', 'users.create']))

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.institution).toEqual(mockInstitution)
      expect(result.current.role).toBe('admin')
      expect(result.current.userType).toBe('tenant_user')
      expect(result.current.roles).toEqual(['admin'])
      expect(result.current.permissions).toEqual(['users.view', 'users.create'])
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('debe hacer login exitosamente sin 2FA', async () => {
      const mockResponse = {
        access: 'access-token',
        refresh: 'refresh-token',
        requires_2fa: false,
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
        },
        institution: {
          id: 1,
          name: 'Test Institution',
          slug: 'test-inst',
        },
        role: 'admin',
        user_type: 'tenant_user',
        roles: ['admin'],
        permissions: ['users.view', 'users.create'],
      }

      vi.mocked(apiClient.apiClient.post).mockResolvedValue(mockResponse)
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('access-token')

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let response
      await act(async () => {
        response = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      expect(response).toEqual(mockResponse)
      expect(tokenManager.saveTokens).toHaveBeenCalledWith('access-token', 'refresh-token')
      expect(result.current.user).toEqual(mockResponse.user)
      expect(result.current.institution).toEqual(mockResponse.institution)
      expect(result.current.role).toBe('admin')
      expect(result.current.userType).toBe('tenant_user')
      expect(result.current.permissions).toEqual(['users.view', 'users.create'])
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('debe retornar requires_2fa cuando se requiere 2FA', async () => {
      const mockResponse = {
        requires_2fa: true,
        challenge_token: 'challenge-token-123',
        message: '2FA required',
      }

      vi.mocked(apiClient.apiClient.post).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let response
      await act(async () => {
        response = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      expect(response).toEqual(mockResponse)
      expect(tokenManager.saveTokens).not.toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('debe manejar errores de login', async () => {
      const mockError = new Error('Invalid credentials')
      vi.mocked(apiClient.apiClient.post).mockRejectedValue(mockError)

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.login({
            email: 'test@example.com',
            password: 'wrong-password',
          })
        })
      ).rejects.toThrow('Invalid credentials')

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('debe hacer logout exitosamente', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }

      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('refresh_token', 'refresh-token')
      localStorage.setItem('userType', 'tenant_user')
      localStorage.setItem('roles', JSON.stringify(['admin']))
      localStorage.setItem('permissions', JSON.stringify(['users.view']))

      vi.mocked(apiClient.apiClient.post).mockResolvedValue({})

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(apiClient.apiClient.post).toHaveBeenCalledWith('/auth/logout/', {
        refresh: 'refresh-token',
      })
      expect(tokenManager.clearTokens).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.institution).toBeNull()
      expect(result.current.role).toBeNull()
      expect(result.current.userType).toBeNull()
      expect(result.current.roles).toEqual([])
      expect(result.current.permissions).toEqual([])
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('debe limpiar sesión local incluso si falla el logout en backend', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')
      localStorage.setItem('refresh_token', 'refresh-token')
      localStorage.setItem('userType', 'tenant_user')

      vi.mocked(apiClient.apiClient.post).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(tokenManager.clearTokens).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('debe retornar true para SaaS admin con cualquier permiso', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')
      localStorage.setItem('userType', 'saas_admin')
      localStorage.setItem('permissions', JSON.stringify([]))

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasPermission('users.view')).toBe(true)
      expect(result.current.hasPermission('users.create')).toBe(true)
      expect(result.current.hasPermission('any.permission')).toBe(true)
    })

    it('debe retornar true si el usuario tiene el permiso específico', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')
      localStorage.setItem('userType', 'tenant_user')
      localStorage.setItem('permissions', JSON.stringify(['users.view', 'users.create']))

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasPermission('users.view')).toBe(true)
      expect(result.current.hasPermission('users.create')).toBe(true)
    })

    it('debe retornar false si el usuario no tiene el permiso', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')
      localStorage.setItem('userType', 'tenant_user')
      localStorage.setItem('permissions', JSON.stringify(['users.view']))

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasPermission('users.view')).toBe(true)
      expect(result.current.hasPermission('users.delete')).toBe(false)
    })

    it('debe retornar true si el usuario tiene permiso wildcard (*)', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')
      localStorage.setItem('userType', 'tenant_user')
      localStorage.setItem('permissions', JSON.stringify(['*']))

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasPermission('users.view')).toBe(true)
      expect(result.current.hasPermission('any.permission')).toBe(true)
    })
  })

  describe('updateUser', () => {
    it('debe actualizar los datos del usuario', async () => {
      const initialUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }

      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')
      localStorage.setItem('user', JSON.stringify(initialUser))

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const updatedUser = {
        ...initialUser,
        first_name: 'Updated',
        last_name: 'Name',
      }

      act(() => {
        result.current.updateUser(updatedUser)
      })

      expect(result.current.user).toEqual(updatedUser)
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser))
    })
  })

  describe('updateSession', () => {
    it('debe actualizar toda la sesión', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const newUser = {
        id: '2',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
      }
      const newInstitution = {
        id: '2',
        name: 'New Institution',
        slug: 'new-inst',
        institution_type: 'banking' as const,
      }
      const newRole = 'manager'

      act(() => {
        result.current.updateSession(newUser, newInstitution, newRole)
      })

      expect(result.current.user).toEqual(newUser)
      expect(result.current.institution).toEqual(newInstitution)
      expect(result.current.role).toBe(newRole)
    })

    it('debe actualizar metadata de auth para flujo 2FA', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token')

      const { result } = renderHook(() => {
        const context = useContext(AuthContext)
        if (!context) throw new Error('AuthContext not found')
        return context
      }, { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const newUser = {
        id: '3',
        email: '2fa@example.com',
        first_name: 'Two',
        last_name: 'Factor',
      }
      const newInstitution = {
        id: '3',
        name: 'Secure Institution',
        slug: 'secure-inst',
        institution_type: 'banking' as const,
      }

      act(() => {
        result.current.updateSession(newUser, newInstitution, 'admin', {
          userType: 'tenant_user',
          roles: ['Administrador'],
          permissions: ['users.view', 'roles.view'],
        })
      })

      expect(result.current.userType).toBe('tenant_user')
      expect(result.current.roles).toEqual(['Administrador'])
      expect(result.current.permissions).toEqual(['users.view', 'roles.view'])
      expect(result.current.hasPermission('users.view')).toBe(true)
      expect(result.current.hasPermission('roles.view')).toBe(true)
    })
  })
})
