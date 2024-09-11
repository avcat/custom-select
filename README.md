# <code>&lt;custom-select&gt;</code>

# Add to project

## As ES6 module from local file ([download](https://github.com/avcat/custom-select/blob/main/custom-select.js))
```JS
import 'custom-select.js';
```

## As ES6 module from CDN
```JS
import 'https://cdn.jsdelivr.net/gh/avcat/custom-select/custom-select.min.js';
```

## As external file from CDN
```HTML
<script src="https://cdn.jsdelivr.net/gh/avcat/custom-select/custom-select.min.js"></script>
```

# Use

## HTML

Replace `<select>` HTML elements with `<custom-select>`:
```HTML
<!-- Before -->
<select name="..." placeholder="...">
  <option value="..." selected>...</option>
  <option value="...">...</option>
  <option value="...">...</option>
</select>

<!-- After -->
<custom-select name="..." placeholder="...">
  <option value="..." selected>...</option>
  <option value="...">...</option>
  <option value="...">...</option>
</custom-select>
```

<table>
  <tr>
    <th>
      Property
    </th>
    <th>
      Definition
    </th>
  </tr>
  <tr>
    <td>
      <code>name</code>
    </td>
    <td>
      Is utilized by form.
    </td>
  </tr>
  <tr>
    <td>
      <code>placeholder</code>
    </td>
    <td>
      Defines initial text of the select. Will be used, if there is no HTML element <code>option</code> with property <code>selected</code>.
    </td>
  </tr>
  <tr>
    <td>
      <code>selected</code>
    </td>
    <td>
      Defines initial value of the <code>CustomSelect</code>.
    </td>
  </tr>
</table>

## JS

### Use public methods

#### value (_getter_) => @returns {string}

Shows current selected value, `null` if no option is selected.

```JS
const customSelect = document.querySelector('custom-select');
console.log(customSelect.value); // '42'
```

#### value (_setter_) {number|string}

Set an option with that value as selected. Numbers are treated as strings.

```JS
const customSelect = document.querySelector('custom-select');
customSelect.value = 42;
console.log(customSelect.value); // '42'
```

#### opened (_getter_) => @returns {boolean}
Gets the `opened` state of the `CustomSelect` component.

```JS
const customSelect = document.querySelector('custom-select');
console.log(customSelect.opened); // false
```

#### opened (_setter_) {boolean}
Sets the `opened` state of the `CustomSelect` component.

```JS
const customSelect = document.querySelector('custom-select');
customSelect.opened = true;
console.log(customSelect.opened); // true
```

#### toggle
Toggle the `opened` state of the `CustomSelect` component.

```JS
const customSelect = document.querySelector('custom-select');
customSelect.toggle();
console.log(customSelect.opened); // true
customSelect.toggle();
console.log(customSelect.opened); // false
```

#### checkValidity
Checks if element is considered valid.
`CustomSelect` is invalid, if it has the `required` attribute, but does bot have a value.

```JS
const customSelect = document.querySelector('custom-select');
console.log(customSelect.checkValidity()); // false
```

### Subscribe to events

`CustomSelect` emits its own `change` event, but you can add more custom events.

```JS
const customSelect = document.querySelector('custom-select');
customSelect.addEventListener('change', e => console.log('changed'));
```

### Give custom name
The `define()` static property can be used to define a custom name for the HTML tag for this Web Component. It is useful for avoiding possible name conflicts.

The default value is `custom-select`.

```JS
CustomSelect.define(); // Can be used as <custom-select>
CustomSelect.define('another-select'); // Can be used as <another-select>
```

## CSS

CSS can be customized: either inside the source file or through CSS variables.

To be able to **affect a Web Component with external stylesheet**, we use `::part(part-name)` [syntax](https://webcomponents.guide/learn/components/styling/#parts-styling-a-shadow-tree-from-the-outside).

Some CSS properties are still [**inherited**](https://webcomponents.guide/learn/components/styling/#inheritance) from the outside: `font-size`, `font-family`, `color`.

```HTML
<!-- The resulting DOM nodes for the reference -->
<custom-select name="programming-language" value="javascript">
  #shadow-root (open) ⤵
    <div part="base">JavaScript</div>
    <input type="checkbox" tabindex="-1">
    <div part="options-wrapper">
      <ul part="options">
        <li part="option" value="javascript" selected="">JavaScript</li>
        <li part="option" value="python">Python</li>
        <li part="option" value="java">Java</li>
      </ul>
    </div>
  #(end shadow-root) ⤶
</custom-select>
```

### Sizes
```CSS
--base-min-height: 2.5em;
--base-padding-inline: 0.5em;
--base-icon-width: 1em;
--base-border-width: 1px;
--base-font-size: 1em;
--options-padding-block: 0;
--options-font-size: 1em;
--options-max-display-items: 5;
--option-padding-block: 0.5em;
```

### Colors
```CSS
--base-border-color: black;
--base-border-color-hover: lightblue;
--base-border-color-opened: lightblue;
--base-background-color-opened: white;
--base-color-opened: black;
--option-background-color-hover: lightblue;
```

### Other
```CSS
--transition: 0.35s ease-in-out;
--arrow-icon: url('data:image/svg+xml, &lt;svg fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg&gt;');
```
