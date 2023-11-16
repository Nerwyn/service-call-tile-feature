# Service Call Tile Feature

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
![Project Maintenance][maintenance-shield]
[![GitHub Activity][last-commit-shield]][commits]
[![Community Forum][forum-shield]][forum]

[![Github][github]][github]

[![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=service-call-tile-feature&owner=Nerwyn&category=Plugin)

<a href="https://www.buymeacoffee.com/nerwyn" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

Call any service via tile features. This custom tile feature will let you create super customizable tile buttons, sliders, and selectors. [The Home Assistant developers gave us the ability to create custom tile features](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#tile-features), why is no one else taking advantage of it? And why isn't something like a generic service call tile button already in Home Assistant? I don't know but here it is.

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/example_tile.png" alt="example_tile" width="600"/>

# How To Use

The trade off for the level of customizability that this card offers is that it can be a bit confusing to use. All of the available features and options are documented below. This card can be installed using HACS by adding it as a custom frontend repository.

1. To start create a tile card. The entity ID can be anything you like.
2. Click `ADD FEATURE` and then `Service Call`
3. Click the edit icon on the `Service Call` entry. By default you should see something like this:

```yaml
type: custom:service-call
entries:
  - type: button
```

## Base Config

| Name    | Type   | Description/Value                                  |
| ------- | ------ | -------------------------------------------------- |
| type    | string | `custom:service-call`                              |
| entries | array  | List of entries to include in a tile features row. |

The custom service call feature is actually a row of entries, each of which have their own configuration. When you first add the `Service Call` feature to your tile card it creates a button to start. You can add more tile features to this row by adding more entries to the `entries` array.

## Entry Configs

### General Options

| Name               | Type                  | Description                                                                                                                                              |
| ------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type               | string                | Type of tile feature. Currently supported options are `button` and `slider`.                                                                             |
| value_attribute    | string                | The attribute to use to determine the value of the feature. Defaults to `state`.                                                                         |
| entity_id          | string                | The entity ID of the tile feature. Defaults to the entity ID provided in the service call data/target or the entity ID of the tile card.                 |
| autofill_entity_id | boolean               | Whether to autofill the `entity_id` of the tile feature and the service call data/target if no entity, device, or area ID is provided. Defaults to true. |
| confirmation       | boolean, Confirmation | Opens a browser popup asking you to confirm your action.                                                                                                 |

By default type will be `button`. If you're using an older version of this feature it may not be present but will still default to `button`. Currently `slider` and `selector` are also supported.

The `value_attribute` field is to set which entity attribute the feature should use for it's value, if not the default entity state. For sliders this field is used to determine the it's default value on render. For selectors this field is used for determining which option is currently selected. It can also be used for `VALUE` string interpolation as described below.

If you find that the autofilling of the entity ID in the service call or tile feature value is causing issues, setting `autofill_entity_id` to `false` may help. Just remember to set the entity ID of the tile feature and the entity, device, or area ID of the service call target.

More information on Home Assistant action confirmations can be found [here](https://www.home-assistant.io/dashboards/actions/#options-for-confirmation). Confirmation text supports string interpolation as described below.

### String Interpolation

Many fields such as colors and labels can have the entity state or attributes interpolated, or can accept CSS variables and functions.

If any of these values returns an empty string or undefined value, an empty string is returned for the entire string, not just the interpolation. Labels will also not be generated so icons will be properly centered.

To better understand entity attributes, use the states Developer Tool found in Home Assistant.

#### Value

Use `VALUE` to interpolate whatever is set in `value_attribute`, whether it is an entity's state (default) or attribute.

```yaml
type: custom:service-call
entries:
  - type: slider
    service: cover.set_cover_position
    value_attribute: current_position
    icon: mdi:curtains
    data:
      position: VALUE
    target:
      entity_id: cover.sunroom_curtains
```

#### State

Use `STATE` in a field to interpolate the state of an entity.

```yaml
type: custom:service-call
entries:
  - service: light.toggle
    icon: mdi:power
    label: STATE
    target:
      entity_id: light.sunroom_ceiling
```

#### Attributes

Use `ATTRIBUTE[]` to interpolate an attribute of an entity, putting the attribute name between the square brackets.

```yaml
type: custom:service-call
entries:
  - type: slider
    color: ATTRIBUTE[rgb_color]
    label: VALUE%
    value_attribute: brightness
    icon: mdi:brightness-4
    service: light.turn_on
    data:
      brightness_pct: VALUE
      entity_id: light.sunroom_ceiling
```

Certain attributes will have additional parsing applied to them before being interpolated.

- `brightness` gets converted from an 8 bit (0-255) value to a whole number percentage (0-100).
- `rgb_color` gets converted from an array of three values e.g. `[255, 128, 0]` to a CSS rgb function `rgb(255, 128, 0)`.

### Service Call Options

| Name    | Type   | Description                                                     |
| ------- | ------ | --------------------------------------------------------------- |
| service | string | The service call to make, e.g. `light.toggle` or `lock.unlock`. |
| target  | object | The entity IDs, device IDs, or area IDs to call the service on. |
| data    | object | Additional data to pass to the service call.                    |

If no target is provided, the tile card's entity ID will be used instead.

To better understand service calls, use the services Developer Tool found in Home Assistant.

### Style Options

| Name               | Type   | Description                                                                                          |
| ------------------ | ------ | ---------------------------------------------------------------------------------------------------- |
| color              | string | Custom color for the tile feature. Can also be a CSS function (see examples).                        |
| opacity            | float  | Opacity of the tile feature. Defaults to 0.2. Cannot be string interpolated.                         |
| icon               | string | Icon to use.                                                                                         |
| icon_color         | string | Custom color for the icon.                                                                           |
| label              | string | String label to place underneath the icon, or by itself.                                             |
| label_color        | string | Custom color for the string label.                                                                   |
| background_color   | string | Custom color for the tile feature background. Can also be a CSS function (see examples).             |
| background_opacity | number | Opacity of the tile feature background. Defaults to 0.2. Cannot be string interpolated.              |
| flex_basis         | string | Percentage of the row the the feature should populate relative to it's siblings. Defaults to `100%`. |

String interpolation can be used for any of these values except for opacity.

### Slider Specific Options

| Name  | Type   | Description                                                                                                                                                          |
| ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| range | array  | The minimum and maximum numbers for the slider, defaults to [0, 100].                                                                                                |
| step  | number | The step size of the slider. Defaults to 1/100 of the range. You may have to manually set this to a whole number for service data like light `color_temp`.           |
| thumb | string | The slider thumb style.<br />- `default`: Like a tile light brightness slider.<br />- `line`: Like a tile temperature slider.<br />- `flat`: Like a mushroom slider. |

### Selector Specific Options

| Name    | Type     | Description                                                                                                                             |
| ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| options | Option[] | An array of entries to use as options for the selector, each one being like it's own button feature                                     |
| option  | string   | A value to used to compare against the features value (see `value_attribute` above) to determine if it is the currently selected option |

# Feature Types

## Buttons

Buttons are the most basic type of custom tile feature, being based on the example provided in the Home Assistant developer documentation.

To create a button, add a Service Call tile feature to your tile and edit it. By default type will be set to button. In order for this button to actually do anything you need to give it a `service` to call, like so:

```yaml
type: custom:service-call
entries:
  - type: button
    service: light.toggle
```

As explained above, the entity ID of the feature and service call data is autofilled with the tile entity ID.

All basic style options work with service call buttons as show in [example 2](#Example-2)

## Sliders

Sliders allow you to create Home Assistant styled input range sliders, similar to those available for light brightness and temperature. But these sliders can be used for any service call.

To create a slider, add a Service Call tile feature to your tile and edit it. Change the type field under `entries` (NOT the root tile feature `type`) to `slider`. By default this will look like a normal tile light brightness or cover position slider, but you can change this to a couple of other thumb styles as shown in [example 3](#Example-3) using the `thumb` option.

Similarly to buttons, you have to set `service` to a service call for the slider to actually do anything.

Sliders can track either the state or attribute of an entity, meaning that when that entity's state or attribute changes so will the slider to match. By default it will track the `state` of an entity. To change this, set `value_attribute` to the name of the attribute you want the slider to track. In order to pass the the slider's value to a service call, set the value in the service call data to `VALUE`. This works just like string interpolation as described above.

```yaml
type: custom:service-call
entries:
  - type: slider
    service: light.turn_on
    value_attribute: brightness
    data:
      brightness_pct: VALUE
```

To better understand the attributes of Home Assistant entities, use the states tab in Home Assistant Developer tools. Remember, that you can also change the entity of the slider by setting `entity_id` either at the entry level or within the `data` or `target` objects (NOT at the root of the feature config).

By default the slider's range will be from 0 to 1, with a step size of 0.01. You will need to adjust this depending on the service you are calling. If you find that the service you are calling does not like non-whole numbers (like `light.turn` with `color_temp`), make sure to set step size to a whole number.

```yaml
type: custom:service-call
entries:
  - type: slider
    thumb: line
    background_color: linear-gradient(-90deg, rgb(255, 167, 87), rgb(255, 255, 251))
    background_opacity: 1
    value_attribute: color_temp
    service: light.turn_on
    range:
      - 153
      - 371
    step: 1
    data:
      color_temp: VALUE
```

## Selectors

Selectors allow you to create a row of service call buttons which with no gaps of which the currently active one will be highlighted, similar to those available for alarm control panel and thermostat modes. But like all features in this project it can be used for any service calls.

To create a selector, add a Service Call tile feature to your tile and edit it. Change the type field under `entries` (NOT the root tile feature `type`) to `selector`. At first you will see nothing! This is because you need to define the options to be listed out in the selector manually. Each of these options is actually a service call button as described above. For now let's use the options field to give each selector option an icon:

```yaml
type: custom:service-call
entries:
  - type: selector
    entity_id: input_select.listening_mode
    options:
      - icon: mdi:dolby
      - icon: mdi:music
      - icon: mdi:microsoft-xbox-controller
```

This card is set up to work with Home Assistant `input_select` entities out of the box. Just using the config above, you can use it to change the values of input selects entities. By default each button will call the `input_select.select_option` service. The list of options is automatically retrieved, but you still have to include the `options` array and give each option button style information so that they will render (you can create blank buttons by setting the option to `{}`).

Since each selector option is a service call button, you can override it's default behavior by including service call information as shown in [example 2](#Example-2). Doing so will also break the current option highlighting, but you can use the `option` field within an option alongside `value_attribute` to restore this, also shown in example 2. `option` will be the value to compare against the entity's value, whether that is it's state or one of it's attributes. If they match and are not undefined, then the the option will be highlighted. The option highlight color defaults to tile color, but can be changed by setting `color` to a different value. You can also set `color` within an option to give that option a different highlight color.

# Examples

## Example 1

A lock tile with lock and unlock buttons

```yaml
type: tile
entity: lock.front_door_ble
show_entity_picture: false
vertical: true
features:
  - type: custom:service-call
    buttons:
      - service: lock.lock
        icon: mdi:lock
      - service: lock.unlock
        icon: mdi:lock-open
card_mod:
  style:
    ha-tile-info$: |
      .secondary:after {
        visibility: visible;
        content: " - {{ states('sensor.front_door_battery_level') }}%";
      }
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/lock_tile.png" alt="lock_tile" width="600"/>

## Example 2

A light tile with a button for each bulb and a color selector, with emphasis on certain options.

```yaml
features:
  - type: custom:service-call
    buttons:
      - service: light.toggle
        icon: mdi:ceiling-light
        icon_color: red
		flex_basis: 200%
      - service: light.toggle
        icon: mdi:lightbulb
        icon_color: orange
        label: Bulb 1
        target:
          entity_id: light.chandelier_bulb_1
      - service: light.toggle
        icon: mdi:lightbulb
        icon_color: yellow
        label: Bulb 2
        target:
          entity_id: light.chandelier_bulb_2
      - service: light.toggle
        icon: mdi:lightbulb
        icon_color: green
        label: Bulb 3
        target:
          entity_id: light.chandelier_bulb_3
      - service: light.toggle
        icon: mdi:lightbulb
        icon_color: blue
        label: Bulb 4
        target:
          entity_id: light.chandelier_bulb_4
      - service: light.toggle
        icon: mdi:lightbulb
        icon_color: purple
        label: Bulb 5
        target:
          entity_id: light.chandelier_bulb_5
  - type: custom:service-call
    entries:
      - type: selector
        entity_id: light.chandelier
        value_attribute: rgb_color
        background_color: rgb(VALUE)
        options:
          - service: light.turn_on
            option: 255,0,0
            color: red
            label: Red
            label_color: red
            data:
              color_name: red
          - service: light.turn_on
            option: 0,128,0
            color: green
            label: Green
            label_color: green
            data:
              color_name: green
          - service: light.turn_on
            option: 0,0,255
            color: blue
            label: Blue
            label_color: blue
            data:
              color_name: blue
          - service: light.turn_on
            option: 255,166,86
            color: white
            label: White
            label_color: white
            flex_basis: 300%
            data:
              color_temp: 500
type: tile
entity: light.chandelier
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/light_tile.png" alt="light_tile" width="600"/>

## Example 3

Multiple sliders for a room's light and curtains.

```yaml
features:
  - type: custom:service-call
    entries:
      - service: light.toggle
        icon: mdi:power
        label: STATE
        data:
          entity_id: light.sunroom_ceiling
  - type: custom:service-call
    entries:
      - type: slider
        color: ATTRIBUTE[rgb_color]
        label: VALUE%
        value_attribute: brightness
        icon: mdi:brightness-4
        service: light.turn_on
        data:
          brightness_pct: VALUE
          entity_id: light.sunroom_ceiling
      - type: slider
        thumb: line
        background_color: linear-gradient(-90deg, rgb(255, 167, 87), rgb(255, 255, 251))
        background_opacity: 1
        value_attribute: color_temp
        service: light.turn_on
        label: ATTRIBUTE[color_temp] Mireds
        label_color: var(--disabled-color)
        icon: mdi:thermometer
        range:
          - 153
          - 371
        step: 1
        data:
          color_temp: VALUE
          entity_id: light.sunroom_ceiling
  - type: custom:service-call
    entries:
      - type: slider
        service: cover.set_cover_position
        value_attribute: current_position
        icon: mdi:curtains
        icon_color: var(--disabled-color)
        color: var(--tile-color)
        data:
          position: VALUE
          entity_id: cover.sunroom_curtains
  - type: custom:service-call
    entries:
      - type: slider
        service: media_player.volume_set
        value_attribute: volume_level
        icon: mdi:spotify
        color: rgb(31, 223, 100)
        label: ATTRIBUTE[media_title]
        range:
          - 0
          - 1
        thumb: flat
        data:
          volume_level: VALUE
          entity_id: media_player.spotify
type: tile
entity: binary_sensor.sun_room
color: accent
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/slider_tile.png" alt="slider_tile" width="600"/>

## Example 4

Selectors for input ranges. Note that the opacity of selector buttons is set to 0 by default, so they are completely transparent against the selector background.

```yaml
features:
  - type: custom:service-call
    entries:
      - type: selector
        entity_id: input_select.lounge_tv_theater_mode
        color: var(--blue-color)
        flex_basis: 140%
        options:
          - icon: mdi:movie
          - icon: mdi:movie-off
          - icon: mdi:movie-outline
          - icon: mdi:movie-off-outline
      - type: selector
        entity_id: input_select.lounge_tv_listening_mode
        options:
          - icon: mdi:dolby
          - icon: mdi:music
          - icon: mdi:microsoft-xbox-controller
  - type: custom:service-call
    entries:
      - type: selector
        entity_id: input_select.lounge_tv_source
        color: var(--red-color)
        options:
          - icon: mdi:television-box
          - icon: mdi:microsoft-windows
          - icon: mdi:vhs
          - icon: mdi:record-player
          - icon: mdi:video-input-hdmi
type: tile
entity: input_select.lounge_tv_listening_mode
color: green
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/selector_tile.png" alt="selector_tile" width="600"/>

[last-commit-shield]: https://img.shields.io/github/last-commit/Nerwyn/service-call-tile-feature?style=for-the-badge
[commits]: https://github.com/Nerwyn/service-call-tile-feature/commits/main
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/t/service-call-button-tile-feature/620724
[license-shield]: https://img.shields.io/github/license/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-Nerwyn-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[releases]: https://github.com/nerwyn/service-call-tile-feature/releases
[github]: https://img.shields.io/github/followers/Nerwyn.svg?style=social
