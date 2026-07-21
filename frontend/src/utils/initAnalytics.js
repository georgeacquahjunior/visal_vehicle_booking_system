import { trackButtonClick, trackFormSubmit } from './analytics';

export default function initAnalytics() {
  // Delegate click events for elements with data-ga-button
  document.addEventListener('click', (e) => {
    const target = e.target.closest && e.target.closest('[data-ga-button]');
    if (target) {
      const name = target.getAttribute('data-ga-button') || target.innerText || 'button';
      const props = {};
      const val = target.getAttribute('data-ga-value');
      if (val) props.value = val;
      trackButtonClick(name, props);
    }
  });

  // Delegate form submit events for forms with data-ga-form
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form && form.matches && form.matches('[data-ga-form]')) {
      const name = form.getAttribute('data-ga-form') || form.getAttribute('name') || 'form';
      // collect non-sensitive inputs marked with data-ga-field
      const data = {};
      form.querySelectorAll('[data-ga-field]').forEach((el) => {
        if (el.name) data[el.name] = el.value;
      });
      trackFormSubmit(name, data);
    }
  });
}
