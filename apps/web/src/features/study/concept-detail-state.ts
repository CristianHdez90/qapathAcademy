export function readingAuxiliaryIsOpen(){
 return Array.from(document.querySelectorAll('[data-reading-aux] details[open]')).some(element=>!element.closest('[hidden],[inert]')&&element.getClientRects().length>0);
}
