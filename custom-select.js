// @ts-check

/**
 * `CustomSelect` is a web component that represents an autonomous web component.
 * @class CustomSelect
 * @extends {HTMLElement}
 */
class CustomSelect extends HTMLElement {
	/**
   * Indicates if the element is form-associated so it can be utilized by f.e. FormData.
	 * @see {@link https://html.spec.whatwg.org/dev/custom-elements.html#custom-elements-face-example|WhatWG documentation on "Creating a form-associated custom element".}
   * @static
   * @type {boolean}
   */
	static formAssociated = true;

	/**
   * Observed attributes for the CustomSelect component.
   * @static
   * @type {string[]}
   */
	static observedAttributes = ['value'];

	/**
	 * This private property is used to store an [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) object.
	 * ElementInternals adds the capability for custom elements to participate in a form submission.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals|attachInternals() on MDN.}
	 * @access private
	 * @type {undefined | ElementInternals}
	 */
	#internals;

	/**
	 * This private property is used to store the reference to the element's [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot).
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow|attachShadow() on MDN.}
	 * @access private
	 * @type {undefined | ShadowRoot}
	 */
	#shadowRoot;

	/**
   * This private property is used to store the options, that will be available to choose and used to validate chosen values.
	 * @access private
	 * @type {undefined | Array | Array.<{value: String, node: HTMLLIElement}>}
   */
	#options;

	/**
	 * Represents the base part of the `CustomSelect`, that shows the chosen value.
	 * @access private
	 * @type {HTMLDivElement | null}
	 */
	#baseNode;

	/**
	 * Represents visually hidden form element inside `CustomSelect`, used as `anchor` for internal browser validation messages.
	 * This `CustomSelect` has only one validation message, responsive to the `required` attribute. 
	 * @access private
	 * @type {HTMLInputElement | null}
	 */
	#inputNode;

	/**
	 * Represents the default value of the select.
	 * It can be: 1) `selected` value; 2) placeholder -> null; 3) first option
	 * @access private
	 * @type {string | null}
	 */
	#defaultValue;

	/**
	 * Is used to keep the tag name of this `CustomSelect`.
	 * @type {string}
	 */
	static tag = 'custom-select';

	/**
	 * This static property can be used to define a custom name for the HTML tag for this Web Component.
	 * It is useful for avoiding possible name conflicts.
	 * @static
	 * @param {string} [tag] default value is `custom-select`
	 * @returns {void}
	 */
	static define(tag = CustomSelect.tag) {
		if (!customElements.get(tag)) {
			customElements.define(tag, this);
			CustomSelect.tag = tag;
		}
	}

	/**
	 * Is used to make sure we only add single global event listener.
	 * @type {boolean}
	 */
	static isDocumentListener = false;

	/**
   * Creates an instance of CustomSelect.
   * @constructor
   */
	constructor() {
		super();
		this.#internals = this.attachInternals();
		this.#shadowRoot = this.attachShadow({ mode: 'open' });
		this.#options = [];

		/**
		 * Represents the `placeholder` value.
		 * @access public
		 * @type {string | null}
		 */
		this.placeholder = null;
	}

