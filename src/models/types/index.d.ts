export {};

declare global {
	interface Window {
		customTileFeatures: CustomTileFeature[];
	}

	interface CustomTileFeature {
		type: string;
		name: string;
		supported?: boolean;
		configurable?: boolean;
	}
}
