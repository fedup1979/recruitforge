// Edge Function: send-email
// Sends transactional emails via Resend
// Story: S5-001

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../_shared/rate-limit.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('PUBLIC_SITE_URL') || 'https://ambitia.io';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EmailTemplate = 'welcome' | 'application_received' | 'test_reminder' | 'status_change'
  | 'roleplay_invitation' | 'status_hired' | 'status_rejected' | 'status_pool'
  | 'status_interview' | 'status_review';

interface EmailRequest {
  template: EmailTemplate;
  to: string;
  data?: Record<string, string>;
}

function getEmailContent(template: EmailTemplate, data: Record<string, string> = {}): { subject: string; html: string } {
  const header = `
    <div style="background: linear-gradient(135deg, #2D5BFF 0%, #6C5CE7 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-family: Inter, sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AMBITIA</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-family: Inter, sans-serif; font-size: 13px;">Recrutement international</p>
    </div>
  `;

  const footer = `
    <div style="padding: 24px; text-align: center; color: #999; font-size: 12px; font-family: Inter, sans-serif; border-top: 1px solid #eee;">
      <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} AMBITIA — Recrutement international</p>
      <p style="margin: 0;">
        <a href="${SITE_URL}/privacy" style="color: #2D5BFF; text-decoration: none;">Confidentialité</a>
        &nbsp;·&nbsp;
        <a href="${SITE_URL}/terms" style="color: #2D5BFF; text-decoration: none;">CGU</a>
      </p>
    </div>
  `;

  const btn = (text: string, url: string) => `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${url}" style="background: linear-gradient(135deg, #2D5BFF 0%, #6C5CE7 100%); color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">${text}</a>
    </div>
  `;

  const wrap = (body: string) => `
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; font-family: Inter, -apple-system, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
      ${header}
      <div style="padding: 32px 28px;">
        ${body}
      </div>
      ${footer}
    </div>
  `;

  const p = (text: string) => `<p style="color: #444; line-height: 1.7; margin: 0 0 16px; font-size: 15px;">${text}</p>`;

  switch (template) {
    case 'welcome':
      return {
        subject: 'Bienvenue sur AMBITIA !',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Bienvenue, ${data.name || 'Candidat'} !</h2>
          ${p('Merci de vous être inscrit(e) sur AMBITIA. Nous sommes ravis de vous accompagner dans votre recherche d\'emploi.')}
          ${p('Commencez par consulter nos offres de postes disponibles :')}
          ${btn('Voir les postes', `${SITE_URL}/jobs`)}
        `),
      };

    case 'application_received':
      return {
        subject: 'Candidature reçue — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Candidature reçue !</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Nous avons bien reçu votre candidature pour le poste de <strong>${data.jobTitle || 'poste'}</strong>.`)}
          ${p('Prochaine étape : passez les tests en ligne pour compléter votre candidature.')}
          ${btn('Passer les tests', `${SITE_URL}/dashboard`)}
        `),
      };

    case 'test_reminder':
      return {
        subject: 'Rappel : complétez vos tests — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">N'oubliez pas vos tests !</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Il vous reste des tests à compléter pour votre candidature au poste de <strong>${data.jobTitle || 'poste'}</strong>.`)}
          ${p('Complétez-les pour avancer dans le processus de recrutement.')}
          ${btn('Passer les tests', `${SITE_URL}/dashboard`)}
        `),
      };

    case 'status_change':
      return {
        subject: 'Mise à jour de votre candidature — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Mise à jour de votre candidature</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Le statut de votre candidature pour <strong>${data.jobTitle || 'poste'}</strong> a été mis à jour : <strong>${data.status || ''}</strong>.`)}
          ${btn('Voir ma candidature', `${SITE_URL}/dashboard`)}
        `),
      };

    case 'status_interview':
      return {
        subject: 'Invitation à un entretien — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Félicitations !</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${data.jobTitle || 'poste'}</strong> a été retenue pour un entretien.`)}
          ${p('Un membre de notre équipe vous contactera prochainement pour convenir d\'un créneau.')}
          ${p('En attendant, préparez-vous en consultant votre tableau de bord :')}
          ${btn('Mon tableau de bord', `${SITE_URL}/dashboard`)}
        `),
      };

    case 'status_hired':
      return {
        subject: 'Bienvenue dans l\'équipe — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Bienvenue dans l'équipe !</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Nous sommes ravis de vous annoncer que vous avez été sélectionné(e) pour le poste de <strong>${data.jobTitle || 'poste'}</strong>.`)}
          ${p('Un membre de notre équipe vous contactera très prochainement pour les prochaines étapes de votre intégration.')}
          ${p('Encore félicitations et bienvenue !')}
          ${btn('Mon tableau de bord', `${SITE_URL}/dashboard`)}
        `),
      };

    case 'status_rejected':
      return {
        subject: 'Résultat de votre candidature — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Résultat de votre candidature</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Nous vous remercions pour votre intérêt pour le poste de <strong>${data.jobTitle || 'poste'}</strong> et le temps que vous avez consacré au processus de recrutement.`)}
          ${p('Après examen attentif de votre candidature, nous avons décidé de ne pas poursuivre pour ce poste. Cette décision ne remet pas en question vos compétences.')}
          ${p('N\'hésitez pas à consulter nos autres offres — de nouvelles opportunités sont régulièrement publiées.')}
          ${btn('Voir les postes', `${SITE_URL}/jobs`)}
        `),
      };

    case 'status_pool':
      return {
        subject: 'Votre profil conservé — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Votre profil a été conservé</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Nous vous remercions pour votre candidature au poste de <strong>${data.jobTitle || 'poste'}</strong>.`)}
          ${p('Votre profil a retenu notre attention et a été ajouté à notre vivier de talents. Nous vous recontacterons dès qu\'une opportunité correspondant à votre profil se présentera.')}
          ${btn('Mon tableau de bord', `${SITE_URL}/dashboard`)}
        `),
      };

    case 'status_review':
      return {
        subject: 'Candidature en cours d\'examen — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Candidature en examen</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Nous avons bien reçu l'ensemble de vos tests pour le poste de <strong>${data.jobTitle || 'poste'}</strong>.`)}
          ${p('Votre candidature est actuellement en cours d\'examen par notre équipe. Nous reviendrons vers vous dans les plus brefs délais.')}
          ${btn('Mon tableau de bord', `${SITE_URL}/dashboard`)}
        `),
      };

    case 'roleplay_invitation':
      return {
        subject: 'Invitation au test de roleplay vocal — AMBITIA',
        html: wrap(`
          <h2 style="color: #1A1D29; margin: 0 0 16px; font-size: 22px;">Test de roleplay vocal</h2>
          ${p(`Bonjour ${data.name || 'Candidat'},`)}
          ${p(`Félicitations ! Votre candidature pour <strong>${data.jobTitle || 'poste'}</strong> a été retenue pour l'étape suivante.`)}
          ${p('Vous êtes invité(e) à passer un test de roleplay vocal avec notre IA. Ce test simule un appel téléphonique et dure environ 10-15 minutes.')}
          ${btn('Passer le test', `${SITE_URL}/dashboard`)}
        `),
      };

    default:
      return { subject: 'AMBITIA', html: wrap(p('Notification')) };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limit: 20 emails per minute per IP
  const ip = getClientIp(req);
  const limit = checkRateLimit(`send-email:${ip}`, 20, 60_000);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterMs, corsHeaders);
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

    // Log email in database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from('email_notifications').insert({
      recipient: to,
      template,
      subject,
      resend_id: result.id,
      sent_at: new Date().toISOString(),
    }).catch(() => {}); // Don't fail if logging fails

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
