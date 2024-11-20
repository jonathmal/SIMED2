// pages/interconsulta/[id]/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { interconsultaService } from '@/services/interconsulta.service';
import Layout from '@/components/Layout';

export default function InterConsultaDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [interconsulta, setInterconsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadInterconsulta();
    }
  }, [id]);

  const loadInterconsulta = async () => {
    try {
      setLoading(true);
      const response = await interconsultaService.getById(id);
      setInterconsulta(response.data || response);
    } catch (err) {
      console.error('Error loading interconsulta:', err);
      setError('Error al cargar los detalles de la interconsulta');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    try {
      setUpdating(true);
      setUpdateMessage('');
      
      // Get current user from localStorage
      const userString = localStorage.getItem('usuario');
      const user = JSON.parse(userString);
      
      // Update the status
      await interconsultaService.actualizarEstado(id, newStatus);
      
      // Refresh the interconsulta data
      await loadInterconsulta();
      
      setUpdateMessage('Estado actualizado correctamente');
      
      // Update the local state immediately for better UX
      setInterconsulta(prev => ({
        ...prev,
        estado: newStatus,
        ultimaActualizacion: {
          usuario: user.nombre,
          fecha: new Date().toISOString()
        }
      }));

    } catch (err) {
      console.error('Error updating status:', err);
      setUpdateMessage('Error al actualizar el estado');
    } finally {
      setUpdating(false);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateMessage('');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto p-4">
            <div className="text-center py-6">Cargando detalles...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto p-4">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center">
            <Link 
              href="/interconsulta" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Volver
            </Link>
          </div>

          {interconsulta && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Detalles de la Interconsulta
                  </h1>
                </div>

                {/* Información del Paciente */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4">Información del Paciente</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                      <dd className="mt-1 text-lg text-gray-900">{interconsulta.paciente.nombre}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Historia Clínica</dt>
                      <dd className="mt-1 text-lg text-gray-900">{interconsulta.paciente.numeroHistoria}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Edad</dt>
                      <dd className="mt-1 text-lg text-gray-900">{interconsulta.paciente.edad} años</dd>
                    </div>
                  </div>
                </div>

                {/* Estado y Servicios */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4">Detalles de la Consulta</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="mt-1 text-lg text-gray-900">{interconsulta.estado}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Servicio Solicitante</dt>
                      <dd className="mt-1 text-lg text-gray-900">{interconsulta.servicioSolicitante.nombre}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Servicio Destino</dt>
                      <dd className="mt-1 text-lg text-gray-900">{interconsulta.servicioDestino.nombre}</dd>
                    </div>
                  </div>
                </div>

                {/* Historia Clínica y Objetivo */}
                <div className="p-6 border-b border-gray-200">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Objetivo de la Consulta</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{interconsulta.objetivoConsulta}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Historia Clínica</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{interconsulta.historiaClinica}</p>
                    </div>
                  </div>
                </div>

                {/* Estado Clínico */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4">Estado Clínico</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Evaluación Subjetiva</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
                        {interconsulta.estadoClinico?.subjetivo}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Signos Vitales</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-md">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Presión Arterial</dt>
                          <dd className="mt-1 text-gray-900">{interconsulta.estadoClinico?.signosVitales?.presionArterial}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">FC</dt>
                          <dd className="mt-1 text-gray-900">{interconsulta.estadoClinico?.signosVitales?.frecuenciaCardiaca}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">FR</dt>
                          <dd className="mt-1 text-gray-900">{interconsulta.estadoClinico?.signosVitales?.frecuenciaRespiratoria}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Temperatura</dt>
                          <dd className="mt-1 text-gray-900">{interconsulta.estadoClinico?.signosVitales?.temperatura}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">SatO2</dt>
                          <dd className="mt-1 text-gray-900">{interconsulta.estadoClinico?.signosVitales?.saturacionOxigeno}</dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Antecedentes */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4">Antecedentes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Personales</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{interconsulta.antecedentesPersonales}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Familiares</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{interconsulta.antecedentesFamiliares}</p>
                    </div>
                  </div>
                </div>

                {/* Medicamentos y Alergias */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4">Medicamentos y Alergias</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Alergias</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{interconsulta.alergias}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Medicamentos Pre-hospitalarios</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{interconsulta.medicamentos?.preHospitalarios}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Medicamentos Hospitalarios</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{interconsulta.medicamentos?.hospitalarios}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estudios Complementarios */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4">Estudios Complementarios</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Laboratorios</h3>
                      <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Resultados</dt>
                          <dd className="mt-1 text-gray-700">{interconsulta.laboratorios?.resultados}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Observaciones</dt>
                          <dd className="mt-1 text-gray-700">{interconsulta.laboratorios?.observaciones}</dd>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Imagenología</h3>
                      <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tipo de Estudio</dt>
                          <dd className="mt-1 text-gray-700">{interconsulta.imagenologia?.tipo}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                          <dd className="mt-1 text-gray-700">{interconsulta.imagenologia?.descripcion}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Hallazgos Relevantes</dt>
                          <dd className="mt-1 text-gray-700">{interconsulta.imagenologia?.hallazgosRelevantes}</dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Update and Response Buttons */}
                <div className="p-6 border-t border-gray-200">
                  <div className="space-y-6">
                    {/* Status Update Section */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Actualizar Estado</h2>
                      <div className="flex flex-col space-y-2">
                        <select 
                          className={`w-full md:w-64 rounded-md shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500
                            ${updating ? 'opacity-50 cursor-not-allowed' : ''}
                            border-gray-300`}
                          value={interconsulta.estado}
                          onChange={handleStatusChange}
                          disabled={updating}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_PROCESO">En Proceso</option>
                          <option value="COMPLETADA">Completada</option>
                          <option value="CANCELADA">Cancelada</option>
                        </select>

                        {updating && (
                          <p className="text-sm text-blue-600">
                            Actualizando...
                          </p>
                        )}

                        {updateMessage && (
                          <p className={`text-sm ${
                            updateMessage.includes('Error') 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {updateMessage}
                          </p>
                        )}

                        <p className="text-sm text-gray-500">
                          Último cambio por: {interconsulta.ultimaActualizacion?.usuario || 'No registrado'}
                          {interconsulta.ultimaActualizacion?.fecha && (
                            <span className="ml-2">
                              ({new Date(interconsulta.ultimaActualizacion.fecha).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Response Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex-1 text-center"
                      >
                        Responder Físicamente
                      </button>
                      <button
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex-1 text-center"
                      >
                        Responder Virtualmente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}