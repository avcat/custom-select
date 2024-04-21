# Todo

1. Create leaned single-file version with CSS-in-JS 
    - It should not use CSS variables, but only default values
    - ? It should be extendable in-place with CSS classes or similar
1. Make it possible to link files to a project by external links
1. Add nicer previews and demos with links to code or the code itself (<code>&lt;details&gt;</code> or whatever)
1. Add Quick Links at the start of Readme

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
<custom-select name="programming-language" value="javascript">
  #shadow-root (open) ⤵
    <div part="base">JavaScript</div>
    <ul part="options">
      <li part="option" value="javascript" selected="">JavaScript</li>
      <li part="option" value="python">Python</li>
      <li part="option" value="java">Java</li>
    </ul>
  #(end shadow-root) ⤶
</custom-select>
```

<table>
  <tr>
    <th width="60%">CSS variable</th>
    <th width="20%">Affected parts</th>
    <th width="20%">Default value</th>
  </tr>
  <tr>
    <td colspan="3" align="center">Sizes</td>
  </tr>
  <tr>
    <td><code>--base-min-height</code></td>
    <td>base</td>
    <td>2.5em</td>
  </tr>
  <tr>
    <td><code>--base-padding-inline</code></td>
    <td>base, option</td>
    <td>0.5em</td>
  </tr>
  <tr>
    <td><code>--base-icon-width</code></td>
    <td>base</td>
    <td>1em</td>
  </tr>
  <tr>
    <td><code>--base-border-width</code></td>
    <td>base, options</td>
    <td>1px</td>
  </tr>
  <tr>
    <td><code>--base-font-size</code></td>
    <td>base</td>
    <td>1em</td>
  </tr>
  <tr>
    <td><code>--options-padding-block</code></td>
    <td>options</td>
    <td>0</td>
  </tr>
  <tr>
    <td><code>--options-font-size</code></td>
    <td>options</td>
    <td>1em</td>
  </tr>
  <tr>
    <td><code>--options-max-display-items</code></td>
    <td>options</td>
    <td>5</td>
  </tr>
  <tr>
    <td><code>--option-padding-block</code></td>
    <td>option</td>
    <td>0.5em</td>
  </tr>
  <tr>
    <td colspan="3" align="center">Colors</td>
  </tr>
  <tr>
    <td><code>--base-border-color</code></td>
    <td>base</td>
    <td><code>black</code></td>
  </tr>
  <tr>
    <td><code>--base-border-color-hover</code></td>
    <td>base</td>
    <td><code>lightblue</code></td>
  </tr>
  <tr>
    <td><code>--base-border-color-opened</code></td>
    <td>base, options</td>
    <td><code>lightblue</code></td>
  </tr>
  <tr>
    <td><code>--base-background-color-opened</code></td>
    <td>base, options</td>
    <td><code>white</code></td>
  </tr>
  <tr>
    <td><code>--base-color-opened</code></td>
    <td>base, options</td>
    <td><code>black</code></td>
  </tr>
  <tr>
    <td><code>--option-background-color-hover</code></td>
    <td>option</td>
    <td><code>lightblue</code></td>
  </tr>
  <tr>
    <td colspan="3" align="center">Other</td>
  </tr>
  <tr>
    <td><code>--transition</code></td>
    <td>base, icon, options, option</td>
    <td><code>0.35s ease-in-out</code></td>
  </tr>
  <tr>
    <td><code>--arrow-icon</code></td>
    <td>icon</td>
    <td><code>url('data:image/svg+xml, &lt;svg fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg&gt;')</code></td>
  </tr>
</table>
