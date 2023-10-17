export interface IConfig {
	type: string;
	buttons: IButton[];
}

export interface IButton extends IServiceCall, IStyle {}

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
