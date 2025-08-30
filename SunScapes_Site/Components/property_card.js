import { t } from '../i18n.js';

export function createPropertyCard(property) {
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(property.price_usd);

    return `
    <div class="bg-white dark:bg-charcoal rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col h-full">
        <div class="relative">
            <a href="property_detail.html?id=${property.id}" class="block">
                <img src="${property.main_image_url}" alt="${property.title}" class="w-full h-56 object-cover">
            </a>
            <div class="absolute top-3 left-3 flex space-x-2">
                ${property.is_ocean_view ? `<span class="bg-ocean-blue text-white text-xs font-semibold px-3 py-1 rounded-full">${t('ocean_view')}</span>` : ''}
            </div>
            <button class="favorite-icon absolute top-3 right-3 bg-white/70 p-2 rounded-full backdrop-blur-sm transition hover:bg-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-charcoal/70 fill-color transition-colors duration-300">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
        </div>
        <div class="p-6 flex flex-col flex-grow">
            <a href="property_detail.html?id=${property.id}" class="block">
                <h3 class="font-display text-xl font-bold truncate group-hover:text-ocean-blue dark:group-hover:text-sunshine-orange transition">${property.title}</h3>
            </a>
            <p class="text-sm text-charcoal/60 dark:text-sand-beige/60 mt-1 flex items-center space-x-1">
                <i data-lucide="map-pin" class="w-4 h-4"></i>
                <span>${property.city}</span>
            </p>
            <div class="flex justify-between items-center mt-4">
                <div class="flex space-x-4 text-sm text-charcoal/80 dark:text-sand-beige/80">
                    <span class="flex items-center space-x-1"><i data-lucide="bed-double" class="w-5 h-5 text-sunshine-orange"></i> <b>${property.bedrooms}</b></span>
                    <span class="flex items-center space-x-1"><i data-lucide="bath" class="w-5 h-5 text-sunshine-orange"></i> <b>${property.bathrooms}</b></span>
                </div>
            </div>
            <div class="mt-auto pt-6">
                <p class="text-2xl font-display font-bold text-ocean-blue dark:text-white">${formattedPrice}</p>
            </div>
        </div>
    </div>
    `;
}
