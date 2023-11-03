export interface IConfig {
	type: string;
	entries: IEntry[];
}

export interface IEntry extends IServiceCall, IStyle, ISliderOptions {
	type: TileFeatureType;
	value_attribute?: string;
	entity_id?: string;
}

export type TileFeatureType = 'button' | 'slider';

export interface IServiceCall {
	service: string;
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

export interface IStyle {
	color?: string;
	opacity?: number;
	icon?: string;
	icon_color?: string;
	label?: string;
	label_color?: string;
}

export type ThumbType = 'default' | 'line' | 'flat';

export interface ISliderOptions {
	range?: [number, number];
	step?: number;
	thumb?: ThumbType;
	background_color?: string;
	background_opacity?: number;
}
