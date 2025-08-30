document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupDarkMode();
    setupNavbarDropdown();
    setupQuiz();
});

function setupQuiz() {
    const steps = document.querySelectorAll('.quiz-step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const resultProfile = document.getElementById('result-profile');
    const resultLink = document.getElementById('result-link');

    let currentStep = 0;
    const answers = {};

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        updateProgressBar();
        updateButtons();
    }

    function updateProgressBar() {
        const progress = ((currentStep + 1) / steps.length) * 100;
        progressBarFill.style.width = `${progress}%`;
    }

    function updateButtons() {
        prevBtn.classList.toggle('hidden', currentStep === 0);
        nextBtn.textContent = currentStep === steps.length - 1 ? 'See My Profile' : 'Next';
    }

    function collectAnswers() {
        const activeStep = steps[currentStep];
        const inputs = activeStep.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'radio' && input.checked) {
                answers[input.name] = input.value;
            }
            if (input.type === 'checkbox' && input.checked) {
                if (!answers[input.name]) answers[input.name] = [];
                answers[input.name].push(input.value);
            }
             if (input.type === 'range') {
                answers[input.name] = input.value;
            }
        });
    }

    function showResults() {
        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');

        let profileHtml = `<ul class="space-y-3 text-lg">`;
        if (answers.lifestyle) profileHtml += `<li class="flex items-center"><i data-lucide="sun" class="w-5 h-5 text-sunshine-orange mr-3"></i>You prefer <strong>${answers.lifestyle}</strong></li>`;
        if (answers.budget) profileHtml += `<li class="flex items-center"><i data-lucide="dollar-sign" class="w-5 h-5 text-sunshine-orange mr-3"></i>With a budget around <strong>$${parseInt(answers.budget).toLocaleString()}</strong></li>`;
        if (answers.bedrooms) profileHtml += `<li class="flex items-center"><i data-lucide="bed-double" class="w-5 h-5 text-sunshine-orange mr-3"></i>Looking for at least <strong>${answers.bedrooms} bedrooms</strong></li>`;
        if (answers.amenities && answers.amenities.length > 0) {
            profileHtml += `<li class="flex items-start"><i data-lucide="check-square" class="w-5 h-5 text-sunshine-orange mr-3 mt-1"></i><span>Must-haves include: <strong>${answers.amenities.join(', ')}</strong></span></li>`;
        }
        profileHtml += `</ul>`;
        
        resultProfile.innerHTML = profileHtml;
        lucide.createIcons();

        const searchParams = new URLSearchParams();
        if (answers.budget) {
            const budget = parseInt(answers.budget);
            if (budget <= 500000) searchParams.set('priceRange', '$100k - $500k');
            else if (budget <= 1000000) searchParams.set('priceRange', '$500k - $1M');
            else searchParams.set('priceRange', '$1M+');
        }
        if (answers.lifestyle === 'vibrant city life' ) searchParams.set('location', 'Cabo San Lucas');
        if (answers.lifestyle === 'beachfront relaxation' ) searchParams.set('location', 'Todos Santos');
        
        resultLink.href = `index.html?${searchParams.toString()}`;
    }

    nextBtn.addEventListener('click', () => {
        collectAnswers();
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            showResults();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
    
    document.querySelectorAll('input[name="budget"]').forEach(input => {
        input.addEventListener('input', (e) => {
            document.getElementById('budget-value').textContent = `$${parseInt(e.target.value).toLocaleString()}`;
        });
    });

    document.querySelectorAll('input[name="bedrooms"]').forEach(input => {
        input.addEventListener('input', (e) => {
            document.getElementById('bedrooms-value').textContent = `${e.target.value}+`;
        });
    });


    showStep(0);
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
