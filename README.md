# Custom Features for Tile Cards and More

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
![Project Maintenance][maintenance-shield]
[![GitHub Activity][last-commit-shield]][commits]
[![Community Forum][forum-shield]][forum]

[![Github][github]][github]

[![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=service-call-tile-feature&owner=Nerwyn&category=Plugin)

Call any service and most [actions](https://www.home-assistant.io/dashboards/actions/) via card features. These custom features will let you create super customizable buttons, sliders, selectors, and spinboxes. [The Home Assistant developers gave us the ability to create custom features](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#tile-features), why is no one else taking advantage of it? And why isn't something like a generic button feature already in Home Assistant? I don't know but here it is.

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/example_tile.png" alt="example_tile" width="600"/>

# Feature Types

## Buttons

Buttons are the most basic type of custom feature, being based on the example provided in the Home Assistant developer documentation.

In addition to `tap_action`, buttons also support `hold_action`, `double_tap_action`, and an altenrate momentary button mode for `momentary_start_action` and `momentary_end_action`. All of these are described in further detail below.

Like all features in this project, buttons can be given an icon and a label. The icon, label, and rest of the feature can be stylized using style options described below.

## Sliders

Sliders allow you to create Home Assistant styled input range sliders, similar to those available for light brightness and temperature. But these sliders can be used for any action.

By default the slider will look like a normal tile light brightness or cover position slider, but you can change this to a couple of other thumb styles using the `Thumb Type` appearance option.

Sliders can track either the state or attribute of an entity, meaning that when that entity's state or attribute changes so will the slider to match. By default it will track the `state` of an entity. To change this, set `Attribute` to the name of the attribute you want the slider to track. In order to pass the the slider's value to a service call, set the value in the service call data to `{{ value | float }}`. If you want to use templating to set the slider label, you can use `value` and `unit` inside of a template to display the current slider value and unit of measurement.

By default the slider's range will be from 0 to 100, with a step size of 1. You will need to adjust this depending on the service you are calling. If you find that the service you are calling does not like non-whole numbers (like `light.turn_on` with `color_temp`), make sure to set step size to a whole number and to use the `int` filter in the action data template.

## Selectors

Selectors allow you to create a row of custom button features with no gaps of which the currently active one will be highlighted, similar to those available for alarm control panel and thermostat modes. But like all features in this project it can be used for any actions.

After adding a selector to your custom features row, you will see nothing! This is because you need to define the options to be listed out in the selector manually. Each of these options is actually a custom button feature as described above.

This feature is set up to work with Home Assistant `select/input_select` entities out of the box. By setting the feature entity to one of these domains, you can use it to change the values of this entity with little more configuration. By default each button will call the `select/input_select.select_option` service. The list of options is automatically retrieved, but you still have to include the `options` array and give each option button style information so that they will render.

Since each selector option is a custom feature button, you can override it's default behavior by changing it's tap action. Doing so will also break the current option highlighting, but you can use the `Option` field within an option alongside `Attribute` to restore this. `Option` will be the value to compare against the feature's value, whether that is it's entity's state or one of it's attributes. If they match and are not undefined, then the the option will be highlighted. The option highlight color defaults to the parent card color (usually the tile card color), but can be changed by setting the CSS attribute `--color` to a different value, either for the entire feature or an individual option.

## Spinboxes

Spinboxes allow you to create Home Assistant style number boxes with increment and decrement buttons, similar to the climate target temperature feature. By default the user can increment or decrement this feature's internal value using the corresponding buttons. Once the user stops pressing the buttons for a time period defined by `debounce_time` (default 1000ms), the user defined `tap_action` will fire.

Like sliders, the spinbox's action should use a service which sets a value similar to `number/input_number.set_value` or `climate.set_temperature` and the user should use `value` in a template to pass it to the action call. This way the user can keep incrementing or decrementing the value until they reach the desired value, and the action to update it in Home Assistant is only called once. You can make this features buttons repeat when held by setting `hold_action.action` to repeat. These should all be set in the `CENTER` tab of the spinbox configuration page.

You can also override the default behavior of the increment and decrement buttons by changing the tab bar to `INCREMENT` or `DECREMENT` and modifying the actions there. Doing so will disable the normal increment/decrement and debounce button behavior and create a stylized button feature instead.

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

**_NEW STUFF HERE_**

All custom features are encapsulated in a custom features row. This allows you to add multiple custom features to a row, apply overall CSS styles, and change the widths of features in the row relative to each other using the `flex-basis` CSS property. You can add a custom features row just like any default feature, except that this feature is available for all entities.

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/add-custom-features-row.png" alt="add_custom_tile_features_row" width="600"/>

Within a custom features row you can add individual features using the add custom feature button. This works just like the top level add feature button but just for custom features. Each feature will look like a blank rectangle to start. Features can be reordered, edited, and deleted from here.

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/add-custom-feature.png" alt="add_custom_tile_feature" width="600"/>

You can also add CSS styles for the entire row here. CSS styles have to be encapsulated in a CSS selector like so. You may also need to add `!important` to the end for it to apply over the default styles of the custom features.

```css
:host {
  --mdc-icon-size: 32px !important;
}
```

By default, features will autofill with it's parent's entity information for tracking it's internal state. This can be disabled by toggling `Autofill Entity` off at the feature level. Haptics can be similary enabled for a feature.

**_NEW STUFF ENDS_**

# Base Config

| Name    | Type      | Description/Value                                         |
| ------- | --------- | --------------------------------------------------------- |
| type    | string    | `custom:service-call`                                     |
| style   | StyleInfo | CSS style properties to set to the overall outer feature. |
| entries | array     | List of entries to include in a tile features row.        |

```yaml
type: custom:service-call
style:
  padding: 0px 12px
entries: []
```

The custom service call feature is actually a row of entries, each of which have their own configuration. When you first add the `Service Call` feature to your tile card it creates a button to start. You can add more tile features to this row by adding more entries to the `entries` array.

# Entry Configs

## General Options

| Name                | Type      | Description                                                                                                                                         |
| ------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| type                | string    | Type of tile feature. Currently supported options are `button`, `slider`, `selector`, and `spinbox`.                                                |
| value_attribute     | string    | The attribute to use to determine the value of the feature. Defaults to `state`.                                                                    |
| entity_id           | string    | The entity ID of the tile feature. Defaults to the entity ID provided in the service call data/target or the entity ID of the tile card.            |
| autofill_entity_id  | boolean   | Whether to autofill the `entity_id` of the tile feature and the service call target if no entity, device, or area ID is provided. Defaults to true. |
| icon                | string    | The name of the icon to use.                                                                                                                        |
| label               | string    | A string to place either underneath the icon or by itself.                                                                                          |
| unit_of_measurement | string    | A string to append to the end of the label, if it exists.                                                                                           |
| style               | StyleInfo | CSS style properties to set to the feature.                                                                                                         |
| haptics             | boolean   | Enable haptics on the feature, defaults to `false`.                                                                                                 |

```yaml
type: custom:service-call
entries:
  - type: button
    value_attribute: brightness
    entity_id: light.lounge
    autofill_entity_id: false
    haptics: true
    icon: >-
      {{ iif(is_state("light.chandelier", "on"), "mdi:ceiling-light",
      "mdi:ceiling-light-outline") }}
    label: >-
      {{ value }}{{ unit }}
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

By default type will be `button`. If you're using an older version of this feature it may not be present but will still default to `button`. Currently `slider`, `selector`, and `spinbox` are also supported.

The `value_attribute` field is to set which entity attribute the feature should use for it's value, if not the default entity state. For sliders this field is used to determine the it's default value on render. For selectors this field is used for determining which option is currently selected. For spinboxes, this field is used to determine which attribute to decrement or increment.

`value_attribute` can also be used to include the feature value in service call data by setting a field in the data object to `'{{ value }}'`, such as for sliders. If the attribute which you wish to use is an array, you can also further include the index at the end of the attribute name in brackets (like `hs_color[0]`).

Some additional logic is applied for certain `value_attribute` values:

- `brightness` - Converted from the default range of 0-255 to 0-100.
- `media_position` - Updated twice a second using the current timestamp and the attribute `media_position_updated_at` when the entity state is `playing`, and locked to a max value using the attribute `media_duration`.
- `elapsed` - Only for timer entities. Updated twice a second using the the current timestamp and the attributes `duration`, `remaining`, and `finishes_at`, and locked to a max value using the attribute `duration`.
  - _NOTE_: `elapsed` is not an actual attribute of timer entities, but is a possible `value_attribute` for timer entities for the purpose of displaying accurate timer elapsed values. Timer entities do have an attribute `remaining`, which only updates when the timer state changes. The actual `remaining` attribute can be calculated using the `elapsed` value and the timer `duration` attribute.

If you find that the autofilling of the entity ID in the service call or tile feature value is causing issues, setting `autofill_entity_id` to `false` may help. Just remember to set the entity ID of the tile feature and the entity, device, or area ID of the service call target.

If the icon or label is empty, then the entire HTML element will not render. Both can be defined using templates, and the variables `value` and `unit` can be included in label templates.

Haptics are disabled for tile features by default, but can be enabled by setting `haptics` to true.

## Templating

Almost all fields support nunjucks templating. Nunjucks is a templating engine for JavaScript, which is heavily based on the jinja2 templating engine for Python which Home Assistant uses. While the syntax of nunjucks and jinja2 is almost identical, you may find the [nunjucks documentation](https://mozilla.github.io/nunjucks/templating.html) useful. Please see the [ha-nunjucks](https://github.com/Nerwyn/ha-nunjucks) repository for a list of available functions. If you want additional functions to be added, please make a feature request on that repository, not this one.

You can include the current value of a tile feature and it's units by using the variables `value` and `unit` in a label template. You can also include `hold_secs` in a template if performing a `momentary_end_action`. Each tile feature can also reference it's entry using `config` within templates. `config.entity` and `config.attribute` will return `config.entity_id` and `config.value_attribute` with their templates rendered (if they has them), and other templated config fields can be rendered within templates by wrapping them in the function `render` within a template. Note - that the `style` field is applied onto the tile feature HTML element and does not have access to these variables and functions. Internal style fields like those described in [Style Options](#style-options) do.

## Actions

There are three traditional ways to trigger an action - tap, double tap, and hold. Buttons, selector options, and spinbox buttons support all three, and sliders only support tap actions. Defining a double tap action that is not `none` introduces a 200ms delay to single tap actions.

| Name                                             | Type   | Description                                                                                                           |
| ------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------- |
| tap_action                                       | object | Action to perform on single tap.                                                                                      |
| hold_action                                      | object | Action to perform when held.                                                                                          |
| double_tap_action                                | object | Action to perform when double tapped. Adding this introduces a 200ms delay to single tap actions.                     |
| [momentary_start_action](#momentary-button-mode) | object | Action to perform when the button is initially held down. If configured normal tap and hold actions will not trigger. |
| [momentary_end_action](#momentary-button-mode)   | object | Action to perform when the button is released.                                                                        |

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

### Adjustable Timings

#### Hold Time

Hold actions are triggered by holding down on a button for a defined amount of time and then releasing. The default amount of time is 500ms. You can change this by setting `hold_time` in the hold action to a different number.

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:view-dashboard
    hold_action:
      action: navigate
      navigation_path: /lovelace/2
      hold_time: 600
```

#### Repeat and Repeat Delay

By setting a hold action to `repeat`, the tap action will repeat while the button is held down. The default delay between repeats is 100ms. You can change this by setting `repeat_delay` in the hold action to a different number. See the below section on [repeat](#repeat) for more.

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:lightbulb
    tap_action:
      action: call-service
      service: light.toggle
      target:
        entity_id: light.bedroom
    hold_action:
      action: repeat
      repeat_delay: 1000
```

#### Double Tap Window

Double tap actions have a default window of 200ms to trigger before a single tap action is triggered instead. You can change this by setting `double_tap_window` in the double tap action to a different number.

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:view-dashboard
    double_tap_action:
      action: navigate
      navigation_path: /lovelace/1
    double_tap_window: 400
```

**NOTE**: Setting `double_tap_window` above or too close to `hold_time` can result in undesirable behavior, as the hold timer expires before the double tap window does.

### Action Types

Actions follow the [Home Assistant actions](https://www.home-assistant.io/dashboards/actions/) syntax. Most Home Assistant actions are supported.

| Action                            | Description                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [call-service](#call-service)     | Call any Home Assistant service.                                                                                                                        |
| [navigate](#navigate)             | Navigate to another Home Assistant page.                                                                                                                |
| [url](#url)                       | Navigate to an external URL.                                                                                                                            |
| [assist](#assist)                 | Open the assist dialog. Uses the mobile dialog if available, like in the Home Assistant app.                                                            |
| [more-info](#more-info)           | Open the more info dialog.                                                                                                                              |
| [fire-dom-event](#fire-dom-event) | Fire a browser dom event using whatever information is in the Action object. Useful for opening browser-mod popup cards.                                |
| [repeat](#repeat)                 | Repeat the `tap_action` ten times a second while held. Only applicable to `hold_action`, acts as `none` if used in `tap_action` or `double_tap_action`. |
| [none](#none)                     | Explicilty set a command to do nothing.                                                                                                                 |

Each action has a set of possible options associated with them. If `action` is not provided the card will guess which type of action it is by the options used.

#### call-service

| Name    | Description                                                                                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| service | The service to call. Use the format `domain.service`, e.g. `"light.turn_on"`.                                                                                    |
| data    | Additional data to pass to the service call. See the Home Assistant documentation or go to Developer Tools > Services to see available options for each service. |
| target  | The entity IDs, device IDs, area IDs, or label IDs to call the service on.                                                                                       |

`data` and `target` are functionally the same and can be used interchangeably or together. You can safely put all information into one object with any of these names. This was done so that you can easily design service calls using Home Assistant's service developer tool and copy the YAML to custom button configurations in this card.

If you include `'{{ value }}'` in any of the data fields, then it will get replaced with the feature's value. This is especially useful for using the slider and spinbox.

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
        brightness_pct: '{{ value }}'
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

#### fire-dom-event

| Name        | Description                                                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| browser_mod | A field expected by [browser mod](https://github.com/thomasloven/hass-browser_mod?tab=readme-ov-file#how-do-i-update-a-popup-from-the-browser-mod-15) for popups. |

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:map
    tap_action:
      action: fire-dom-event
      browser_mod:
        service: browser_mod.more_info
        data:
          large: true
          entity: zone.home
          ignore_popup_card: false
        target:
          entity: THIS
```

#### repeat

| Name         | Description                                      |
| ------------ | ------------------------------------------------ |
| repeat_delay | Milliseconds between repeats. Defaults to 100ms. |

The `tap_action` must also be defined.

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:lightbulb
    tap_action:
      action: call-service
      service: light.toggle
      target:
        entity_id: light.theater
    hold_action:
      action: repeat # light will be toggled repeatedly while held
    repeat_delay: 1000
```

#### none

None. This action does nothing. Can also be used to make a slider ready only.

````yaml
```yaml
type: custom:service-call
entries:
  - type: button
    tap_action:
      action: none
    hold_action:
      action: more-info
````

### Momentary Button mode

As an alternative to normal tap, hold, and double tap actions, buttons and selectors can also be used in a momentary mode. Configuring this option disables the normal tap, hold, and double tap actions.

`momentary_start_action` is fired when you first press down on a button (or center of touchpad). `momentary_end_action` is fired when you release the button or touchpad. While these are meant to be used together you can use one or the other.

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:ceiling-light
    momentary_start_action:
      action: call-service
      service: light.turn_on
      data:
        entity_id: light.sunroom_ceiling
    momentary_end_action:
      action: call-service
      service: light.turn_off
      data:
        entity_id: light.sunroom_ceiling
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

If you want to apply additional styles to subelements, you can also use the options `icon_style`, `label_style`, `background_style`, `slider_style`, and `tooltip_style`. While `style` applies to the outer HTML element, these subelement style fields are applied internally. Because of this, they can also use internal variabes in templates such as `value`.

```yaml
type: custom:service-call
entries:
  - type: button
    icon: mdi:brightness-4
    label: '{{ value }}{{ unit }}'
    unit_of_measurement: '%'
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

| Name                        | Type         | Description                                                                                                                                                                                                                             |
| --------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| range                       | array        | The minimum and maximum numbers for the slider, defaults to [0, 100].                                                                                                                                                                   |
| step                        | number       | The step size of the slider. Defaults to 1/100 of the range. You may have to manually set this to a whole number for service data like light `color_temp`.                                                                              |
| thumb                       | string       | The slider thumb style.<br />- `default`: Like a tile light brightness slider.<br />- `line`: Like a tile color temperature slider.<br />- `flat`: Like a mushroom slider.<br />- `round`: Like an Android Material volume slider.      |
| value_from_hass_delay       | number       | The time the feature will wait after firing an action before it starts retrieving values from Home Assistant again. Useful for preventing bouncing between new and old values if an entity takes a while to update. Defaults to 1000ms. |
| style.--thumb-width         | string       | Width of the actual slider thumb, not including box shadow. Default varies by thumb style and browser.                                                                                                                                  |
| style.--thumb-border-radius | string       | Border radius of the slider thumb. Default varies by thumb style.                                                                                                                                                                       |
| style.--thumb-box-shadow    | string       | Box shadow of the slider thumb. Default varies by thumb style.                                                                                                                                                                          |
| style.--tooltip-label       | string       | Tooltip label template, defaults to `{{ value }}{{ unit }}`.                                                                                                                                                                            |
| style.--tooltip-transform   | CSS function | Tooltip location transform function, defaults to `translate(var(--thumb-offset), -35px)`.                                                                                                                                               |
| style.--tooltip-display     | string       | Tooltip display value, set to `none` to hide tooltip, defaults to `initial`.                                                                                                                                                            |

```yaml
type: custom:service-call
entries:
  - type: slider
    icon: mdi:brightness-4
    label: '{{ value }}{{ unit }}'
    unit_of_measurment: ' Mireds'
    thumb: flat
    range:
      - '{{ state_attr("light.lounge", "min_mireds") }}'
      - '{{ state_attr("light.lounge", "max_mireds") }}'
    step: 1
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

| Name                  | Type     | Description                                                                                                                              |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| options               | Option[] | An array of entries to use as options for the selector, each one being like it's own button feature.                                     |
| options.i.option      | string   | A value to used to compare against the features value (see `value_attribute` above) to determine if it is the currently selected option. |
| style.--hover-opacity | number   | Opacity to use when hovering over a selector option.                                                                                     |

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

## Spinbox Specific Options

| Name                  | Type   | Description                                                                                                                                                                                                                             |
| --------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| range                 | array  | The minimum and maximum numbers for the spinbox, defaults to [-32767, 32767].                                                                                                                                                           |
| step                  | number | The increment/decrement step amount, defaults to 1.                                                                                                                                                                                     |
| value_from_hass_delay | number | The time the feature will wait after firing an action before it starts retrieving values from Home Assistant again. Useful for preventing bouncing between new and old values if an entity takes a while to update. Defaults to 1000ms. |
| debounce_time         | number | The time to wait before firing the spinbox action, defaults to 1000ms.                                                                                                                                                                  |
| increment             | IEntry | Override the default increment button behavior and style options.                                                                                                                                                                       |
| decrement             | IEntry | Override the default decrement button behavior and style options.                                                                                                                                                                       |

```yaml
type: custom:service-call
entries:
  - type: spinbox
    icon: mdi:brightness-4
    label: '{{ value }}{{ unit }}'
    unit_of_measurement: '%'
    step: 5
    debounceTime: 1000
    range:
      - 0
      - 100
    value_attribute: brightness
    tap_action:
      action: call-service
      service: light.turn_on
      data:
        entity_id: light.sunroom_ceiling
        brightness_pct: '{{ value }}'
    decrement:
      icon: mdi:brightness-3
      label: down
      tap_action:
        action: none
        service: light.turn_on
        data:
          entity_id: light.sunroom_ceiling
          brightness_step_pct: -10
      hold_action:
        action: repeat
      style:
        flex-flow: row
      icon_style:
        padding-right: 4px
    increment:
      icon: mdi:brightness-2
      label: up
      tap_action:
        action: none
        service: light.turn_on
        data:
          entity_id: light.sunroom_ceiling
          brightness_step_pct: 5
      hold_action:
        action: repeat
      style:
        flex-flow: row-reverse
      icon_style:
        padding-left: 4px
    style:
      '--light-color': rgb({{ state_attr("light.sunroom_ceiling", "rgb_color") }})
      '--on-color': >-
        {{ "var(--light-color)" if is_state("light.sunroom_ceiling", "on") else
        "initial" }}
      '--background': var(--on-color)
      '--icon-color': var(--on-color)
      '--label-color': var(--on-color)
```

# YAML Examples

While all configuration can now be done through the user interface, these YAML examples can provide some insight on how to do some advanced styling and templating.

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
              target:
                entity_id: lock.front_door_ble
              data: {}
            entity_id: lock.front_door_ble
            type: button
            value_attribute: state
            styles: |
              --color: var(--green-color) !important;
          - icon: mdi:lock-open-outline
            option: unlocked
            tap_action:
              action: call-service
              service: lock.unlock
              target:
                entity_id: lock.front_door_ble
              data: {}
            autofill_entity_id: true
            haptics: false
            entity_id: lock.front_door_ble
            type: button
            value_attribute: state
            styles: |
              --color: var(--red-color) !important;
        value_attribute: state
        styles: ''
type: tile
entity: lock.front_door_ble
show_entity_picture: false
vertical: false
layout_options:
  grid_columns: 4
  grid_rows: ''
card_mod:
  style:
    ha-tile-info$: |
      .secondary:after {
        visibility: visible;
        content: " ⸱ {{ states('sensor.front_door_battery_level') }}%";
      }
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/lock_tile.png" alt="lock_tile" width="600"/>

## Example 2

A light tile with a button for each bulb, a color selector, brightness and temperature sliders, and a brightness spinbox with emphasis on certain options.

```yaml
features:
  - type: custom:service-call
    entries:
      - type: button
        tap_action:
          action: call-service
          service: light.toggle
          confirmation:
            text: >-
              Are you sure you want to turn the light {{ 'on' if
              is_state('light.chandelier', 'off') else 'off' }}?
            exemptions: []
          target:
            entity_id: light.chandelier
        icon: >-
          {{ iif(is_state("light.chandelier", "on"), "mdi:ceiling-light",
          "mdi:ceiling-light-outline") }}
        label: '{{ value if value > 0 else "" }}{{ unit if value > 0 else "" }}'
        value_attribute: brightness
        unit_of_measurement: '%'
        autofill_entity_id: true
        entity_id: light.chandelier
        styles: |-
          :host {
            flex-basis: 200% !important;
            --icon-color: red !important;
            {% if is_state("light.chandelier", "on") %}
            --color: rgb({{ state_attr("light.chandelier", "rgb_color") }});
            {% endif %}
             !important;
          }
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_1
        icon: mdi:lightbulb
        label: Bulb 1
        entity_id: light.chandelier
        type: button
        value_attribute: state
        styles: |-
          :host {
            --icon-color: orange !important;
          }
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_2
        icon: mdi:lightbulb
        label: Bulb 2
        entity_id: light.chandelier
        type: button
        value_attribute: state
        styles: |-
          :host {
            --icon-color: yellow !important;
          }
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_3
        icon: mdi:lightbulb
        label: Bulb 3
        entity_id: light.chandelier
        type: button
        value_attribute: state
        styles: |-
          :host {
            --icon-color: green !important;
          }
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_4
        icon: mdi:lightbulb
        label: Bulb 4
        entity_id: light.chandelier
        type: button
        value_attribute: state
        styles: |-
          :host {
            --icon-color: blue !important;
          }
      - tap_action:
          action: call-service
          service: light.toggle
          target:
            entity_id: light.chandelier_bulb_5
        icon: mdi:lightbulb
        label: Bulb 5
        entity_id: light.chandelier
        type: button
        value_attribute: state
        styles: |-
          :host {
            --icon-color: purple !important;
          }
    styles: ''
  - type: custom:service-call
    entries:
      - type: selector
        entity_id: light.chandelier
        value_attribute: rgb_color
        options:
          - tap_action:
              action: call-service
              service: light.turn_on
              data:
                color_name: red
              target:
                entity_id: light.chandelier
            option: 255,0,0
            label: Red
            icon: mdi:alpha-r
            entity_id: light.chandelier
            type: button
            value_attribute: state
            styles: |
              :host {
                --label-color: red !important;
                --color: red !important;
                {% if (state_attr("light.chandelier", "rgb_color") or []).join(',') == '255,0,0' %}
                --label-filter: invert(1);
                {% endif %}
              }
          - tap_action:
              action: call-service
              service: light.turn_on
              data:
                color_name: green
              target:
                entity_id: light.chandelier
            option: 0,128,0
            label: Green
            icon: mdi:alpha-g
            entity_id: light.chandelier
            type: button
            value_attribute: state
            styles: |-
              :host {
                --label-color: green !important;
                --color: green !important;
                {% if (state_attr("light.chandelier", "rgb_color") or []).join(',') == '0,128,0' %}
                --label-filter: invert(1);
                {% endif %}
              }
          - tap_action:
              action: call-service
              service: light.turn_on
              data:
                color_name: blue
              target:
                entity_id: light.chandelier
            option: 0,0,255
            label: Blue
            icon: mdi:alpha-b
            entity_id: light.chandelier
            type: button
            value_attribute: state
            styles: |-
              :host {
                --label-color: blue !important;
                --color: blue !important;
                {% if (state_attr("light.chandelier", "rgb_color") or []).join(',') == '0,0,255' %}
                --label-filter: invert(1);
                {% endif %}
              }
          - tap_action:
              action: call-service
              service: light.turn_on
              data:
                color_temp: 500
              target:
                entity_id: light.chandelier
            option: 255,166,87
            label: White
            icon: mdi:alpha-w
            entity_id: light.chandelier
            type: button
            value_attribute: state
            styles: |-
              :host {
                --label-color: white !important;
                --color: white !important;
                {% if (state_attr("light.chandelier", "rgb_color") or []).join(',') == '255,166,87' %}
                --label-filter: invert(1);
                --icon-filter: invert(1);
                {% endif %}
              }
          - tap_action:
              action: call-service
              service: light.turn_on
              target:
                entity_id: light.chandelier
              data:
                color_name: purple
            option: 128,0,128
            label: Purple
            icon: mdi:alpha-p
            entity_id: light.chandelier
            type: button
            value_attribute: state
            styles: |-
              :host {
                --label-color: purple !important;
                --color: purple !important;
                {% if (state_attr("light.chandelier", "rgb_color") or []).join(',') == '128,0,128' %}
                --label-filter: invert(1);
                {% endif %}
              }
        styles: |-
          .background {
            {% if is_state("light.chandelier", "on") %}
            --background: rgb({{ state_attr("light.chandelier", "rgb_color") }});
            {% endif %}
          }
  - type: custom:service-call
    entries:
      - type: slider
        label: '{{ value }}{{ unit }}'
        unit_of_measurement: '%'
        value_attribute: brightness
        icon: mdi:brightness-4
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            brightness_pct: '{{ value }}'
          target:
            entity_id: light.chandelier
        entity_id: light.chandelier
        styles: |
          :host {
            flex-basis: 200% !important;
          }
        range:
          - 0
          - 100
        step: 1
      - type: slider
        thumb: line
        value_attribute: color_temp
        tap_action:
          action: call-service
          service: light.turn_on
          target:
            entity_id: light.chandelier
          data:
            color_temp: '{{ value }}'
        label: '{{ value }}{{ unit }}'
        unit_of_measurement: ' Mireds'
        icon: mdi:thermometer
        range:
          - '{{ state_attr("light.chandelier", "min_mireds") }}'
          - '{{ state_attr("light.chandelier", "max_mireds") }}'
        step: 1
        entity_id: light.chandelier
        styles: |-
          :host {
            --label-color: var(--disabled-color) !important;
            --background: linear-gradient(-90deg, rgb(255, 167, 87), rgb(255, 255, 251)) !important;
            --background-opacity: 1 !important;
          }
    styles: ''
  - type: custom:service-call
    entries:
      - type: spinbox
        haptics: true
        icon: mdi:brightness-4
        unit_of_measurement: '%'
        label: '{{ value }}{{ unit }}'
        step: 5
        debounceTime: 1000
        range:
          - 0
          - 100
        value_attribute: brightness
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            brightness_pct: '{{ value | float }}'
          target:
            entity_id: light.chandelier
        decrement:
          icon: mdi:brightness-3
          label: down
          hold_action:
            action: repeat
          entity_id: light.chandelier
          type: button
          value_attribute: state
          styles: |-
            :host {
              flex-flow: row !important;
            }
            .icon {
              padding-right: 4px !important;
            }
        increment:
          icon: mdi:brightness-2
          label: up
          hold_action:
            action: repeat
          entity_id: light.chandelier
          type: button
          value_attribute: state
          styles: |-
            :host {
              flex-flow: row-reverse !important;
            }
            .icon {
              padding-left: 4px !important;
            }
        hold_action:
          action: repeat
        entity_id: light.chandelier
        styles: |-
          :host {
            --light-color: rgb({{ state_attr("light.chandelier", "rgb_color") }}) !important;
            --on-color: {{ "var(--light-color)" if is_state("light.chandelier", "on") else "initial" }} !important;
            --background: var(--on-color) !important;
            --icon-color: var(--on-color) !important;
            --label-color: var(--on-color) !important;
          }
type: tile
entity: light.chandelier
layout_options:
  grid_columns: 4
  grid_rows: auto
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/example_tile.png" alt="light_tile" width="600"/>

## Example 3

Multiple sliders for a room's light and curtains.

```yaml
features:
  - type: custom:service-call
    entries:
      - type: button
        haptics: true
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            entity_id: light.sunroom_ceiling
            color_name: red
        double_tap_action:
          action: call-service
          service: light.turn_on
          xdouble_tap_window: 1000
          data:
            entity_id: light.sunroom_ceiling
            color_name: green
        hold_action:
          action: call-service
          service: light.turn_on
          xhold_time: 2000
          data:
            entity_id: light.sunroom_ceiling
            color_name: blue
        icon: mdi:power
        label: '{{ states("light.sunroom_ceiling") }}'
        entity_id: light.sunroom_ceiling
        value_attribute: state
        styles: |-
          :host {
            {% if is_state("light.sunroom_ceiling", "on") %}
            --color: rgb({{ state_attr("light.sunroom_ceiling", "rgb_color") }});
            {% endif %} !important;
          }
      - type: slider
        haptics: true
        label: '{{ value }}{{ unit }}'
        unit_of_measurement: '%'
        value_attribute: brightness
        icon: mdi:brightness-4
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            brightness_pct: '{{ value | int }}'
          target:
            entity_id: light.sunroom_ceiling
        entity_id: light.sunroom_ceiling
        range:
          - 0
          - 100
        step: 1
        thumb: default
        styles: |
          :host {
            flex-basis: 200% !important;
            {% if is_state("light.sunroom_ceiling", "on") %}
            --color: rgb({{ state_attr("light.sunroom_ceiling", "rgb_color") }})
            {% endif %}
          }
          .tooltip {
            {% if is_state("light.sunroom_ceiling", "off") %}
            display: none !important;
            {% endif %}
          }
  - type: custom:service-call
    entries:
      - type: slider
        thumb: line
        range:
          - 0
          - 360
        step: 0.1
        value_attribute: Hs color[0]
        icon: mdi:palette
        tap_action:
          action: call-service
          target:
            entity_id: light.sunroom_ceiling
          data:
            hs_color:
              - '{{ value }}'
              - 100
          service: light.turn_on
        entity_id: light.sunroom_ceiling
        styles: |-
          :host {
            flex-basis: 200% !important;
            --background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 66%, #f0f 83%, #f00 100%) !important;
            --background-opacity: 1 !important;
          }
          .tooltip {
            background: hsl({{ value }}, 100%, 50%) !important;
          }
      - type: slider
        thumb: line
        value_attribute: color_temp
        tap_action:
          action: call-service
          service: light.turn_on
          data:
            color_temp: '{{ value }}'
            entity_id: light.sunroom_ceiling
        label: '{{ value }}{{ unit }}'
        unit_of_measurement: ' Mireds'
        icon: mdi:thermometer
        range:
          - '{{ state_attr("light.sunroom_ceiling", "min_mireds") }}'
          - '{{ state_attr("light.sunroom_ceiling", "max_mireds") }}'
        step: 1
        styles: |-
          :host {
            --background: linear-gradient(-90deg, rgb(255, 167, 87), rgb(255, 255, 251)) !important; --background-opacity: 1 !important; --label-color: var(--disabled-color) !important;
          }
        autofill_entity_id: true
        entity_id: light.sunroom_ceiling
  - type: custom:service-call
    entries:
      - type: slider
        tap_action:
          action: call-service
          service: cover.set_cover_position
          data:
            position: '{{ value }}'
            entity_id: cover.sunroom_curtains
        value_attribute: current_position
        icon: mdi:curtains
        entity_id: cover.sunroom_curtains
        styles: |-
          :host {
            --color: var(--tile-color) !important;
            --icon-color: var(--disabled-color) !important;
          }
        range:
          - 0
          - 100
        step: 1
  - type: custom:service-call
    entries:
      - type: slider
        entity_id: media_player.spotify_nerwyn_singh
        tap_action:
          action: call-service
          service: media_player.volume_set
          data:
            volume_level: '{{ value }}'
          target:
            entity_id: media_player.spotify_nerwyn_singh
        value_attribute: volume_level
        icon: mdi:spotify
        label: |
          {{ state_attr(config.entity, "media_title") }}
          {{ state_attr(config.entity, "media_artist") }}
        range:
          - 0
          - 1
        thumb: round
        styles: |-
          :host {
            --color: rgb(31, 223, 100) !important;
            flex-direction: row !important;
            border-radius: 40px !important;
            --tooltip-label: '{{ (value * 100) | int }}%' !important;
            flex-basis: 500% !important;
          }
          .icon {
            color: rgb(37, 79, 55) !important;
            padding: 8px !important;
            flex: auto !important;
            position: absolute !important;
            transform: translateX(var(--thumb-offset)) !important;
          }
          .label {
            left: -16px !important;
          }
        step: 0.01
      - type: button
        entity_id: media_player.spotify_nerwyn_singh
        icon: mdi:play-pause
        tap_action:
          action: call-service
          service: media_player.media_play_pause
          data: {}
          target:
            entity_id: media_player.spotify_nerwyn_singh
        double_tap_action:
          action: call-service
          service: script.spotify_refresh_every_5_seconds_for_30_seconds
          target:
            entity_id: media_player.spotify_nerwyn_singh
        value_attribute: state
        styles: ''
  - type: custom:service-call
    entries:
      - type: button
        entity_id: media_player.spotify_nerwyn_singh
        value_attribute: media_position
        tap_action:
          action: call-service
          service: media_player.media_previous_track
          target:
            entity_id: media_player.spotify_nerwyn_singh
        label: >-
          {% set minutes = (value / 60) | int %} {% set seconds = (value - 60 *
          minutes) | int %} {{ minutes }}:{{ 0 if seconds < 10 else "" }}{{
          seconds | int }}
        styles: |-
          :host {
            overflow: visible !important;
            height: 12px !important;
            border-radius: 0px !important;
            --color: none !important;
          }
      - type: slider
        tap_action:
          action: call-service
          service: media_player.media_seek
          data:
            seek_position: '{{ value }}'
          target:
            entity_id: media_player.spotify_nerwyn_singh
        entity_id: media_player.spotify_nerwyn_singh
        value_attribute: media_position
        value_from_hass_delay: 5000
        range:
          - 0
          - '{{ state_attr(config.entity, "media_duration") }}'
        thumb: flat
        styles: |-
          :host {
            --color: rgb(31, 223, 100) !important;
            --tooltip-label: '{{ (value / 60) | int }}:{{ 0 if (value - 60*((value / 60) | int)) < 10 else "" }}{{ (value - 60*((value / 60) | int)) | int }}' !important;
            flex-basis: 1200% !important;
            height: 10px !important;
          }
        step: 3.9896
      - type: button
        entity_id: media_player.spotify_nerwyn_singh
        value_attribute: media_position
        tap_action:
          action: call-service
          service: media_player.media_next_track
          target:
            entity_id: media_player.spotify_nerwyn_singh
        label: >-
          {{ (state_attr(config.entity, "media_duration") / 60) | int }}:{{ 0 if
          (state_attr(config.entity, "media_duration") -
          60*((state_attr(config.entity, "media_duration") / 60) | int)) < 10
          else "" }}{{ (state_attr(config.entity, "media_duration") -
          60*((state_attr(config.entity, "media_duration") / 60) | int)) | int
          }}
        styles: |-
          :host {
            overflow: visible !important;
            height: 12px !important;
            border-radius: 0px !important;
            --color: none !important;
          }
type: tile
entity: binary_sensor.sun_room
color: accent
icon: ''
layout_options:
  grid_columns: 4
  grid_rows: auto
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
            entity_id: input_select.lounge_tv_theater_mode
            option: Theater
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: Theater
              target:
                entity_id: input_select.lounge_tv_theater_mode
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:movie-off
            entity_id: input_select.lounge_tv_theater_mode
            option: Light
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: Light
              target:
                entity_id: input_select.lounge_tv_theater_mode
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:movie-outline
            entity_id: input_select.lounge_tv_theater_mode
            option: Dark
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: Dark
              target:
                entity_id: input_select.lounge_tv_theater_mode
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:movie-off-outline
            entity_id: input_select.lounge_tv_theater_mode
            option: 'Off'
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: 'Off'
              target:
                entity_id: input_select.lounge_tv_theater_mode
            type: button
            value_attribute: state
            styles: ''
        value_attribute: state
        styles: |-
          :host {
            --color: var(--blue-color) !important;
            flex-basis: 140% !important;
          }
      - type: selector
        entity_id: input_select.lounge_tv_listening_mode
        options:
          - icon: mdi:dolby
            entity_id: input_select.lounge_tv_listening_mode
            option: Movie
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: Movie
              target:
                entity_id: input_select.lounge_tv_listening_mode
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:music
            entity_id: input_select.lounge_tv_listening_mode
            option: Music
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: Music
              target:
                entity_id: input_select.lounge_tv_listening_mode
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:microsoft-xbox-controller
            entity_id: input_select.lounge_tv_listening_mode
            option: Game
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: Game
              target:
                entity_id: input_select.lounge_tv_listening_mode
            type: button
            value_attribute: state
            styles: ''
        value_attribute: state
        styles: ''
  - type: custom:service-call
    entries:
      - type: selector
        entity_id: input_select.lounge_tv_source
        options:
          - icon: mdi:television-box
            entity_id: input_select.lounge_tv_source
            option: Google TV
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: Google TV
              target:
                entity_id: input_select.lounge_tv_source
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:microsoft-windows
            entity_id: input_select.lounge_tv_source
            option: HTPC
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: HTPC
              target:
                entity_id: input_select.lounge_tv_source
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:vhs
            entity_id: input_select.lounge_tv_source
            option: DVD/VHS
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: DVD/VHS
              target:
                entity_id: input_select.lounge_tv_source
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:record-player
            entity_id: input_select.lounge_tv_source
            option: Vinyl
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: Vinyl
              target:
                entity_id: input_select.lounge_tv_source
            type: button
            value_attribute: state
            styles: ''
          - icon: mdi:video-input-hdmi
            entity_id: input_select.lounge_tv_source
            option: External
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: External
              target:
                entity_id: input_select.lounge_tv_source
            type: button
            value_attribute: state
            styles: ''
        value_attribute: state
        styles: |-
          :host {
            --color: var(--red-color) !important;
          }
type: tile
entity: input_select.lounge_tv_listening_mode
color: green
layout_options:
  grid_columns: 4
  grid_rows: auto
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
            icon: mdi:alpha-{{ config.option | lower }}
            styles: |-
              :host {
                --icon-color: {{ "var(--disabled-color)" if is_state(config.entity, config.option) }};
                --color: var(--red-color);
              }
            entity_id: input_select.select_test
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: A
              target:
                entity_id: input_select.select_test
            type: button
            value_attribute: state
          - option: B
            icon: mdi:alpha-{{ config.option | lower }}
            entity_id: input_select.select_test
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: B
              target:
                entity_id: input_select.select_test
            type: button
            value_attribute: state
            styles: |-
              :host {
                --icon-color: {{ "var(--disabled-color)" if is_state(config.entity, config.option) }} !important;
                --color: var(--green-color) !important;
              }
          - option: C
            icon: mdi:alpha-{{ config.option | lower }}
            entity_id: input_select.select_test
            tap_action:
              action: call-service
              service: input_select.select_option
              data:
                option: C
              target:
                entity_id: input_select.select_test
            type: button
            value_attribute: state
            styles: |-
              :host {
                --icon-color: {{ "var(--disabled-color)" if is_state(config.entity, config.option) }} !important;
                --color: var(--blue-color) !important;
              }
        entity_id: input_select.select_test
        value_attribute: state
        styles: ''
  - type: custom:service-call
    entries:
      - type: button
        icon: mdi:arrow-down-bold
        tap_action:
          action: call-service
          service: input_number.decrement
          data:
            entity_id: input_number.slider_test
        hold_action:
          action: repeat
          repeat_delay: 10
        entity_id: input_number.slider_test
        value_attribute: state
        styles: ''
      - type: slider
        thumb: round
        entity_id: input_number.slider_test
        label: |
          Input Number
          {{ value }}{{ unit }}
        unit_of_measurement: '#'
        icon: mdi:numeric
        styles: |-
          :host {
            flex-basis: 600% !important;
            --tooltip-label: "The number is {{ value }}";
            border-radius: 40px !important;
            --label-color: var(--disabled-color);
          }
          .icon {
            color: var(--accent-color) !important;
            padding: 8px !important;
            flex: auto !important;
            position: absolute !important;
            transform: translateX(var(--thumb-offset)) !important;
            --mdc-icon-size: 24px !important;
          }
        range:
          - -128
          - 128
        tap_action:
          action: call-service
          target:
            entity_id:
              - input_number.slider_test
          service: input_number.set_value
          data:
            value: '{{ value | int }}'
        autofill_entity_id: true
        step: 0.5
        value_attribute: state
      - type: button
        icon: mdi:arrow-up-bold
        action: call-service
        haptics: true
        hold_action:
          action: repeat
          repeat_delay: 10
        entity_id: input_number.slider_test
        tap_action:
          action: call-service
          service: input_number.increment
          target:
            entity_id:
              - input_number.slider_test
        value_attribute: state
        styles: ''
    styles: |-
      {% if not is_state(config.entity, "A")  %}
      :host {
        display: none !important;
      }
      {% endif %}
  - type: custom:service-call
    entries:
      - type: spinbox
        tap_action:
          action: call-service
          service: input_number.set_value
          data:
            value: '{{ value }}'
          target:
            entity_id: input_number.slider_test
        range:
          - -128
          - 128
        step: 0.5
        label: '{{ value }}'
        hold_action:
          action: repeat
          repeat_delay: 50
        autofill_entity_id: true
        decrement:
          entity_id: input_number.slider_test
          type: button
          value_attribute: state
          styles: ''
        entity_id: input_number.slider_test
        increment:
          entity_id: input_number.slider_test
          type: button
          value_attribute: state
          styles: ''
        value_attribute: state
        styles: ''
    styles: |
      {% if not is_state(config.entity, "A")  %}
      :host {
        display: none !important;
      }
      {% endif %}
  - type: custom:service-call
    entries:
      - type: button
        icon: mdi:youtube
        tap_action:
          action: url
          url_path: youtube.com
        double_tap_action:
          action: url
          url_path: play.spotify.com
        entity_id: input_select.select_test
        value_attribute: state
        styles: ''
      - type: button
        icon: mdi:view-dashboard
        tap_action:
          action: navigate
          navigation_path: /lovelace/0
        double_tap_action:
          action: navigate
          navigation_path: /lovelace-extra/0
        entity_id: input_select.select_test
        value_attribute: state
        styles: ''
      - type: button
        icon: mdi:view-compact
        tap_action:
          action: navigate
          navigation_path: /lovelace-extra/subview
        entity_id: input_select.select_test
        value_attribute: state
        styles: ''
    styles: |-
      {% if not is_state(config.entity, "B")  %}
      :host {
        display: none !important;
      }
      {% endif %}
  - type: custom:service-call
    entries:
      - type: button
        icon: mdi:assistant
        tap_action:
          action: assist
          pipeline_id: last_used
        label: ''
        entity_id: input_select.select_test
        value_attribute: state
        styles: ''
        double_tap_action:
          action: navigate
          navigation_path: '?conversation=1'
      - type: button
        tap_action:
          action: more-info
          target:
            entity_id: sensor.fordpass_elveh
        entity_id: sensor.fordpass_elveh
        value_attribute: state
        styles: |-
          :host {
            background-image: url('http://homeassistant.local:8123/local/ford_mme.png') !important;
            background-size: contain !important;
            background-repeat: no-repeat !important;
            background-position: center !important;
            opacity: 1 !important;
          }
    styles: |-

      {% if not is_state(config.entity, "C")  %}
      :host {
        display: none !important;
      }
      {% endif %}
type: tile
entity: input_select.select_test
show_entity_picture: false
vertical: false
color: primary
layout_options:
  grid_columns: 4
  grid_rows: auto
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/selector_show_tile.png" alt="selector_show_tile" width="1200"/>

## Example 6

A better looking temperature spinbox with hold on repeat, tile color, and an icon and label. Also an XKCD button that opens a different comic based on how long you hold it using momentary button mode.

```yaml
features:
  - type: custom:service-call
    entries:
      - type: spinbox
        icon: mdi:thermometer
        label: '{{ value }}{{ unit }}'
        step: 1
        debounceTime: 1000
        range:
          - '{{ state_attr("climate.downstairs_thermostat", "min_temp") }}'
          - '{{ state_attr("climate.downstairs_thermostat", "max_temp") }}'
        value_attribute: temperature
        unit_of_measurement: °F
        hold_action:
          action: repeat
        entity_id: climate.downstairs_thermostat
        styles: |-
          :host {
            --background: var(--tile-color) !important;
            --icon-color: var(--tile-color) !important;
            flex-flow: row !important;
          }
        tap_action:
          action: call-service
          target:
            entity_id: climate.downstairs_thermostat
  - type: custom:service-call
    entries:
      - type: button
        label: XKCD
        value_from_hass_delay: 5000
        momentary_end_action:
          action: url
          url_path: https://xkcd.com/{{ 1000* HOLD_SECS }}
        entity_id: climate.downstairs_thermostat
        value_attribute: state
  - type: custom:service-call
    entries:
      - type: button
        entity_id: sensor.cold_flu_index_today
        label: |-
          State Float
          {{ value }}
        value_attribute: state
        styles: ''
      - type: button
        entity_id: sensor.cold_flu_index_today
        label: |-
          State Float
          {{ value }}
        value_attribute: strep_index
        icon: ''
        styles: |-
          .background {
            --color: {{ "blue" if state_attr(config.entity, config.attribute) < 3 else "green" }} !important;
          }
        tap_action:
          action: more-info
          target:
            entity_id: sensor.cold_flu_index_today
          confirmation:
            exemptions:
              - user: 7e9bf9d73edc48df8ece5cec7e9a4f00
              - user: af773a442cd7493f8178f7c23b7882d7
            text: Display Cold & Flue Index?
type: tile
entity: climate.downstairs_thermostat
layout_options:
  grid_columns: 4
  grid_rows: auto
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/spinbox_tile.png" alt="spinbox_tile" width="600"/>

## Example 7

A read only timer display with buttons and multiple labels.

```yaml
features:
  - type: custom:service-call
    entries:
      - type: button
        value_attribute: elapsed
        label: >-
          {% set minutes = (value / 60) | int %} {% set seconds = (value - 60 *
          minutes) | int %} {{ minutes }}:{{ 0 if seconds < 10 else "" }}{{
          seconds | int }}
        styles: |-
          :host {
            overflow: visible !important;
            height: 12px !important;
            border-radius: 0px !important;
            --color: none !important;
          }
        entity_id: timer.timer_test
      - type: slider
        tap_action:
          action: none
        value_attribute: elapsed
        thumb: flat
        step: 1
        range:
          - 0
          - >-
            {% set hms = state_attr(config.entity, "duration").split(":") %} {{
            (hms[0] |int ) * 3600 + (hms[1] | int) * 60 + (hms[2] | int) }}
        styles: |-
          :host {
            flex-basis: 1200% !important;
            height: 10px !important;
          }
        entity_id: timer.timer_test
      - type: button
        value_attribute: duration
        label: '{% set hms = value.split(":") %} {{ hms[1] | int }}:{{ hms[2] }}'
        styles: |-
          :host {
            overflow: visible !important;
            height: 12px !important;
            border-radius: 0px !important;
            --color: none !important;
          }
        entity_id: timer.timer_test
  - type: custom:service-call
    entries:
      - type: button
        icon: mdi:timer-check
        tap_action:
          action: call-service
          service: timer.start
          target:
            entity_id: timer.timer_test
        entity_id: timer.timer_test
        value_attribute: elapsed
      - type: button
        icon: mdi:timer-pause
        tap_action:
          action: call-service
          service: timer.pause
          target:
            entity_id: timer.timer_test
        entity_id: timer.timer_test
        value_attribute: elapsed
      - type: button
        icon: mdi:timer-cancel
        tap_action:
          action: call-service
          service: timer.cancel
          target:
            entity_id: timer.timer_test
        entity_id: timer.timer_test
        value_attribute: elapsed
    styles: |-
      :host {
        --mdc-icon-size: 32px !important;
      }
type: tile
entity: timer.timer_test
layout_options:
  grid_columns: 4
  grid_rows: auto
```

<img src="https://raw.githubusercontent.com/Nerwyn/service-call-tile-feature/main/assets/timer_tile.png" alt="timer_tile" width="600"/>

[last-commit-shield]: https://img.shields.io/github/last-commit/Nerwyn/service-call-tile-feature?style=for-the-badge
[commits]: https://github.com/Nerwyn/service-call-tile-feature/commits/main
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/t/service-call-button-tile-feature/620724
[license-shield]: https://img.shields.io/github/license/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-Nerwyn-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/Nerwyn/service-call-tile-feature.svg?style=for-the-badge
[releases]: https://github.com/nerwyn/service-call-tile-feature/releases
[github]: https://img.shields.io/github/followers/Nerwyn.svg?style=social
