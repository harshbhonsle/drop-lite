import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function DownloadPage() {
  const { fileId } = useParams();
  const [fileInfo, setFileInfo] = useState(null);
  const [code, setCode] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError('');
    setFileInfo(null);
    setDownloadUrl('');
    setLoading(true);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/download-file/${fileId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setFileInfo(data);
      })
      .catch(() => setError('Error fetching file info.'))
      .finally(() => setLoading(false));
  }, [fileId]);

  const handleVerify = async () => {
    if (!code || code.length !== 4) {
      setError('Please enter a valid 4-digit code');
      return;
    }

    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/download-file/${fileId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        setDownloadUrl(data.url || data.cloudinary_url);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch {
      setError('Server error during verification');
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
        <p className="text-gray-400 text-lg animate-pulse">Loading file info...</p>
      </section>
    );
  }

  if (error && !fileInfo) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
        <p className="max-w-md text-red-500 bg-gray-900 p-6 rounded-lg text-center shadow-lg">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#121212] text-white px-4 py-20 flex items-center justify-center">
      <div className="bg-[#1e1e1e] w-full max-w-md p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">🔐 Download File</h2>

        <p className="mb-2"><span className="font-semibold text-gray-300">Name:</span> {fileInfo?.fileName}</p>
        <p className="mb-6"><span className="font-semibold text-gray-300">Expires:</span> {new Date(fileInfo?.expiresAt).toLocaleString()}</p>

        <input
          type="text"
          maxLength={4}
          placeholder="Enter 4-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-2 mb-4 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-cyan-500 hover:bg-cyan-600 transition-colors text-white font-semibold py-2 rounded shadow"
        >
          Unlock & Download
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}

        {downloadUrl && (
          <div className="mt-6 text-center">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 font-medium hover:underline"
            >
              🔽 Download Now
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
