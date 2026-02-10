// Edge Function: parse-cv
// Parses CV (PDF) using OpenAI GPT-4o structured output
// Triggered fire-and-forget after CV upload

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../_shared/rate-limit.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseCvRequest {
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
    const rl = checkRateLimit(`parse-cv:${clientIp}`, 10, 300_000); // 10 per 5 min
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs, corsHeaders);

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check OpenAI key
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { documentId, storagePath }: ParseCvRequest = await req.json();

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
      return new Response(JSON.stringify({ error: 'Failed to download CV: ' + (downloadError?.message || 'unknown') }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert PDF blob to base64 for OpenAI
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Send to OpenAI for structured extraction
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a CV parser. Extract structured data from the CV provided. Always respond in valid JSON matching the schema. If a field is not found, use an empty string or empty array. Extract all information in the original language of the CV (usually French).`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Parse this CV and extract structured information. Return JSON only, no markdown.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64}`,
                },
              },
            ],
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'parsed_cv',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Full name of the candidate' },
                email: { type: 'string', description: 'Email address' },
                phone: { type: 'string', description: 'Phone number' },
                location: { type: 'string', description: 'City/country of residence' },
                summary: { type: 'string', description: 'Professional summary or objective' },
                skills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of skills',
                },
                experience: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      company: { type: 'string' },
                      title: { type: 'string' },
                      dates: { type: 'string' },
                      description: { type: 'string' },
                    },
                    required: ['company', 'title', 'dates', 'description'],
                    additionalProperties: false,
                  },
                  description: 'Work experience entries',
                },
                education: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      school: { type: 'string' },
                      degree: { type: 'string' },
                      dates: { type: 'string' },
                    },
                    required: ['school', 'degree', 'dates'],
                    additionalProperties: false,
                  },
                  description: 'Education entries',
                },
                languages: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Languages spoken with level',
                },
              },
              required: ['name', 'email', 'phone', 'location', 'summary', 'skills', 'experience', 'education', 'languages'],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error('OpenAI error:', errText);
      return new Response(JSON.stringify({ error: 'CV parsing failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiResult = await openaiResponse.json();
    const content = openaiResult.choices?.[0]?.message?.content || '{}';

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Failed to parse OpenAI response as JSON:', content);
      parsed = {};
    }

    // Update candidate_documents metadata with parsed data
    const { data: existingDoc } = await supabase
      .from('candidate_documents')
      .select('metadata')
      .eq('id', documentId)
      .single();

    const existingMetadata = (existingDoc?.metadata as Record<string, unknown>) || {};

    await supabase
      .from('candidate_documents')
      .update({
        metadata: { ...existingMetadata, parsed },
      })
      .eq('id', documentId);

    return new Response(JSON.stringify({ success: true, fields: Object.keys(parsed) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Parse CV error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
