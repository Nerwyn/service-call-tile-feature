# Service Call Tile Feature

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
![Project Maintenance][maintenance-shield]
[![GitHub Activity][last-commit-shield]][commits]
[![Community Forum][forum-shield]][forum]

[![Github][github]][github]

[![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=service-call-tile-feature&owner=Nerwyn&category=Plugin)

Call any service and most [actions](https://www.home-assistant.io/dashboards/actions/) via tile features. This custom tile feature will let you create super customizable tile buttons, sliders, and selectors. [The Home Assistant developers gave us the ability to create custom tile features](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#tile-features), why is no one else taking advantage of it? And why isn't something like a generic service call tile button already in Home Assistant? I don't know but here it is.

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

# Base Config

| Name    | Type    | Description/Value                                                                                               |
| ------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| type    | string  | `custom:service-call`                                                                                           |
| hide    | boolean | Whether to hide this row of entries. Should be set using a template. Defaults to false.                         |
| show    | boolean | Whether to show this row of entries. Should be set using a template. Defaults to true. Supercedes hide if true. |
| entries | array   | List of entries to include in a tile features row.                                                              |

```yaml
type: custom:service-call
hide: '{{ is_state("light.lounge", "off") }}'
show: '{{ is_state("light.lounge", "on") }}'
entries: []
```

The custom service call feature is actually a row of entries, each of which have their own configuration. When you first add the `Service Call` feature to your tile card it creates a button to start. You can add more tile features to this row by adding more entries to the `entries` array.

# Entry Configs

## General Options

| Name                | Type      | Description                                                                                                                                              |
| ------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type                | string    | Type of tile feature. Currently supported options are `button`, `slider`, and `selector`.                                                                |
| value_attribute     | string    | The attribute to use to determine the value of the feature. Defaults to `state`.                                                                         |
| entity_id           | string    | The entity ID of the tile feature. Defaults to the entity ID provided in the service call data/target or the entity ID of the tile card.                 |
| autofill_entity_id  | boolean   | Whether to autofill the `entity_id` of the tile feature and the service call data/target if no entity, device, or area ID is provided. Defaults to true. |
| icon                | string    | The name of the icon to use.                                                                                                                             |
| label               | string    | A string to place either underneath the icon or by itself.                                                                                               |
| unit_of_measurement | string    | A string to append to the end of the label, if it exists.                                                                                                |
| style               | StyleInfo | CSS style properties to set to the feature, further explained below.                                                                                     |

```yaml
type: custom:service-call
entries:
  - type: button
    value_attribute: brightness
    entity_id: light.lounge
    autofill_entity_id: false
    icon: >-
      {{ iif(is_state("light.chandelier", "on"), "mdi:ceiling-light",
      "mdi:ceiling-light-outline") }}
    label: >-
      {{ (100*state_attr("light.chandelier", "brightness")/255) | round or
      undefined }}
    unit_of_measurement: '%'
    style:
      --icon-color: yellow
      --color: |
        {% if is_state("light.chandelier", "on") %}
          rgb({{ state_attr("light.chandelier", "rgb_color") }})
        {% else %}
          initial
        {% endif %}
```

By default type will be `button`. If you're using an older version of this feature it may not be present but will still default to `button`. Currently `slider` and `selector` are also supported.

The `value_attribute` field is to set which entity attribute the feature should use for it's value, if not the default entity state. For sliders this field is used to determine the it's default value on render. For selectors this field is used for determining which option is currently selected. It can also be used to include the feature value in service call data by setting a field in the data object to `VALUE`, such as for sliders. If the attribute which you wish to use is an array, you can also further include the index at the end of the attribute name in brackets (like `hs_color[0]`).

If you find that the autofilling of the entity ID in the service call or tile feature value is causing issues, setting `autofill_entity_id` to `false` may help. Just remember to set the entity ID of the tile feature and the entity, device, or area ID of the service call target.

If the icon or label is empty, then the entire HTML element will not render. If the label is present, then `unit_of_measurement` is appended to the end of it.

## Templating

All fields at the entry level and lower support nunjucks templating. Nunjucks is a templating engine for JavaScript, which is heavily based on the jinja2 templating engine which Home Assistant uses. While the syntax of nunjucks and jinja2 is almost identical, you may find the [nunjucks documentation](https://mozilla.github.io/nunjucks/templating.html) useful. Please see the [ha-nunjucks](https://github.com/Nerwyn/ha-nunjucks) repository for a list of available functions. If you want additional functions to be added, please make a feature request on that repository, not this one.

You can include the current value of a tile feature and it's units by using the variables `VALUE` and `UNIT` in a label template.

## Actions

There are three ways to trigger an action - tap, double tap, and hold. Buttons and selector options support all three, and sliders only support tap actions. Defining a double tap action that is not `none` introduces a 200ms delay to single tap actions.

| Name              | Type   | Description                                                                                       |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------- |
| tap_action        | object | Action to perform on single tap.                                                                  |
| hold_action       | object | Action to perform when held.                                                                      |
| double_tap_action | object | Action to perform when double tapped. Adding this introduces a 200ms delay to single tap actions. |

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:ceiling-light
    tap_action:
      action: call-service
      service: light.toggle
      target:
        entity_id: light.lounge
    double_tap_action:
      action: url
      url_path: youtube.com
    hold_action:
      action: assist
```

Each action also supports the `confirmation` field. More information on Home Assistant action confirmations can be found [here](https://www.home-assistant.io/dashboards/actions/#options-for-confirmation). Confirmation text supports string interpolation as described above.

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:ceiling-light
    tap_action:
      action: call-service
      service: light.toggle
      target:
        entity_id: light.lounge
      confirmation:
        text: >-
          Are you sure you want to turn the light {{ 'on' if
          is_state('light.lounge', 'off') else 'off' }}?
```

### Action Types

Actions follow the [Home Assistant actions](https://www.home-assistant.io/dashboards/actions/) syntax. Most Home Assistant actions are supported.

| Action       | Description                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------- |
| call-service | Call any Home Assistant service.                                                             |
| navigate     | Navigate to another Home Assistant page.                                                     |
| url          | Navigate to an external URL.                                                                 |
| assist       | Open the assist dialog. Uses the mobile dialog if available, like in the Home Assistant app. |
| more-info    | Open the more info dialog.                                                                   |
| none         | Explicilty set a command to do nothing.                                                      |

Each action has a set of possible options associated with them. If `action` is not provided the card will guess which type of action it is by the options used.

#### call-service

| Name    | Description                                                                                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| service | The service to call. Use the format `domain.service`, e.g. `"light.turn_on"`.                                                                                    |
| data    | Additional data to pass to the service call. See the Home Assistant documentation or go to Developer Tools > Services to see available options for each service. |
| target  | The entity IDs, device IDs, or area IDs to call the service on.                                                                                                  |

`data` and `target` get internally merged into one object since `hass.callService` only has a single data field. You can safely put all information into one object with any of these names. This was done so that you can easily design service calls using Home Assistant's service developer tool and copy the YAML to custom button configurations in this card.

If you include `VALUE` in any of the data fields, then it will get replaced with the feature's value. This is especially useful for using the slider. You can do this with or without templating.

```yaml
type: custom:service-call
entries:
  - type: slider
    icon: mdi:brightness-4
    value_attribute: brightness
    tap_action:
      action: call-service
      service: light.turn_on
      data:
        brightness_pct: VALUE
      target:
        entity_id: light.lounge
```

#### navigate

| Name               | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| navigation_path    | Home Assistant page to navigate to.                                  |
| navigation_replace | Whether to replace the current page in the history with the new URL. |

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:view-dashboard
    tap_action:
      action: navigate
      navigation_path: /lovelace/0
      navigation_replace: true
    double_tap_action:
      action: navigate
      navigation_path: /lovelace/1
    hold_action:
      action: navigate
      navigation_path: /lovelace/2
```

#### url

| Name     | Description                      |
| -------- | -------------------------------- |
| url_path | External website to navigate to. |

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:google
    tap_action:
      action: url
      url_path: https://www.google.com
```

#### assist

_The following options are only available in the mobile assist dialog._

| Name            | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| pipeline_id     | Assist pipeline id to use.                                              |
| start_listening | If supported, listen for voice commands when opening the assist dialog. |

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:assistant
    tap_action:
      action: assist
      pipeline_id: preferred
      start_listening: true
```

#### more-info

| Name           | Description                                     |
| -------------- | ----------------------------------------------- |
| data.entity_id | The entity ID to open the more info dialog for. |

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:cctv
    tap_action:
      action: more-info
      data:
        entity_id: camera.front_door
```

## Style Options

While any CSS property can be used, these values are internal CSS variables designed to be set by the user.

| Name                 | Type   | Description                                                                                          |
| -------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| --color              | string | Custom color for the tile feature. Can also be a CSS function (see examples).                        |
| --opacity            | float  | Opacity of the tile feature. Defaults to 0.2.                                                        |
| --icon-color         | string | Custom color for the icon.                                                                           |
| --label-color        | string | Custom color for the string label.                                                                   |
| --icon-filter        | string | Filter to apply to the icon.                                                                         |
| --label-filter       | string | Filter to apply to the string label.                                                                 |
| --background         | string | Custom color for the tile feature background. Can also be a CSS function (see examples).             |
| --background-opacity | number | Opacity of the tile feature background. Defaults to 0.2.                                             |
| flex-basis           | string | Percentage of the row the the feature should populate relative to it's siblings. Defaults to `100%`. |

If you want to apply additional styles to subelements, you can also use the options `icon_style`, `label_style`, `background_style`, and `slider_style`.

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:brightness-4
    label: VALUE
    value_attribute: brightness
    tap_action:
      action: call-service
      service: light.toggle
      target:
        entity_id: light.lounge
    style:
      --color: |
        {% if is_state("light.lounge", "on") %}
          rgb({{ state_attr("light.lounge", "rgb_color") }})
        {% else %}
          initial
        {% endif %}
      --opacity: 1
      --icon-color: white
      --label-color: var(--disabled-color)
      --icon-filter: blur(1px)
      --label-filter: hue-rotate(90deg)
      --background: gray
      flex-basis: 200%
```

## Slider Specific Options

| Name    | Type    | Description                                                                                                                                                                |
| ------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| range   | array   | The minimum and maximum numbers for the slider, defaults to [0, 100].                                                                                                      |
| step    | number  | The step size of the slider. Defaults to 1/100 of the range. You may have to manually set this to a whole number for service data like light `color_temp`.                 |
| thumb   | string  | The slider thumb style.<br />- `default`: Like a tile light brightness slider.<br />- `line`: Like a tile color temperature slider.<br />- `flat`: Like a mushroom slider. |
| tooltip | boolean | Whether or not to display a tooltip with the slider value when it's held down on, defaults to true.                                                                        |

```yaml
type: custom:service-call
entries:
  - type: slider
    icon: mdi:brightness-4
    label: VALUE
    thumb: flat
    range:
      - '{{ state_attr("light.lounge", "min_mireds") }}'
      - '{{ state_attr("light.lounge", "max_mireds") }}'
    step: 1
    tooltip: true
    value_attribute: brightness
    tap_action:
      action: call-service
      service: light.turn_on
      target:
        entity_id: light.lounge
    style:
      --color: |
        {% if is_state("light.lounge", "on") %}
          rgb({{ state_attr("light.lounge", "rgb_color") }})
        {% else %}
          var(--state-inactive-color)
        {% endif %}
```

## Selector Specific Options

| Name                  | Type     | Description                                                                                                                             |
| --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| options               | Option[] | An array of entries to use as options for the selector, each one being like it's own button feature                                     |
| options.i.option      | string   | A value to used to compare against the features value (see `value_attribute` above) to determine if it is the currently selected option |
| style.--hover-opacity | number   | Opacity to use when hovering over a selector option.                                                                                    |

```yaml
type: custom:service-call
entries:
  - type: selector
    options:
      - option: A
        icon: mdi:alpha-a
        style:
          '--icon-color': >-
            {{ "var(--disabled-color)" if is_state("input_select.test_select",
            "A") }}
          '--color': var(--red-color)
      - option: B
        icon: mdi:alpha-b
        style:
          '--icon-color': >-
            {{ "var(--disabled-color)" if is_state("input_select.test_select",
            "B") }}
          '--color': var(--green-color)
      - option: C
        icon: mdi:alpha-c
        style:
          '--icon-color': >-
            {{ "var(--disabled-color)" if is_state("input_select.test_select",
            "C") }}
          '--color': var(--blue-color)
    style:
      --hover-opacity: 0.4
```

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

If the domain of the feature entity is a `number/input_number`, then the service and data will be set to use the `number/input_number.set_value` service, and range and step will use the corresponding attributes of the entity if they are not set in the config. Otherwise, you will need to set `service` to a service call to actually do anything.

Sliders can track either the state or attribute of an entity, meaning that when that entity's state or attribute changes so will the slider to match. By default it will track the `state` of an entity. To change this, set `value_attribute` to the name of the attribute you want the slider to track. In order to pass the the slider's value to a service call, set the value in the service call data to `VALUE`. If you want to use templating to set the slider label instead, you can use `VALUE` and `UNIT` inside of a template to display the current slider value and unit of measurement as you wish. Otherwise if you include `VALUE` in a label without templating it will be replaced with the current slider value with unit of measurement appended to it if provided. If you similarly include `VALUE` in a slider's label, it will update as you tap or drag the slider and include units if `unit_of_measurement` is also provided.

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

By default the slider's range will be from 0 to 100, with a step size of 1. You will need to adjust this depending on the service you are calling. If you find that the service you are calling does not like non-whole numbers (like `light.turn` with `color_temp`), make sure to set step size to a whole number.

```yaml
type: custom:service-call
entries:
  - type: slider
    thumb: line
    value_attribute: color_temp
    service: light.turn_on
    range:
      - 153
      - 371
    step: 1
    data:
      color_temp: VALUE
    style:
      --background-color: linear-gradient(-90deg, rgb(255, 167, 87), rgb(255, 255, 251))
      --background-opacity: 1
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

This feature is set up to work with Home Assistant `select/input_select` entities out of the box. Just using the config above, you can use it to change the values of input selects entities. By default each button will call the `select/input_select.select_option` service. The list of options is automatically retrieved, but you still have to include the `options` array and give each option button style information so that they will render (you can create blank buttons by setting the option to `{}`).

Since each selector option is a service call button, you can override it's default behavior by including service call information as shown in [example 2](#Example-2). Doing so will also break the current option highlighting, but you can use the `option` field within an option alongside `value_attribute` to restore this, also shown in example 2. `option` will be the value to compare against the entity's value, whether that is it's state or one of it's attributes. If they match and are not undefined, then the the option will be highlighted. The option highlight color defaults to tile color, but can be changed by setting `color` to a different value. You can also set `color` within an option to give that option a different highlight color.

# Examples

## Example 1

A lock tile with lock and unlock selector options

```yaml
features:
  - type: custom:service-call
    entries:
      - type: selector
        entity_id: lock.front_door_ble
        options:
          - icon: mdi:lock
            option: locked
            tap_action:
              action: call-service
              service: lock.lock
            style:
              '--color': var(--green-color)
          - icon: mdi:lock-open-outline
            option: unlocked
            tap_action:
              action: call-service
              service: lock.unlock
            style:
              '--color': var(--red-color)
type: tile
entity: lock.front_door_ble
show_entity_picture: false
vertical: true
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

A light tile with a button for each bulb, a color selector, and brightness and temperature sliders, with emphasis on certain options.

```yaml
features:
  - type: custom:service-call
    entries:
      - tap_action:
          action: call-service
          service: light.toggle
          confirmation:
            text: >-
              Are you sure you want to turn the light {{ 'on' if
              is_state('light.chandelier', 'off') else 'off' }}?
        icon: >-
          {{ iif(is_state("light.chandelier", "on"), "mdi:ceiling-light",
          "mdi:ceiling-light-outline") }}
        label: >-
          {{ (100*state_attr("light.chandelier", "brightness")/255) | round or
          undefined }}
        unit_of_measurement: '%'
        style:
          flex-basis: 200%
          '--icon-color': red
          '--color': |
            {% if is_state("light.chandelier", "on") %}
              rgb({{ state_attr("light.chandelier", "rgb_color") }})
            {% else %}
              initial
            {% endif %}
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_1
        icon: mdi:lightbulb
        icon_color: orange
        label: Bulb 1
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_2
        icon: mdi:lightbulb
        icon_color: yellow
        label: Bulb 2
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_3
        icon: mdi:lightbulb
        icon_color: green
        label: Bulb 3
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_4
        icon: mdi:lightbulb
        icon_color: blue
        label: Bulb 4
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_5
        icon: mdi:lightbulb
        icon_color: purple
        label: Bulb 5
  - type: custom:service-call
    entries:
      - type: selector
        entity_id: light.chandelier
        value_attribute: rgb_color
        style:
          '--background': |
            {% if is_state("light.chandelier", "on") %}
              rgb({{ state_attr("light.chandelier", "rgb_color") }})
            {% else %}
              initial
            {% endif %}
        options:
          - tap_action:
              action: call-service
              service: light.turn_on
              data:
                color_name: red
            option: 255,0,0
            label: Red
            icon: mdi:alpha-r
            style:
              '--label-color': red
              '--color': red
              '--label-filter': >-
                {{ "invert(1)" if (state_attr("light.chandelier", "rgb_color")
                or []).join(',') == '255,0,0' }}
          - tap_action:
              action: call-service
              service: light.turn_on
              data:
                color_name: green
            option: 0,128,0
            label: Green
            icon: mdi:alpha-g
            style:
              '--label-color': green
              '--color': green
              '--label-filter': >-
                {{ "invert(1)" if (state_attr("light.chandelier", "rgb_color")
                or []).join(',') == '0,128,0' }}
          - tap_action:
              action: call-service
              service: light.turn_on
              data:
                color_name: blue
            option: 0,0,255
            label: Blue
            icon: mdi:alpha-b
            style:
              '--label-color': blue
              '--color': blue
              '--label-filter': >-
                {{ "invert(1)" if (state_attr("light.chandelier", "rgb_color")
                or []).join(',') == '0,0,255' }}
          - tap_action:
              action: call-service
              service: light.turn_on
              data:
                color_temp: 500
            option: 255,166,86
            label: White
            icon: mdi:alpha-w
            style:
              '--label-color': white
              '--color': white
              flex-basis: 300%
              '--icon-filter': >-
                {{ "invert(1)" if (state_attr("light.chandelier", "rgb_color")
                or []).join(',') == '255,166,86' }}
              '--label-filter': >-
                {{ "invert(1)" if (state_attr("light.chandelier", "rgb_color")
                or []).join(',') == '255,166,86' }}
  - type: custom:service-call
    entries:
      - type: slider
        label: VALUE
        unit_of_measurement: '%'
        value_attribute: brightness
        icon: mdi:brightness-4
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            brightness_pct: VALUE
        style:
          flex-basis: 200%
      - type: slider
        thumb: line
        value_attribute: color_temp
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            color_temp: VALUE
        label: VALUE
        unit_of_measurement: ' Mireds'
        icon: mdi:thermometer
        range:
          - '{{ state_attr("light.chandelier", "min_mireds") }}'
          - '{{ state_attr("light.chandelier", "max_mireds") }}'
        step: 1
        style:
          '--label-color': var(--disabled-color)
          '--background': linear-gradient(-90deg, rgb(255, 167, 87), rgb(255, 255, 251))
          '--background-opacity': 1
type: tile
entity: light.chandelier
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/example_tile.png" alt="light_tile" width="600"/>

## Example 3

Multiple sliders for a room's light and curtains.

```yaml
features:
  - type: custom:service-call
    entries:
      - type: button
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            entity_id: light.sunroom_ceiling
            color_name: red
        double_tap_action:
          action: call-service
          service: light.turn_on
          data:
            entity_id: light.sunroom_ceiling
            color_name: green
        hold_action:
          action: call-service
          service: light.turn_on
          data:
            entity_id: light.sunroom_ceiling
            color_name: blue
        icon: mdi:power
        label: '{{ states("light.sunroom_ceiling") }}'
        style:
          '--color': |-
            {% if is_state("light.sunroom_ceiling", ["on"]) %}
              rgb({{ state_attr("light.sunroom_ceiling", "rgb_color") }})
            {% else %}
              initial
            {% endif %}
      - type: slider
        label: VALUE
        unit_of_measurement: '%'
        value_attribute: brightness
        icon: mdi:brightness-4
        tooltip: '{{ is_state("light.sunroom_ceiling", "on") }}'
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            brightness_pct: VALUE
            entity_id: light.sunroom_ceiling
        style:
          flex-basis: 200%
          '--color': |
            {% if is_state("light.sunroom_ceiling", "on") %}
              rgb({{ state_attr("light.sunroom_ceiling", "rgb_color") }})
            {% else %}
              var(--state-inactive-color)
            {% endif %}
  - type: custom:service-call
    entries:
      - type: slider
        thumb: line
        range:
          - 0
          - 360
        step: 0.1
        service: light.turn_on
        value_attribute: hs_color[0]
        icon: mdi:palette
        data:
          hs_color:
            - VALUE
            - 100
          entity_id: light.sunroom_ceiling
        style:
          flex-basis: 200%
          '--background': >-
            linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 66%, #f0f 83%, #f00 100%)
          '--background-opacity': 1
      - type: slider
        thumb: line
        value_attribute: color_temp
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            color_temp: VALUE
            entity_id: light.sunroom_ceiling
        label: VALUE
        unit_of_measurement: ' Mireds'
        icon: mdi:thermometer
        range:
          - '{{ state_attr("light.sunroom_ceiling", "min_mireds") }}'
          - '{{ state_attr("light.sunroom_ceiling", "max_mireds") }}'
        step: 1
        style:
          '--background': linear-gradient(-90deg, rgb(255, 167, 87), rgb(255, 255, 251))
          '--background-opacity': 1
          '--label-color': var(--disabled-color)
  - type: custom:service-call
    entries:
      - type: slider
        tap_action:
          action: call-service
          service: cover.set_cover_position
          data:
            position: VALUE
            entity_id: cover.sunroom_curtains
        value_attribute: current_position
        icon: mdi:curtains
        style:
          '--color': var(--tile-color)
          '--icon-color': var(--disabled-color)
  - type: custom:service-call
    entries:
      - type: slider
        tap_action:
          action: call-service
          service: media_player.volume_set
          data:
            volume_level: VALUE
            entity_id: media_player.spotify
        value_attribute: volume_level
        icon: mdi:spotify
        label: |
          {{ state_attr("media_player.spotify", "media_title") }}
          {{ state_attr("media_player.spotify", "media_artist") }}
        range:
          - 0
          - 1
        thumb: flat
        style:
          '--color': rgb(31, 223, 100)
          flex-direction: row
        icon_style:
          padding: 8px
          flex: auto
        label_style:
          left: '-16px'

type: tile
entity: binary_sensor.sun_room
color: accent
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/slider_tile.png" alt="slider_tile" width="600"/>

## Example 4

Selectors for input selects. Note that the opacity of selector buttons is set to 0 by default, so they are completely transparent against the selector background.

```yaml
features:
  - type: custom:service-call
    entries:
      - type: selector
        entity_id: input_select.lounge_tv_theater_mode
        options:
          - icon: mdi:movie
          - icon: mdi:movie-off
          - icon: mdi:movie-outline
          - icon: mdi:movie-off-outline
        style:
          '--color': var(--blue-color)
          flex-basis: 140%
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
        options:
          - icon: mdi:television-box
          - icon: mdi:microsoft-windows
          - icon: mdi:vhs
          - icon: mdi:record-player
          - icon: mdi:video-input-hdmi
        style:
          '--color': var(--red-color)
type: tile
entity: input_select.lounge_tv_listening_mode
color: green
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/selector_tile.png" alt="selector_tile" width="600"/>

## Example 5

Using a selector to display different features.

```yaml
features:
  - type: custom:service-call
    entries:
      - type: selector
        options:
          - option: A
            icon: mdi:alpha-a
            style:
              '--icon-color': >-
                {{ "var(--disabled-color)" if
                is_state("input_select.test_select", "A") }}
              '--color': var(--red-color)
          - option: B
            icon: mdi:alpha-b
            style:
              '--icon-color': >-
                {{ "var(--disabled-color)" if
                is_state("input_select.test_select", "B") }}
              '--color': var(--green-color)
          - option: C
            icon: mdi:alpha-c
            style:
              '--icon-color': >-
                {{ "var(--disabled-color)" if
                is_state("input_select.test_select", "C") }}
              '--color': var(--blue-color)
  - type: custom:service-call
    show: '{{ is_state("input_select.test_select", "A") }}'
    entries:
      - type: button
        icon: mdi:youtube
        tap_action:
          action: url
          url_path: youtube.com
        double_tap_action:
          action: url
          url_path: play.spotify.com
      - type: button
        icon: mdi:view-dashboard
        tap_action:
          action: navigate
          navigation_path: /lovelace/0
        double_tap_action:
          action: navigate
          navigation_path: /lovelace-extra/0
  - type: custom:service-call
    show: '{{ is_state("input_select.test_select", "B") }}'
    entries:
      - type: button
        icon: mdi:assistant
        tap_action:
          action: assist
  - type: custom:service-call
    show: '{{ is_state("input_select.test_select", "C") }}'
    entries:
      - type: slider
        thumb: flat
        entity_id: input_number.slider_test
        label: VALUE
        style:
          '--label-color': var(--disabled-color)
type: tile
entity: input_select.test_select
show_entity_picture: false
vertical: false
color: accent
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/selector_show_tile.png" alt="selector_show_tile" width="1200"/>

[last-commit-shield]: https://img.shields.io/github/last-commit/Nerwyn/service-call-tile-feature?style=for-the-badge
[commits]: https://github.com/Nerwyn/service-call-tile-feature/commits/main
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/t/service-call-button-tile-feature/620724
[license-shield]: https://img.shields.io/github/license/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-Nerwyn-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[releases]: https://github.com/nerwyn/service-call-tile-feature/releases
[github]: https://img.shields.io/github/followers/Nerwyn.svg?style=social
