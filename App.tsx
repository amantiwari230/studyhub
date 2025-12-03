import React, { useState, useEffect } from 'react';
import { Tab, Note, PdfFile, Link, YoutubeVideo } from './types';
import { api, API_URL } from './services/api';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { Plus, BookOpen, FileText, Link as LinkIcon, Youtube, Layout } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.NOTES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [notes, setNotes] = useState<Note[]>([]);
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // for notes, urls
  const [file, setFile] = useState<File | null>(null);

  // Fetch Data on Load
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === Tab.NOTES) {
        const data = await api.notes.getAll();
        setNotes(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (activeTab === Tab.PDFS) {
        const data = await api.pdfs.getAll();
        setPdfs(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (activeTab === Tab.LINKS) {
        const data = await api.links.getAll();
        setLinks(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (activeTab === Tab.YOUTUBE) {
        const data = await api.youtube.getAll();
        setVideos(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === Tab.NOTES) {
        await api.notes.add({ title, content });
      } else if (activeTab === Tab.LINKS) {
        await api.links.add({ title, url: content });
      } else if (activeTab === Tab.YOUTUBE) {
        await api.youtube.add({ title, url: content });
      } else if (activeTab === Tab.PDFS && file) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('pdf', file);
        await api.pdfs.upload(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert("Failed to save item. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("Are you sure?")) return;
    
    try {
      if (activeTab === Tab.NOTES) await api.notes.delete(id);
      if (activeTab === Tab.PDFS) await api.pdfs.delete(id);
      if (activeTab === Tab.LINKS) await api.links.delete(id);
      if (activeTab === Tab.YOUTUBE) await api.youtube.delete(id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFile(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col sticky top-0 md:h-screen z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white">
            <BookOpen size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">StudyHub</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <NavButton 
            active={activeTab === Tab.NOTES} 
            onClick={() => setActiveTab(Tab.NOTES)} 
            icon={<Layout size={20} />} 
            label="Notes" 
          />
          <NavButton 
            active={activeTab === Tab.PDFS} 
            onClick={() => setActiveTab(Tab.PDFS)} 
            icon={<FileText size={20} />} 
            label="Documents" 
          />
          <NavButton 
            active={activeTab === Tab.LINKS} 
            onClick={() => setActiveTab(Tab.LINKS)} 
            icon={<LinkIcon size={20} />} 
            label="Links" 
          />
          <NavButton 
            active={activeTab === Tab.YOUTUBE} 
            onClick={() => setActiveTab(Tab.YOUTUBE)} 
            icon={<Youtube size={20} />} 
            label="Videos" 
          />
        </nav>

        <div className="pt-6 border-t border-slate-100">
           <p className="text-xs text-slate-400 text-center">v1.0.0 &copy; 2024</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.toLowerCase().replace('youtube', 'Videos')}</h2>
            <p className="text-slate-500 mt-1">Manage your {activeTab.toLowerCase()} collection</p>
          </div>
          <button 
            onClick={openModal}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-brand-500/20 transition-all active:scale-95 font-medium"
          >
            <Plus size={20} />
            <span>Add New</span>
          </button>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading && <div className="col-span-full text-center py-20 text-slate-400">Loading...</div>}
          
          {!isLoading && activeTab === Tab.NOTES && notes.map(item => (
            <Card 
              key={item.id} 
              title={item.title} 
              subtitle={item.content} 
              type="note" 
              onDelete={() => handleDelete(item.id)}
            />
          ))}

          {!isLoading && activeTab === Tab.PDFS && pdfs.map(item => (
             <Card 
               key={item.id}
               title={item.title}
               subtitle={`Added: ${new Date(item.created_at).toLocaleDateString()}`}
               type="pdf"
               linkUrl={`${API_URL}/${item.file_path}`} 
               onDownload={() => window.open(api.pdfs.getDownloadUrl(item.id), '_blank')}
               onDelete={() => handleDelete(item.id)}
               onClick={() => window.open(`${API_URL}/${item.file_path}`, '_blank')}
             />
          ))}

          {!isLoading && activeTab === Tab.LINKS && links.map(item => (
            <Card 
              key={item.id}
              title={item.title}
              subtitle={item.url}
              type="link"
              linkUrl={item.url}
              onDelete={() => handleDelete(item.id)}
              onClick={() => window.open(item.url, '_blank')}
            />
          ))}

          {!isLoading && activeTab === Tab.YOUTUBE && videos.map(item => (
            <Card 
              key={item.id}
              title={item.title}
              subtitle="Watch on YouTube"
              type="youtube"
              imageUrl={item.thumbnail}
              linkUrl={item.url}
              onDelete={() => handleDelete(item.id)}
              onClick={() => window.open(item.url, '_blank')}
            />
          ))}

          {!isLoading && 
            ((activeTab === Tab.NOTES && notes.length === 0) ||
            (activeTab === Tab.PDFS && pdfs.length === 0) ||
            (activeTab === Tab.LINKS && links.length === 0) ||
            (activeTab === Tab.YOUTUBE && videos.length === 0)) && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="mb-4 p-4 bg-slate-50 rounded-full">
                <Plus size={32} className="opacity-20" />
              </div>
              <p>No items found. Click "Add New" to get started.</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Add New ${activeTab === Tab.YOUTUBE ? 'Video' : activeTab === Tab.PDFS ? 'Document' : activeTab === Tab.NOTES ? 'Note' : 'Link'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              required
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="Enter a descriptive title"
            />
          </div>

          {activeTab === Tab.NOTES && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
              <textarea 
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
                placeholder="Write your notes here..."
              />
            </div>
          )}

          {(activeTab === Tab.LINKS || activeTab === Tab.YOUTUBE) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
              <input 
                required
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="https://..."
              />
            </div>
          )}

          {activeTab === Tab.PDFS && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PDF File</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input 
                  required
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="text-slate-400 mb-2" size={32} />
                <span className="text-sm text-slate-600 font-medium">{file ? file.name : "Click to upload PDF"}</span>
                <span className="text-xs text-slate-400 mt-1">Maximum size 10MB</span>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
             <button 
               type="button"
               onClick={() => setIsModalOpen(false)}
               className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={isLoading}
               className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
             >
               {isLoading ? 'Saving...' : 'Save Item'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
      active 
        ? 'bg-brand-50 text-brand-700 shadow-sm' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;