import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadFile() {
  const [uploaded, setUploaded] = useState(() => {
    try {
      const saved = localStorage.getItem('uploaded');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [previewFiles, setPreviewFiles] = useState(() => {
    try {
      const saved = localStorage.getItem('previewFiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    setError('');
    setLoading(true);
    setUploaded(null);

    const previews = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));

    setPreviewFiles(previews);
    localStorage.setItem('previewFiles', JSON.stringify(previews));

    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        formData.append('images', file);
      } else if (file.type.startsWith('video/')) {
        formData.append('video', file);
      }
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload-file/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploaded(data);
        localStorage.setItem('uploaded', JSON.stringify(data));
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Clean up blob previews on unmount or when previewFiles changes
  useEffect(() => {
    return () => {
      previewFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [previewFiles]);

  // Clear localStorage only on tab/window close or navigation away (not on reload)
  useEffect(() => {
    const handlePageHide = (event) => {
      if (!event.persisted) {
        localStorage.removeItem('uploaded');
        localStorage.removeItem('previewFiles');
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  // Manual reset function
  const handleReset = () => {
    setUploaded(null);
    setPreviewFiles([]);
    localStorage.removeItem('uploaded');
    localStorage.removeItem('previewFiles');
  };

  return (
    <section className="bg-[#121212] min-h-screen flex flex-col justify-start p-6 sm:p-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col">
        {/* Header */}
        <header className="mb-8 text-center mt-24 sm:mt-40 px-2 sm:px-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-cyan-400 drop-shadow-lg select-none">
            DropLite
          </h1>
          <p className="mt-2 text-gray-400 text-base sm:text-lg italic max-w-md mx-auto">
            Securely share your files with ease and style.
          </p>
        </header>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer
            ${isDragActive ? 'bg-gray-900 border-gray-500' : 'bg-gray-800 border-gray-600'}
            text-gray-300 transition-colors duration-200 w-full`}
        >
          <input {...getInputProps()} />
          <p className="font-medium">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files, or click to select'}
          </p>
        </div>

        {/* Previews */}
        {previewFiles.length > 0 && (
          <aside className="mt-6 flex flex-wrap gap-4 justify-center">
            {previewFiles.map(({ preview, type, name }, index) => {
              if (type.startsWith('image/')) {
                return (
                  <img
                    key={index}
                    src={preview}
                    alt={name}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                  />
                );
              } else if (type.startsWith('video/')) {
                return (
                  <video
                    key={index}
                    src={preview}
                    controls
                    className="w-36 h-24 rounded-lg border border-gray-700"
                  />
                );
              } else {
                return (
                  <div
                    key={index}
                    className="w-24 h-24 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 text-xs p-2 break-words"
                  >
                    {name}
                  </div>
                );
              }
            })}
          </aside>
        )}

        {/* Upload Status */}
        {loading && (
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className="w-5 h-5 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-cyan-300 font-medium">Uploading...</span>
          </div>
        )}
        {error && <p className="mt-4 text-red-500">{error}</p>}

        {/* Upload Result */}
        {uploaded && (
          <div className="mt-8 text-green-400 px-2 sm:px-0">
            <p className="mb-2 text-green-500 font-semibold">✅ Upload successful!</p>
            <p className="mb-2 break-words">
              <strong>4-digit code:</strong>{' '}
              <code className="bg-gray-900 px-2 py-1 rounded select-all">{uploaded.code}</code>
            </p>
            <p className="mb-2 font-semibold">Download Link:</p>
            {uploaded.finalLink ? (
              <a
                href={uploaded.finalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline break-all"
              >
                {uploaded.finalLink}
              </a>
            ) : (
              <ul className="list-disc list-inside space-y-1 break-words">
                {uploaded.downloadLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline break-all"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm text-gray-400">
              Share the 4-digit code with anyone you want to give access to the file(s).
            </p>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="mt-6 inline-block px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Reset Upload
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
