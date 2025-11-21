const { DateTime } = luxon;
const datePicker = document.getElementById("date-picker");

datePicker.addEventListener("input", () => {
  let dob = DateTime.fromISO(datePicker.value).startOf("day");
  let now = DateTime.now().startOf("day");

  if (!dob.isValid) return;

  const diff = now.diff(dob, ["years", "months"]);

  const years = Math.floor(diff.years);
  const months = Math.floor(diff.months);

  console.log(`Age: ${years} years ${months} months`);
});
