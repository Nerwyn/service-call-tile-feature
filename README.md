# Service Call Tile Feature

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
![Project Maintenance][maintenance-shield]
[![GitHub Activity][last-commit-shield]][commits]
[![Community Forum][forum-shield]][forum]

[![Github][github]][github]

[![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=service-call-tile-feature&owner=Nerwyn&category=Plugin)

Call any service via tile features. This custom tile feature will let you create super customizable tile buttons and sliders. [The Home Assistant developers gave us the ability to create custom tile features](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#tile-features), why is no one else taking advantage of it? And why isn't something like a generic service call tile button already in Home Assistant? I don't know but here it is.

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/cd27af901165c46cfee537a4b35f1999c4626df5/assets/light_tile.png" alt="light_tile" width="600"/>

# How To Use

The trade off for the level of customizability that this card offers is that it can be a bit confusing to use. All of the available features and options are documented below. This card can be installed using HACS by adding it as a custom frontend repository.

1. To start create a tile card. The entity ID can be anything you like.
2. Click `ADD FEATURE` and then `Service Call`
3. Click the edit icon on the `Service Call` entry. By default you should see something like this:

```yaml
type: custom:service-call
entries:
  - type: button
    service: ''
```

## Base Config

| Name    | Type   | Description/Value                                  |
| ------- | ------ | -------------------------------------------------- |
| type    | string | `custom:service-call`                              |
| entries | array  | List of entries to include in a tile features row. |

The custom service call feature is actually a row of entries, each of which have their own configuration. When you first add the `Service Call` feature to your tile card it creates a button to start. You can add more tile features to this row by adding more entries to the `entries` array.

## Entry Configs

### General Options

| Name            | Type   | Description                                                                      |
| --------------- | ------ | -------------------------------------------------------------------------------- |
| type            | string | Type of tile feature. Currently supported options are `button` and `slider`.     |
| value_attribute | string | The attribute to use to determine the value of the feature. Defaults to `state`. |

By default type will be `button`. If you're using an older version of this feature it may not be present but will still default to `button`. Currently `slider` is also supported.

As of now `value_attribute` is only important for sliders, as it uses this field to determine the slider's default value on render. It can also be used for `VALUE` string interpolation as described below.

### String Interpolation

Many fields such as colors and labels can have the entity state or attributes interpolated, or can accept CSS variables.

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
    opacity: 2
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

If no target is provided, the tile card's entity ID will be used instead. This entity ID is also used for string interpolation.

To better understand service calls, use the services Developer Tool found in Home Assistant.

### Global Style Options

| Name        | Type   | Description                                                                        |
| ----------- | ------ | ---------------------------------------------------------------------------------- |
| color       | string | Custom color for the button.                                                       |
| opacity     | float  | Opacity of the feature background. Defaults to 0.2. Cannot be string interpolated. |
| icon        | string | Material design icon to use.                                                       |
| icon_color  | string | Custom color for the icon.                                                         |
| label       | string | String label to place underneath the icon, or by itself.                           |
| label_color | string | Custom color for the string label.                                                 |

String interpolation can be used for any of these values.

### Slider Specific Options

| Name               | Type   | Description                                                                                                        |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| range              | array  | The minimum and maximum numbers for the slider, defaults to [0, 100].                                              |
| step               | number | The step size of the slider. Defaults to 1/100 of the range.                                                       |
| thumb              | string | The slider thumb style. `default` is like a light brightness slider and `line` is like a light temperature slider. |
| background_color   | string | Custom color for the background of the slider.                                                                     |
| background_opacity | number | Opacity of the button background. Defaults to 0.2. Cannot be string interpolated.                                  |

# Examples

## A lock tile with lock and unlock buttons

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

## A light tile with a button for each bulb and color buttons

```yaml
features:
  - type: custom:service-call
    buttons:
      - service: light.toggle
        icon: mdi:ceiling-light
        icon_color: red
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
    buttons:
      - service: light.turn_on
        color: red
        label: Red
        label_color: red
        data:
          color_name: red
      - service: light.turn_on
        color: green
        label: Green
        label_color: green
        data:
          color_name: green
      - service: light.turn_on
        color: blue
        label: Blue
        label_color: blue
        data:
          color_name: blue
      - service: light.turn_on
        color: white
        label: White
        label_color: white
        data:
          color_temp: 500
type: tile
entity: light.chandelier
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/cd27af901165c46cfee537a4b35f1999c4626df5/assets/light_tile.png" alt="light_tile" width="600"/>

## Multiple sliders for a room's light and curtains

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
        data:
          volume_level: VALUE
          entity_id: media_player.spotify_nerwyn_singh
type: tile
entity: binary_sensor.sun_room
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/dev/assets/slider_tile.png" alt="slider_tile" width="600"/>

[last-commit-shield]: https://img.shields.io/github/last-commit/Nerwyn/service-call-tile-feature?style=for-the-badge
[commits]: https://github.com/Nerwyn/service-call-tile-feature/commits/main
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/t/service-call-button-tile-feature/620724
[license-shield]: https://img.shields.io/github/license/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-Nerwyn-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[releases]: https://github.com/nerwyn/service-call-tile-feature/releases
[github]: https://img.shields.io/github/followers/Nerwyn.svg?style=social
