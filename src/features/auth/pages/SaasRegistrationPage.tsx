import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
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
  const [step, setStep] = useState<RegistrationStep>(1);
  const [formData, setFormData] = useState<SaasRegistrationData>({
    companyName: '',
    industry: 'banking',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<RegistrationFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

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
