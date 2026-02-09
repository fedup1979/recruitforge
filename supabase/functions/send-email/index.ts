// Edge Function: send-email
// Sends transactional emails via Resend
// Story: S5-001

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('PUBLIC_SITE_URL') || 'https://ambitia.io';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EmailTemplate = 'welcome' | 'application_received' | 'test_reminder' | 'status_change' | 'roleplay_invitation';

interface EmailRequest {
  template: EmailTemplate;
  to: string;
  data?: Record<string, string>;
}

function getEmailContent(template: EmailTemplate, data: Record<string, string> = {}): { subject: string; html: string } {
  const header = `
    <div style="background-color: #2D5BFF; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-family: Inter, sans-serif; font-size: 24px;">AMBITIA</h1>
    </div>
  `;

  const footer = `
    <div style="padding: 24px; text-align: center; color: #666; font-size: 12px; font-family: Inter, sans-serif;">
      <p>&copy; ${new Date().getFullYear()} AMBITIA — Recrutement international</p>
      <p><a href="${SITE_URL}/privacy" style="color: #2D5BFF;">Politique de confidentialité</a></p>
    </div>
  `;

  const wrap = (body: string) => `
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; font-family: Inter, sans-serif;">
      ${header}
      <div style="padding: 32px 24px;">
        ${body}
      </div>
      ${footer}
    </div>
  `;

  switch (template) {
    case 'welcome':
      return {
        subject: 'Bienvenue sur AMBITIA !',
        html: wrap(`
          <h2 style="color: #1A1D29;">Bienvenue, ${data.name || 'Candidat'} !</h2>
          <p style="color: #444; line-height: 1.6;">Merci de vous être inscrit(e) sur AMBITIA. Nous sommes ravis de vous accompagner dans votre recherche d'emploi.</p>
          <p style="color: #444; line-height: 1.6;">Commencez par consulter nos offres de postes disponibles :</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/jobs" style="background-color: #2D5BFF; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Voir les postes</a>
          </div>
        `),
      };

    case 'application_received':
      return {
        subject: 'Candidature reçue — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29;">Candidature reçue !</h2>
          <p style="color: #444; line-height: 1.6;">Bonjour ${data.name || 'Candidat'},</p>
          <p style="color: #444; line-height: 1.6;">Nous avons bien reçu votre candidature pour le poste de <strong>${data.jobTitle || 'poste'}</strong>.</p>
          <p style="color: #444; line-height: 1.6;">Prochaine étape : passez les tests en ligne pour compléter votre candidature.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/dashboard" style="background-color: #2D5BFF; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Mon tableau de bord</a>
          </div>
        `),
      };

    case 'test_reminder':
      return {
        subject: 'Rappel : complétez vos tests — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29;">N'oubliez pas vos tests !</h2>
          <p style="color: #444; line-height: 1.6;">Bonjour ${data.name || 'Candidat'},</p>
          <p style="color: #444; line-height: 1.6;">Il vous reste des tests à compléter pour votre candidature au poste de <strong>${data.jobTitle || 'poste'}</strong>.</p>
          <p style="color: #444; line-height: 1.6;">Complétez-les pour avancer dans le processus de recrutement.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/dashboard" style="background-color: #2D5BFF; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Passer les tests</a>
          </div>
        `),
      };

    case 'status_change':
      return {
        subject: `Mise à jour de votre candidature — AMBITIA`,
        html: wrap(`
          <h2 style="color: #1A1D29;">Mise à jour de votre candidature</h2>
          <p style="color: #444; line-height: 1.6;">Bonjour ${data.name || 'Candidat'},</p>
          <p style="color: #444; line-height: 1.6;">Le statut de votre candidature pour <strong>${data.jobTitle || 'poste'}</strong> a été mis à jour : <strong>${data.status || ''}</strong>.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/dashboard" style="background-color: #2D5BFF; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Voir ma candidature</a>
          </div>
        `),
      };

    case 'roleplay_invitation':
      return {
        subject: 'Invitation au test de roleplay vocal — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29;">Test de roleplay vocal</h2>
          <p style="color: #444; line-height: 1.6;">Bonjour ${data.name || 'Candidat'},</p>
          <p style="color: #444; line-height: 1.6;">Félicitations ! Votre candidature pour <strong>${data.jobTitle || 'poste'}</strong> a été retenue pour l'étape suivante.</p>
          <p style="color: #444; line-height: 1.6;">Vous êtes invité(e) à passer un test de roleplay vocal avec notre IA. Ce test simule un appel téléphonique et dure environ 10-15 minutes.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/dashboard" style="background-color: #2D5BFF; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Passer le test</a>
          </div>
        `),
      };

    default:
      return { subject: 'AMBITIA', html: wrap('<p>Notification</p>') };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify admin auth for direct calls (or allow service role for triggers)
    const authHeader = req.headers.get('Authorization');
    const serviceKey = req.headers.get('x-service-key');

    if (!authHeader && serviceKey !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { template, to, data } = (await req.json()) as EmailRequest;

    if (!template || !to) {
      return new Response(JSON.stringify({ error: 'Missing template or to' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, html } = getEmailContent(template, data);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AMBITIA <noreply@ambitia.io>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      return new Response(JSON.stringify({ error: 'Resend error', details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await resendResponse.json();

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
