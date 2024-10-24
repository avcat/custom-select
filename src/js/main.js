import customizations from '../data/customizations.js';
import Fieldset from '../components/Fieldset.js';
import Toast from '../components/Toast.js';

document.addEventListener('DOMContentLoaded', () => {

  // Output customization fields
  (() => {
    const customizationForm = document.querySelector('[data-js="customize"]');
    if (!customizationForm) return;

    for (let key in customizations) {
      const fieldset = Fieldset(key, customizations[key]);
      customizationForm.insertAdjacentHTML('beforeend', fieldset);
    }
  })();

  // Apply default styles on load
  (() => {
    const defaultValues = [...new FormData(document.querySelector('[data-js="customize"]'))];
  
    if (!defaultValues || !defaultValues.length) return;

    defaultValues.forEach(defaultValue => {
      const [name, value] = defaultValue;
      document.documentElement.style.setProperty( name, value );
    });
  })();

  // Apply new styles on change
  (() => {
    document.querySelector( '[data-js="customize"]' )?.addEventListener( 'change', e => {
      const { name, value } = e.target;
      document.documentElement.style.setProperty( name, value );
    } );
  })();

  // Output new styles
  (() => {
    document.querySelector( '[data-js="customize"]' )?.addEventListener( 'submit', e => {
      e.preventDefault();
  
      const formData = new FormData( e.originalTarget );
  
      let customCss = 'custom-select {\n';
      for ( let [name, value] of formData ) {
        customCss += `\t${name}: ${value};\n`;
      }
      customCss += '}';
  
      const cssOutputNode = document.querySelector( '[data-js="css-output"]' );
  
      if ( !cssOutputNode ) return;
  
      cssOutputNode.value = customCss;
      console.info( cssOutputNode, customCss )
      cssOutputNode.select();
      document.execCommand( 'copy' );
    } );
  })();

  // Output FormData on submit
  (() => {
    const testForm = document.querySelector( '[data-js="test-form-data"]' );

    if (!testForm) return;

    testForm.addEventListener( 'submit', e => {
      e.preventDefault();
      const testFormData = [...new FormData(testForm)];
      console.table(testFormData);
    } );
  })();

  // Output toasts
  (() => {
    Toast(`
      <h3>1Test toast</h3>
      <p>Par</p>  
    `);
  })();
  
}, { once: true });