import React from 'react';
import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  description = 'This feature is currently under development. Check back soon!',
  backLink,
  backLabel = 'Go Back',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-primary-50 p-4 rounded-full mb-6">
        <Construction className="w-12 h-12 text-primary-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">{description}</p>
      {backLink && (
        <Link
          to={backLink}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          {backLabel}
        </Link>
      )}
    </div>
  );
};

export default ComingSoonPage;
