import { StyleInfo } from 'lit/directives/style-map.js';

export interface IConfig {
	type: string;
	entries: IEntry[];
}

export interface IEntry extends IServiceCall, ISliderOptions, ISelectorOptions {
	type?: TileFeatureType;
	value_attribute?: string;
	entity_id?: string;
	autofill_entity_id?: boolean;
	confirmation?: boolean | IConfirmation;
	icon?: string;
	label?: string;
	unit_of_measurement?: string;
	style?: StyleInfo;
}

export type TileFeatureType = 'button' | 'slider' | 'selector';

export interface IServiceCall {
	service?: string;
	data?: IData;
	target?: ITarget;
}

export interface IData {
	[key: string]: string | string[] | number | boolean;
}

export interface ITarget {
	entity_id?: string | string[];
	device_id?: string | string[];
	area_id?: string | string[];
}

export interface IConfirmation {
	text?: string;
	exemptions?: IExemption[];
}

export interface IExemption {
	user: string;
}

export type ThumbType = 'default' | 'line' | 'flat';

export interface ISliderOptions {
	range?: [number, number];
	step?: number;
	thumb?: ThumbType;
}

export interface IOption extends IEntry {
	option?: string;
}

export interface ISelectorOptions {
	options?: IOption[];
}
