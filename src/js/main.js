import customizations from '../data/customizations.js';
import Fieldset from "../components/Fieldset.js";

// Output customization fields
document.addEventListener('DOMContentLoaded', () => {
  const customizationForm = document.querySelector('[data-js="customize"]');
  if (!customizationForm) return;

  for (let key in customizations) {
    const fieldset = Fieldset(key, customizations[key]);
    customizationForm.insertAdjacentHTML('beforeend', fieldset);
  }
}, { once: true });

// Apply new styles on change
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector( '[data-js="customize"]' )?.addEventListener( 'change', e => {
    const { name, value } = e.target;
    document.documentElement.style.setProperty( name, value );
  } );
}, { once: true });

// Output new styles
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector( '[data-js="customize"]' )?.addEventListener( 'submit', e => {
    e.preventDefault();

    const formData = new FormData( e.originalTarget );
    let customCss = '';

    for ( let [name, value] of formData ) {
      customCss += `${name}: ${value};\n`;
    }

    const cssOutputNode = document.querySelector( '[data-js="css-output"]' );

    if ( !cssOutputNode ) return;

    cssOutputNode.value = customCss;
    console.info( cssOutputNode, customCss )
    cssOutputNode.select();
    document.execCommand( 'copy' );
  } );
}, { once: true });

// Output FormData on submit
document.addEventListener('DOMContentLoaded', () => {
  const testForm = document.querySelector( '[data-js="test-form-data"]' );

  if (!testForm) return;

  testForm.addEventListener( 'submit', e => {
    e.preventDefault();
    const testFormData = [...new FormData(testForm)];
    console.table(testFormData);
  } );
}, { once: true });