// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const API_KEY = "6gqThzDwhHpNbFhcJbqFhmRDjgJHRHfMpLBMRJjf";

const searchButton = document.getElementById("searchButton");
const gallery = document.getElementById("gallery");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");
const closeModalButton = document.getElementById("closeModal");

searchButton.addEventListener("click", fetchNASAImages);
closeModalButton.addEventListener("click", () => imageModal.close());

imageModal.addEventListener("click", (event) => {
    if (event.target === imageModal) {
        imageModal.close();
    }
});

async function fetchNASAImages() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    // Make sure both dates are selected
    if (!startDate || !endDate) {
        alert("Please select both dates.");
        return;
    }

    if (startDate > endDate) {
        alert("The start date must be before the end date.");
        return;
    }

    gallery.innerHTML = "<p>Loading NASA images...</p>";

    try {
        const url = new URL(
            "https://science.nasa.gov/wp-json/wp/v2/apod-basic"
        );

        url.searchParams.set("start_date", startDate);
        url.searchParams.set("end_date", endDate);
        url.searchParams.set("api_key", API_KEY);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`NASA API error: ${response.status}`);
        }

        const data = await response.json();

        // Support either a single object or an array
        const images = Array.isArray(data) ? data : [data];

        displayNASAImages(images);

    } catch (error) {
        console.error("NASA API error:", error);
        gallery.innerHTML =
            "<p>Unable to load NASA images. Please try again.</p>";
    }
}

function displayNASAImages(images) {
    gallery.innerHTML = "";

    images.forEach((image) => {
        const card = document.createElement("div");
        card.className = "gallery-item";

        const title = document.createElement("h3");
        title.textContent = image.title || "Untitled";

        const date = document.createElement("p");
        date.textContent = image.date || "";

        const explanation = document.createElement("p");
        explanation.textContent = image.explanation || "";

        card.appendChild(title);
        card.appendChild(date);

        const imageUrl = image.hdurl || image.url;

        if (image.media_type === "image" && imageUrl) {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = image.alt || image.title || "NASA astronomy image";
            img.loading = "lazy";
            card.appendChild(img);

            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", `View ${image.title || "NASA image"}`);
            card.addEventListener("click", () => openImageModal(image, imageUrl));
            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openImageModal(image, imageUrl);
                }
            });
        } else {
            const link = document.createElement("a");
            link.href = image.permalink || image.url;
            link.textContent = "View NASA image or video";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            card.appendChild(link);
        }

        card.appendChild(explanation);
        gallery.appendChild(card);
    });

    if (images.length === 0) {
        gallery.textContent = "No NASA images were found.";
    }
}

function openImageModal(image, imageUrl) {
    modalImage.src = image.hdurl || imageUrl;
    modalImage.alt = image.alt || image.title || "NASA astronomy image";
    modalTitle.textContent = image.title || "Untitled";
    modalDate.textContent = image.date || "";
    modalExplanation.textContent = image.explanation || "No explanation is available.";
    imageModal.showModal();
}