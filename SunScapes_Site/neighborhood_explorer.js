let map;
let infoWindow;
let propertyMarkers = [];
const amenityMarkers = {
    schools: [],
    healthcare: [],
    restaurants: [],
    beaches: []
};

const SUNSHINE_ORANGE = '#FFA500';
const OCEAN_BLUE = '#0077BE';
const CHARCOAL = '#2C3E50';

const mapStyles = {
    light: [
        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#606060" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
        { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
        { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e6f2" }] },
        { featureType: "water", elementType: "geometry.fill", stylers: [{ color: OCEAN_BLUE }, { saturation: -25 }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    ],
    dark: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
        { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
        { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
    ]
};

const mockProperties = [
    { id: 1, title: 'Luxury Villa in Cabo San Lucas', price_usd: 1250000, lat: 22.8905, lng: -109.9167 },
    { id: 2, title: 'Modern Condo with Ocean View', price_usd: 750000, lat: 24.1426, lng: -110.3121 },
    { id: 3, title: 'Charming Beachside Casita', price_usd: 480000, lat: 23.4503, lng: -110.2246 },
    { id: 4, title: 'Expansive Land for Development', price_usd: 980000, lat: 23.3608, lng: -110.1654 },
    { id: 5, title: 'Penthouse Overlooking the Marina', price_usd: 1800000, lat: 22.8850, lng: -109.9080 },
    { id: 6, title: 'Secluded Hacienda-Style Home', price_usd: 890000, lat: 23.0614, lng: -109.6953 }
];

const mockAmenities = [
    { name: 'Cabo San Lucas High School', type: 'schools', lat: 22.9010, lng: -109.9210 },
    { name: 'La Paz International School', type: 'schools', lat: 24.1580, lng: -110.3000 },
    { name: 'Hospital H+ Los Cabos', type: 'healthcare', lat: 23.0483, lng: -109.7063 },
    { name: 'AmeriMed Hospital Cabo San Lucas', type: 'healthcare', lat: 22.8880, lng: -109.9190 },
    { name: 'The Office on the Beach', type: 'restaurants', lat: 22.8817, lng: -109.9056 },
    { name: 'Tacos Gardenias', type: 'restaurants', lat: 22.8875, lng: -109.9123 },
    { name: 'Costa Azul Beach', type: 'beaches', lat: 23.0450, lng: -109.7150 },
    { name: 'Playa Balandra', type: 'beaches', lat: 24.3214, lng: -110.3235 },
    { name: 'Cerritos Beach', type: 'beaches', lat: 23.3333, lng: -110.1798 },
];

const icons = {
    property: {
        path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
        fillColor: SUNSHINE_ORANGE,
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: CHARCOAL,
        rotation: 0,
        scale: 1.2,
        anchor: new google.maps.Point(12, 12),
    },
    schools: {
        path: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',
        fillColor: OCEAN_BLUE,
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 0.9,
        anchor: new google.maps.Point(12, 12),
    },
    healthcare: {
        path: 'M12 2L12 2c3.314 0 6 2.686 6 6L18 18c0 1.105-.895 2-2 2H8c-1.105 0-2-.895-2-2V8c0-3.314 2.686-6 6-6zM9 9v6h2v-6H9zM13 9v6h2v-6h-2z',
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 0.9,
        anchor: new google.maps.Point(12, 12),
    },
    restaurants: {
        path: 'M16 2v20M8 2v20M2 10h20M4 12h16',
        fillColor: '#d97706',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 0.9,
        anchor: new google.maps.Point(12, 12),
    },
    beaches: {
        path: 'M2 12c.9-2.2 2.7-4 5-4 2.8 0 4.5 2 7 2 2.3 0 4.1-1.8 5-4M2 6c.9-2.2 2.7-4 5-4 2.8 0 4.5 2 7 2 2.3 0 4.1-1.8 5-4M2 18c.9-2.2 2.7-4 5-4 2.8 0 4.5 2 7 2 2.3 0 4.1-1.8 5-4',
        fillColor: '#06b6d4',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 0.9,
        anchor: new google.maps.Point(12, 12),
    }
};

function initMap() {
    const bcsCenter = { lat: 23.6345, lng: -109.9925 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: bcsCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: document.documentElement.classList.contains('dark') ? mapStyles.dark : mapStyles.light,
    });

    infoWindow = new google.maps.InfoWindow();
    addPropertyMarkers();
    addAmenityMarkers();
}
window.initMap = initMap;

function addPropertyMarkers() {
    mockProperties.forEach(prop => {
        const marker = new google.maps.Marker({
            position: { lat: prop.lat, lng: prop.lng },
            map: map,
            icon: icons.property,
            title: prop.title
        });

        marker.addListener('click', () => {
            const content = `
                <div class="custom-infowindow">
                    <h3>${prop.title}</h3>
                    <p>Price: $${prop.price_usd.toLocaleString()}</p>
                    <a href="property_details.html?id=${prop.id}" target="_blank">View Details &rarr;</a>
                </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });
        propertyMarkers.push(marker);
    });
}

function addAmenityMarkers() {
    mockAmenities.forEach(amenity => {
        const marker = new google.maps.Marker({
            position: { lat: amenity.lat, lng: amenity.lng },
            map: null,
            icon: icons[amenity.type],
            title: amenity.name
        });

        marker.addListener('click', () => {
             const content = `<div class="custom-infowindow"><h3>${amenity.name}</h3><p>Type: ${amenity.type.charAt(0).toUpperCase() + amenity.type.slice(1)}</p></div>`;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });
        amenityMarkers[amenity.type].push(marker);
    });
}

function toggleAmenityLayer(layer, show) {
    if (amenityMarkers[layer]) {
        amenityMarkers[layer].forEach(marker => {
            marker.setMap(show ? map : null);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupDarkMode();
    setupNavbarDropdown();

    document.querySelectorAll('#map-controls input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const layer = e.target.dataset.layer;
            toggleAmenityLayer(layer, e.target.checked);
        });
    });
});

function setupDarkMode() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    const htmlElement = document.documentElement;

    const applyTheme = (isDark) => {
        if (isDark) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
        if (map) {
            map.setOptions({ styles: isDark ? mapStyles.dark : mapStyles.light });
        }
    };

    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isDarkMode = storedTheme ? storedTheme === 'dark' : systemPrefersDark;
    applyTheme(isDarkMode);

    if(toggleButton) {
        toggleButton.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            applyTheme(isDarkMode);
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }
}

function setupNavbarDropdown() {
    const button = document.getElementById('tools-dropdown-button');
    const menu = document.getElementById('tools-dropdown-menu');
    const icon = button ? button.querySelector('i[data-lucide="chevron-down"]') : null;

    if (!button || !menu || !icon) return;
    
    let isMenuOpen = false;

    const toggleMenu = (forceOpen = null) => {
        isMenuOpen = forceOpen !== null ? forceOpen : !isMenuOpen;
        menu.classList.toggle('hidden', !isMenuOpen);
        icon.classList.toggle('rotate-180', isMenuOpen);
    }
    
    toggleMenu(true);

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (event) => {
        if (isMenuOpen && !button.contains(event.target)) {
            toggleMenu(false);
        }
    });
}
