import { useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/components/auth/withAuth';
import { interconsultaService } from '@/services/interconsulta.service';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const INITIAL_FORM_STATE = {
  paciente: {
    nombre: '',
    edad: '',
    numeroHistoria: ''
  },
  servicioSolicitante: '',
  servicioDestino: '',
  objetivoConsulta: '',
  historiaClinica: '',
  estadoClinico: {
    subjetivo: '',
    signosVitales: {
      presionArterial: '',
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      temperatura: '',
      saturacionOxigeno: ''
    }
  },
  laboratorios: {
    resultados: '',
    observaciones: ''
  },
  imagenologia: {
    tipo: '',
    descripcion: '',
    hallazgosRelevantes: ''
  },
  antecedentesPersonales: '',
  antecedentesFamiliares: '',
  alergias: '',
  medicamentos: {
    preHospitalarios: '',
    hospitalarios: ''
  },
  prioridad: 'ALTA'
};

const servicios = [
  { id: '672e05bad3ce20d6407a5143', nombre: 'Cirugía' },
  { id: '672e099e636c9f5552583436', nombre: 'Medicina Interna' }
];

const CrearInterconsulta = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleChange = (e, section, subsection) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      if (section && subsection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: {
              ...prev[section][subsection],
              [name]: value
            }
          }
        };
      }
      
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: value
          }
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await interconsultaService.crearInterconsulta(formData);
      setSuccess(true);
      setFormData(INITIAL_FORM_STATE);
      
      // Redirect after successful creation
      setTimeout(() => {
        router.push('/interconsulta');
      }, 2000);
    } catch (err) {
      setError(err.message);
      // Scroll to error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Interconsulta</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>Interconsulta creada exitosamente. Redirigiendo...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6">
        {/* Datos del Paciente */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Datos del Paciente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.paciente.nombre}
                onChange={(e) => handleChange(e, 'paciente')}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Edad</label>
              <input
                type="number"
                name="edad"
                value={formData.paciente.edad}
                onChange={(e) => handleChange(e, 'paciente')}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">N° de Historia Clínica</label>
              <input
                type="text"
                name="numeroHistoria"
                value={formData.paciente.numeroHistoria}
                onChange={(e) => handleChange(e, 'paciente')}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Servicio Solicitante</label>
              <select
                name="servicioSolicitante"
                value={formData.servicioSolicitante}
                onChange={(e) => setFormData(prev => ({ ...prev, servicioSolicitante: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccione un servicio</option>
                {servicios.map(servicio => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Servicio Destino</label>
              <select
                name="servicioDestino"
                value={formData.servicioDestino}
                onChange={(e) => setFormData(prev => ({ ...prev, servicioDestino: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccione un servicio</option>
                {servicios.map(servicio => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Detalles de la Interconsulta */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Detalles de la Interconsulta</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Objetivo de la Consulta</label>
            <textarea
              name="objetivoConsulta"
              value={formData.objetivoConsulta}
              onChange={(e) => setFormData(prev => ({ ...prev, objetivoConsulta: e.target.value }))}
              rows="3"
              className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Historia Clínica</label>
            <textarea
              name="historiaClinica"
              value={formData.historiaClinica}
              onChange={(e) => setFormData(prev => ({ ...prev, historiaClinica: e.target.value }))}
              rows="3"
              className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </section>

        {/* Estado Clínico */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Estado Clínico</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Evaluación Subjetiva</label>
            <textarea
              name="subjetivo"
              value={formData.estadoClinico.subjetivo}
              onChange={(e) => handleChange(e, 'estadoClinico')}
              rows="3"
              className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Presión Arterial</label>
              <input
                type="text"
                name="presionArterial"
                value={formData.estadoClinico.signosVitales.presionArterial}
                onChange={(e) => handleChange(e, 'estadoClinico', 'signosVitales')}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">FC</label>
              <input
                type="text"
                name="frecuenciaCardiaca"
                value={formData.estadoClinico.signosVitales.frecuenciaCardiaca}
                onChange={(e) => handleChange(e, 'estadoClinico', 'signosVitales')}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">FR</label>
              <input
                type="text"
                name="frecuenciaRespiratoria"
                value={formData.estadoClinico.signosVitales.frecuenciaRespiratoria}
                onChange={(e) => handleChange(e, 'estadoClinico', 'signosVitales')}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Temperatura</label>
              <input
                type="text"
                name="temperatura"
                value={formData.estadoClinico.signosVitales.temperatura}
                onChange={(e) => handleChange(e, 'estadoClinico', 'signosVitales')}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SatO2</label>
              <input
                type="text"
                name="saturacionOxigeno"
                value={formData.estadoClinico.signosVitales.saturacionOxigeno}
                onChange={(e) => handleChange(e, 'estadoClinico', 'signosVitales')}
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Antecedentes */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Antecedentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Antecedentes Personales</label>
              <textarea
                name="antecedentesPersonales"
                value={formData.antecedentesPersonales}
                onChange={(e) => setFormData(prev => ({ ...prev, antecedentesPersonales: e.target.value }))}
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Antecedentes Familiares</label>
              <textarea
                name="antecedentesFamiliares"
                value={formData.antecedentesFamiliares}
                onChange={(e) => setFormData(prev => ({ ...prev, antecedentesFamiliares: e.target.value }))}
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Alergias y Medicamentos */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Alergias y Medicamentos</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alergias</label>
            <textarea
              name="alergias"
              value={formData.alergias}
              onChange={(e) => setFormData(prev => ({ ...prev, alergias: e.target.value }))}
              rows="2"
              className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Medicamentos Pre-hospitalarios</label>
              <textarea
                name="preHospitalarios"
                value={formData.medicamentos.preHospitalarios}
                onChange={(e) => handleChange(e, 'medicamentos')}
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medicamentos Hospitalarios</label>
              <textarea
                name="hospitalarios"
                value={formData.medicamentos.hospitalarios}
                onChange={(e) => handleChange(e, 'medicamentos')}
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Laboratorios e Imagenología */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Estudios Complementarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2">Laboratorios</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resultados</label>
                  <textarea
                    name="resultados"
                    value={formData.laboratorios.resultados}
                    onChange={(e) => handleChange(e, 'laboratorios')}
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.laboratorios.observaciones}
                    onChange={(e) => handleChange(e, 'laboratorios')}
                    rows="2"
                    className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2">Imagenología</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Estudio</label>
                  <input
                    type="text"
                    name="tipo"
                    value={formData.imagenologia.tipo}
                    onChange={(e) => handleChange(e, 'imagenologia')}
                    className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.imagenologia.descripcion}
                    onChange={(e) => handleChange(e, 'imagenologia')}
                    rows="2"
                    className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hallazgos Relevantes</label>
                  <textarea
                    name="hallazgosRelevantes"
                    value={formData.imagenologia.hallazgosRelevantes}
                    onChange={(e) => handleChange(e, 'imagenologia')}
                    rows="2"
                    className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prioridad */}
        <section>
          <label className="block text-sm font-medium text-gray-700">Prioridad</label>
          <select
            name="prioridad"
            value={formData.prioridad}
            onChange={(e) => setFormData(prev => ({ ...prev, prioridad: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`
              flex items-center px-4 py-2 rounded-md text-white font-medium
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors duration-200
            `}
          >
            {loading && <Clock className="animate-spin -ml-1 mr-2 h-5 w-5" />}
            {loading ? 'Creando...' : 'Crear Interconsulta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default withAuth(CrearInterconsulta);