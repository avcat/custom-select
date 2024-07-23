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
	 * This static property can be used to define a custom HTML tag for this Web Component.
	 * It is useful for avoiding possible name conflicts.
	 * @static
	 * @param {string} [tag='custom-select'] tag
	 * @default 'custom-select'
	 * @returns {void}
	 */
	static define(tag = 'custom-select') {
		if (!customElements.get(tag)) {
			customElements.define(tag, this);
		}
	}

	/**
   * Creates an instance of CustomSelect.
   * @constructor
   */
	constructor() {
		super();
		this.#internals = this.attachInternals();
		this.#shadowRoot = this.attachShadow({ mode: 'open' });
		this.#options = [];
	}

	/**
	 * Lifecycle callback. Called each time the element is added to the document.
	 * Used for the first render and to add event listeners to the element.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements|Using custom elements on MDN.}
	 * @return {void}
	 */
	connectedCallback() {
		this.#renderOnce();
		this.addEventListener('click', this.#handleClick);
	}

	/**
	 * Lifecycle callback. Called each time the element is removed from the document.
	 * Used to remove event listeners from the element.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements|Using custom elements on MDN.}
	 * @return {void}
	 */
	disconnectedCallback() {
		this.removeEventListener('click', this.#handleClick);
	}

	/**
	 * Lifecycle callback. Called each time when attributes are changed, added, removed, or replaced.
	 * Used to update form value, emit events and update the UI.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements|Using custom elements on MDN.}
	 * @param {string} name The name of the attribute which changed.
	 * @param {string} oldValue The attribute's old value.
	 * @param {string} newValue The attribute's new value.
	 * @return {void}
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		this.#internals.setFormValue(newValue);
		this.#emit('change', newValue);
		this.#updateComponent(newValue);
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
		const placeholder = this.getAttribute('placeholder');
		base.textContent = placeholder || '';
		this.#baseNode = base;
		this.#shadowRoot.appendChild(base);

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
			this.setAttribute('value', selectedValue);
		} else if (!placeholder) {
			this.setAttribute(
				'value', 
				optionsNodesVanilla[0].getAttribute('value') 
				|| optionsNodesVanilla[0].textContent
			);
			optionsNodesVanilla[0].setAttribute('selected', '');
		}
	}

	#handleClick(event) {
		event.stopPropagation();
		
		const el = event.originalTarget || event.composedPath()[0]; // Fix in Chrome - Event object does not have originalTarget and defaults to <custom-select> host element

		switch (el.getAttribute('part')) {
			case 'option': {
				this.value = el.getAttribute('value');
				return this.opened = false;
			}
			case 'base': {
				return this.toggle();
			}
			default: {
				return;
			}
		}
	}

	/**
	 * Gets the `opened` state of the `CustomSelect` component.
	 * @return {boolean} The `opened` state.
	 */
	get opened() {
		return this.hasAttribute('opened');
	}

	/**
   * Sets the `opened` state of the `CustomSelect` component.
   * @param {boolean} state The new opened state.
   */
	set opened(state) {
		if (typeof state !== 'boolean') {
      throw new TypeError('new state must be a boolean');
    }

		if (state) {
			 this.setAttribute('opened', '');

			 document.addEventListener(
				'click', 
				e => e.target !== this && (this.opened = false), 
				{ once: true }
			);
		} else {
			this.removeAttribute('opened');
		}
	}

	/**
	 * Toggle `opened` state of the custom select.
	 * @return {boolean} New `opened` state after toggle.
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
	 * @return {string} The `value` of the `CustomSelect` component.
	 */
	get value() {
		return this.getAttribute('value');
	}

	/**
   * _Suggests_ the new `value` state for the `CustomSelect` component.
	 * The new value will be applied if the `CustomSelect` included an
	 * option with this value when it was firstly initialized.
	 * `newValue` is converted to string.
   * @param {number|string} newValue The new _possible_ state.
   */
	set value(newValue) {
		const newValueConverted = newValue.toString();
		const newCurrentOption = this.#options.find(option => option.value === newValueConverted);

		if (!newCurrentOption) {
			return;
		}

		this.setAttribute('value', newValueConverted);
	}
}

CustomSelect.define();