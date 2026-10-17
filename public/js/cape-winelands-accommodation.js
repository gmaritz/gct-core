(() => {
  document.querySelectorAll("input[type='radio'][name$='[accommodationId]']").forEach((radio) => {
    radio.addEventListener("change", () => {
      const match = radio.name.match(/^selections\[(\d+)\]/);
      if (!match) return;
      document.querySelectorAll(`[data-property-options='${match[1]}']`).forEach((fields) => {
        fields.disabled = fields.dataset.propertyId !== radio.value;
      });
    });
  });
  document.querySelectorAll("[data-room-choice]").forEach((roomChoice) => {
    const match = roomChoice.id.match(/^(room-\d+-\d+-\d+)$/);
    if (!match) return;
    const rateChoice = document.querySelector(`#rate-${match[1].slice(5)}`);
    if (!rateChoice) return;
    const updateRates = () => {
      [...rateChoice.options].forEach((option) => {
        option.hidden = option.dataset.roomId !== roomChoice.value;
      });
      const available = [...rateChoice.options].find((option) => !option.hidden);
      if (available) rateChoice.value = available.value;
    };
    roomChoice.addEventListener("change", updateRates);
    updateRates();
  });
})();
