import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface NewSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateScene: (title: string, synopsis: string) => Promise<void>;
}

export const NewSceneModal: React.FC<NewSceneModalProps> = ({
  isOpen,
  onClose,
  onCreateScene,
}) => {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreateScene(title, synopsis);
      setTitle('');
      setSynopsis('');
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0e1017] border border-neutral-800 rounded max-w-md w-full p-6 shadow-2xl text-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-neutral-400" />
            <h3 className="font-bold text-sm text-white">Initialize New Scene</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[11px] text-neutral-400 uppercase mb-1">
              Scene Heading / Title:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SUB-LEVEL 9 DEPRESSURIZATION"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#e5a93c]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 uppercase mb-1">
              Dramatic Synopsis / Action:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Elena cuts through the blast door with plasma torch while Reyes monitors perimeter sensors..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#e5a93c] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-neutral-700 text-neutral-300 rounded text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded bg-[#e5a93c] text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-[#d4972e] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Registering...' : 'Register Scene'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
