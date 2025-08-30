import { createPropertyCard } from './components/property_card.js';
import { t } from './i18n.js';

function initializePage() {
    const recommendationCarousel = document.getElementById('recommendation-carousel');

    const loadRecommendations = async () => {
        if (!recommendationCarousel) return;

        try {
            const response = await fetch('data/properties.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const properties = await response.json();

            const shuffled = properties.sort(() => 0.5 - Math.random());
            const selectedProperties = shuffled.slice(0, 6);

            let recommendationsHTML = '';
            selectedProperties.forEach(property => {
                const cardHTML = createPropertyCard(property);
                recommendationsHTML += `<div>${cardHTML}</div>`;
            });
            
            recommendationCarousel.innerHTML = recommendationsHTML;
            lucide.createIcons();
            
        } catch (error) {
            console.error("Could not load recommendations:", error);
            recommendationCarousel.innerHTML = `<p class="text-center col-span-full">${t('js_recommendations_error')}</p>`;
        }
    };

    const setupTabs = () => {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;

                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                tabContents.forEach(content => {
                    if (content.id === `${tab}-content`) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
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
    setupTabs();
    loadRecommendations();
    lucide.createIcons();
}

document.addEventListener('i18n:ready', initializePage);