	/**
	 * Lifecycle callback. Called each time the element is added to the document.
	 * Used for the first render and to add event listeners to the element.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements|Using custom elements on MDN.}
	 * @returns {void}
	 */
	connectedCallback() {
		/**
		 * Form control should be focusable to use the {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals#instance_methods|Instance Methods}
		*/
		this.tabIndex = 0;
		this.placeholder = this.getAttribute('placeholder');
		this.#renderOnce();
		this.#updateValidity();

		/**
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets}
		 * @type {Array<CSSStyleSheet>}
		 */
		this.#shadowRoot.adoptedStyleSheets = [addStyles()];

		if (!CustomSelect.isDocumentListener) {
			document.addEventListener('click', this.#handleClick);
			CustomSelect.isDocumentListener = true;
		}
	}

	/**
	 * Lifecycle callback. Called each time the element is removed from the document.
	 * Used to remove event listeners from the element.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements|Using custom elements on MDN.}
	 * @returns {void}
	 */
	disconnectedCallback() {
		document.removeEventListener('click', this.#handleClick);
	}

	/**
	 * Lifecycle callback. Called each time when attributes are changed, added, removed, or replaced.
	 * Used to update form value, emit events and update the UI.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements|Using custom elements on MDN.}
	 * @param {string} name The name of the attribute which changed.
	 * @param {string} oldValue The attribute's old value.
	 * @param {string} newValue The attribute's new value.
	 * @returns {void}
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		this.#internals.setFormValue(newValue);
		this.#emit('change', newValue);
		this.#updateComponent(newValue);
		this.#updateValidity();
	}

	/**
	 * Called when the form is being reset. 
	 * The order of reset: `selected` option -> first option -> placeholder (no `selected` option).
	 * @see {@link https://web.dev/articles/more-capable-form-controls#void_formresetcallback|void formResetCallback()}
	 * @returns {void}
	 */
	formResetCallback() {
		if (this.#defaultValue) {
			this.value = this.#defaultValue;
			return;
		}

		const selectedOption = this.#options.find(option => option.node.getAttribute('selected') !== null);
		if (selectedOption) {
			selectedOption.node.removeAttribute('selected');
		}

		this.#baseNode.textContent = this.placeholder;
		this.removeAttribute('value');
	}

	/**
	 * Called when the browser tries to restore or autocomplete the state of the element.
	 * @see {@link https://web.dev/articles/more-capable-form-controls#void_formstaterestorecallbackstate_mode|void formStateRestoreCallback(state, mode)}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue|ElementInternals: setFormValue() }
	 * @param {string} value
	 * @param {File | string | FormData} [state]
	 * @returns {void}
	 */
	formStateRestoreCallback(value, state) {
		this.value = value;
  }

	/**
	 * Creates a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) with provided type and value and dispatches it.
	 * @param {string} type Name of the event to emit.
	 * @param {*} value Event payload.
	 * @returns {CustomEvent} Custom event.
	 */
	#emit(type, value) {
		const eventOptions = {
			bubbles: true,
			cancelable: true,
			detail: value,
		};
		const event = new CustomEvent(type, eventOptions);
		this.dispatchEvent(event);
		return event;
	}

	/**
	 * Method that tries to change the element value updates the UI. Runs every time any of the attributes is changed.
	 * If `newValue` is found among the element options, the value and the UI will be changed.
	 * @param {string | number} newValue 
	 * @returns {void}
	 */
	#updateComponent(newValue) {
		/**
		 * @type {{value: String, node: HTMLLIElement} | undefined}
		 */
		const newCurrentOption = this.#options.find(option => option.value === newValue);
		
		if (!newCurrentOption) {
			return;
		}

		this.#options.forEach(option => option.node.removeAttribute('selected'));
		newCurrentOption.node.setAttribute('selected', '');

		this.#baseNode.textContent = newCurrentOption.node.textContent;
	}

	/**
	 * Used to gather data from the HTML and do first render of the element after `connectedCallback`.
	 * Sets up the `#baseNode`, `#options`, and the default selected option (if there is one), 
	 */
	#renderOnce() {
		/**
		 * @type {null | string}
		 */
		let selectedValue = null;
		
		const base = document.createElement('div');
		base.setAttribute('part', 'base');
		this.#baseNode = base;
		this.#shadowRoot.appendChild(base);

		const input = document.createElement('input');
		input.setAttribute('type', 'checkbox');
		input.tabIndex = -1; // visually hidden element should be skipped by keyboard navigation in favor of the host element
		this.#inputNode = input;
		this.#shadowRoot.appendChild(input);

		const optionsNodesVanilla = [...this.querySelectorAll('option')];

