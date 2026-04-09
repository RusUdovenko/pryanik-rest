// menu-loader.js - загрузка меню из Firebase

(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMenuLoader);
    } else {
        initMenuLoader();
    }
})();

let currentPage = {
    main: 1,
    kids: 1,
    banquet: 1
};
const itemsPerPage = 8;

// Порядок категорий для сортировки
const mainCategoryOrder = ['Завтраки', 'Закуски', 'Салаты', 'Супы', 'Паста', 'Горячее', 'Хлеб', 'Десерты', 'Напитки'];
const kidsCategoryOrder = ['Закуски', 'Салаты', 'Супы', 'Горячее', 'Напитки'];
const banquetCategoryOrder = ['Горячее', 'Закуски', 'Десерты'];

// Сохраняем все отсортированные блюда для каждой вкладки
let allSortedItems = {
    main: [],
    kids: [],
    banquet: []
};

// Активная категория для каждой вкладки
let activeCategory = {
    main: null,
    kids: null,
    banquet: null
};

function initMenuLoader() {
    if (typeof firebaseAPI === 'undefined') {
        setTimeout(initMenuLoader, 500);
        return;
    }
    
    loadAllMenus();
    setupTabListeners();
}

async function loadAllMenus() {
    showLoadingIndicators();
    
    try {
        const [mainData, kidsData, banquetData] = await Promise.all([
            firebaseAPI.getItems(COLLECTIONS.MAIN),
            firebaseAPI.getItems(COLLECTIONS.KIDS),
            firebaseAPI.getItems(COLLECTIONS.BANQUET)
        ]);
        
        // Сортируем и сохраняем все блюда
        allSortedItems.main = sortItemsByCategoryOrder(mainData, mainCategoryOrder);
        allSortedItems.kids = sortItemsByCategoryOrder(kidsData, kidsCategoryOrder);
        allSortedItems.banquet = sortItemsByCategoryOrder(banquetData, banquetCategoryOrder);
        
        // Настраиваем фильтры для каждой вкладки
        setupFiltersForTab('main');
        setupFiltersForTab('kids');
        setupFiltersForTab('banquet');
        
        // Показываем первую категорию для активной вкладки
        const activeTab = document.querySelector('.menu-tab-content.active');
        if (activeTab) {
            const menuType = activeTab.id.replace('tab-', '');
            showCategoryForTab(menuType, activeCategory[menuType]);
        }
        
        setupLoadMoreButtons();
        
    } catch (error) {
        showErrorMessage();
    }
}

function sortItemsByCategoryOrder(items, categoryOrder) {
    if (!items || items.length === 0) return items;
    
    return [...items].sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category);
        const indexB = categoryOrder.indexOf(b.category);
        
        const sortA = indexA === -1 ? 999 : indexA;
        const sortB = indexB === -1 ? 999 : indexB;
        
        if (sortA !== sortB) {
            return sortA - sortB;
        }
        
        return (a.id || 0) - (b.id || 0);
    });
}

function setupFiltersForTab(menuType) {
    const tabContent = document.getElementById(`tab-${menuType}`);
    if (!tabContent) return;
    
    const categoryButtons = tabContent.querySelectorAll('.menu-catalog-cat');
    if (categoryButtons.length === 0) return;
    
    // Находим первую категорию (не "Все")
    let firstCategory = null;
    let firstCategoryKey = null;
    
    for (let i = 0; i < categoryButtons.length; i++) {
        const catKey = categoryButtons[i].getAttribute('data-cat');
        if (catKey !== 'all') {
            firstCategory = categoryButtons[i];
            firstCategoryKey = catKey;
            break;
        }
    }
    
    // Сохраняем активную категорию
    activeCategory[menuType] = firstCategoryKey;
    
    // Добавляем обработчики на кнопки
    for (let i = 0; i < categoryButtons.length; i++) {
        const btn = categoryButtons[i];
        const newBtn = btn.cloneNode(true);
        if (btn.parentNode) {
            btn.parentNode.replaceChild(newBtn, btn);
        }
        
        newBtn.addEventListener('click', (function(menuTypeParam, categoryKey) {
            return function(e) {
                e.preventDefault();
                
                // Обновляем активную категорию
                activeCategory[menuTypeParam] = categoryKey;
                
                // Обновляем активный класс у кнопок
                const allBtns = document.querySelectorAll(`#tab-${menuTypeParam} .menu-catalog-cat`);
                for (let j = 0; j < allBtns.length; j++) {
                    allBtns[j].classList.remove('active');
                }
                this.classList.add('active');
                
                // Показываем выбранную категорию
                showCategoryForTab(menuTypeParam, categoryKey);
            };
        })(menuType, newBtn.getAttribute('data-cat')));
    }
    
    // Устанавливаем активный класс на первую кнопку
    if (firstCategory) {
        firstCategory.classList.add('active');
    }
}

