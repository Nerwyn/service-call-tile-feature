# Service Call Tile Feature

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
![Project Maintenance][maintenance-shield]
[![GitHub Activity][last-commit-shield]][commits]
[![Community Forum][forum-shield]][forum]

[![Github][github]][github]

[![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=service-call-tile-feature&owner=Nerwyn&category=Plugin)

Call any service via a tile button. This custom tile feature will let you do whatever you want with tile card buttons. [The Home Assistant developers gave us the ability to create custom tile features](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#tile-features), why is no one else taking advantage of it? And why isn't something like a generic service call tile button already in Home Assistant? I don't know but here it is.

[Home Assistant Community Forums Thread](https://community.home-assistant.io/t/service-call-button-tile-feature/620724)

## Options

### Base Config

| Name    | Type   | Description/Value                                  |
| ------- | ------ | -------------------------------------------------- |
| type    | string | `custom:service-call`                              |
| buttons | array  | List of buttons to include in a tile features row. |

### Button Config

### Service Call Options

| Name    | Type   | Description                                                                                                                                                        |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| service | string | The service call to make, e.g. `light.toggle` or `lock.unlock`.                                                                                                    |
| target  | object | The entity IDs, device IDs, or area IDs to call the service on. If left blank will use the entity ID assigned to the tile card.                                    |
| data    | object | Additional data to pass to the service call. See the Home Assistant documentation or go to `Developer Tools > Services` to see available options for each service. |

#### Style Options

| Name        | Type   | Description                                                                                                         |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| color       | string | Custom color for the button. Should either be a color name like `red` or an rgb function like `rgb(255 0 0)`.       |
| opacity     | float  | Opacity of the button background. Should be a number between 0 and 1. Defaults to 0.2.                              |
| icon        | string | Material design icon to use.                                                                                        |
| icon_color  | string | Custom color for the icon. Should either be a color name like `red` or an rgb function like `rgb(255 0 0)`.         |
| label       | string | String label to place underneath the icon, or by itself.                                                            |
| label_color | string | Custom color for the string label. Should either be a color name like `red` or an rgb function like `rgb(255 0 0)`. |

## Examples

### A lock tile with lock and unlock buttons

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

<img src="assets/lock_tile.png" alt="guide" width="600"/>

### A light tile with a button for each bulb and color buttons

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

<img src="assets/light_tile.png" alt="guide" width="600"/>

[last-commit-shield]: https://img.shields.io/github/last-commit/Nerwyn/service-call-tile-feature?style=for-the-badge
[commits]: https://github.com/Nerwyn/service-call-tile-feature/commits/main
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/t/service-call-button-tile-feature/620724
[license-shield]: https://img.shields.io/github/license/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-Nerwyn-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[releases]: https://github.com/nerwyn/service-call-tile-feature/releases
[github]: https://img.shields.io/github/followers/Nerwyn.svg?style=social
