/**
 * Application status utilities — single source of truth.
 * Used by dashboard.astro, admin/candidates pages.
 */

export interface StatusInfo {
  label: string;
  class: string;
}

export const statusLabels: Record<string, StatusInfo> = {
  pending: { label: 'En attente', class: 'badge-warning' },
  testing: { label: 'Tests en cours', class: 'badge-info' },
  review: { label: 'En évaluation', class: 'badge-secondary' },
  interview: { label: 'Entretien', class: 'badge-accent' },
  hired: { label: 'Embauché', class: 'badge-success' },
  rejected: { label: 'Refusé', class: 'badge-error' },
  pool: { label: 'En vivier', class: 'badge-neutral' },
};

export function getStatusInfo(status: string): StatusInfo {
  return statusLabels[status] ?? { label: status, class: 'badge-ghost' };
}

/** Pipeline steps for progress display */
export const pipelineSteps = ['pending', 'testing', 'review', 'interview', 'hired'] as const;
export const stepLabels = ['Candidature', 'Tests', 'Review', 'Entretien', 'Décision'] as const;

/** Get current step index for a given status */
export function getStepIndex(status: string): number {
  if (status === 'hired' || status === 'rejected' || status === 'pool') return 4;
  const idx = pipelineSteps.indexOf(status as typeof pipelineSteps[number]);
  return idx >= 0 ? idx : 0;
}

/** Get progress percentage for a given status */
export function getProgressPercentage(status: string): number {
  const idx = getStepIndex(status);
  return Math.round(((idx + 1) / pipelineSteps.length) * 100);
}
