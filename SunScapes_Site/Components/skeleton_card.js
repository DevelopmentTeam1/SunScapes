export function createSkeletonCard() {
    return `
    <div class="bg-white dark:bg-charcoal rounded-xl shadow-lg overflow-hidden">
        <div class="w-full h-56 bg-gray-200 dark:bg-gray-700 shimmer"></div>
        <div class="p-6">
            <div class="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded shimmer mb-2"></div>
            <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded shimmer mb-4"></div>
            <div class="flex justify-between items-center mt-4">
                <div class="flex space-x-4">
                    <div class="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                    <div class="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                    <div class="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                </div>
            </div>
            <div class="mt-6">
                <div class="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
            </div>
        </div>
    </div>
    `;
}
