// --------------------- Airport Data (No API) ---------------------
const airports = [
    { city: "Kuala Lumpur", code: "KUL" },
    { city: "Singapore", code: "SIN" },
    { city: "Bangkok", code: "BKK" },
    { city: "Jakarta", code: "CGK" },
    { city: "Manila", code: "MNL" },
    { city: "Tokyo", code: "NRT" },
    { city: "Osaka", code: "KIX" },
    { city: "Seoul", code: "ICN" },
    { city: "Hong Kong", code: "HKG" },
    { city: "Beijing", code: "PEK" },
    { city: "Shanghai", code: "PVG" },
    { city: "Dubai", code: "DXB" },
    { city: "Doha", code: "DOH" },
    { city: "Jeddah", code: "JED" },
    { city: "Riyadh", code: "RUH" },
    { city: "Mumbai", code: "BOM" },
    { city: "Delhi", code: "DEL" },
    { city: "London", code: "LHR" },
    { city: "Paris", code: "CDG" },
    { city: "Frankfurt", code: "FRA" },
    { city: "Amsterdam", code: "AMS" },
    { city: "Rome", code: "FCO" },
    { city: "Madrid", code: "MAD" },
    { city: "New York", code: "JFK" },
    { city: "Los Angeles", code: "LAX" },
    { city: "Toronto", code: "YYZ" },
    { city: "Sydney", code: "SYD" },
    { city: "Melbourne", code: "MEL" },
    { city: "Auckland", code: "AKL" },
    { city: "Istanbul", code: "IST" },
    { city: "Vienna", code: "VIE" },
    { city: "Copenhagen", code: "CPH" },
    { city: "Oslo", code: "OSL" },
    { city: "Helsinki", code: "HEL" },
    { city: "Lahore", code: "LHE" },
    { city: "Karachi", code: "KHI" },
    { city: "Bali", code: "DPS" }
];

// --------------------- Helper Functions ---------------------
function getCode(value) {
    if (!value) return "";
    const match = value.match(/\(([A-Z]{3})\)/);
    return match ? match[1].toLowerCase() : "";
}

function updateCount(type, change) {
    const el = document.getElementById(`${type}Count`);
    let val = parseInt(el.innerText) || 0;
    val = Math.max(0, val + change);
    el.innerText = val;
}

// --------------------- Autocomplete Setup ---------------------
function setupAutocomplete(inputEl, resultEl) {
    inputEl.addEventListener("input", () => {
        const query = inputEl.value.trim().toLowerCase();
        resultEl.innerHTML = "";

        if (query.length < 2) return;

        const filtered = airports.filter(airport =>
            airport.city.toLowerCase().includes(query) ||
            airport.code.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            resultEl.innerHTML = `<div class="autocomplete-item disabled">No results found</div>`;
        } else {
            resultEl.innerHTML = filtered.map(airport =>
                `<div class="autocomplete-item" data-value="${airport.city} (${airport.code})">${airport.city} (${airport.code})</div>`
            ).join("");
        }
    });

    resultEl.addEventListener("mousedown", (e) => {
        const item = e.target.closest(".autocomplete-item");
        if (item && !item.classList.contains("disabled")) {
            e.preventDefault();
            inputEl.value = item.getAttribute("data-value");
            resultEl.innerHTML = "";
        }
    });

    inputEl.addEventListener("blur", () => {
        setTimeout(() => resultEl.innerHTML = "", 200);
    });
}

// --------------------- Trip Type Toggle ---------------------
let tripType = "roundtrip";
document.querySelector('input[value="roundtrip"]').addEventListener("click", () => {
    tripType = "roundtrip";
    document.getElementById("returnDate").style.display = "inline-block";
});
document.querySelector('input[value="oneway"]').addEventListener("click", () => {
    tripType = "oneway";
    document.getElementById("returnDate").style.display = "none";
});

// --------------------- Form Submission ---------------------
document.getElementById("flightForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const from = getCode(document.getElementById("from").value);
    const to = getCode(document.getElementById("to").value);
    const depart = document.getElementById("departDate").value;
    const ret = document.getElementById("returnDate").value;
    const adults = parseInt(document.getElementById("adultCount").innerText) || 0;
    const children = parseInt(document.getElementById("childCount").innerText) || 0;
    const infants = parseInt(document.getElementById("infantCount").innerText) || 0;
    const cabinClass = document.getElementById("cabinClass").value;

    // Validation
    if (!from || !to) {
        alert("Please select valid origin and destination airports.");
        return;
    }

    if (from === to) {
        alert("Origin and destination cannot be the same.");
        return;
    }

    if (!depart) {
        alert("Please select a departure date.");
        return;
    }

    if (tripType === "roundtrip" && !ret) {
        alert("Please select a return date for round trips.");
        return;
    }

    if (tripType === "roundtrip" && ret && new Date(ret) < new Date(depart)) {
        alert("Return date must be after departure date.");
        return;
    }

    if (adults < 1) {
        alert("At least one adult passenger is required.");
        return;
    }

    // Construct URL
    let dateString = depart.replace(/-/g, "");
    let url = `https://www.skyscanner.com/transport/flights/${from}/${to}/${dateString}`;
    
    if (tripType === "roundtrip" && ret) {
        let retString = ret.replace(/-/g, "");
        url += `/${retString}`;
    }

    const params = new URLSearchParams();
    params.append("adults", adults);
    if (children > 0) params.append("children", children);
    if (infants > 0) params.append("infants", infants);
    params.append("cabinclass", cabinClass);

    url += "/?" + params.toString();
    window.open(url, "_blank");
});

// --------------------- Promo Card Click Handler ---------------------
function setupPromoCards() {
    document.querySelectorAll('.promo-card').forEach(card => {
        card.addEventListener('click', function() {
            // Get the selected origin (either from form or default)
            let originInput = document.getElementById('from').value;
            let originCode;
            
            // Try to extract code from input (format: "City (CODE)")
            if (originInput.includes('(')) {
                const match = originInput.match(/\(([A-Z]{3})\)/);
                originCode = match ? match[1] : "KUL";
            } else {
                originCode = "KUL"; // Default to Kuala Lumpur if no proper selection
            }
            
            // Get destination from card's data attribute
            const destinationCode = this.getAttribute('data-destination');
            
            // Build Skyscanner URL
            const url = `https://www.skyscanner.com/transport/flights/${originCode}/${destinationCode}/`;
            
            // Open in new tab
            window.open(url, '_blank');
        });
    });
}

// --------------------- Initialize Page ---------------------
document.addEventListener("DOMContentLoaded", function() {
    setupAutocomplete(document.getElementById("from"), document.getElementById("fromResults"));
    setupAutocomplete(document.getElementById("to"), document.getElementById("toResults"));
    setupPromoCards();
});