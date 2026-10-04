import React, { useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';

export const PhotoUploader = ({ value, onChange, label = "Photo / Document" }) => {
  const fileInputRef = useRef(null);

  // Clear HTML file input whenever value is cleared/empty
  useEffect(() => {
    if (!value && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG Base64 data URL
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        onChange(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange('');
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">{label}</label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-36 flex items-center justify-center">
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
          >
            <Camera className="w-5 h-5 text-emerald-600" />
            <span>Take Photo / Gallery</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};
