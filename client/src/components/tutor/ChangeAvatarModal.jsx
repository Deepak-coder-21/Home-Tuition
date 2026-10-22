import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Check, 
  Camera, 
  RefreshCw, 
  Sparkles,
  AlertCircle,
  Eye
} from 'lucide-react';

export const CURATED_AVATARS = [
  {
    id: 'av-1',
    label: 'Academic Scholar (Male)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-2',
    label: 'Senior Lecturer (Male)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-3',
    label: 'Mathematics Expert (Female)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-4',
    label: 'Science Specialist (Male)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-5',
    label: 'Languages Faculty (Female)',
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-6',
    label: 'Primary Educator (Female)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-7',
    label: 'Commerce & Accounts (Male)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-8',
    label: 'STEM & Robotics (Female)',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80'
  }
];

export default function ChangeAvatarModal({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  tutorName,
  onSave 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileProcess = (file) => {
    setFileError('');
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Image is too large. Maximum allowed size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    setUrlError('');
    if (!urlInput.trim()) {
      setUrlError('Please enter a valid image web URL.');
      return;
    }
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      setUrlError('URL must start with http:// or https://');
      return;
    }

    // Pre-test image load
    const testImg = new window.Image();
    testImg.onload = () => {
      setSelectedAvatar(urlInput.trim());
      setUrlError('');
    };
    testImg.onerror = () => {
      setUrlError('Could not load image from this URL. Please check the link.');
    };
    testImg.src = urlInput.trim();
  };

  const [applyError, setApplyError] = useState('');

  const handleSaveAndApply = async () => {
    setIsApplying(true);
    setApplyError('');
    try {
      if (onSave) {
        await onSave(selectedAvatar);
      }
      setIsApplying(false);
      onClose();
    } catch (err) {
      setIsApplying(false);
      setApplyError(err?.message || 'Failed to upload photo. Please check your network and try again.');
    }
  };

  const handleResetToDefault = () => {
    setSelectedAvatar(CURATED_AVATARS[0].url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-warm-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-900 text-white p-6 sm:px-8 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-800 border border-brand-700 flex items-center justify-center text-amber-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold">
                Change Profile Picture
              </h2>
              <p className="text-xs text-stone-300">
                Educator: {tutorName || 'Tutor Profile'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white hover:bg-brand-800 rounded-xl transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Live Preview Bar */}
          <div className="bg-warm-50 rounded-2xl p-4 border border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={selectedAvatar}
                  alt="Profile preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-700 shadow-md"
                />
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-extrabold rounded-md shadow uppercase tracking-wider">
                  New
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">Live Preview</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                    High Quality
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  This photo will appear on your public search card, profile page, and inquiry chats.
                </p>
              </div>
            </div>

            {selectedAvatar !== currentAvatar && (
              <button
                type="button"
                onClick={() => setSelectedAvatar(currentAvatar)}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 transition shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Revert to Previous</span>
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'upload'
                  ? 'border-brand-800 text-brand-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload from Device</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'preset'
                  ? 'border-brand-800 text-brand-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Verified Educator Avatars</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'url'
                  ? 'border-brand-800 text-brand-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Image Web Link</span>
            </button>
          </div>

          {/* Tab 1: Upload from Device */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-brand-700 bg-brand-50/50 scale-[0.99]'
                    : 'border-stone-300 hover:border-brand-600 hover:bg-stone-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center mx-auto mb-3 border border-brand-100 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>

                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  Click to choose a photo or drag & drop here
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Supports PNG, JPG, JPEG, or WebP. Professional front-facing academic or teaching portraits work best.
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-stone-100 rounded-full text-[11px] font-semibold text-stone-600">
                  Maximum file size: 5MB
                </div>
              </div>

              {fileError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Verified Educator Avatars */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600">
                Choose one of our verified, professional educator headshots suitable for home and online tutors:
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CURATED_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={`relative group p-2 rounded-2xl border-2 text-left transition flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-brand-800 bg-brand-50/60 ring-2 ring-brand-800/20 shadow-md'
                          : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200">
                        <img
                          src={avatar.url}
                          alt={avatar.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand-900/40 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-stone-700 text-center leading-tight line-clamp-2">
                        {avatar.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Image Web Link */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Direct Image Web URL (HTTP/HTTPS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-example.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Preview Link
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Paste any public direct link from Unsplash, Google Photos, or your personal educator website.
                </p>
              </div>

              {urlError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}
            </form>
          )}

          {/* Helper Notice & Reset */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span>Tip: Clear lighting & cheerful expression increase student responses.</span>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-terracotta-600 hover:text-terracotta-700 font-semibold"
            >
              Reset to Default
            </button>
          </div>

        </div>

        {applyError && (
          <div className="mx-6 sm:mx-8 mb-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{applyError}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-stone-50 px-6 sm:px-8 py-4 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndApply}
            disabled={isApplying}
            className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isApplying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                <span>Saving Photo...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save & Apply Photo</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
