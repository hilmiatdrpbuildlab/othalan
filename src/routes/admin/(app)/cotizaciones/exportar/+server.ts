import type { RequestHandler } from './$types';
import { desc } from 'drizzle-orm';
import { requirePermission } from '$lib/server/auth';
import { audit } from '$lib/server/audit';
import { rfqRequests } from '$lib/server/db/schema';
import { RFQ_STATUS } from '$lib/site-config';
import { formatDateTime } from '$lib/utils/format';
import { rfqFilters } from '$lib/server/inbox';

const csvCell = (v: unknown) => {
	let s = v === null || v === undefined ? '' : Array.isArray(v) ? v.join(', ') : String(v);
	if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // spreadsheet formula injection guard
	return `"${s.replace(/"/g, '""')}"`;
};

export const GET: RequestHandler = async ({ locals, url }) => {
	const user = requirePermission(locals.user, 'leads', 'read');
	const { where } = rfqFilters(url);
	const rows = await locals.db.select().from(rfqRequests).where(where).orderBy(desc(rfqRequests.createdAt)).limit(5000);
	const head = ['Ticket', 'Fecha', 'Estado', 'Nombre', 'Empresa', 'RUT', 'Cargo', 'Correo', 'Teléfono', 'Prefiere', 'Servicio', 'Sectores', 'Región', 'Comuna', 'Inicio estimado', 'Licitación', 'N.º licitación', 'Superficie m²', 'Acero t', 'Presupuesto', 'Descripción'];
	const lines = rows.map((r) =>
		[
			r.ticketCode,
			formatDateTime(r.createdAt),
			RFQ_STATUS[r.status],
			r.contactName,
			r.company,
			r.rut,
			r.position,
			r.email,
			r.phone,
			r.contactPreference,
			r.serviceLabel,
			r.sectors,
			r.region,
			r.comuna,
			r.startDate,
			r.tenderType,
			r.tenderNumber,
			r.areaM2,
			r.steelTons,
			r.budgetRange,
			r.description
		]
			.map(csvCell)
			.join(';')
	);
	await audit(locals.db, user, 'export', 'cotizaciones', null, `${rows.length} filas`);
	// BOM + semicolon separator: opens correctly in Excel with Chilean regional settings.
	const body = '﻿' + [head.map(csvCell).join(';'), ...lines].join('\r\n');
	return new Response(body, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="cotizaciones-${new Date().toISOString().slice(0, 10)}.csv"`,
			'cache-control': 'no-store'
		}
	});
};
