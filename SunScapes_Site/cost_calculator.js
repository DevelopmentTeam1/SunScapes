document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupDarkMode();
    setupNavbarDropdown();
    setupCostCalculator();
});

function setupCostCalculator() {
    const familySizeInput = document.getElementById('family-size');
    const lifestyleSelect = document.getElementById('lifestyle');
    const cityCheckboxes = document.querySelectorAll('input[name="city"]');
    const resultsTableBody = document.getElementById('results-table-body');
    const resultsContainer = document.getElementById('results-container');

    const costData = {
        'Cabo San Lucas': { housing: 2200, food: 800, transportation: 350, utilities: 200, entertainment: 600 },
        'San José del Cabo': { housing: 1900, food: 750, transportation: 300, utilities: 180, entertainment: 500 },
        'La Paz': { housing: 1200, food: 600, transportation: 250, utilities: 150, entertainment: 400 },
        'Todos Santos': { housing: 1600, food: 700, transportation: 400, utilities: 170, entertainment: 450 },
    };

    const lifestyleFactors = {
        Budget: 0.8,
        Moderate: 1.0,
        Luxury: 1.5,
    };

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    }

    function updateTable() {
        const familySize = parseInt(familySizeInput.value) || 1;
        const lifestyle = lifestyleSelect.value;
        const selectedCities = Array.from(cityCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        if (selectedCities.length === 0) {
            resultsContainer.classList.add('hidden');
            return;
        }

        resultsContainer.classList.remove('hidden');
        resultsTableBody.innerHTML = '';

        const categories = ['housing', 'food', 'transportation', 'utilities', 'entertainment'];
        const totals = {};
        selectedCities.forEach(city => totals[city] = 0);

        categories.forEach(category => {
            const row = document.createElement('tr');
            row.className = 'border-b border-sand-beige/50 dark:border-charcoal/50';
            
            const categoryCell = document.createElement('td');
            categoryCell.className = 'py-3 px-4 font-semibold capitalize';
            categoryCell.textContent = category;
            row.appendChild(categoryCell);

            selectedCities.forEach(city => {
                const baseCost = costData[city][category];
                const familyFactor = category === 'housing' ? 1 + (familySize - 1) * 0.2 : 1 + (familySize - 1) * 0.4;
                const calculatedCost = baseCost * lifestyleFactors[lifestyle] * familyFactor;
                totals[city] += calculatedCost;
                
                const cell = document.createElement('td');
                cell.className = 'py-3 px-4 text-center';
                cell.textContent = formatCurrency(calculatedCost);
                row.appendChild(cell);
            });
            resultsTableBody.appendChild(row);
        });

        const totalRow = document.createElement('tr');
        totalRow.className = 'bg-sand-beige/30 dark:bg-charcoal/70 font-bold';
        
        const totalCell = document.createElement('td');
        totalCell.className = 'py-3 px-4';
        totalCell.textContent = 'Monthly Total';
        totalRow.appendChild(totalCell);

        selectedCities.forEach(city => {
            const cell = document.createElement('td');
            cell.className = 'py-3 px-4 text-center text-lg';
            cell.textContent = formatCurrency(totals[city]);
            totalRow.appendChild(totalCell);
            totalRow.appendChild(cell);
        });
        resultsTableBody.appendChild(totalRow);
    }

    [familySizeInput, lifestyleSelect, ...cityCheckboxes].forEach(el => {
        el.addEventListener('input', updateTable);
        el.addEventListener('change', updateTable);
    });

    updateTable();
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

    if (toggleButton) {
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
