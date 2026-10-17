(() => {
  const allocation = document.querySelector("#room-allocation");
  if (!allocation) return;

  const participants = document.querySelector("#participants");
  const addRoom = document.querySelector("#add-room");
  const total = document.querySelector("#room-allocation-total");
  const guidance = document.querySelector("#group-size-guidance");
  const form = allocation.closest("form");

  const update = () => {
    const roomInputs = [...allocation.querySelectorAll("select[name='roomAdults']")];
    const allocated = roomInputs.reduce((sum, input) => sum + Number(input.value), 0);
    const count = Number(participants.value);
    total.textContent = `Adults allocated: ${allocated} of ${count}`;
    total.setAttribute("aria-live", "polite");
    addRoom.disabled = roomInputs.length >= count;
    guidance.hidden = count <= 8;
    form.querySelector("button[type='submit']").disabled = allocated !== count;
  };

  participants.addEventListener("change", update);
  allocation.addEventListener("change", update);
  addRoom.addEventListener("click", () => {
    const index = allocation.querySelectorAll("select[name='roomAdults']").length;
    const label = document.createElement("label");
    label.className = "form-label";
    label.htmlFor = `room-adults-${index}`;
    label.textContent = `Room ${index + 1} adults`;

    const select = document.createElement("select");
    select.className = "form-select";
    select.id = label.htmlFor;
    select.name = "roomAdults";
    select.required = true;
    for (let adults = 1; adults <= 8; adults += 1) {
      const option = document.createElement("option");
      option.value = String(adults);
      option.textContent = String(adults);
      select.append(option);
    }
    const remove = document.createElement("button");
    remove.className = "button button--secondary";
    remove.type = "button";
    remove.textContent = "Remove room";
    remove.addEventListener("click", () => {
      label.remove();
      select.remove();
      remove.remove();
      update();
    });
    allocation.append(label, select, remove);
    update();
  });
  update();
})();
