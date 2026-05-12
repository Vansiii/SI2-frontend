/**
 * Componente de animación mejorada para el estado "Interpretando"
 * Muestra una animación atractiva mientras la IA procesa el audio
 */
import { useEffect, useState } from 'react';
import { Mic, Brain, Sparkles, Wand2 } from 'lucide-react';
import styles from './InterpretingAnimation.module.css';

interface InterpretingAnimationProps {
  message?: string;
  showProgress?: boolean;
}

const PROCESSING_STEPS = [
  { icon: Mic, label: 'Transcribiendo audio', duration: 2000 },
  { icon: Brain, label: 'Analizando contenido', duration: 2000 },
  { icon: Wand2, label: 'Interpretando intención', duration: 2000 },
  { icon: Sparkles, label: 'Generando configuración', duration: 2000 },
];

export function InterpretingAnimation({ 
  message = 'Interpretando tu solicitud...', 
  showProgress = true 
}: InterpretingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    // Ciclar entre los pasos
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % PROCESSING_STEPS.length);
    }, 2500);

    // Animar el progreso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // No llegar al 100% hasta que termine
        return prev + 1;
      });
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [showProgress]);

  const CurrentIcon = PROCESSING_STEPS[currentStep].icon;

  return (
    <div className={styles.container}>
      {/* Círculos de fondo animados */}
      <div className={styles.backgroundCircles}>
        <div className={`${styles.circle} ${styles.circle1}`}></div>
        <div className={`${styles.circle} ${styles.circle2}`}></div>
        <div className={`${styles.circle} ${styles.circle3}`}></div>
      </div>

      {/* Contenido principal */}
      <div className={styles.content}>
        {/* Icono principal con animación */}
        <div className={styles.iconContainer}>
          <div className={styles.iconPulse}>
            <CurrentIcon className={styles.mainIcon} />
          </div>
          
          {/* Partículas flotantes */}
          <div className={styles.particles}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={styles.particle}
                style={{
                  '--delay': `${i * 0.2}s`,
                  '--angle': `${i * 45}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Mensaje principal */}
        <h3 className={styles.title}>{message}</h3>

        {/* Paso actual */}
        {showProgress && (
          <div className={styles.stepIndicator}>
            <span className={styles.stepLabel}>
              {PROCESSING_STEPS[currentStep].label}
            </span>
          </div>
        )}

        {/* Barra de progreso */}
        {showProgress && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressText}>{progress}%</span>
          </div>
        )}

        {/* Indicadores de pasos */}
        {showProgress && (
          <div className={styles.stepsContainer}>
            {PROCESSING_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={index}
                  className={`${styles.step} ${
                    isActive ? styles.stepActive : ''
                  } ${isCompleted ? styles.stepCompleted : ''}`}
                >
                  <div className={styles.stepIcon}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <span className={styles.stepText}>{step.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Texto de espera */}
        <p className={styles.subtitle}>
          La IA está procesando tu audio. Esto puede tomar unos momentos...
        </p>
      </div>
    </div>
  );
}

export default InterpretingAnimation;
