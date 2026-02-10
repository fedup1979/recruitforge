// Edge Function: create-vapi-call
// Creates a Vapi call session for roleplay test
// Story: S4-007

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../_shared/rate-limit.ts';

const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Roleplay scenarios
const scenarios = {
  easy: {
    name: 'Sophie - Prospect motivée',
    systemPrompt: `Tu es Sophie, 32 ans, vendeuse dans un magasin de vêtements à Paris. Tu as vu une publicité Facebook pour une formation professionnelle en ligne et tu as demandé des informations.

Tu es MOTIVÉE et INTÉRESSÉE. Tu veux changer de carrière.

Ton comportement :
- Tu réponds aux questions avec enthousiasme
- Tu poses des questions sur la formation (durée, prix, débouchés)
- Tu es disponible pour un rendez-vous
- Tu dis "oui" facilement quand on te propose un rendez-vous avec un conseiller

Si le setter te propose un rendez-vous, accepte après 1-2 questions.

IMPORTANT : Tu parles UNIQUEMENT en français. Tu es polie et chaleureuse. Garde tes réponses courtes (1-3 phrases).`,
  },
  medium: {
    name: 'Marie - Prospect hésitante',
    systemPrompt: `Tu es Marie, 38 ans, secrétaire dans un cabinet d'avocats. Tu as cliqué sur une pub Facebook par curiosité pour une formation professionnelle en ligne, mais tu n'es PAS CONVAINCUE.

Tu es HÉSITANTE et SCEPTIQUE.

Ton comportement :
- Tu utilises ces objections (dans cet ordre, une par échange) :
  1. "Je ne sais pas, je réfléchis encore..."
  2. "C'est combien ? Ça doit être cher non ?"
  3. "Vous pouvez m'envoyer les infos par email plutôt ?"
  4. Si le setter gère bien les objections, accepte finalement le RDV
- Tu ne dis jamais "oui" tout de suite
- Tu es polie mais pas enthousiaste
- Tu poses des questions sur le prix et les modalités

Si le setter gère BIEN tes objections (réponses pertinentes, empathique), accepte le RDV.
Si le setter est MAUVAIS (robotique, agressif, ne répond pas), refuse et dis que tu rappelleras.

IMPORTANT : Tu parles UNIQUEMENT en français. Garde tes réponses courtes (1-3 phrases).`,
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limit: 5 calls per minute per IP (Vapi calls are expensive)
  const ip = getClientIp(req);
  const limit = checkRateLimit(`vapi-call:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterMs, corsHeaders);
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { applicationId, scenario } = await req.json();

    if (!applicationId || !scenario || !scenarios[scenario as keyof typeof scenarios]) {
      return new Response(JSON.stringify({ error: 'Missing applicationId or invalid scenario' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify application belongs to user
    const { data: app } = await supabase
      .from('applications')
      .select('id, user_id')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single();

    if (!app) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const selectedScenario = scenarios[scenario as keyof typeof scenarios];

    // Create Vapi call
    const vapiResponse = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistant: {
          model: {
            provider: 'openai',
            model: 'gpt-4o',
            systemMessage: selectedScenario.systemPrompt,
          },
          voice: {
            provider: '11labs',
            voiceId: 'EXAVITQu4vr4xnSDxMaL', // French female voice
          },
          firstMessage: scenario === 'easy'
            ? 'Allô ?'
            : 'Oui allô ?',
          recordingEnabled: true,
          transcriptionEnabled: true,
          language: 'fr-FR',
          name: selectedScenario.name,
        },
      }),
    });

    if (!vapiResponse.ok) {
      const errText = await vapiResponse.text();
      return new Response(JSON.stringify({ error: 'Vapi error', details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vapiData = await vapiResponse.json();

    // Create test_results entry
    await supabase.from('test_results').insert({
      application_id: applicationId,
      test_type: `roleplay_${scenario}`,
      started_at: new Date().toISOString(),
      result_data: {
        vapi_call_id: vapiData.id,
        scenario: scenario,
        scenario_name: selectedScenario.name,
      },
    });

    return new Response(JSON.stringify({
      callId: vapiData.id,
      webCallUrl: vapiData.webCallUrl,
      scenario: selectedScenario.name,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
