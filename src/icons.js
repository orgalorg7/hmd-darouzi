// Names and classes are internal constants, never user-provided strings.
export function icon(name, className = '') {
  return `<svg class="ui-icon ${className}" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/assets/interface-icons.svg#${name}"></use></svg>`;
}
