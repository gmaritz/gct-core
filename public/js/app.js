document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  if (body) {
    body.dataset.ready = "true";
  }

  document.querySelectorAll("[data-protect-submit]").forEach((form) => {
    form.addEventListener("submit", () => {
      const submit = form.querySelector("button[type=submit]");
      if (submit instanceof HTMLButtonElement) {
        submit.disabled = true;
        submit.setAttribute("aria-disabled", "true");
      }
    }, { once: true });
  });

  const errorSummary = document.querySelector("[role=alert][tabindex='-1']");
  if (errorSummary instanceof HTMLElement) errorSummary.focus();
});