		if (optionsNodesVanilla.length > 0) {
			const optionsWrapper = document.createElement('div');
			optionsWrapper.setAttribute('part', 'options-wrapper');
			this.#shadowRoot.appendChild(optionsWrapper);

			const options = document.createElement('ul');
			options.setAttribute('part', 'options');
			optionsWrapper.appendChild(options);

			const fragmentOptions = document.createDocumentFragment();

			optionsNodesVanilla.forEach(optionNodeVanilla => {
				const { value, textContent, selected } = optionNodeVanilla;

				const option = document.createElement('li');
				option.setAttribute('part', 'option');
				option.setAttribute('value', value);
				option.textContent = textContent;

				if (selected) {
					option.setAttribute('selected', '');
					selectedValue = value;
				}

				fragmentOptions.appendChild(option);
				
				this.#options.push({
					value,
					node: option,
				});
			});

			options.appendChild(fragmentOptions);
		}

		if (selectedValue) {
			this.value = selectedValue;
			this.#defaultValue = selectedValue;
		} else if (this.placeholder) {
			this.#baseNode.textContent = this.placeholder;
			this.#defaultValue = null;
		} else {
			const firstOption = optionsNodesVanilla[0];
			const firstOptionValue = firstOption.getAttribute('value') || firstOption.textContent;

			this.value = firstOptionValue;
			firstOption.setAttribute('selected', '');
			this.#defaultValue = firstOptionValue;
		}
	}

	/**
	 * Toggles the `CustomSelect` and changes its value.
	 * @param {Event} event 
	 * @returns {void}
	 */
	#handleClick(event) {
		/**
		 * There is a need in picking `this` context from the `EventTarget`, 
		 * because the global listener is added to the `document` only by the first `CustomSelect` instance.
		 * @type {EventTarget | CustomSelect}
		 */
		const thisInstance = event.target;
		const isCustomSelect = thisInstance instanceof CustomSelect;

		/**
		 * @type {CustomSelect}
		 */
		const openedCustomSelect = document.querySelector(`${CustomSelect.tag}[opened]`);
		
		if (openedCustomSelect && openedCustomSelect !== thisInstance) {
			openedCustomSelect.opened = false;
		}

		if (!isCustomSelect) return;

		/**
		 * `composedPath` is something that will work in both Chrome and Firefox.
		 * With `event.target` defaults to the <custom-select> host element.
		 * Another alternative is to use [originalTarget](https://developer.mozilla.org/en-US/docs/Web/API/Event/originalTarget).
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath}
		 * @type {EventTarget}
		*/
		const part = event.composedPath()[0];

		/**
		 * Emulates a generic `EventTarget as HTMLElement`.
		 */
		if (!(part instanceof HTMLElement)) {
			return;
		}

		switch (part.getAttribute('part')) {
			case 'option': {
				thisInstance.value = part.getAttribute('value');
				thisInstance.opened = false;
				break;
			}
			case 'base': {
				thisInstance.toggle();
				break;
			}
			default: {
				break;
			}
		}
	}

	/**
	 * Gets the `opened` state of the `CustomSelect` component.
	 * @returns {boolean} The `opened` state.
	 */
	get opened() {
		return this.hasAttribute('opened');
	}

	/**
   * Sets the `opened` state of the `CustomSelect` component.
   * @param {boolean} state The new opened state.
	 * @returns {void}
   */
	set opened(state) {
		if (typeof state !== 'boolean') {
      throw new TypeError('new state must be a boolean');
    }

		if (state) {
			this.setAttribute('opened', '');
		} else {
			this.removeAttribute('opened');
		}
	}

	/**
	 * Toggle `opened` state of the `CustomSelect`.
	 * @returns {boolean} New `opened` state after toggle.
	 */
	toggle() {
		if (this.opened) {
			this.opened = false;
		} else {
			this.opened = true;
		}
		
		return this.opened;
	}

	/**
	 * Gets the `value` of the `CustomSelect` component.
	 * @returns {string} The `value` of the `CustomSelect` component.
	 */
	get value() {
		return this.getAttribute('value');
	}

	/**
   * _Suggests_ the new `value` state for the `CustomSelect` component.
	 * The new value will be applied if the `CustomSelect` included an
	 * option with this value when it was firstly initialized.
	 * `newValue` is converted to string.
   * @param {number | string} newValue The new _possible_ state.
	 * @returns {void}
   */
	set value(newValue) {
		const newValueConverted = newValue.toString();
		const newCurrentOption = this.#options.find(option => option.value === newValueConverted);

		if (!newCurrentOption) {
			return;
		}

		this.setAttribute('value', newValueConverted);
	}

	/**
	 * Checks if element is considered valid.
	 * `CustomSelect` is invalid, if it has the `required` attribute, but does bot have a value.
	 * @returns {boolean}
	 */
	checkValidity() {
		return this.#internals.checkValidity();
	}

	/**
	 * Updates the validity of the `CustomSelect`.
	 * @returns {void}
	 */
	#updateValidity() {
		if (this.hasAttribute('required') && !this.value) {
			this.#internals.setValidity({ valueMissing: true }, 'The required value is missing.', this.#inputNode);
			this.#internals.reportValidity();
		} else {
			this.#internals.setValidity({});
		}
	}
}

