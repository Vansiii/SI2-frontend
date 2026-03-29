import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { TwoFactorForm } from '../components/TwoFactorForm';
import { verify2FA } from '../services/verify2FA';
import { resend2FACode } from '../services/resend2FACode';
import { useAuth } from '../hooks/useAuth';
import { saveTokens } from '../../../utils/tokenManager';
import type { TwoFactorErrorResponse } from '../../../types';

export function TwoFactorPage() {
  const navigate = useNavigate();
  const { updateSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TwoFactorErrorResponse | null>(null);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const challengeTokenRef = useRef<string | null>(null); // Ref para mantener el token actualizado
  const [expiresIn, setExpiresIn] = useState<number>(300); // 5 minutos por defecto
  const [method, setMethod] = useState<'totp' | 'email'>('totp');
  const [userEmail, setUserEmail] = useState<string>('');

  // Auto-dismiss error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Cargar datos de sessionStorage al montar
  useEffect(() => {
    const token = sessionStorage.getItem('challenge_token');
    const expiresAt = sessionStorage.getItem('challenge_expires_at');
    const twoFactorMethod = sessionStorage.getItem('two_factor_method');
    const email = sessionStorage.getItem('user_email');

    if (!token) {
      // Si no hay challenge_token, redirigir a login
      navigate('/login', { replace: true });
      return;
    }

    setChallengeToken(token);
    challengeTokenRef.current = token; // Actualizar ref
    
    if (expiresAt) {
      // Calcular tiempo restante desde el timestamp
      const expiresAtMs = parseInt(expiresAt, 10);
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));
      setExpiresIn(remainingSeconds);
    }
    
    if (twoFactorMethod === 'email' || twoFactorMethod === 'totp') {
      setMethod(twoFactorMethod);
    }
    
    if (email) {
      setUserEmail(email);
    }
  }, [navigate]);

  // Sincronizar ref cuando cambia el estado
  useEffect(() => {
    challengeTokenRef.current = challengeToken;
  }, [challengeToken]);

  const handleSubmit = async (code: string) => {
    // Usar ref para obtener el token más actualizado
    const currentToken = challengeTokenRef.current;
    console.log('[2FA Submit] Challenge token actual:', currentToken);
    
    if (!currentToken) {
      navigate('/login', { replace: true });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await verify2FA(currentToken, code, false);

      // Guardar tokens
      saveTokens(response.access, response.refresh);

      // Guardar datos de usuario en localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('institution', JSON.stringify(response.institution));
      localStorage.setItem('role', response.role);

      // Actualizar contexto con toda la sesión
      updateSession(response.user, response.institution, response.role);

      // Limpiar sessionStorage
      sessionStorage.removeItem('challenge_token');
      sessionStorage.removeItem('challenge_expires_at');
      sessionStorage.removeItem('two_factor_method');
      sessionStorage.removeItem('user_email');

      // Redirigir a home
      navigate('/home', { replace: true });
    } catch (err: unknown) {
      console.log('[2FA Verify] Error recibido:', err);
      
      if (err && typeof err === 'object' && 'message' in err) {
        const errorMessage = (err as any).message as string;
        console.log('[2FA Verify] Mensaje de error:', errorMessage);
        
        const errorObj: TwoFactorErrorResponse = {
          error: errorMessage,
        };
        
        // Extraer intentos restantes del mensaje
        const attemptsMatch = errorMessage.match(/Te quedan (\d+) intento/);
        if (attemptsMatch) {
          errorObj.attempts_remaining = parseInt(attemptsMatch[1], 10);
          console.log('[2FA Verify] Intentos restantes extraídos:', errorObj.attempts_remaining);
        } else {
          console.log('[2FA Verify] No se encontraron intentos en el mensaje');
        }
        
        console.log('[2FA Verify] Error objeto final:', errorObj);
        setError(errorObj);
      } else {
        setError({
          error: 'Error al verificar el código. Intenta de nuevo.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    // Usar ref para obtener el token más actualizado
    const currentToken = challengeTokenRef.current;
    
    if (!currentToken || method !== 'email') {
      return;
    }

    try {
      const response = await resend2FACode(currentToken);
      
      // Actualizar challenge token con el nuevo token del backend
      if (response.challenge_token) {
        setChallengeToken(response.challenge_token);
        challengeTokenRef.current = response.challenge_token; // Actualizar ref inmediatamente
        sessionStorage.setItem('challenge_token', response.challenge_token);
      }
      
      // Calcular nuevo timestamp de expiración
      const newExpiresAt = Date.now() + (response.expires_in * 60 * 1000);
      
      // Actualizar sessionStorage con el nuevo timestamp
      sessionStorage.setItem('challenge_expires_at', newExpiresAt.toString());
      
      // Actualizar tiempo de expiración en segundos
      setExpiresIn(response.expires_in * 60);
      setError(null);
      
      // Opcional: mostrar mensaje de éxito
      // toast.success(response.message);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'error' in err) {
        setError(err as TwoFactorErrorResponse);
      } else {
        setError({
          error: 'Error al reenviar el código. Intenta de nuevo.',
        });
      }
    }
  };

  const handleBack = () => {
    // Limpiar sessionStorage y volver a login
    sessionStorage.removeItem('challenge_token');
    sessionStorage.removeItem('challenge_expires_at');
    sessionStorage.removeItem('two_factor_method');
    sessionStorage.removeItem('user_email');
    navigate('/login', { replace: true });
  };

  // No renderizar nada hasta verificar que hay challenge_token
  if (!challengeToken) {
    return null;
  }

  const title = method === 'email' 
    ? 'Verificación por Email' 
    : 'Verificación de Dos Factores';
    
  const subtitle = method === 'email'
    ? 'Revisa tu correo electrónico'
    : 'Ingresa el código de tu aplicación de autenticación';

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <TwoFactorForm
        key={expiresIn} // Forzar re-render cuando cambia el tiempo
        onSubmit={handleSubmit}
        onBack={handleBack}
        onResend={method === 'email' ? handleResend : undefined}
        isLoading={isLoading}
        error={error}
        expiresIn={expiresIn}
        method={method}
        userEmail={userEmail}
      />
    </AuthLayout>
  );
}
