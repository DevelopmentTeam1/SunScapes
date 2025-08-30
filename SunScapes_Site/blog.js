const articles = [
  {
    slug: 'guide_to_buying_property',
    title: 'Complete Guide to Buying Property in BCS as a Foreigner',
    summary: 'Demystify the process of purchasing property in Mexico as a foreigner. This guide provides a clear, step-by-step roadmap, explaining concepts like the Fideicomiso and outlining the path to secure ownership in paradise.',
    filePath: 'data/articles/guide_to_buying_property.md'
  },
  {
    slug: 'la_paz_vs_cabo',
    title: 'La Paz vs Cabo: Ultimate Comparison 2025',
    summary: 'Choosing between the high-energy luxury of Los Cabos and the tranquil authenticity of La Paz? This ultimate comparison breaks down the vibe, real estate, lifestyle, and costs to help you find your perfect Baja match.',
    filePath: 'data/articles/la_paz_vs_cabo.md'
  },
  {
    slug: 'understanding_fideicomiso',
    title: 'Understanding Fideicomiso: A Foreigner’s Guide to the Mexican Property Trust',
    summary: 'A deep dive into the Fideicomiso, the secure bank trust that allows foreigners to own coastal property in Mexico. We bust common myths and explain why it\'s the gold standard for your real estate investment.',
    filePath: 'data/articles/understanding_fideicomiso.md'
  },
  {
    slug: 'top_10_todos_santos',
    title: 'The Insider’s Guide: Top 10 Beachfront Communities in Todos Santos',
    summary: 'Explore the magical coastline of Todos Santos. From the surf-centric vibes of Pescadero to the quiet seclusion of Las Tunas, discover the top 10 communities for beachfront and ocean-view living in this Pueblo Mágico.',
    filePath: 'data/articles/top_10_todos_santos.md'
  },
  {
    slug: 'bcs_market_forecast',
    title: 'BCS Property Market Forecast 2025-2030: An Investor’s Outlook',
    summary: 'An investor\'s outlook on the Baja California Sur property market through 2030. We analyze key trends, infrastructure growth, and strategic opportunities that will shape the future of this real estate powerhouse.',
    filePath: 'data/articles/bcs_market_forecast.md'
  }
];

const handleDarkMode = () => {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
    });
};

const initLucide = () => {
    if (window.lucide) {
        lucide.createIcons();
    }
};

const displayBlogList = () => {
    const container = document.getElementById('blog-list-container');
    if (!container) return;

    container.innerHTML = articles.map(article => `
        <div class="bg-white dark:bg-charcoal/80 rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
            <div class="p-6 flex-grow">
                <h2 class="font-display text-2xl font-bold mb-3">${article.title}</h2>
                <p class="text-charcoal/70 dark:text-sand-beige/70 mb-4 line-clamp-3">${article.summary}</p>
            </div>
            <div class="p-6 bg-sand-beige/50 dark:bg-charcoal/60">
                <a href="article.html?slug=${article.slug}" class="font-semibold text-ocean-blue dark:text-sunshine-orange hover:underline">Read More &rarr;</a>
            </div>
        </div>
    `).join('');
};

const displayArticle = async () => {
    const container = document.getElementById('article-container');
    if (!container) return;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (!slug) {
            throw new Error('No article specified.');
        }

        const article = articles.find(a => a.slug === slug);

        if (!article) {
            throw new Error('Article not found.');
        }

        document.title = `${article.title} | SunScapes Blog`;
        
        const response = await fetch(article.filePath);
        if (!response.ok) {
            throw new Error('Could not load article content.');
        }
        const markdown = await response.text();
        container.innerHTML = marked.parse(markdown);

    } catch (error) {
        container.innerHTML = `<h1 class="font-display text-3xl font-bold">Error</h1><p class="mt-4 text-lg">${error.message}</p><p>Please check the URL or go back to the blog home.</p>`;
    }
};


document.addEventListener('DOMContentLoaded', () => {
    handleDarkMode();
    initLucide();
    displayBlogList();
    displayArticle();
});
