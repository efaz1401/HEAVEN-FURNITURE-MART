/* ==========================================================================
   js/print-doc.js — the one place that arms the print stylesheet

   css/pages.css has an `@media print` block scoped to `body.printing-document`
   which hides the page and prints only the spec sheet or the cash memo. Nothing
   set that class: both modals called `window.print()` bare, so Ctrl+P and the
   Print button printed the whole page behind the modal and none of the
   document-only rules — white background, no backdrop, `.no-print` hidden,
   the bordered sheet — ever applied.

   Two call sites (js/spec-sheet.js, js/cashmemo.js) share this rather than
   keeping a copy each, because the class name is the contract with the
   stylesheet and two copies drift.

   CLEANUP IS DELIBERATELY BELT-AND-BRACES. A lingering class is harmless on
   screen — every rule using it lives inside `@media print` — but it is NOT
   harmless on the next print: with the modal closed and the class still set,
   `body.printing-document > *:not(.spec-modal)` would hide the page and print
   blank paper. So it is cleared on `afterprint`, on the print media query going
   false (Safari has historically skipped `afterprint`), and by the modals
   themselves when they close.
   ========================================================================== */

const CLASS = 'printing-document';

/** Clear the print-scoping class. Safe to call when it is not set. */
export function endPrintDocument() {
  document.body.classList.remove(CLASS);
}

/**
 * Print one document modal on its own, with the print stylesheet armed.
 * Call it from the modal's own Print button — the modal must already be open,
 * since the stylesheet reveals `.spec-modal` / `.memo-modal` and nothing else.
 */
export function printDocument() {
  document.body.classList.add(CLASS);

  const done = () => {
    endPrintDocument();
    window.removeEventListener('afterprint', done);
    if (mql && mql.removeEventListener) mql.removeEventListener('change', onMql);
  };
  const onMql = (e) => { if (!e.matches) done(); };

  const mql = window.matchMedia ? window.matchMedia('print') : null;
  window.addEventListener('afterprint', done);
  if (mql && mql.addEventListener) mql.addEventListener('change', onMql);

  /* Last, so the listeners are registered before a synchronous print dialog
     blocks this thread. */
  window.print();
}
