// @ts-check

/** Class representing a custom select element - an autonomous web component. */
class CustomSelect extends HTMLElement {
	static formAssociated = true;
	static observedAttributes = ['value'];
	#internals;
	#shadowRoot;
	#options;

	static define(tag = 'custom-select') {
		if (!customElements.get(tag)) {
			customElements.define(tag, this);
		}
	}

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

	get opened() {
		return this.hasAttribute('opened');
	}

	set opened(state) {
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

	toggle() {
		if (this.opened) {
			return this.opened = false;
		}
		
		this.opened = true;
	}

	get value() {
		return this.getAttribute('value');
	}

	set value(newValue) {
		const newCurrentOption = this.#options.find(option => option.value === newValue.toString());

		if (!newCurrentOption) {
			return;
		}

		this.setAttribute('value', newValue);
	}
}

CustomSelect.define();