// Initialize EmailJS
emailjs.init({
    publicKey: "8OSPdvqvhdUHylvQ6"
});

// Contact form
const contactForm = document.getElementById("contact_form");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitButton = document.getElementById("submit");
        const formStatus = document.getElementById("form_status");

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        formStatus.textContent = "";

        try {
            await emailjs.sendForm(
                "service_rewc83i",
                "template_83yo9ax",
                contactForm
            );

            formStatus.textContent = "Message sent successfully!";
            formStatus.style.color = "#a6e3a1";

            contactForm.reset();

        } catch (error) {
            console.error("EmailJS Error:", error);

            formStatus.textContent =
                "Failed to send message. Please try again.";

            formStatus.style.color = "#f38ba8";

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
        }
    });
}