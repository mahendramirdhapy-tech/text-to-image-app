'use client';
import { useState } from 'react';

export default function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError('');
    setImage(null);

    try {
      // Ab hum apne own API ko call karenge
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (data.image) {
        setImage(data.image);
      } else {
        throw new Error('No image received');
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#333',
          marginBottom: '30px'
        }}>
          🎨 Text to Image Generator
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate... (e.g., 'A beautiful sunset over mountains')"
            rows="4"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            disabled={loading}
          />
        </div>

        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : (!prompt.trim() ? '#999' : '#0070f3'),
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (loading || !prompt.trim()) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '🔄 Generating...' : '✨ Generate Image'}
        </button>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef5350',
            borderRadius: '8px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {image && (
          <div style={{ 
            marginTop: '30px', 
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>
              Generated Image:
            </h3>
            <img 
              src={image} 
              alt="Generated from AI" 
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
