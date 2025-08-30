document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupDarkMode();
    setupNavbarDropdown();
    setupRoiCalculator();
});

function setupRoiCalculator() {
    const inputs = {
        purchasePrice: document.getElementById('purchase-price'),
        downPaymentPercent: document.getElementById('down-payment-percent'),
        interestRate: document.getElementById('interest-rate'),
        loanTerm: document.getElementById('loan-term'),
        rentalIncome: document.getElementById('rental-income'),
        monthlyExpenses: document.getElementById('monthly-expenses'),
    };

    const outputs = {
        monthlyCashflow: document.getElementById('monthly-cashflow'),
        cashOnCashRoi: document.getElementById('cash-on-cash-roi'),
        capRate: document.getElementById('cap-rate'),
    };
    
    const valueDisplays = {
        downPaymentValue: document.getElementById('down-payment-value'),
        interestRateValue: document.getElementById('interest-rate-value'),
        loanTermValue: document.getElementById('loan-term-value'),
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    function calculate() {
        const p = parseFloat(inputs.purchasePrice.value) || 0;
        const dpp = parseFloat(inputs.downPaymentPercent.value) || 20;
        const ir = parseFloat(inputs.interestRate.value) || 5;
        const lt = parseFloat(inputs.loanTerm.value) || 30;
        const ri = parseFloat(inputs.rentalIncome.value) || 0;
        const me = parseFloat(inputs.monthlyExpenses.value) || 0;

        valueDisplays.downPaymentValue.textContent = `${dpp}%`;
        valueDisplays.interestRateValue.textContent = `${ir.toFixed(2)}%`;
        valueDisplays.loanTermValue.textContent = `${lt} years`;

        const downPaymentAmount = p * (dpp / 100);
        const loanAmount = p - downPaymentAmount;
        
        const monthlyInterestRate = (ir / 100) / 12;
        const numberOfPayments = lt * 12;
        
        let monthlyMortgage = 0;
        if (monthlyInterestRate > 0 && loanAmount > 0) {
           monthlyMortgage = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        }

        const netOperatingIncome = (ri * 12) - (me * 12);
        const monthlyCashflow = ri - me - monthlyMortgage;
        
        const totalCashInvested = downPaymentAmount; 
        const annualCashflow = monthlyCashflow * 12;

        const cashOnCashRoi = totalCashInvested > 0 ? (annualCashflow / totalCashInvested) * 100 : 0;
        const capRate = p > 0 ? (netOperatingIncome / p) * 100 : 0;

        outputs.monthlyCashflow.textContent = formatCurrency(monthlyCashflow);
        outputs.monthlyCashflow.classList.toggle('text-green-500', monthlyCashflow >= 0);
        outputs.monthlyCashflow.classList.toggle('text-red-500', monthlyCashflow < 0);

        outputs.cashOnCashRoi.textContent = `${cashOnCashRoi.toFixed(2)}%`;
        outputs.capRate.textContent = `${capRate.toFixed(2)}%`;
    }

    Object.values(inputs).forEach(input => {
        input.addEventListener('input', calculate);
    });

    calculate();
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
