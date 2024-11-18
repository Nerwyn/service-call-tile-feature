import { StyleInfo } from 'lit/directives/style-map.js';

import { IActions } from './IActions';

export interface IConfig {
	type: string;
	styles?: string;
	entries: IEntry[];
}

export interface IEntry
	extends IActions,
		ISliderOptions,
		IDropdownSelectorOptions,
		ISpinboxOptions {
	type?: TileFeatureType;

	entity_id?: string;
	autofill_entity_id?: boolean;
	value_attribute?: string;
	value_from_hass_delay?: number;

	icon?: string;
	label?: string;
	unit_of_measurement?: string;
	styles?: string;

	haptics?: boolean;
}

export const TileFeatureTypes = [
	'button',
	'dropdown',
	'selector',
	'slider',
	'spinbox',
] as const;
export type TileFeatureType = (typeof TileFeatureTypes)[number];

export interface IOption extends IEntry {
	option?: string;
}

export interface IDropdownSelectorOptions {
	options?: IOption[];
}

export const ThumbTypes = ['default', 'line', 'flat', 'round'] as const;
export type ThumbType = (typeof ThumbTypes)[number];

export interface ISliderOptions {
	range?: [number, number];
	step?: number;
	thumb?: ThumbType;

	slider_style?: StyleInfo;
	tooltip_style?: StyleInfo;
}

export interface ISpinboxOptions {
	range?: [number, number];
	step?: number;
	debounce_time?: number;
	increment?: IEntry;
	decrement?: IEntry;
}