function showCategoryForTab(menuType, categoryKey) {
    const tabContent = document.getElementById(`tab-${menuType}`);
    if (!tabContent) return;
    
    const catalogGrid = tabContent.querySelector('.menu-catalog-grid');
    const loadMoreDiv = tabContent.querySelector('.menu-catalog-loadmore');
    
    if (!catalogGrid) return;
    
    // Получаем все блюда для этого типа меню
    const allItems = allSortedItems[menuType];
    if (!allItems || allItems.length === 0) {
        catalogGrid.innerHTML = '<div class="empty-message" style="text-align: center; padding: 40px;">Нет блюд</div>';
        return;
    }
    
    // Фильтруем по категории
    let filteredItems = [];
    if (categoryKey === 'all') {
        filteredItems = [...allItems];
    } else {
        for (let i = 0; i < allItems.length; i++) {
            const itemCategoryKey = getCategoryKeyForFilter(allItems[i].category, menuType);
            if (itemCategoryKey === categoryKey) {
                filteredItems.push(allItems[i]);
            }
        }
    }
    
    // Сбрасываем пагинацию
    currentPage[menuType] = 1;
    
    // Рендерим отфильтрованные блюда
    renderFilteredItems(catalogGrid, filteredItems, menuType);
    
    // Обновляем кнопку "Загрузить еще"
    if (loadMoreDiv) {
        if (filteredItems.length > itemsPerPage) {
            loadMoreDiv.style.display = 'block';
        } else {
            loadMoreDiv.style.display = 'none';
        }
    }
}

function renderFilteredItems(catalogGrid, items, menuType) {
    if (!items || items.length === 0) {
        catalogGrid.innerHTML = '<div class="empty-message" style="text-align: center; padding: 40px;">Нет блюд в этой категории</div>';
        return;
    }
    
    catalogGrid.innerHTML = '';
    
    const end = currentPage[menuType] * itemsPerPage;
    const itemsToShow = items.slice(0, end);
    
    for (let i = 0; i < itemsToShow.length; i++) {
        const item = itemsToShow[i];
        const itemElement = createMenuItem(item, menuType);
        if (itemElement) {
            catalogGrid.appendChild(itemElement);
        }
    }
}

function loadMoreForTab(menuType) {
    const tabContent = document.getElementById(`tab-${menuType}`);
    if (!tabContent) return;
    
    const catalogGrid = tabContent.querySelector('.menu-catalog-grid');
    const loadMoreDiv = tabContent.querySelector('.menu-catalog-loadmore');
    
    if (!catalogGrid) return;
    
    // Получаем текущие отфильтрованные блюда
    const currentCategory = activeCategory[menuType];
    const allItems = allSortedItems[menuType];
    
    let filteredItems = [];
    if (currentCategory === 'all') {
        filteredItems = [...allItems];
    } else {
        for (let i = 0; i < allItems.length; i++) {
            const itemCategoryKey = getCategoryKeyForFilter(allItems[i].category, menuType);
            if (itemCategoryKey === currentCategory) {
                filteredItems.push(allItems[i]);
            }
        }
    }
    
    if (filteredItems.length === 0) return;
    
    currentPage[menuType]++;
    const end = currentPage[menuType] * itemsPerPage;
    const newItemsToShow = filteredItems.slice(0, end);
    
    // Обновляем грид
    catalogGrid.innerHTML = '';
    for (let i = 0; i < newItemsToShow.length; i++) {
        const item = newItemsToShow[i];
        const itemElement = createMenuItem(item, menuType);
        if (itemElement) {
            catalogGrid.appendChild(itemElement);
        }
    }
    
    // Скрываем кнопку если показаны все
    if (loadMoreDiv && filteredItems.length <= end) {
        loadMoreDiv.style.display = 'none';
    }
}

function createMenuItem(item, menuType) {
    const div = document.createElement('div');
    div.className = 'menu-catalog-item';
    
    let weightCaloriesStr = formatWeightCalories(item);
    let imageUrl = getImageUrl(item, menuType);
    
    let html = '<a href="#" class="menu-catalog-link" onclick="return false;">';
    html += '<div class="menu-catalog-img-wrapper">';
    html += '<div class="menu-catalog-img" style="background-image: url(\'' + imageUrl + '\'); background-color: #f0e8e0; background-size: cover; background-position: center;"></div>';
    html += '</div>';
    html += '<div class="menu-catalog-info">';
    html += '<h3 class="menu-catalog-title">' + escapeHtml(item.title) + '</h3>';
    
    if (weightCaloriesStr) {
        html += '<div class="menu-catalog-weight">' + weightCaloriesStr + '</div>';
    }
    
    if (item.description && item.description !== '') {
        html += '<div class="menu-catalog-desc">' + escapeHtml(item.description) + '</div>';
    }
    
    html += '<div class="menu-catalog-price">' + item.price + ' ₽</div>';
    html += '</div>';
    html += '</a>';
    
    div.innerHTML = html;
    return div;
}

function formatWeightCalories(item) {
    let result = '';
    
    if (item.calories_per_100 && item.calories_per_100 !== '') {
        if (item.weight && item.weight !== '') {
            result = item.weight + ' г / ' + item.calories_per_100 + ' ккал/100г';
        } else {
            result = item.calories_per_100 + ' ккал/100г';
        }
    } else if (item.calories && item.calories !== '') {
        if (item.weight && item.weight !== '') {
            result = item.weight + ' г / ' + item.calories + ' ккал';
        } else {
            result = item.calories + ' ккал';
        }
    } else if (item.weight && item.weight !== '') {
        result = item.weight + ' г';
    }
    
    return result;
}

