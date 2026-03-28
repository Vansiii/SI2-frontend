import { Briefcase, ChevronRight } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import type { RegistrationFieldErrors, SaasRegistrationData } from '../types';

interface Props {
  formData: SaasRegistrationData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNext: () => void;
  errors: RegistrationFieldErrors;
}

function inputClass(hasError: boolean): string {
  return `focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-lg py-3 outline-none border transition-colors ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`;
}

export function CompanyInfoStep({ formData, onChange, onNext, errors }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Nombre de la Entidad Financiera
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={onChange}
              className={`${inputClass(Boolean(errors.companyName))} pl-10`}
              placeholder="Ingresa el nombre de la entidad financiera"
              aria-invalid={Boolean(errors.companyName)}
            />
          </div>
          {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>}
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Tipo de Institución
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={onChange}
              className={`${inputClass(Boolean(errors.industry))} px-3 bg-white`}
              aria-invalid={Boolean(errors.industry)}
            >
              <option value="banking">Banco Comercial</option>
              <option value="microfinance">Microfinanciera</option>
              <option value="cooperative">Cooperativa de Crédito</option>
              <option value="fintech">Fintech</option>
            </select>
          </div>
          {errors.industry && <p className="mt-1 text-xs text-red-600">{errors.industry}</p>}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Continuar
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
