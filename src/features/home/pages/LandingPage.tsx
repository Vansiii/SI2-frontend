import { Link } from 'react-router-dom';
import { Shield, Zap, BarChart3, CheckCircle2, Building2, Users, ChevronRight, Menu, X, Star, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSubscriptionPlans, calculateMonthlyPrice, type SubscriptionPlan } from '../../saas/services/subscriptionsApi';

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const plansData = await getSubscriptionPlans();
      // Ordenar por display_order y filtrar solo activos
      const activePlans = plansData
        .filter(plan => plan.is_active)
        .sort((a, b) => a.display_order - b.display_order);
      setPlans(activePlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: number) => {
    setSelectedPlan(planId);
  };

  const getRegistrationUrl = () => {
    if (selectedPlan) {
      return `/register?plan=${selectedPlan}`;
    }
    return '/register';
  };

  const formatPrice = (plan: SubscriptionPlan) => {
    const price = parseFloat(plan.price);
    if (price === 0) return 'Gratis';
    
    const monthlyPrice = calculateMonthlyPrice(plan);
    return `$${monthlyPrice.toFixed(0)}`;
  };

  const getBillingText = (plan: SubscriptionPlan) => {
    if (parseFloat(plan.price) === 0) return '';
    
    switch (plan.billing_cycle) {
      case 'MONTHLY':
        return '/mes';
      case 'QUARTERLY':
        return '/mes (facturado trimestralmente)';
      case 'ANNUAL':
        return '/mes (facturado anualmente)';
      default:
        return '/mes';
    }
  };

  const getPopularPlan = () => {
    // El plan más popular es el que tiene display_order = 2 (generalmente el plan Pro)
    return plans.find(plan => plan.display_order === 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                FinCore
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Características</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Precios</a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all">
                Registrarse
              </Link>
            </div>

            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Características</a>
              <a href="#pricing" className="block text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Precios</a>
              <a href="#faq" className="block text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <Link to="/login" className="w-full text-center py-2 text-base font-medium text-blue-600 bg-blue-50 rounded-lg">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="w-full text-center py-2 text-base font-medium text-white bg-blue-600 rounded-lg shadow-sm">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
          {/* Decorative glowing blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] -z-10 animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-[100px] -z-10 animate-float delay-500"></div>
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-balance z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full border border-blue-600 bg-blue-400 animate-pulse"></span>
              FinCore
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up delay-100">
              El sistema core para <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                instituciones financieras
              </span>
            </h1>
            
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
              Gestiona créditos, clientes y reportes regulatorios en una plataforma 
              segura, escalable y fácil de usar diseñada para la era moderna.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up delay-300">
              <Link to={getRegistrationUrl()} className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:-translate-y-1 transition-all w-full sm:w-auto">
                {selectedPlan ? 'Registrarse con plan seleccionado' : 'Comenzar gratis'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="#pricing" className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-slate-700 bg-white/80 backdrop-blur border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl shadow-sm hover:shadow hover:-translate-y-1 transition-all w-full sm:w-auto">
                Ver planes
              </a>
            </div>
            
            <div className="mt-16 sm:mt-24 animate-fade-in-up delay-400">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">Confiado por instituciones innovadoras</p>
              <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-50 grayscale">
                <div className="flex items-center gap-2 text-xl font-bold font-serif"><Building2 className="h-6 w-6"/> Banco Unión</div>
                <div className="flex items-center gap-2 text-xl font-bold"><Shield className="h-6 w-6"/> FinTech Sur</div>
                <div className="flex items-center gap-2 text-xl font-bold italic"><Users className="h-6 w-6"/> Cooperativa Pro</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Todo lo que necesitas en un solo lugar</h2>
              <p className="text-lg text-slate-600">Herramientas poderosas sin la complejidad de sistemas heredados.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Gestión Ultrarrápida</h3>
                <p className="text-slate-600 leading-relaxed">Procesa solicitudes de crédito y altas de clientes en minutos, automatizando la evaluación de riesgos financieros.</p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Seguridad Bancaria</h3>
                <p className="text-slate-600 leading-relaxed">Tus datos protegidos con encriptación de grado militar, autenticación 2FA y auditoría completa de acciones organizativas.</p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">Reportes Mágicos</h3>
                <p className="text-slate-600 leading-relaxed">Generación de reportes regulatorios con un clic. Visualizaciones claras del estado de la cartera y morosidad general.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -z-10"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200/40 rounded-full blur-[120px] -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Precios transparentes</h2>
              <p className="text-lg text-slate-600">Comienza gratis y escala cuando lo necesites. Sin contratos ocultos.</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">Cargando planes...</span>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                {plans.map((plan, index) => {
                  const isPopular = getPopularPlan()?.id === plan.id;
                  const isSelected = selectedPlan === plan.id;
                  const price = formatPrice(plan);
                  const billingText = getBillingText(plan);
                  
                  return (
                    <div
                      key={plan.id}
                      className={`
                        relative rounded-3xl p-8 shadow-sm border flex flex-col h-full transition-all duration-300 cursor-pointer
                        ${isPopular 
                          ? 'bg-blue-600 border-blue-500 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)] transform md:-translate-y-4 hover:-translate-y-6' 
                          : 'bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-xl hover:-translate-y-2'
                        }
                        ${isSelected && !isPopular ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                        ${isSelected && isPopular ? 'ring-2 ring-white/50' : ''}
                      `}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {/* Badge "Más Popular" */}
                      {isPopular && (
                        <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center">
                          <span className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-sm flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Más Popular
                          </span>
                        </div>
                      )}

                      {/* Badge "Seleccionado" */}
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isPopular ? 'bg-white/20' : 'bg-blue-600'}`}>
                            <CheckCircle2 className={`h-4 w-4 ${isPopular ? 'text-white' : 'text-white'}`} />
                          </div>
                        </div>
                      )}

                      <h3 className={`text-xl font-semibold mb-2 relative z-10 ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                        {plan.name}
                      </h3>
                      
                      <p className={`text-sm mb-6 relative z-10 ${isPopular ? 'text-blue-200' : 'text-slate-500'}`}>
                        {plan.description}
                      </p>
                      
                      <div className="mb-6 relative z-10">
                        <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                          {price}
                        </span>
                        <span className={`${isPopular ? 'text-blue-200' : 'text-slate-500'}`}>
                          {billingText}
                        </span>
                      </div>

                      <ul className="space-y-4 mb-8 flex-1 relative z-10">
                        {/* Límites principales */}
                        <li className={`flex gap-3 ${isPopular ? 'text-blue-100' : 'text-slate-600'}`}>
                          <CheckCircle2 className={`h-5 w-5 shrink-0 ${isPopular ? 'text-blue-300' : 'text-emerald-500'}`} />
                          {plan.max_users === -1 ? 'Usuarios ilimitados' : `Hasta ${plan.max_users} usuarios`}
                        </li>
                        
                        <li className={`flex gap-3 ${isPopular ? 'text-blue-100' : 'text-slate-600'}`}>
                          <CheckCircle2 className={`h-5 w-5 shrink-0 ${isPopular ? 'text-blue-300' : 'text-emerald-500'}`} />
                          {plan.max_loans_per_month === -1 ? 'Préstamos ilimitados' : `${plan.max_loans_per_month} préstamos/mes`}
                        </li>

                        {/* Features principales */}
                        {plan.has_workflows && (
                          <li className={`flex gap-3 ${isPopular ? 'text-blue-100' : 'text-slate-600'}`}>
                            <CheckCircle2 className={`h-5 w-5 shrink-0 ${isPopular ? 'text-blue-300' : 'text-emerald-500'}`} />
                            Workflows de aprobación
                          </li>
                        )}
                        
                        {plan.has_reporting && (
                          <li className={`flex gap-3 ${isPopular ? 'text-blue-100' : 'text-slate-600'}`}>
                            <CheckCircle2 className={`h-5 w-5 shrink-0 ${isPopular ? 'text-blue-300' : 'text-emerald-500'}`} />
                            Reportes avanzados
                          </li>
                        )}

                        {plan.has_api_access && (
                          <li className={`flex gap-3 ${isPopular ? 'text-blue-100' : 'text-slate-600'}`}>
                            <CheckCircle2 className={`h-5 w-5 shrink-0 ${isPopular ? 'text-blue-300' : 'text-emerald-500'}`} />
                            Acceso API
                          </li>
                        )}

                        {plan.has_priority_support && (
                          <li className={`flex gap-3 ${isPopular ? 'text-blue-100' : 'text-slate-600'}`}>
                            <CheckCircle2 className={`h-5 w-5 shrink-0 ${isPopular ? 'text-blue-300' : 'text-emerald-500'}`} />
                            Soporte prioritario 24/7
                          </li>
                        )}
                      </ul>

                      <Link 
                        to={`/register?plan=${plan.id}`}
                        className={`
                          w-full py-3 px-4 font-medium rounded-xl text-center transition-all relative z-10 block
                          ${isPopular 
                            ? 'bg-white hover:bg-blue-50 text-blue-600 hover:scale-[1.02] shadow-sm' 
                            : isSelected
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                          }
                        `}
                      >
                        {parseFloat(plan.price) === 0 
                          ? 'Empezar gratis' 
                          : plan.trial_days > 0 
                            ? `Probar ${plan.trial_days} días gratis`
                            : 'Seleccionar plan'
                        }
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mensaje de plan seleccionado */}
            {selectedPlan && (
              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Plan {plans.find(p => p.id === selectedPlan)?.name} seleccionado
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Haz clic en "Registrarse con plan seleccionado" para continuar
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-white border-t border-slate-100 relative">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12 animate-fade-in-up">Preguntas Frecuentes</h2>
            
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 hover:shadow-lg transition-all duration-300 group">
                <h4 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">¿Puedo cambiar de plan más adelante?</h4>
                <p className="text-slate-600">Por supuesto. Puedes hacer un upgrade o downgrade en cualquier momento desde tu panel de facturación. Si cambias a mitad de mes, prorratearemos el cobro.</p>
              </div>
              <div className="p-6 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 hover:shadow-lg transition-all duration-300 group">
                <h4 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">¿Qué tan seguros están mis datos?</h4>
                <p className="text-slate-600">Utilizamos encriptación AES-256 en reposo y TLS en tránsito. Realizamos copias de seguridad diarias y nuestra infraestructura está certificada SOC2 y cumple con PCI-DSS.</p>
              </div>
              <div className="p-6 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 hover:shadow-lg transition-all duration-300 group">
                <h4 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">¿Existe soporte para migración de datos?</h4>
                <p className="text-slate-600">Sí. Todos nuestros planes de pago incluyen soporte para importar tus clientes y créditos existentes vía CSV. En el plan Premium un consultor lo hará por ti.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 bg-blue-600 text-center px-4 overflow-hidden">
          {/* Background patterned overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">¿Listo para modernizar tu institución?</h2>
            <p className="text-blue-200 text-xl mx-auto mb-10">Únete a cientos de instituciones que ya confían en FinCore para operar de manera eficiente.</p>
            <Link to={getRegistrationUrl()} className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-blue-600 bg-white hover:bg-blue-50 rounded-xl shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300">
              {selectedPlan ? 'Registrarse con plan seleccionado' : 'Crear cuenta gratis ahora'}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-400 text-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold text-white">FinCore</span>
        </div>
        <p>© 2026 FinCore. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
