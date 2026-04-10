const surveyForm = document.getElementById("surveyForm");
const surveyMessage = document.getElementById("surveyMessage");

if (surveyForm && surveyMessage) {
  surveyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(surveyForm);
    const name = data.get("name");
    surveyMessage.textContent = `Thank you${name ? `, ${name}` : ""}. This demo form does not send data yet—connect it to your backend or replace this page with Google Forms.`;
    surveyForm.reset();
  });
}
