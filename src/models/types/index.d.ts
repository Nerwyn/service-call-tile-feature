export {};

declare global {
	interface Window {
		customTileFeatures: CustomTileFeature[];
	}

	interface CustomTileFeature {
		type: string;
		name: string;
		configurable?: boolean;
		supported?: () => boolean;
	}

	interface Event {
		// eslint-disable-next-line
		detail?: Record<string, any>;
	}
}
