/** Serializable CMS field/column definitions shared by the server engine and the admin UI. */

export type FieldType =
	| 'text'
	| 'textarea'
	| 'markdown'
	| 'number'
	| 'decimal'
	| 'boolean'
	| 'date'
	| 'datetime'
	| 'select'
	| 'relation'
	| 'multirelation'
	| 'image'
	| 'file'
	| 'gallery'
	| 'list'
	| 'icon'
	| 'slug'
	| 'email'
	| 'url'
	| 'status';

export type Option = { value: string; label: string };

export type FieldDef = {
	name: string;
	label: string;
	type: FieldType;
	required?: boolean;
	max?: number;
	help?: string;
	placeholder?: string;
	options?: Option[];
	/** for slug fields: which field to derive from */
	slugFrom?: string;
	/** layout */
	width?: 'full' | 'half' | 'third';
	section?: string;
	suffix?: string;
	/** never shown to the public (UI hint) */
	private?: boolean;
};

export type ColumnDef = {
	key: string;
	label: string;
	kind?: 'text' | 'status' | 'bool' | 'date' | 'image' | 'badge' | 'mono';
};

export type ResourceMeta = {
	key: string;
	label: string;
	singular: string;
	icon: string;
	group: string;
	titleField: string;
	sortable: boolean;
	hasStatus: boolean;
	description?: string;
	fields: FieldDef[];
	columns: ColumnDef[];
	publicPath?: string | null;
	canWrite: boolean;
};

export type MediaInfo = {
	id: string;
	storageKey: string;
	mime: string;
	filename: string;
	alt: string;
	width: number | null;
	height: number | null;
	bytes: number;
	dominantColor: string | null;
};
