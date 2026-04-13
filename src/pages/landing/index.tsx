import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Trophy, ArrowRight, Star } from 'lucide-react';
import { TipsterLayout } from '@/layouts/TipsterLayout';
import { useAuthStore } from '@/stores/authStore';
import { PostsFeedScreen } from '@/components/posts/PostsFeedScreen';

export default function Landing() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  if (token && role === "ROLE_TIPSTER") {
    return (
      <TipsterLayout isFixed={false}>
        <PostsFeedScreen />
      </TipsterLayout>
    );
  }

  const dummyTipsters = [
    { name: 'Alex Pronósticos', sport: 'Fútbol', winRate: '75%', roi: '+12.5%', avatar: 'https://i.pravatar.cc/150?u=1' },
    { name: 'BetMaster V', sport: 'Tenis', winRate: '68%', roi: '+8.2%', avatar: 'https://i.pravatar.cc/150?u=2' },
    { name: 'Hoops King', sport: 'Baloncesto', winRate: '72%', roi: '+15.1%', avatar: 'https://i.pravatar.cc/150?u=3' },
  ];

  return (
    <TipsterLayout>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
          Encuentra a los <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">Mejores Tipsters</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Únete a la plataforma líder para verificar estadísticas, seguir a expertos y mejorar tus pronósticos deportivos con datos reales.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/admin/registro" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center">
            Explorar Tipsters <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link to="/tipster/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 hover:bg-gray-50 border border-indigo-200 font-bold rounded-xl text-lg transition-all shadow-sm flex items-center justify-center">
            Soy Tipster
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">¿Por qué elegir Picka?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Estadísticas Verificadas</h3>
              <p className="text-gray-600">Todo el rendimiento de nuestros tipsters está auditado y es 100% real. Sin engaños.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Maximiza tu ROI</h3>
              <p className="text-gray-600">Sigue estrategias rentables y mejora el retorno de tus pronósticos a largo plazo.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-6 text-pink-600">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Los Mejores Expertos</h3>
              <p className="text-gray-600">Accede a un ranking actualizado de los pronosticadores con más éxito en distintas disciplinas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Tipsters (Dummy) Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Tipsters Destacados</h2>
              <p className="text-gray-600 mt-2">Los expertos con mejor rendimiento este mes</p>
            </div>
            <Link to="/admin/registro" className="text-indigo-600 hover:text-indigo-800 font-semibold items-center hidden sm:flex">
              Ver todos <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dummyTipsters.map((tipster, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center space-x-4 mb-6">
                  <img src={tipster.avatar} alt={tipster.name} className="w-16 h-16 rounded-full ring-2 ring-indigo-50" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center">
                      {tipster.name}
                      <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                    </h3>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{tipster.sport}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Win Rate</p>
                    <p className="text-xl font-bold text-gray-900">{tipster.winRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ROI</p>
                    <p className="text-xl font-bold text-emerald-600">{tipster.roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </TipsterLayout>
  );
}
