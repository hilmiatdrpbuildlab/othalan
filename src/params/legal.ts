import type { ParamMatcher } from '@sveltejs/kit';

export const LEGAL_SLUGS = ['politica-de-privacidad', 'terminos-y-condiciones', 'politica-de-cookies'];

export const match: ParamMatcher = (param) => LEGAL_SLUGS.includes(param);