function getImageUrl(item, menuType) {
    if (item.image && item.image !== '') {
        return item.image;
    }
    
    if (menuType === 'main') {
        return '';
    } else if (menuType === 'kids') {
        return '';
    } else {
        return '';
    }
}

function getCategoryKeyForFilter(category, menuType) {
    if (menuType === 'main') {
        if (category === 'Завтраки') return 'breakfast';
        if (category === 'Закуски') return 'appetizers';
        if (category === 'Салаты') return 'salads';
        if (category === 'Супы') return 'soups';
        if (category === 'Паста') return 'pasta';
        if (category === 'Горячее') return 'hot';
        if (category === 'Хлеб') return 'bread';
        if (category === 'Десерты') return 'desserts';
        if (category === 'Напитки') return 'drinks';
        return category;
    } else if (menuType === 'kids') {
        if (category === 'Закуски') return 'kids-appetizers';
        if (category === 'Салаты') return 'kids-salads';
        if (category === 'Супы') return 'kids-soups';
        if (category === 'Горячее') return 'kids-main';
        if (category === 'Напитки') return 'kids-drinks';
        return category;
    } else {
        if (category === 'Горячее') return 'banquet-hot';
        if (category === 'Закуски') return 'banquet-appetizers';
        if (category === 'Десерты') return 'banquet-desserts';
        return category;
    }
}

function setupTabListeners() {
    const tabs = document.querySelectorAll('.menu-main-tab');
    
    for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        
        tab.addEventListener('click', function(event) {
            event.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            for (let j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove('active');
            }
            this.classList.add('active');
            
            const allContents = document.querySelectorAll('.menu-tab-content');
            for (let j = 0; j < allContents.length; j++) {
                allContents[j].classList.remove('active');
            }
            
            const activeContent = document.getElementById('tab-' + tabId);
            if (activeContent) {
                activeContent.classList.add('active');
            }
            
            // Показываем сохраненную категорию для этой вкладки
            setTimeout(function() {
                showCategoryForTab(tabId, activeCategory[tabId]);
                updateLoadMoreButtonForTab(tabId);
            }, 50);
        });
    }
}

function updateLoadMoreButtonForTab(menuType) {
    const tabContent = document.getElementById(`tab-${menuType}`);
    if (!tabContent) return;
    
    const loadMoreDiv = tabContent.querySelector('.menu-catalog-loadmore');
    if (!loadMoreDiv) return;
    
    const currentCategory = activeCategory[menuType];
    const allItems = allSortedItems[menuType];
    
    let filteredItems = [];
    if (currentCategory === 'all') {
        filteredItems = [...allItems];
    } else {
        for (let i = 0; i < allItems.length; i++) {
            const itemCategoryKey = getCategoryKeyForFilter(allItems[i].category, menuType);
            if (itemCategoryKey === currentCategory) {
                filteredItems.push(allItems[i]);
            }
        }
    }
    
    if (filteredItems.length > currentPage[menuType] * itemsPerPage) {
        loadMoreDiv.style.display = 'block';
    } else {
        loadMoreDiv.style.display = 'none';
    }
}

function setupLoadMoreButtons() {
    const oldButtons = document.querySelectorAll('.menu-catalog-loadmore-btn');
    
    for (let i = 0; i < oldButtons.length; i++) {
        const btn = oldButtons[i];
        const newBtn = btn.cloneNode(true);
        if (btn.parentNode) {
            btn.parentNode.replaceChild(newBtn, btn);
        }
    }
    
    const newButtons = document.querySelectorAll('.menu-catalog-loadmore-btn');
    
    for (let i = 0; i < newButtons.length; i++) {
        const btn = newButtons[i];
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tabContent = this.closest('.menu-tab-content');
            if (!tabContent) return;
            
            if (tabContent.id === 'tab-main') {
                loadMoreForTab('main');
            } else if (tabContent.id === 'tab-kids') {
                loadMoreForTab('kids');
            } else if (tabContent.id === 'tab-banquet') {
                loadMoreForTab('banquet');
            }
        });
    }
}

function showLoadingIndicators() {
    const grids = document.querySelectorAll('.menu-catalog-grid');
    
    for (let i = 0; i < grids.length; i++) {
        const grid = grids[i];
        if (grid && grid.children.length === 0) {
            grid.innerHTML = '<div class="loading-message" style="text-align: center; padding: 40px;"></div>';
        }
    }
}

function showErrorMessage() {
    const grids = document.querySelectorAll('.menu-catalog-grid');
    
    for (let i = 0; i < grids.length; i++) {
        const grid = grids[i];
        if (grid && grid.innerHTML.indexOf('Загрузка') !== -1) {
            grid.innerHTML = '<div class="error-message" style="text-align: center; padding: 40px; color: #dc3545;">Ошибка загрузки меню. Пожалуйста, обновите страницу.</div>';
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.refreshMenu = function() {
    loadAllMenus();
};