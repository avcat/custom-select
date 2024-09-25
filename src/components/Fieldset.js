const isDefault = value => {
  if (value.includes('>')) {
    return value.replace('>', '');
  }

  return false;
};

const label = (name, value) => `
  <label>
    <input 
      type="radio" 
      name="${name}" 
      value="${isDefault(value) || value}"
      ${isDefault(value) && 'checked'}
    >
    ${isDefault(value) || value}
  </label>
`;

const labelIcon = (name, value) => `
  <label class="icon">
    <input 
      type="radio" 
      name="${name}" 
      value="url(${isDefault(value) || value})"
      ${isDefault(value) && 'checked'}
    >
    <img src="${isDefault(value) || value}" width="24" height="24">
  </label>
`

const Fieldset = (name, values) => `
  <fieldset>
    <legend>${name}</legend>

    ${values.map(value => {
      return name === '--arrow-icon' ? 
        labelIcon(name, value) :
        label(name, value);
    }).join('')}
  </fieldset>
`;

export default Fieldset;