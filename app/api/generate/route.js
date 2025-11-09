export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
      });
    }

    // Currently working models - October 2024
    const workingModels = [
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      'https://api-inference.huggingface.co/models/ogkalu/Comic-Diffusion',
      'https://api-inference.huggingface.co/models/dallinmackay/Van-Gogh-diffusion'
    ];

    for (const modelUrl of workingModels) {
      try {
        console.log(`Trying model: ${modelUrl}`);
        
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            inputs: prompt.substring(0, 200), // Short prompt
            parameters: {
              num_inference_steps: 20
            }
          }),
          timeout: 30000
        });

        console.log(`Response status for ${modelUrl}: ${response.status}`);

        if (response.status === 200) {
          const imageBuffer = await response.arrayBuffer();
          
          if (imageBuffer.byteLength > 0) {
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            
            return new Response(JSON.stringify({
              image: `data:image/jpeg;base64,${base64Image}`,
              success: true,
              model: modelUrl.split('/').pop()
            }));
          }
        } else if (response.status === 503) {
          // Model loading - try next one
          continue;
        }
      } catch (error) {
        console.log(`Model ${modelUrl} failed:`, error.message);
        // Try next model
        continue;
      }
    }

    // If all models failed
    return new Response(JSON.stringify({ 
      error: 'All models are currently unavailable. Please try again later or use simpler prompts like "cat", "sunset".' 
    }), { status: 500 });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error: ' + error.message 
    }), { status: 500 });
  }
}
