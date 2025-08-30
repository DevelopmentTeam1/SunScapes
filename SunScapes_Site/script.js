import { createPropertyCard } from './components/property_card.js';
import { createSkeletonCard } from './components/skeleton_card.js';
import { t } from './i18n.js';

function initializePage() {
    setupDarkMode();
    setupNavbarDropdown();
    loadProperties();
    setupChatbot();

    const searchButton = document.querySelector('button.bg-ocean-blue');
    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            const filters = getSearchFilters();
            loadProperties(filters);
        });
    }
    
    const params = new URLSearchParams(window.location.search);
    if(params.has('priceRange')) {
        document.getElementById('price-range').value = params.get('priceRange');
        loadProperties(getSearchFilters());
    }
    if(params.has('location')) {
        document.getElementById('location').value = params.get('location');
        loadProperties(getSearchFilters());
    }
}

function getSearchFilters() {
    const location = document.getElementById('location').value;
    const propertyTypeEl = document.getElementById('prop-type');
    const propertyType = propertyTypeEl.options[propertyTypeEl.selectedIndex].textContent;
    const priceRange = document.getElementById('price-range').value;
    
    const filters = {};
    if (location) filters.location = location;
    if (propertyType && propertyType !== t('search_prop_type_all')) filters.type = propertyType;
    if (priceRange && priceRange !== t('search_price_range_any')) filters.priceRange = priceRange;
    
    return filters;
}

function setupDarkMode() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    const htmlElement = document.documentElement;

    const applyTheme = (isDark) => {
        if (isDark) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
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
    const icon = button ? button.querySelector('i[data-lucide=\'chevron-down\']') : null;

    if (!button || !menu || !icon) return;

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
    });

    document.addEventListener('click', (event) => {
        if (!menu.classList.contains('hidden') && !button.contains(event.target)) {
            menu.classList.add('hidden');
            icon.classList.remove('rotate-180');
        }
    });
}

function setupChatbot() {
    const chatButton = document.getElementById('chat-icon-button');
    const chatWindow = document.getElementById('chat-window');
    const closeChatButton = document.getElementById('close-chat-button');
    const chatInput = chatWindow.querySelector('input');
    const sendButton = chatWindow.querySelector('button');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatButton || !chatWindow || !closeChatButton || !chatInput || !sendButton) return;

    chatButton.addEventListener('click', () => chatWindow.classList.remove('chat-hidden'));
    closeChatButton.addEventListener('click', () => chatWindow.classList.add('chat-hidden'));
    
    const addUserMessage = (message) => {
        const messageHTML = `
            <div class="flex items-start gap-3 flex-row-reverse">
                <img src="https://i.pravatar.cc/32?u=guest" class="w-8 h-8 rounded-full flex-shrink-0" alt="User avatar">
                <div class="bg-ocean-blue text-white p-3 rounded-lg max-w-xs">
                    <p class="text-sm">${message}</p>
                </div>
            </div>`;
        chatMessages.querySelector('.space-y-4').innerHTML += messageHTML;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };
    
    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if(message) {
            addUserMessage(message);
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
}


