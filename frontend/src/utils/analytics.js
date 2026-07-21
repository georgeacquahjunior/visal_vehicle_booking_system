export const pageview = (path) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path });
};

export const event = ({ action, category, label, value } = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};

export default { pageview, event };

export const trackFormSubmit = (formName, data = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'form_submit', {
    event_category: 'Form',
    event_label: formName,
    ...data,
  });
};

export const trackButtonClick = (buttonName, props = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'button_click', {
    event_category: 'Button',
    event_label: buttonName,
    ...props,
  });
};
