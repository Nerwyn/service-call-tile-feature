export interface IConfig {
	type: string;
	entries: IEntry[];
}

export interface IEntry
	extends IServiceCall,
		IStyle,
		ISliderOptions,
		ISelectorOptions {
	type?: TileFeatureType;
	value_attribute?: string;
	entity_id?: string;
	autofill_entity_id?: boolean;
	confirmation?: boolean | IConfirmation;
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

export interface IStyle {
	color?: string;
	opacity?: number;
	icon?: string;
	icon_color?: string;
	label?: string;
	label_color?: string;
	background_color?: string;
	background_opacity?: number;
	flex_basis?: string;
}

export type ThumbType = 'default' | 'line' | 'flat';

export interface ISliderOptions {
	range?: [number, number];
	step?: number;
	thumb?: ThumbType;
}

export interface IOption extends IEntry {
	option?: string;
	invert_icon?: boolean;
	invert_label?: boolean;
}

export interface ISelectorOptions {
	options?: IOption[];
	invert_icon?: boolean;
	invert_label?: boolean;
}
