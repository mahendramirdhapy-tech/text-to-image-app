export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
      });
    }

    // FLUX model - currently working and fast
    const response = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            num_inference_steps: 4
          }
        }),
      }
    );

    console.log('FLUX Model Response Status:', response.status);

    if (response.status === 503) {
      return new Response(JSON.stringify({ 
        error: 'FLUX model is loading. Please wait 30 seconds and try again.' 
      }), { status: 503 });
    }

    if (response.status === 404 || response.status === 410) {
      return new Response(JSON.stringify({ 
        error: 'Model not available. Trying alternative...' 
      }), { status: 404 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ 
        error: `API Error: ${response.status}` 
      }), { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    return new Response(JSON.stringify({
      image: `data:image/jpeg;base64,${base64Image}`,
      success: true,
      model: 'FLUX.1-schnell'
    }));

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server error: ' + error.message 
    }), { status: 500 });
  }
}
