import { Construction } from 'lucide-react';

function PlaceholderPage({ title, description, week }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-100 rounded-2xl mb-6">
          <Construction className="w-10 h-10 text-violet-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{title}</h1>
        <p className="text-slate-600 mb-4">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-full">
          <span className="text-sm text-violet-700 font-medium">🚧 Coming in {week}</span>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;