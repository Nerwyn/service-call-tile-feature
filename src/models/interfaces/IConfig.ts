import { StyleInfo } from 'lit/directives/style-map.js';

import { IActions } from './IActions';

export interface IConfig {
	type: string;
	hide: boolean;
	show: boolean;
	entries: IEntry[];
}

export interface IEntry
	extends IActions,
		ISliderOptions,
		ISelectorOptions,
		ISpinnerOptions {
	type?: TileFeatureType;
	value_attribute?: string;

	entity_id?: string;
	autofill_entity_id?: boolean;

	icon?: string;
	label?: string;
	unit_of_measurement?: string;

	style?: StyleInfo;
	background_style?: StyleInfo;
	icon_style?: StyleInfo;
	label_style?: StyleInfo;
	slider_style?: StyleInfo;
}

export type TileFeatureType = 'button' | 'slider' | 'selector';

export type ThumbType = 'default' | 'line' | 'flat';

export interface ISliderOptions {
	range?: [number, number];
	step?: number;
	thumb?: ThumbType;
	tooltip?: boolean;
}

export interface IOption extends IEntry {
	option?: string;
}

export interface ISelectorOptions {
	options?: IOption[];
}

export interface ISpinnerOptions {
	step?: number;
	debounceTime?: number;
}
