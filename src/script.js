// Elements
const keyContainer = document.querySelector('.key-items');
const toggleBar = document.querySelector('.toggle-bar');
const content = document.querySelector('.content');
const error = document.querySelector('.error');

class Calculator {
  #contentWidth;
  #currOperation = null;
  #currNumber = null;
  #prevNumber = null;
  #numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  #others = {
    dot: '.',
    eq: '=',
    plus: '+',
    min: '-',
    mul: 'x',
    div: '/',
    del: 'del',
    res: 'reset',
  };
  #operations = {
    plus(a, b) {
      return a + b;
    },
    min(a, b) {
      return a - b;
    },
    mul(a, b) {
      return a * b;
    },
    div(a, b) {
      return a / b;
    },
  };

  constructor() {
    this.#generateMarkup();
    this.#contentWidth = content.scrollWidth;
    toggleBar.addEventListener('click', this.#switchThemes);
    keyContainer.addEventListener('click', this.#handleKeys.bind(this));
    window.addEventListener('keydown', this.#bindKeyboard.bind(this));
  }

  #insertMarkup(type, dataValue, gridArea, value) {
    const markup = `
      <li
        class="small-key ${type}"
        data-value="${dataValue}"
        style="grid-area: ${gridArea}"
      >
        ${value}
      </li>`;
    keyContainer.insertAdjacentHTML('beforeend', markup);
  }

  #generateMarkup() {
    this.#numbers.forEach(n => this.#insertMarkup('number', n, `n-${n}`, n));
    Object.entries(this.#others).forEach(val =>
      this.#insertMarkup(val[0], val[0], val[0], val[1])
    );
    content.focus();
  }

  #switchThemes(e) {
    const radio = e.target.closest('input');
    if (!radio) return;
    document.body.className = `theme-${radio.value}`;
  }

  #renderError(msg) {
    error.textContent = '';
    error.textContent = msg;
    error.classList.remove('hidden');
    setTimeout(function () {
      error.classList.add('hidden');
    }, 1500);
  }

  #setplaceholder() {
    const prevNumber = this.#addCommas(this.#prevNumber.toString());
    const number =
    prevNumber.length > 18 ? this.#prevNumber.toExponential(3) : prevNumber;
    content.value = number + 'over';

    if (content.scrollWidth > this.#contentWidth) {
      content.style.fontSize = '1.5rem';
    } else {
      content.style.fontSize = '2rem';
    }

    content.value = '';
    content.setAttribute('placeholder', number);
    
  }

  #remove() {
    if (
      content.value.length === 0 &&
      content.getAttribute('placeholder').length === 0
    ) {
      return;
    }

    let number;
    if (content.value.length === 0) {
      number = this.#removeCommas(content.getAttribute('placeholder'));
      content.setAttribute('placeholder', '');
    }

    if (content.value.length > 0) {
      number = this.#removeCommas(content.value);
    }

    const deleted = number.toString().slice(0, -1);
    if (deleted.length === 0) {
      this.#clearScreen();
    }

    if (deleted.length > 0) {
      content.value = this.#addCommas(deleted) + 'overf';
      
      if (content.scrollWidth === this.#contentWidth) {
        content.style.fontSize = '2rem';
      }

      content.value = this.#addCommas(deleted);

      if (this.#prevNumber !== null && this.#currNumber !== null) {
        this.#setNull();
      }
    }
  }

  #clearScreen() {
    content.value = '';
    content.setAttribute('placeholder', '');
  }

  #setNull() {
    this.#currNumber = null;
    this.#prevNumber = null;
    this.#currOperation = null;
  }

  #addCommas(number) {
    let [integer, decimal] = number.replaceAll(',', '').split('.');
    decimal = decimal ? `.${decimal}` : '';
    return Number(integer).toLocaleString('en') + decimal;
  }

  #removeCommas(number) {
    if (number === '.') return 0.0;
    return Number(number.replaceAll(',', ''));
  }

  #addContent(value) {
    if (content.value.length === 18)
      return this.#renderError('You have reached the maximum');

    if (value === '.') {
      content.value += '.';
    } else {
      const number = content.value + value;
      content.value = this.#addCommas(number);

      if (content.scrollWidth > this.#contentWidth) {
        content.style.fontSize = '1.5rem';
      } else {
        content.style.fontSize = '2rem';
      }
    }
  }

  #doOperation(type) {
    this.#currNumber =
      content.value.length > 0
        ? this.#removeCommas(content.value)
        : this.#currNumber;
    this.#prevNumber = Number(
      this.#operations[type](this.#prevNumber, this.#currNumber).toFixed(8)
    );

    this.#setplaceholder();
  }

  #handleOperation(operationType) {
    if (
      this.#prevNumber !== null &&
      this.#currNumber === null &&
      content.value.length > 0
    ) {
      this.#doOperation(this.#currOperation);
      this.#currOperation = operationType;
    }

    if (
      (this.#prevNumber === null && content.value.length > 0) ||
      content.getAttribute('placeholder').length > 0
    ) {
      this.#prevNumber =
        content.value.length > 0
          ? this.#removeCommas(content.value)
          : this.#prevNumber;
      this.#currNumber = null;
      this.#currOperation = operationType;
    }

    if (content.value.length > 0) {
      this.#setplaceholder();
    }
  }

  #handleKeys(e) {
    const key = e.target.closest('li');
    if (!key) return;

    if (
      key === e.target.closest('.number') ||
      (key.dataset.value === 'dot' && !content.value.includes('.'))
    ) {
      const value = key.dataset.value === 'dot' ? '.' : key.dataset.value;
      this.#addContent(value);
    }

    if (
      key.dataset.value === 'min' &&
      content.value.length === 0 &&
      content.getAttribute('placeholder').length === 0
    ) {
      content.value = '-';
    }

    if (key.dataset.value === 'plus' && content.value === '-') {
      content.value = '';
    }

    if (key.dataset.value === 'del') {
      this.#remove();
    }

    if (key.dataset.value === 'res') {
      this.#clearScreen();
    }

    if (content.value === '.' || content.value === '-') return;

    if (
      key.dataset.value === 'eq' &&
      this.#currOperation &&
      (this.#currNumber !== null || content.value.length > 0)
    ) {
      this.#doOperation(this.#currOperation);
    }

    // Operations: +, -, x, /
    if (Object.keys(this.#operations).includes(key.dataset.value)) {
      this.#handleOperation(key.dataset.value);
    }

    if (
      content.value.length === 0 &&
      content.getAttribute('placeholder').length === 0
    ) {
      this.#setNull();
    }
  }

  #bindKeyboard(e) {
    if (Number.isInteger(+e.key) || e.key === '.') {
      this.#addContent(e.key);
    }

    if (e.key === 'Backspace') {
      this.#remove();
    }

    if (e.key === 'Delete') {
      this.#clearScreen();
      this.#setNull();
    }

    if (
      e.key === 'Enter' &&
      this.#currOperation &&
      (this.#currNumber !== null || content.value.length > 0)
    ) {
      this.#doOperation(this.#currOperation);
    }

    if (['+', '-', '*', '/'].includes(e.key)) {
      let operationType = Object.entries(this.#others).find(
        entry => entry[1] === e.key
      )?.[0];
      operationType = operationType ?? 'mul';
      this.#handleOperation(operationType);
    }
  }
}

new Calculator();
