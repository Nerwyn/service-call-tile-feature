import { IAction } from '../interfaces/IActions';

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

	interface Event {
		// eslint-disable-next-line
		detail?: Record<string, any>
	}
}
