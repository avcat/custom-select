# Todo

1. Create more convenient way to use default and custom arrow icons
1. Remove `position: absolute`, use `height: 0` + `overflow: visible` instead
    - Remove mwidth
1. Create leaned single-file version with CSS-in-JS 
    - It should not use CSS variables, but only default values
    - ? It should be extendable in-place with CSS classes or similar
1. Make it possible to link files to a project by external links

# <code>&lt;custom-select&gt;</code>

## Add to project

[The Web Component class](/custom-select.js)
```js
// main.js
import 'custom-select.js';
```

[Styles](/custom-select.css)
```css
/* styles.css */
@import 'custom-select.css';
```

## Use

Replace `<select>` HTML elements with `<custom-select>`:
```html
// Before
<select name="..." placeholder="...">
  <option value="..." selected>...</option>
  <option value="...">...</option>
  <option value="...">...</option>
</select>

// After
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
      Defines initial text of the select, if there is no HTML element <code>option</code> with property <code>selected</code>.
    </td>
  </tr>
  <tr>
    <td>
      <code>selected</code>
    </td>
    <td>
      Defines initial value of the <code>custom-select</code>.
    </td>
  </tr>
</table>

## Subscribe to events

<code>&lt;custom-select&gt;</code> emits its own `change` event, but you can add more custom events.

```js
document.querySelector('custom-select')
  .addEventListener(
    'change', 
    e => console.log('custom select changed', e)
  );
```

## Customize

- `custom-select.css` can be fully customized
- to be able to **affect a Web Component with external stylesheet**, we use `::part(part-name)` [syntax](https://webcomponents.guide/learn/components/styling/#parts-styling-a-shadow-tree-from-the-outside)
- some CSS properties are still [**inherited**](https://webcomponents.guide/learn/components/styling/#inheritance) from the outside: `font-size`, `font-family`, `color`
- there are some **CSS variables**, that can be utilized

```html
<!-- The resulting DOM nodes for the reference -->
<custom-select name="bedrooms" value="bedrooms-2">
  #shadow-root (open) ⤵
    <div part="select">
      <div part="base">2 Bedrooms</div>
      <ul part="options">
        <li part="option" value="all">All</li>
        <li part="option" value="bedrooms-1">1 Bedroom</li>
        <li part="option" value="bedrooms-2" selected="">2 Bedrooms</li>
      </ul>
    </div>
  #(end shadow-root) ⤶
</custom-select>
```

<table>
  <tr>
    <th>CSS variable</th>
    <th>Affected parts</th>
    <th>Default value</th>
  </tr>
  <tr>
    <td colspan="3" align="center">Sizes</td>
  </tr>
  <tr>
    <td><code>--select-min-height</code></td>
    <td>base</td>
    <td>40px</td>
  </tr>
  <tr>
    <td><code>--select-pad-x</code></td>
    <td>base, option</td>
    <td>9px</td>
  </tr>
  <tr>
    <td><code>--select-icon-w</code></td>
    <td>base</td>
    <td>14px</td>
  </tr>
  <tr>
    <td><code>--select-border-w</code></td>
    <td>base, options</td>
    <td>1px</td>
  </tr>
  <tr>
    <td><code>--select-fs</code></td>
    <td>base</td>
    <td>15px</td>
  </tr>
  <tr>
    <td><code>--options-pad-y</code></td>
    <td>options</td>
    <td>16px</td>
  </tr>
  <tr>
    <td><code>--options-fs</code></td>
    <td>options</td>
    <td>18px</td>
  </tr>
  <tr>
    <td><code>--options-max-display-items</code></td>
    <td>options</td>
    <td>5</td>
  </tr>
  <tr>
    <td><code>--option-pad-y</code></td>
    <td>option</td>
    <td>12px</td>
  </tr>
  <tr>
    <td colspan="3" align="center">Colors</td>
  </tr>
  <tr>
    <td><code>--select-border</code></td>
    <td>base</td>
    <td><code>var(--txt-primary, #fff)</code></td>
  </tr>
  <tr>
    <td><code>--select-hover-border</code></td>
    <td>base</td>
    <td><code>var(--txt-secondary, #c99a5b)</code></td>
  </tr>
  <tr>
    <td><code>--select-opened-border</code></td>
    <td>base, options</td>
    <td><code>var(--txt-secondary, #c99a5b)</code></td>
  </tr>
  <tr>
    <td><code>--select-opened-bg</code></td>
    <td>base, options</td>
    <td><code>var(--offWhiteBackground, #fafafa)</code></td>
  </tr>
  <tr>
    <td><code>--select-opened-color</code></td>
    <td>base, options</td>
    <td><code>var(--primary-background, #1c1a1b)</code></td>
  </tr>
  <tr>
    <td><code>--option-hover-bg</code></td>
    <td>option</td>
    <td><code>var(--txt-secondary, #c99a5b)</code></td>
  </tr>
</table>
