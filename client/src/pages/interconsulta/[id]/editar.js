// pages/interconsulta/[id]/editar.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/components/auth/withAuth';

const EditarInterconsulta = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Editar Interconsulta</h1>
      {/* Edit form will go here */}
    </div>
  );
};

export default withAuth(EditarInterconsulta);