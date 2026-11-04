(() => {
  const form = document.querySelector(".accommodation-selection form");
  if (!form) return;
  const submit = form.querySelector("button[type='submit']");

  const update = () => {
    let valid = true;
    form.querySelectorAll("[data-stop-selection]").forEach((stop) => {
      const selectedProperty = stop.querySelector("input[type='radio'][name$='[accommodationId]']:checked");
      if (!selectedProperty) {
        valid = false;
        return;
      }

      stop.querySelectorAll("[data-property-options]").forEach((fields) => {
        fields.disabled = fields.dataset.propertyId !== selectedProperty.value;
      });

      const activeFields = [...stop.querySelectorAll("[data-property-options]:not(:disabled)")];
      if (activeFields.length !== 1) {
        valid = false;
        return;
      }

      const fields = activeFields[0];
      const rateChoices = [...fields.querySelectorAll("[data-rate-choice]")];
      const usedRates = new Set();
      rateChoices.forEach((rateChoice) => {
        const suffix = rateChoice.id.slice("rate-".length);
        const roomChoice = fields.querySelector(`#room-${suffix}`);
        if (!roomChoice) {
          valid = false;
          return;
        }
        const available = [...rateChoice.options].filter((option) =>
          option.dataset.roomId === roomChoice.value && !usedRates.has(option.value),
        );
        [...rateChoice.options].forEach((option) => {
          option.hidden = !available.includes(option);
        });
        const current = available.find((option) => option.value === rateChoice.value);
        const selected = current ?? available[0];
        if (!selected) {
          valid = false;
          return;
        }
        rateChoice.value = selected.value;
        usedRates.add(selected.value);
      });
    });
    submit.disabled = !valid;
  };

  form.addEventListener("change", update);
  update();
})();
