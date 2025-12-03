
import React from 'react';
import { Trash2, ExternalLink, FileText, Video, Download } from 'lucide-react';

interface CardProps {
  title: string;
  subtitle?: string; // date or content preview
  type: 'pdf' | 'note' | 'link' | 'youtube';
  imageUrl?: string;
  linkUrl?: string; // URL for "View" / External Link
  downloadUrl?: string; // Specific URL for "Download"
  onDelete: () => void;
  onClick?: () => void; // Main card click action
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  type, 
  imageUrl, 
  linkUrl, 
  downloadUrl,
  onDelete, 
  onClick 
}) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group flex flex-col h-full"
    >
      {imageUrl && (
        <div className="relative h-40 bg-slate-100 overflow-hidden cursor-pointer" onClick={onClick}>
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Video size={12} /> Play
          </div>
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-brand-600">
             {type === 'pdf' && <FileText size={18} />}
             {type === 'link' && <ExternalLink size={18} />}
             {type === 'note' && <FileText size={18} />}
          </div>
        </div>

        <h3 
          className="font-semibold text-slate-900 leading-tight mb-2 cursor-pointer hover:text-brand-600"
          onClick={onClick}
        >
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1 break-words whitespace-pre-line">
            {subtitle}
          </p>
        )}
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {type}
          </span>
          <div className="flex items-center gap-2">
            
            {/* Download Button (For PDFs) */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                // Don't use target=_blank for downloads if the server sets Content-Disposition: attachment,
                // but using it is safer to prevent page navigation if server fails.
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                title="Download"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={16} />
              </a>
            )}

            {/* View/External Link Button */}
            {linkUrl && (
              <a 
                href={linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                title={type === 'pdf' ? 'View in Browser' : 'Open Link'}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={16} />
              </a>
            )}

            {/* Delete Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