CustomSelect.define();

/**
 * Returns the styles for the web component.
 * @returns {CSSStyleSheet}
 */
function addStyles() {
	const stylesheet = new CSSStyleSheet();

	/**
	 * @see {@link https://webcomponents.guide/learn/components/styling/#using-constructable-stylesheets}
	 */
	const styles = css`
		:host {
			user-select: none;
			position: relative;
			transition: filter var(--transition-duration, 0.3s) var(--transition-timing-function, ease);

			&::part(base) {
				box-sizing: border-box;
				font-size: var(--base-font-size, 1em);
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: var(--base-icon-gap, 1em);
				padding-inline: var(--base-padding-inline, .5em);
				height: var(--base-min-height, 2.5em);
				border-width: var(--base-border-width, 2px);
				border-style: solid;
				border-radius: var(--select-border-radius, 5px);
				border-color: var(--base-border-color, black);
				white-space: nowrap;
				cursor: pointer;
				transition: border-color var(--transition-duration, 0.3s) var(--transition-timing-function, ease), background-color var(--transition-duration, 0.3s) var(--transition-timing-function, ease);
			}

			&::part(base)::after {
				display: inline-block;
				content: '';
				height: 100%;
				width: var(--base-icon-width, 1em);
				/* We are using background-image instead if content to have control over external image's size */
				background-image: var(--arrow-icon, url('data:image/svg+xml, <svg fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>'));
				background-position: center;
				background-repeat: no-repeat;
				background-size: contain;
				transform-origin: center;
				transition: rotate var(--transition-duration, 0.3s) var(--transition-timing-function, ease);
			}

			&::part(options-wrapper) {
				margin-top: calc(-1 * var(--base-border-width, 2px));
				height: 0;
			}

			&::part(options) {
				margin: 0;
				list-style: none;
				font-size: var(--options-font-size, 1em);
				padding: var(--options-padding-block, 0) 0;
				border-width: var(--base-border-width, 2px);
				border-style: solid;
				border-bottom-left-radius: var(--select-border-radius, 5px);
				border-bottom-right-radius: var(--select-border-radius, 5px);
				scrollbar-color: var(--accent-primary, dimgray) transparent;
				max-height: calc(
					var(--options-padding-block, 0em) * 2
					+ calc(var(--option-padding-block, .5em) * 2 + 1lh)
					* var(--options-max-display-items, 5)
				); /* In nested calc() units of measurement must match: https://stackoverflow.com/a/53656145 */
				overflow: hidden auto;
				transition: all var(--transition-duration, 0.3s) var(--transition-timing-function, ease);
				opacity: 0;
				visibility: hidden;
			}

			&::part(option) {
				padding-block: var(--option-padding-block, .5em);
				padding-inline: var(--base-padding-inline, .5em) calc(var(--base-padding-inline, .5em) + var(--base-icon-width, 1em) + var(--base-icon-gap, 1em));
				cursor: pointer;
				transition: background-color var(--transition-duration, 0.3s) var(--transition-timing-function, ease);
			}

			input {
				all: unset;
			}

			&::part(option):hover {
				background-color: var(--option-background-color-hover, lightblue);
			}
		}

		:host(:hover) {
			&::part(base) {
				background-color: var(--base-background-color-hover, white);
				border-color: var(--base-border-color-hover, lightblue);
			}
		}

		:host([opened]) {
			z-index: 10;
			
			&::part(base) {
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
				border-color: var(--base-border-color-opened, lightblue);
				border-bottom-color: var(--base-background-color-opened, white);
				background-color: var(--base-background-color-opened, white);
				color: var(--base-color-opened, black);
			}

			&::part(base)::after {
				rotate: 180deg;
			}

			&::part(options) {
				opacity: 1;
				visibility: visible;
				border-color: var(--base-border-color-opened, lightblue);
				border-top: none;
				background-color: var(--base-background-color-opened, white);
				color: var(--base-color-opened, black);
			}
		}

		:host(:invalid) {
			--base-border-color: red;
		}
	`;

	stylesheet.replaceSync(styles);

	return stylesheet;
}

/**
 * Adds CSS syntax highlight together with the extension [vscode-styled-components](https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components).
 * @param {TemplateStringsArray} strings 
 * @param  {...string} values 
 * @returns {string}
 */
function css(strings, ...values) {
	return strings.raw.join('');
}