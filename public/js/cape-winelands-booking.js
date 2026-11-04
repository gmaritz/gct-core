(() => {
  const allocation = document.querySelector("#room-allocation");
  if (!allocation) return;

  const participants = document.querySelector("#participants");
  const guidance = document.querySelector("#group-size-guidance");
  const form = allocation.closest("form");
  const submit = form.querySelector("button[type='submit']");

  const integer = (value, minimum) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= minimum;

  const renderChildAges = (room, childCount) => {
    const ages = room.querySelector("[data-child-ages]");
    if (!ages || !integer(childCount, 0)) return;
    const previousValues = [...ages.querySelectorAll("input")].map((input) => input.value);
    const count = Number(childCount);
    if (previousValues.length === count) return;
    ages.replaceChildren();
    for (let index = 0; index < count; index += 1) {
      const label = document.createElement("label");
      label.className = "form-label";
      label.dataset.childAgeLabel = "";
      label.htmlFor = `${room.dataset.roomId}-child-age-${index}`;
      label.textContent = `Child ${index + 1} age`;
      const input = document.createElement("input");
      input.className = "form-input";
      input.id = label.htmlFor;
      input.type = "number";
      input.min = "0";
      input.step = "1";
      input.required = true;
      input.dataset.childAge = "";
      input.value = previousValues[index] ?? "";
      ages.append(label, input);
    }
  };

  const update = () => {
    const participantCount = Number(participants.value);
    let valid = integer(participants.value, 2) && participantCount <= 8;

    [...allocation.querySelectorAll("[data-stop-allocation]")].forEach((stop) => {
      const stopIndex = stop.dataset.stopIndex;
      const rooms = [...stop.querySelectorAll("[data-room-allocation]")];
      let adultTotal = 0;
      if (rooms.length === 0) valid = false;

      rooms.forEach((room, roomIndex) => {
        const adults = room.querySelector("[data-adults]");
        const children = room.querySelector("[data-children]");
        const slot = `stopOccupancies[${stopIndex}][rooms][${roomIndex}]`;
        adults.name = `${slot}[adults]`;
        adults.id = `room-${stopIndex}-${roomIndex}-adults`;
        room.querySelector("[data-adults-label]").htmlFor = adults.id;
        room.querySelector("[data-adults-label]").textContent = `Room ${roomIndex + 1} adults`;
        room.dataset.roomId = `room-${stopIndex}-${roomIndex}`;
        adultTotal += Number(adults.value);
        if (!integer(adults.value, 1)) valid = false;

        if (children) {
          children.name = `${slot}[children]`;
          children.id = `room-${stopIndex}-${roomIndex}-children`;
          room.querySelector("[data-children-label]").htmlFor = children.id;
          room.querySelector("[data-children-label]").textContent = `Room ${roomIndex + 1} children`;
          if (!integer(children.value, 0)) {
            valid = false;
          } else {
            renderChildAges(room, children.value);
          }
          const currentAges = [...room.querySelectorAll("[data-child-age]")];
          currentAges.forEach((age, ageIndex) => {
            age.name = `${slot}[childAges][${ageIndex}]`;
            age.labels[0].textContent = `Child ${ageIndex + 1} age`;
            if (!integer(age.value, 0)) valid = false;
          });
          if (integer(children.value, 0) && currentAges.length !== Number(children.value)) valid = false;
        }

        const remove = room.querySelector("[data-remove-room]");
        remove.hidden = rooms.length === 1;
      });

      const total = stop.querySelector("[data-allocation-total]");
      total.textContent = `Adults allocated: ${adultTotal} of ${participantCount}`;
      total.setAttribute("aria-live", "polite");
      if (adultTotal !== participantCount) valid = false;

      const addButton = stop.querySelector("[data-add-room]");
      addButton.disabled = rooms.length >= participantCount;
    });

    guidance.hidden = participantCount <= 8;
    submit.disabled = !valid;
  };

  allocation.addEventListener("input", update);
  allocation.addEventListener("change", update);
  allocation.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const stop = button.closest("[data-stop-allocation]");
    if (!stop) return;

    if (button.matches("[data-add-room]")) {
      const room = document.createElement("div");
      room.dataset.roomAllocation = "";
      room.innerHTML = `
        <label class="form-label" data-adults-label>Room adults</label>
        <select class="form-select" data-adults required>
          ${Array.from({ length: 8 }, (_unused, index) => `<option value="${index + 1}"${index === 0 ? " selected" : ""}>${index + 1}</option>`).join("")}
        </select>
        ${stop.querySelector("[data-children]") ? `
          <label class="form-label" data-children-label>Room children</label>
          <input class="form-input" data-children type="number" min="0" step="1" value="0" required>
          <div data-child-ages></div>
        ` : ""}
        <button class="button button--secondary" type="button" data-remove-room>Remove room</button>
      `;
      stop.querySelector("[data-room-list]").append(room);
    } else if (button.matches("[data-remove-room]")) {
      button.closest("[data-room-allocation]").remove();
    }

    update();
  });
  participants.addEventListener("change", update);
  update();
})();
