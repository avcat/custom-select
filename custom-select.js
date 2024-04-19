customElements.define('custom-select', class customSelect extends HTMLElement {
	static formAssociated = true;
	static observedAttributes = ['value'];
	#internals;
	#shadowRoot;

	constructor() {
		super();
		this.#internals = this.attachInternals();
		this.#shadowRoot = this.attachShadow({ mode: 'open' });
		this.optionsNodes = [];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.#internals.setFormValue(newValue);
		this.emit('change', newValue);
		this.updateComponent(newValue);
	}

	emit(type, value) {
		const event = new CustomEvent(type, {
			bubbles: true,
			cancelable: true,
			detail: value,
		});
		return this.dispatchEvent(event);
	}

	connectedCallback() {
		this.renderOnce();
		this.addEventListener('click', this.handleClick);
	}

	updateComponent(newValue) {
		const newCurrentOptionNode = this.optionsNodes.find(option => option.getAttribute('value') === newValue);
		
		if (!newCurrentOptionNode) {
			return;
		}

		this.optionsNodes.forEach(optionNode => optionNode.removeAttribute('selected'));
		newCurrentOptionNode.setAttribute('selected', '');

		this.baseNode.textContent = newCurrentOptionNode.textContent;
	}

	renderOnce() {
		const mwidth = this.getAttribute('mwidth');

		if (mwidth) {
			this.style.setProperty('--mwidth', `${mwidth}px`);
		}

		let selectedValue = null;

		const select = document.createElement('div');
		select.setAttribute('part', 'select');
		
		const base = document.createElement('div');
		base.setAttribute('part', 'base');
		const placeholder = this.getAttribute('placeholder');
		base.textContent = placeholder || '';
		this.baseNode = base;
		select.appendChild(base);

		const optionsNodesVanilla = [...this.querySelectorAll('option')];

		if (optionsNodesVanilla.length > 0) {
			const options = document.createElement('ul');
			options.setAttribute('part', 'options');
			select.appendChild(options);

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

				options.appendChild(option);
				this.optionsNodes.push(option);
			});
		}

		this.#shadowRoot.appendChild(select);

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

	open() {
		this.setAttribute('opened', '');
	}

	close() {
		this.removeAttribute('opened');
	}

	toggle() {
		if (this.hasAttribute('opened')) {
			this.close();
		} else {
			this.open();
		}
	}

	/* eslint consistent-return: 0 */
	// eslint consistent-return in Vanilla JS does not recognize exhaustive swtich statements
	handleClick(event) {
		const el = event.originalTarget || event.composedPath()[0]; // Fix in Chrome - Event object does not have originalTarget and defaults to <custom-select> host element

		switch (el.getAttribute('part')) {
			case 'option': {
				this.setAttribute('value', el.getAttribute('value'));
				return this.close();
			}
			case 'base': {
				return this.toggle();
			}
			default:
				return;
		}
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.handleClick);
	}
});