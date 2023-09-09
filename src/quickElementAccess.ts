export const $ = <E extends HTMLElement = HTMLElement>(
  selector: string,
  ref: { querySelector: (s: string) => HTMLElement | null } = document
): E | null => {
  return ref.querySelector(selector) as E | null;
};

export const $$ = <E extends HTMLElement = HTMLElement>(
  selector: string,
  ref: { querySelectorAll: (s: string) => NodeListOf<HTMLElement> } = document
): E[] => {
  return Array.from(ref.querySelectorAll(selector)) as E[];
};
