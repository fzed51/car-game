export const $ = (selector: string, ref: { querySelector: (s: string) => HTMLElement | null } = document): HTMLElement | null => {
    return ref.querySelector(selector)
}

export const $$ = (selector: string, ref: { querySelectorAll: (s: string) => NodeListOf<HTMLElement> } = document): HTMLElement[] => {
    return Array.from(ref.querySelectorAll(selector))
}