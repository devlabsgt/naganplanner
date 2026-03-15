import React from 'react';
import { getDepartamentos } from './lib/action'; 
import ListDepartamentos from './ListDepartamento'; 

export default async function GestorDeparta() {
  const data = await getDepartamentos();

  return (
    <div className="w-full">
       <ListDepartamentos initialData={data || []} />
    </div>
  );
}