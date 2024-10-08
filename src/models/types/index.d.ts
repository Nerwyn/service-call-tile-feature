export {};

declare global {
	interface Window {
		customCardFeatures: CustomCardFeature[];
	}

	interface CustomCardFeature {
		type: string;
		name: string;
		configurable?: boolean;
		supported?: () => boolean;
	}

	interface Event {
		// eslint-disable-next-line
		detail?: any;
	}
}
