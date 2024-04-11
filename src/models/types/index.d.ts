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
		detail?: Record<
			string,
			| string
			| number
			| boolean
			| IData
			| Record<string, string | number | boolean>
		> | IAction;
	}
}
