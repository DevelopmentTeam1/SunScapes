import { createPropertyCard } from './components/property_card.js';
import { t } from './i18n.js';

let currentLang = 'en';

function initializePage(event) {
    currentLang = event.detail.lang;

    const propertyDetailsContainer = document.getElementById('property-details-content');
    const loadingContainer = document.getElementById('loading-state');
    const tourModal = document.getElementById('tour-modal');
    const tourForm = document.getElementById('tour-form');
    const closeTourModalBtn = document.getElementById('close-tour-modal-btn');
    const recommendedSection = document.getElementById('recommended-section');
    const similarPropertiesGrid = document.getElementById('similar-properties-grid');

    const getPropertyId = () => {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id'), 10);
    };

    const loadPropertyDetails = async () => {
        const propertyId = getPropertyId();
        if (isNaN(propertyId)) {
            propertyDetailsContainer.innerHTML = `<p class="text-center text-xl text-sunshine-orange">${t('js_invalid_id')}</p>`;
            return;
        }

        try {
            const response = await fetch('data/properties.json');
            if (!response.ok) throw new Error('Network response was not ok.');
            
            const properties = await response.json();
            const property = properties.find(p => p.id === propertyId);

            if (property) {
                displayPropertyDetails(property);
                loadSimilarProperties(properties, property);
            } else {
                propertyDetailsContainer.innerHTML = `<p class="text-center text-xl text-sunshine-orange">${t('js_not_found')}</p>`;
            }
        } catch (error) {
            console.error('Failed to load property details:', error);
            propertyDetailsContainer.innerHTML = `<p class="text-center text-xl text-sunshine-orange">${t('js_could_not_load_details')}</p>`;
        }
    };
    
    const displayPropertyDetails = (property) => {
        const formattedPrice = new Intl.NumberFormat(currentLang, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(property.price_usd);

        const detailsHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    <div class="mb-6">
                        <h1 class="text-4xl font-display font-bold">${property.title}</h1>
                        <p class="text-lg text-charcoal/60 dark:text-sand-beige/60 mt-2 flex items-center"><i data-lucide="map-pin" class="w-5 h-5 mr-2"></i>${property.community}, ${property.city}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-2 mb-8 rounded-xl overflow-hidden">
                        <div class="col-span-2">
                            <img src="${property.images[0]}" alt="${property.title}" class="w-full h-auto object-cover cursor-pointer">
                        </div>
                        <img src="${property.images[1]}" alt="View 2" class="w-full h-auto object-cover cursor-pointer">
                        <img src="${property.images[2]}" alt="View 3" class="w-full h-auto object-cover cursor-pointer">
                    </div>

                    <div class="prose dark:prose-invert max-w-none mb-8">
                        <h2 class="text-2xl font-display font-bold" data-i18n="property_description">${t('property_description')}</h2>
                        <p>${property.description}</p>
                    </div>

                    <div id="virtual-tour-section">
                        <h2 class="text-2xl font-display font-bold mb-4" data-i18n="virtual_tour_section_title">${t('virtual_tour_section_title')}</h2>
                        <p class="text-charcoal/70 dark:text-sand-beige/70 mb-4" data-i18n="virtual_tour_section_desc">${t('virtual_tour_section_desc')}</p>
                        <button id="open-tour-modal-btn" class="bg-ocean-blue text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2">
                            <i data-lucide="video" class="w-5 h-5"></i>
                            <span data-i18n="virtual_tour_request_button">${t('virtual_tour_request_button')}</span>
                        </button>
                    </div>
                </div>
                <div class="lg:col-span-1">
                    <div class="sticky top-24 bg-sand-beige/30 dark:bg-charcoal/70 p-6 rounded-xl shadow-lg">
                        <p class="text-3xl font-display font-bold text-ocean-blue dark:text-white mb-6">${formattedPrice}</p>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center"><span class="font-semibold" data-i18n="sticky_bedrooms">${t('sticky_bedrooms')}</span><span class="flex items-center space-x-2"><i data-lucide="bed-double" class="w-5 h-5 text-sunshine-orange"></i> <b>${property.bedrooms}</b></span></div>
                            <div class="flex justify-between items-center"><span class="font-semibold" data-i18n="sticky_bathrooms">${t('sticky_bathrooms')}</span><span class="flex items-center space-x-2"><i data-lucide="bath" class="w-5 h-5 text-sunshine-orange"></i> <b>${property.bathrooms}</b></span></div>
                            <div class="flex justify-between items-center"><span class="font-semibold" data-i18n="sticky_area">${t('sticky_area')}</span><span class="flex items-center space-x-2"><i data-lucide="ruler" class="w-5 h-5 text-sunshine-orange"></i> <b>${property.area_sqft.toLocaleString(currentLang)} sqft</b></span></div>
                             ${property.is_ocean_view ? `<div class="flex justify-between items-center"><span class="font-semibold" data-i18n="sticky_view">${t('sticky_view')}</span><span class="flex items-center space-x-2"><i data-lucide="waves" class="w-5 h-5 text-sunshine-orange"></i> <b data-i18n="sticky_ocean_view">${t('sticky_ocean_view')}</b></span></div>` : ''}
                        </div>
                        <button class="mt-8 w-full bg-sunshine-orange text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
                           <i data-lucide="heart" class="w-5 h-5"></i>
                           <span data-i18n="sticky_favorites_button">${t('sticky_favorites_button')}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        propertyDetailsContainer.innerHTML = detailsHTML;
        loadingContainer.style.display = 'none';
        
        const openTourModalBtn = document.getElementById('open-tour-modal-btn');
        if (openTourModalBtn) {
            openTourModalBtn.addEventListener('click', () => {
                tourModal.classList.remove('modal-hidden');
            });
        }
        lucide.createIcons();
    };
    
    const loadSimilarProperties = (allProperties, currentProperty) => {
        const similar = allProperties.filter(p => p.id !== currentProperty.id && p.city === currentProperty.city).slice(0, 3);
        if(similar.length > 0) {
            similarPropertiesGrid.innerHTML = similar.map(p => `<div>${createPropertyCard(p)}</div>`).join('');
            recommendedSection.classList.remove('hidden');
            lucide.createIcons();
        }
    }

    const setupModal = () => {
        if (closeTourModalBtn) {
            closeTourModalBtn.addEventListener('click', () => {
                tourModal.classList.add('modal-hidden');
            });
        }
        if (tourModal) {
            tourModal.addEventListener('click', (e) => {
                if (e.target === tourModal) {
                    tourModal.classList.add('modal-hidden');
                }
            });
        }
        if (tourForm) {
            tourForm.addEventListener('submit', (e) => {
                e.preventDefault();
                tourModal.classList.add('modal-hidden');
                
                const confirmation = document.createElement('div');
                confirmation.className = 'fixed top-5 right-5 bg-ocean-blue text-white py-3 px-5 rounded-lg shadow-lg z-[100] animate-pulse';
                confirmation.textContent = t('js_tour_request_sent');
                document.body.appendChild(confirmation);
                
                setTimeout(() => {
                    confirmation.remove();
                }, 5000);
            });
        }
    };
    
    const initDarkMode = () => {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        darkModeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    };
    
    initDarkMode();
    loadPropertyDetails();
    setupModal();
    lucide.createIcons();
}

document.addEventListener('i18n:ready', initializePage);
