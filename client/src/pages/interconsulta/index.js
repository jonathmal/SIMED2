// src/pages/interconsulta/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { interconsultaService } from '@/services/interconsulta.service';
import Layout from '@/components/Layout';

const InterconsultaCard = ({ interconsulta }) => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const handleVerDetalles = (e) => {
    e.stopPropagation();
    router.push(`/interconsulta/${interconsulta._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 mb-4">
      <div className="p-4">
        <div className="cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-black font-semibold">
                {interconsulta.paciente?.nombre}
              </h2>
              <div className="space-y-1">
                <p className="text-sm text-gray-800">
                  HC: {interconsulta.paciente?.numeroHistoria}
                </p>
                <p className="text-sm text-gray-800">
                  De: {interconsulta.servicioSolicitante?.nombre}
                </p>
                <p className="text-sm text-gray-800">
                  Para: {interconsulta.servicioDestino?.nombre}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className="px-3 py-1 rounded-full text-sm border bg-gray-100 text-gray-800">
                {interconsulta.estado}
              </span>
              <button
                onClick={handleVerDetalles}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Objetivo de la Consulta
                </h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  {interconsulta.objetivoConsulta}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function InterconsultaIndex() {
  const [interconsultas, setInterconsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInterconsultas();
  }, []);

  const loadInterconsultas = async () => {
    try {
        setLoading(true);
        setError(null);

        const userString = localStorage.getItem('usuario');
        if (!userString) {
            throw new Error('No se encontró información del usuario');
        }

        const user = JSON.parse(userString);
        console.log('User data:', user);
        
        let response;
        
        if (user.rol === 'ADMIN') {
            console.log('Fetching all interconsultas for admin');
            response = await interconsultaService.getAllAdmin();
        } else {
            if (!user.servicio) {
                throw new Error('Usuario sin servicio asignado');
            }
            console.log('Fetching interconsultas for service:', user.servicio);
            response = await interconsultaService.getAllByService(user.servicio);
        }

        console.log('Response:', response);
        
        if (response.exito) {
            // Changed from response.interconsultas to response.data
            setInterconsultas(response.data || []);
        } else {
            throw new Error(response.error || 'Error al cargar las interconsultas');
        }
    } catch (err) {
        console.error('Error loading interconsultas:', err);
        setError(err.message || 'Error al cargar las interconsultas');
    } finally {
        setLoading(false);
    }
};

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Interconsultas</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">Cargando interconsultas...</div>
          ) : (
            <div className="space-y-4">
              {interconsultas.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                  No hay interconsultas disponibles
                </div>
              ) : (
                interconsultas.map((interconsulta) => (
                  <InterconsultaCard 
                    key={interconsulta._id} 
                    interconsulta={interconsulta}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}