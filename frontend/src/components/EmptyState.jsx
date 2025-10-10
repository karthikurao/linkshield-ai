// frontend/src/components/EmptyState.jsx
import React from 'react';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Using outline icons for a lighter feel

const EmptyState = ({
  icon,
  title = "Nothing to see here",
  message = "There is no data to display at the moment.",
}) => {
  const IconComponent = icon ?? DocumentMagnifyingGlassIcon;
  return (
    <div className="text-center py-12 px-6">
      <IconComponent className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
      <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
};

export default EmptyState;