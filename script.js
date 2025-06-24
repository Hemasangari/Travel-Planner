// Flatpickr setup
const dateRangePicker = flatpickr("#dateRange", {
  mode: "range",
  dateFormat: "Y-m-d",
  minDate: "today"
});

// Guest Picker Logic
let guestCounts = { adults: 2, children: 0, rooms: 1 };

function adjustGuests(type, delta) {
  guestCounts[type] = Math.max(0, guestCounts[type] + delta);
  document.getElementById(`guest${capitalize(type)}`).textContent = guestCounts[type];
  updateGuestDisplay();
  updateUrlPreview();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateGuestDisplay() {
  document.getElementById("guestDisplay").value = `${guestCounts.adults} Adults · ${guestCounts.children} Children · ${guestCounts.rooms} Room${guestCounts.rooms > 1 ? 's' : ''}`;
}

// Show/hide guest dropdown
document.getElementById("guestDisplay").addEventListener("click", () => {
  const guestOptions = document.getElementById("guestOptions");
  guestOptions.style.display = guestOptions.style.display === "block" ? "none" : "block";
});

// Close guest dropdown if clicked outside
window.addEventListener("click", (e) => {
  if (!e.target.closest("#guestOptions") && !e.target.closest("#guestDisplay")) {
    document.getElementById("guestOptions").style.display = "none";
  }
});

// On page load: reset form state
window.addEventListener("DOMContentLoaded", () => {
  // Clear inputs
  document.getElementById("locationInput").value = "";
  document.getElementById("dateRange").value = "";
  dateRangePicker.clear();

  // Reset guest counts
  guestCounts = { adults: 2, children: 0, rooms: 1 };
  document.getElementById("guestAdults").textContent = "2";
  document.getElementById("guestChildren").textContent = "0";
  document.getElementById("guestRooms").textContent = "1";
  updateGuestDisplay();

  // Hide guest options
  document.getElementById("guestOptions").style.display = "none";

  // Uncheck all filters
  ["filterPriceBudget", "filterStar45", "filterBreakfast", "filterFreeCancel"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });

  // Clear recent searches from localStorage
  localStorage.removeItem("recentSearches");

  // Clear preview
  updateUrlPreview();

  // Render empty recent search
  renderRecentSearches();
});

// Generate Booking.com URL
function generateBookingUrl() {
  const location = document.getElementById("locationInput").value.trim();
  const dateRange = document.getElementById("dateRange").value.trim();
  const adults = guestCounts.adults;
  const children = guestCounts.children;
  const rooms = guestCounts.rooms;

  if (!location || !dateRange) return null;

  const [checkin, checkout] = dateRange.split(" to ");
  if (!checkin || !checkout) return null;

  let filters = [];
  if (document.getElementById("filterPriceBudget")?.checked) filters.push("price=1");
  if (document.getElementById("filterStar45")?.checked) filters.push("class=4,5");
  if (document.getElementById("filterBreakfast")?.checked) filters.push("mealplan=1");
  if (document.getElementById("filterFreeCancel")?.checked) filters.push("fc=1");

  const filterParams = filters.length > 0 ? `&nflt=${filters.join(";")}` : "";

  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location)}&checkin_year_month_monthday=${checkin}&checkout_year_month_monthday=${checkout}&group_adults=${adults}&group_children=${children}&no_rooms=${rooms}&lang=en&selected_currency=MYR${filterParams}`;
}

// Handle Search Button Click
function searchHotelsHandler() {
  const location = document.getElementById("locationInput").value.trim();
  const dateRange = document.getElementById("dateRange").value.trim();
  const [checkin, checkout] = dateRange.split(" to ");
  const guests = `${guestCounts.adults + guestCounts.children} people`;

  const url = generateBookingUrl();
  if (!url) {
    alert("Please complete all required fields.");
    return;
  }

  saveRecentSearch(location, checkin, checkout, guests);
  window.location.href = url;
}

// Show Booking.com URL Preview
function updateUrlPreview() {
  const preview = document.getElementById("urlPreview");
  const location = document.getElementById("locationInput").value.trim();
  const dateRange = document.getElementById("dateRange").value.trim();

  if (!preview) return;

  if (!location || !dateRange) {
    preview.textContent = "";
    preview.style.display = "none";
    return;
  }

  const url = generateBookingUrl();
  preview.textContent = url;
  preview.style.display = "block";
}

// Add listeners to update preview on input/filter changes
["locationInput", "dateRange", "filterPriceBudget", "filterStar45", "filterBreakfast", "filterFreeCancel"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", updateUrlPreview);
    el.addEventListener("change", updateUrlPreview);
  }
});

// Hero Search Input - Enter Key Trigger
document.getElementById("heroSearchInput")?.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const destination = e.target.value.trim();
    if (!destination) {
      alert("Please enter a destination.");
      return;
    }
    document.getElementById("locationInput").value = destination;
    updateUrlPreview();
    searchHotelsHandler();
  }
});

// Save Recent Search
function saveRecentSearch(location, checkin, checkout, guests) {
  let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
  recent.unshift({ location, checkin, checkout, guests });
  recent = recent.slice(0, 5); // limit to last 5
  localStorage.setItem("recentSearches", JSON.stringify(recent));
  renderRecentSearches();
}

// Render Recent Searches with Image
function renderRecentSearches() {
  const container = document.getElementById("recentSearchesContainer");
  if (!container) return;

  const recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (recent.length === 0) {
    container.innerHTML = "<p class='text-muted'>No recent searches yet.</p>";
    return;
  }

  container.innerHTML = `<div class='d-flex flex-wrap gap-3'>` +
    recent.map(search => `
      <div class="card shadow-sm" style="min-width: 220px; max-width: 220px;">
        <img src="https://source.unsplash.com/220x120/?${encodeURIComponent(search.location)}" class="card-img-top" alt="${search.location}" />
        <div class="card-body">
          <h6 class="card-title mb-1">${search.location}</h6>
          <p class="card-text text-muted small">${search.checkin} - ${search.checkout}<br>${search.guests}</p>
        </div>
      </div>
    `).join("") +
    `</div>`;
}
