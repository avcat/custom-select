const toastBox = document.querySelector('[data-js="toast-box"]');

const Toast = (html) => {
  if (!toastBox) {
    throw new Error('Toast Box was not found.')
  }

  const toastEntity = document.createElement('div');
  toastEntity.classList = 'toast';
  toastEntity.insertAdjacentHTML('afterbegin', html);
  toastBox.insertAdjacentElement('afterbegin', toastEntity);

  setTimeout(() => {
    toastEntity.classList.remove('toast');

    setTimeout(() => {
      toastEntity.remove();
    }, 1000);
  }, 1000);
}

export default Toast;