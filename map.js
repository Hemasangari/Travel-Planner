const map = L.map("map", { zoomControl: false });
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let userMarker;

function centerOnUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        map.setView([lat, lon], 11);
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([lat, lon], { title: "You are here" }).addTo(map);
      },
      () => {
        map.setView([20, 0], 2);
      }
    );
  } else {
    map.setView([20, 0], 2);
  }
}
centerOnUser();

document.getElementById("recenter-btn").addEventListener("click", () => {
  centerOnUser();
});

document.getElementById("swap").addEventListener("click", () => {
  const o = document.getElementById("origin");
  const d = document.getElementById("destination");
  [o.value, d.value] = [d.value, o.value];
});

document.getElementById("use-location").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        document.getElementById("origin").value = `${lat},${lon}`;
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

document.getElementById("overlay-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const origin = document.getElementById("origin").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const mode = document.querySelector("input[name='mode']:checked").value;

  if (!origin || !destination) {
    alert("Please enter both origin and destination.");
    return;
  }

  const baseUrl = "https://www.google.com/maps/dir/?api=1";
  const url = `${baseUrl}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
  window.open(url, "_blank");
});

function setupSuggestions(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(suggestionsId);

  input.addEventListener("input", async () => {
    const value = input.value.trim();
    suggestionBox.innerHTML = "";
    suggestionBox.style.display = "none";

    if (!value) return;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5`;

    try {
      const response = await axios.get(url, {
        headers: { "Accept-Language": "en" }
      });

      if (response.data.length > 0) {
        suggestionBox.style.display = "block";
      }

      response.data.forEach((place) => {
        const div = document.createElement("div");
        div.textContent = place.display_name;
        div.addEventListener("click", () => {
          input.value = place.display_name;
          suggestionBox.innerHTML = "";
          suggestionBox.style.display = "none";
        });
        suggestionBox.appendChild(div);
      });
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  });

  document.addEventListener("click", (e) => {
    if (!suggestionBox.contains(e.target) && e.target !== input) {
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
    }
  });
}

window.addEventListener("load", () => {
  setupSuggestions("origin", "origin-suggestions");
  setupSuggestions("destination", "destination-suggestions");
});
