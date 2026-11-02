
document.addEventListener("DOMContentLoaded", () => {

    const elements = document.querySelectorAll(
        ".tracking-in-expand, .text-focus-in, .scale-in-ver-top, .scale-in-hor-center, .slide-in-left"
    );

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {
            const element = entry.target;

            if (entry.isIntersecting) {

                // Reset previous animation
                element.classList.remove("animation-active");
                element.style.animation = "none";

                // Force browser reflow
                void element.offsetWidth;

                // Restore original CSS animation
                element.style.animation = "";

                // Start animation
                element.classList.add("animation-active");

            } else {

                // Stop animation outside viewport
                element.classList.remove("animation-active");

            }
        });

    }, {
        threshold: 0.2
    });

    elements.forEach(element => observer.observe(element));

    console.log("Scroll animations initialized:", elements.length);

});
