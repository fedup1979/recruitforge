// Edge Function: transcribe-video
// Transcribes video audio using Deepgram Nova-2 (French)
// Triggered fire-and-forget after video upload

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../_shared/rate-limit.ts';

const DEEPGRAM_API_KEY = Deno.env.get('DEEPGRAM_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscribeRequest {
  documentId: string;
  storagePath: string;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`transcribe:${clientIp}`, 5, 300_000); // 5 per 5 min
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs, corsHeaders);

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check Deepgram key
    if (!DEEPGRAM_API_KEY) {
      return new Response(JSON.stringify({ error: 'Deepgram API key not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { documentId, storagePath }: TranscribeRequest = await req.json();

    if (!documentId || !storagePath) {
      return new Response(JSON.stringify({ error: 'Missing documentId or storagePath' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to download file from storage
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('candidates')
      .download(storagePath);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: 'Failed to download video: ' + (downloadError?.message || 'unknown') }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send to Deepgram for transcription
    const dgResponse = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&language=fr&punctuate=true&smart_format=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/webm', // Works for video too
        },
        body: fileData,
      }
    );

    if (!dgResponse.ok) {
      const errText = await dgResponse.text();
      console.error('Deepgram error:', errText);
      return new Response(JSON.stringify({ error: 'Transcription failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dgResult = await dgResponse.json();
    const transcript = dgResult.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    // Update candidate_documents metadata with transcript
    await supabase
      .from('candidate_documents')
      .update({
        metadata: { transcript },
      })
      .eq('id', documentId);

    // Also update test_results for video_presentation if it exists
    // Find test_results that reference this document
    const { data: testResults } = await supabase
      .from('test_results')
      .select('id, result_data')
      .filter('result_data->>document_id', 'eq', documentId);

    if (testResults && testResults.length > 0) {
      for (const tr of testResults) {
        const updatedData = { ...(tr.result_data || {}), transcript };
        await supabase
          .from('test_results')
          .update({ result_data: updatedData })
          .eq('id', tr.id);
      }
    }

    return new Response(JSON.stringify({ success: true, transcript_length: transcript.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Transcribe error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
