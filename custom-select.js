// @ts-check

/**
 * `CustomSelect` is a web component that represents an autonomous web component.
 *
 * @class CustomSelect
 * @extends {HTMLElement}
 */
class CustomSelect extends HTMLElement {
	/**
   * Indicates if the element is form-associated so it can be utilized by f.e. FormData.
	 * @see {@link https://html.spec.whatwg.org/dev/custom-elements.html#custom-elements-face-example|WhatWG documentation on "Creating a form-associated custom element".}
   *
   * @static
   * @type {boolean}
   */
	static formAssociated = true;

	/**
   * Observed attributes for the CustomSelect component.
   *
   * @static
   * @type {string[]}
   */
	static observedAttributes = ['value'];

	
	#internals;
	#shadowRoot;

	/**
   * The options available in the CustomSelect component.
	 * 
   * @property {options}
	 * @type {Array}
   */
	#options;

	static define(tag = 'custom-select') {
		if (!customElements.get(tag)) {
			customElements.define(tag, this);
		}
	}

	/**
   * Creates an instance of CustomSelect.
   * 
   * @constructor
   */
	constructor() {
		super();
		this.#internals = this.attachInternals();
		this.#shadowRoot = this.attachShadow({ mode: 'open' });
		this.#options = [];
	}

	connectedCallback() {
		this.#renderOnce();
		this.addEventListener('click', this.#handleClick);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.#handleClick);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.#internals.setFormValue(newValue);
		this.#emit('change', newValue);
		this.#updateComponent(newValue);
	}

	#emit(type, value) {
		const event = new CustomEvent(type, {
			bubbles: true,
			cancelable: true,
			detail: value,
		});
		return this.dispatchEvent(event);
	}

	#updateComponent(newValue) {
		const newCurrentOption = this.#options.find(option => option.value === newValue);
		
		if (!newCurrentOption) {
			return;
		}

		this.#options.forEach(option => option.node.removeAttribute('selected'));
		newCurrentOption.node.setAttribute('selected', '');

		this.baseNode.textContent = newCurrentOption.node.textContent;
	}

	#renderOnce() {
		let selectedValue = null;
		
		const base = document.createElement('div');
		base.setAttribute('part', 'base');
		const placeholder = this.getAttribute('placeholder');
		base.textContent = placeholder || '';
		this.baseNode = base;
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