async function fetchProperties(filters = {}) {
    const API_URL = '/api/properties/search';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(filters)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.status === 'success') return result.data;
        throw new Error(result.message || 'API returned an error');
    } catch (error) {
        console.warn(`API call to ${API_URL} failed. This is expected in a sandbox environment. Falling back to mock data.`, error.message);
        
        return new Promise(resolve => {
            setTimeout(() => {
                const mockData = [
                    { id: 1, title: 'Luxury Villa in Cabo San Lucas', price_usd: 1250000, main_image_url: 'https://images.unsplash.com/photo-1613553424174-1c203de29c92?q=80&w=2070&auto=format&fit=crop', bedrooms: 4, bathrooms: 5, city: 'Cabo San Lucas', is_ocean_view: true },
                    { id: 2, title: 'Modern Condo with Ocean View', price_usd: 750000, main_image_url: 'https://images.unsplash.com/photo-1594411799216-a3696a17551e?q=80&w=2070&auto=format&fit=crop', bedrooms: 2, bathrooms: 2, city: 'La Paz', is_ocean_view: true },
                    { id: 3, title: 'Charming Beachside Casita', price_usd: 480000, main_image_url: 'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?q=80&w=1974&auto=format&fit=crop', bedrooms: 3, bathrooms: 2, city: 'Todos Santos', is_ocean_view: false },
                    { id: 4, title: 'Expansive Land for Development', price_usd: 980000, main_image_url: 'https://images.unsplash.com/photo-1512403738477-7435a4911e2f?q=80&w=2070&auto=format&fit=crop', bedrooms: 0, bathrooms: 0, city: 'El Pescadero', is_ocean_view: false },
                    { id: 5, title: 'Penthouse Overlooking the Marina', price_usd: 1800000, main_image_url: 'https://images.unsplash.com/photo-1617833535952-736024db4b39?q=80&w=2070&auto=format&fit=crop', bedrooms: 3, bathrooms: 4, city: 'Cabo San Lucas', is_ocean_view: true },
                    { id: 6, title: 'Secluded Hacienda-Style Home', price_usd: 890000, main_image_url: 'https://images.unsplash.com/photo-1628624747181-651e51513f59?q=80&w=2070&auto=format&fit=crop', bedrooms: 5, bathrooms: 5, city: 'San José del Cabo', is_ocean_view: false }
                ];
                
                let filteredData = mockData;
                if (filters.location) {
                    filteredData = filteredData.filter(p => p.city.toLowerCase().includes(filters.location.toLowerCase()));
                }
                if (filters.priceRange) {
                    const [minStr, maxStr] = filters.priceRange.replace(/[\$,]/g, '').split(' - ');
                    const min = parseInt(minStr.replace('k', '000').replace('M', '000000'));
                    const max = maxStr ? parseInt(maxStr.replace('k', '000').replace('M', '000000')) : Infinity;
                    if (filters.priceRange.includes('+')) {
                         const minPlus = parseInt(filters.priceRange.replace(/[\\$,M+]/g, '')) * 1000000;
                         filteredData = filteredData.filter(p => p.price_usd >= minPlus);
                    } else {
                         filteredData = filteredData.filter(p => p.price_usd >= min && p.price_usd <= max);
                    }
                }
                resolve(filteredData);
            }, 1000);
        });
    }
}


async function loadProperties(filters = {}) {
    const listingsContainer = document.getElementById('property-listings');
    if (!listingsContainer) return;

    listingsContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        listingsContainer.innerHTML += createSkeletonCard();
    }
    lucide.createIcons();

    try {
        const properties = await fetchProperties(filters);

        listingsContainer.innerHTML = '';
        if (properties && properties.length > 0) {
            properties.forEach(property => {
                listingsContainer.innerHTML += createPropertyCard(property);
            });
        } else {
            listingsContainer.innerHTML = `<div class="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
                <i data-lucide="search-x" class="w-16 h-16 mx-auto text-gray-400"></i>
                <h3 class="mt-4 text-xl font-semibold">${t('js_no_properties_found')}</h3>
                <p class="mt-2 text-charcoal/70 dark:text-sand-beige/70">${t('js_try_adjusting_filters')}</p>
            </div>`;
        }
        
        lucide.createIcons();
        addFavoriteListeners();
    } catch (error) {
        console.error('Failed to load properties:', error);
        listingsContainer.innerHTML = `<div class="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
            <i data-lucide="server-crash" class="w-16 h-16 mx-auto text-red-500"></i>
            <h3 class="mt-4 text-xl font-semibold">${t('js_could_not_load_properties')}</h3>
            <p class="mt-2 text-charcoal/70 dark:text-sand-beige/70">${t('js_server_error_message')}</p>
        </div>`;
        lucide.createIcons();
    }
}

function addFavoriteListeners() {
    const favoriteButtons = document.querySelectorAll('.favorite-icon');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            button.classList.toggle('active');
        });
    });
}

document.addEventListener('i18n:ready', initializePage);
