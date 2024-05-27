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
		ISpinboxOptions {
	type?: TileFeatureType;

	entity_id?: string;
	autofill_entity_id?: boolean;
	value_attribute?: string;
	value_from_hass_delay?: number;

	icon?: string;
	label?: string;
	unit_of_measurement?: string;

	haptics?: boolean;

	style?: StyleInfo;
	background_style?: StyleInfo;
	icon_style?: StyleInfo;
	label_style?: StyleInfo;
}

export type TileFeatureType = 'button' | 'slider' | 'selector' | 'spinbox';

export type ThumbType = 'default' | 'line' | 'flat' | 'round';

export interface ISliderOptions {
	range?: [number, number];
	step?: number;
	thumb?: ThumbType;

	slider_style?: StyleInfo;
	tooltip_style?: StyleInfo;
}

export interface IOption extends IEntry {
	option?: string;
}

export interface ISelectorOptions {
	options?: IOption[];
}

export interface ISpinboxOptions {
	range?: [number, number];
	step?: number;
	debounce_time?: number;
	increment?: IEntry;
	decrement?: IEntry;
}
