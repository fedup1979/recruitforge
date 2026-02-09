// Edge Function: vapi-webhook
// Receives Vapi webhook events when calls end
// Updates test_results with recording URL and transcript

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPI_WEBHOOK_SECRET = Deno.env.get('VAPI_WEBHOOK_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-vapi-secret',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Optional: Verify webhook secret if configured
    if (VAPI_WEBHOOK_SECRET) {
      const secret = req.headers.get('x-vapi-secret');
      if (secret !== VAPI_WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: 'Invalid webhook secret' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const payload = await req.json();
    const { message } = payload;

    if (!message) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no message' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle different Vapi event types
    const eventType = message.type;

    if (eventType === 'end-of-call-report') {
      const callId = message.call?.id;
      if (!callId) {
        return new Response(JSON.stringify({ ok: true, skipped: 'no call id' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Extract recording URL and transcript
      const recordingUrl = message.recordingUrl || message.call?.recordingUrl || '';
      const transcript = message.transcript || '';
      const duration = message.call?.duration || message.durationSeconds || 0;
      const summary = message.summary || '';
      const cost = message.cost || 0;

      // Find matching test_results by vapi_call_id in result_data
      const { data: results } = await supabase
        .from('test_results')
        .select('id, result_data')
        .filter('result_data->>vapi_call_id', 'eq', callId);

      if (results && results.length > 0) {
        const result = results[0];
        const existingData = (result.result_data || {}) as Record<string, any>;

        await supabase
          .from('test_results')
          .update({
            result_data: {
              ...existingData,
              recording_url: recordingUrl,
              transcript: transcript,
              duration_seconds: duration,
              summary: summary,
              cost: cost,
              webhook_received_at: new Date().toISOString(),
            },
            completed_at: new Date().toISOString(),
          })
          .eq('id', result.id);
      }

      return new Response(JSON.stringify({ ok: true, processed: 'end-of-call-report', callId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (eventType === 'status-update') {
      const callId = message.call?.id;
      const status = message.status;

      if (callId && status === 'ended') {
        // Mark call as ended (recording may come later via end-of-call-report)
        const { data: results } = await supabase
          .from('test_results')
          .select('id, result_data')
          .filter('result_data->>vapi_call_id', 'eq', callId);

        if (results && results.length > 0) {
          const result = results[0];
          const existingData = (result.result_data || {}) as Record<string, any>;

          await supabase
            .from('test_results')
            .update({
              result_data: {
                ...existingData,
                call_status: 'ended',
                ended_at: new Date().toISOString(),
              },
            })
            .eq('id', result.id);
        }
      }

      return new Response(JSON.stringify({ ok: true, processed: 'status-update' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For any other event, acknowledge without processing
    return new Response(JSON.stringify({ ok: true, skipped: eventType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
