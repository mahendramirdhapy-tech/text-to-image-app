export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
      });
    }

    // Use stable diffusion model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: prompt.substring(0, 500) // Limit length
        }),
      }
    );

    if (response.status === 503) {
      return new Response(JSON.stringify({ 
        error: 'Model is loading. Please try again in 30 seconds.' 
      }), { status: 503 });
    }

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ 
        error: `API Error: ${response.status}. Please check your token permissions.` 
      }), { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    return new Response(JSON.stringify({
      image: `data:image/jpeg;base64,${base64Image}`,
      success: true
    }));

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server error: ' + error.message 
    }), { status: 500 });
  }
}
