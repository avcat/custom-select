const isDefault = value => {
  if (value.includes('>')) {
    return value.replace('>', '');
  }

  return false;
};

const Fieldset = (name, values) => `
  <fieldset>
    <legend>${name}</legend>

    ${values.map(value => `
      <label>
        <input 
          type="radio" 
          name="${name}" 
          value="${isDefault(value) || value}"
          ${isDefault(value) && 'checked'}
        >
        ${isDefault(value) || value}
      </label>
    `)}
  </fieldset>
`;

export default Fieldset;