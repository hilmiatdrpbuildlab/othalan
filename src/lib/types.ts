export type PublicMedia = {
	id: string;
	storageKey: string;
	mime: string;
	width: number | null;
	height: number | null;
	alt: string;
	caption: string | null;
	focalX: number;
	focalY: number;
	dominantColor: string | null;
	filename: string;
	bytes: number;
};
