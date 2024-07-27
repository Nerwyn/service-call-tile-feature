export {};

declare global {
	interface Window {
		customCardFeatures: CustomCardFeature[];
		customTileFeatures: CustomCardFeature[];
	}

	interface CustomCardFeature {
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
