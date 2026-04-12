import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { RegistrationProgressBar } from '../components/RegistrationProgressBar';
import { CompanyInfoStep } from '../components/CompanyInfoStep';
import { AdminInfoStep } from '../components/AdminInfoStep';
import { SuccessStep } from '../components/SuccessStep';
import {
  RegisterUserApiError,
  registerUser,
} from '../services/registerUser';
import type { RegistrationFieldErrors, SaasRegistrationData } from '../types';
import { getSubscriptionPlan, type SubscriptionPlan } from '../../saas/services/subscriptionsApi';

type RegistrationStep = 1 | 2 | 3;

function fieldKeyFromInputName(name: string): keyof RegistrationFieldErrors | null {
  const allowed: Array<keyof RegistrationFieldErrors> = [
    'companyName',
    'industry',
    'firstName',
    'lastName',
    'email',
    'password',
    'confirmPassword',
  ];
  return allowed.includes(name as keyof RegistrationFieldErrors)
    ? (name as keyof RegistrationFieldErrors)
    : null;
}

export function SaasRegistrationPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<RegistrationStep>(1);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<SaasRegistrationData>({
    companyName: '',
    industry: 'banking',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedPlanId: undefined,
  });
  const [formErrors, setFormErrors] = useState<RegistrationFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      const planIdNumber = parseInt(planId, 10);
      if (!isNaN(planIdNumber)) {
        setFormData(prev => ({ ...prev, selectedPlanId: planIdNumber }));
        loadSelectedPlan(planIdNumber);
      }
    }
  }, [searchParams]);

  const loadSelectedPlan = async (planId: number) => {
    try {
      const plan = await getSubscriptionPlan(planId);
      setSelectedPlan(plan);
    } catch (error) {
      console.error('Error loading selected plan:', error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldKey = fieldKeyFromInputName(name);
    const inputName = name as keyof SaasRegistrationData;

    setFormData((prev) => ({ ...prev, [inputName]: value }));

    if (fieldKey) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldKey]: undefined,
        form: undefined,
      }));
    }
  };

  const handleNext = () => setStep(2);
  const handleBack = () => {
    setFormErrors((prev) => ({ ...prev, form: undefined }));
    setStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await registerUser(formData);
      setSuccessMessage(response.message);
      setStep(3);
    } catch (error) {
      if (error instanceof RegisterUserApiError) {
        setFormErrors((prev) => ({ ...prev, ...error.fieldErrors, form: error.message }));
        if (error.fieldErrors.companyName || error.fieldErrors.industry) {
          setStep(1);
        }
      } else {
        setFormErrors({
          form: 'No se pudo conectar con el servidor. Verifica que el backend este ejecutandose.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepComponent = () => {
    switch (step) {
      case 1:
        return (
          <CompanyInfoStep
            formData={formData}
            onChange={handleChange}
            onNext={handleNext}
            errors={formErrors}
          />
        );
      case 2:
        return (
          <AdminInfoStep
            formData={formData}
            onChange={handleChange}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errors={formErrors}
          />
        );
      case 3:
        return (
          <SuccessStep
            formData={formData}
            message={successMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title="Crea tu entorno financiero"
      subtitle="Únete a nuestra plataforma y gestiona tus créditos eficientemente"
    >
      {/* Mostrar plan seleccionado si existe */}
      {selectedPlan && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{selectedPlan.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Plan {selectedPlan.name} seleccionado</h3>
              <p className="text-sm text-blue-700">
                {parseFloat(selectedPlan.price) === 0 
                  ? 'Plan gratuito' 
                  : `$${parseFloat(selectedPlan.price)} ${selectedPlan.billing_cycle === 'MONTHLY' ? '/mes' : selectedPlan.billing_cycle === 'ANNUAL' ? '/año' : '/trimestre'}`
                }
                {selectedPlan.trial_days > 0 && ` • ${selectedPlan.trial_days} días de prueba gratis`}
              </p>
            </div>
          </div>
        </div>
      )}

      <RegistrationProgressBar currentStep={step} totalSteps={2} />
      
      {currentStepComponent()}

      {step < 3 && (
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Inicia sesión aquí
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
