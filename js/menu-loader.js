// menu-loader.js - загрузка меню на сайт из localStorage с кнопкой "Загрузить еще"

(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMenuLoader);
    } else {
        initMenuLoader();
    }
    
    // Слушаем изменения в localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'menu_last_update') {
            console.log('Обновление меню из localStorage');
            loadAllMenus();
        }
    });
})();

// Глобальные переменные для пагинации
let currentPage = {
    main: 1,
    kids: 1,
    banquet: 1
};
const itemsPerPage = 8;

function initMenuLoader() {
    console.log('Инициализация menu-loader');
    
    // Загружаем все меню при старте
    loadAllMenus();
    
    // Добавляем обработчики для вкладок
    setupTabListeners();
    
    // Добавляем обработчики для кнопок загрузки
    setupLoadMoreButtons();
}

function setupTabListeners() {
    const tabs = document.querySelectorAll('.menu-main-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            console.log('Переключение вкладки на:', this.dataset.tab);
            
            // Убираем active у всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Скрываем/показываем контент вкладок
            const tabId = this.dataset.tab;
            document.querySelectorAll('.menu-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Сбрасываем пагинацию для этой вкладки
            setTimeout(() => {
                resetPaginationForTab(tabId);
                updateFiltersForActiveTab();
            }, 100);
        });
    });
}

function setupLoadMoreButtons() {
    // Удаляем старые обработчики
    const oldButtons = document.querySelectorAll('.menu-catalog-loadmore-btn');
    oldButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // Добавляем новые
    document.querySelectorAll('.menu-catalog-loadmore-btn').forEach(btn => {
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
    });
}

function resetPaginationForTab(menuType) {
    currentPage[menuType] = 1;
    
    const container = document.querySelector(`#tab-${menuType}`);
    if (!container) return;
    
    const items = container.querySelectorAll('.menu-catalog-item');
    items.forEach((item, index) => {
        if (index < itemsPerPage) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    updateLoadMoreButton(menuType);
}

function loadMoreForTab(menuType) {
    const container = document.querySelector(`#tab-${menuType}`);
    if (!container) return;
    
    const items = container.querySelectorAll('.menu-catalog-item');
    if (items.length === 0) return;
    
    currentPage[menuType]++;
    
    const end = currentPage[menuType] * itemsPerPage;
    
    items.forEach((item, index) => {
        if (index < end) {
            item.style.display = 'block';
        }
    });
    
    updateLoadMoreButton(menuType);
    
    // Обновляем фильтры после загрузки
    setTimeout(() => {
        updateFiltersForActiveTab();
    }, 50);
}

function updateLoadMoreButton(menuType) {
    const container = document.querySelector(`#tab-${menuType}`);
    const loadMoreContainer = container?.querySelector('.menu-catalog-loadmore');
    
    if (!container || !loadMoreContainer) return;
    
    const items = container.querySelectorAll('.menu-catalog-item');
    const totalItems = items.length;
    
    if (totalItems > currentPage[menuType] * itemsPerPage) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

function loadAllMenus() {
    console.log('Загрузка всех меню');
    
    // Сохраняем оригинальные данные меню как резерв
    saveOriginalMenuData();
    
    // Загружаем основное меню
    loadMenuToPage('main', '#tab-main .menu-catalog-grid');
    
    // Загружаем детское меню
    loadMenuToPage('kids', '#tab-kids .menu-catalog-grid');
    
    // Загружаем банкетное меню
    loadMenuToPage('banquet', '#tab-banquet .menu-catalog-grid');
    
    // После загрузки применяем пагинацию
    setTimeout(() => {
        resetPaginationForTab('main');
        resetPaginationForTab('kids');
        resetPaginationForTab('banquet');
        updateFiltersForActiveTab();
    }, 200);
}

// Функция для сохранения оригинальных данных меню (на случай, если в localStorage пусто)
function saveOriginalMenuData() {
    // Сохраняем оригинальное основное меню
    if (!localStorage.getItem('menu_main_original')) {
        const mainItems = [];
        document.querySelectorAll('#tab-main .menu-catalog-item').forEach(item => {
            const title = item.querySelector('.menu-catalog-title')?.textContent || '';
            const category = item.getAttribute('data-category') || '';
            const weightEl = item.querySelector('.menu-catalog-weight');
            const descEl = item.querySelector('.menu-catalog-desc');
            const priceEl = item.querySelector('.menu-catalog-price');
            const imgEl = item.querySelector('.menu-catalog-img');
            
            let weight = '', calories = '';
            if (weightEl) {
                const weightText = weightEl.textContent;
                const weightMatch = weightText.match(/(\d+)\s*г/);
                const caloriesMatch = weightText.match(/(\d+(?:[.,]\d+)?)\s*ккал/);
                if (weightMatch) weight = weightMatch[1];
                if (caloriesMatch) calories = caloriesMatch[1].replace(',', '.');
            }
            
            let image = '';
            if (imgEl) {
                const bgImage = imgEl.style.backgroundImage;
                const match = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (match) image = match[1];
            }
            
            mainItems.push({
                id: mainItems.length + 1,
                title: title,
                category: mapCategoryFromKey(category, 'main'),
                weight: weight,
                calories: calories,
                description: descEl ? descEl.textContent : '',
                price: priceEl ? parseInt(priceEl.textContent) : 0,
                image: image || '../image/dishes/1.avif'
            });
        });
        
        if (mainItems.length > 0) {
            localStorage.setItem('menu_main_original', JSON.stringify(mainItems));
        }
    }
    
    // Сохраняем оригинальное детское меню
    if (!localStorage.getItem('menu_kids_original')) {
        const kidsItems = [];
        document.querySelectorAll('#tab-kids .menu-catalog-item').forEach(item => {
            const title = item.querySelector('.menu-catalog-title')?.textContent || '';
            const category = item.getAttribute('data-category') || '';
            const weightEl = item.querySelector('.menu-catalog-weight');
            const descEl = item.querySelector('.menu-catalog-desc');
            const priceEl = item.querySelector('.menu-catalog-price');
            const imgEl = item.querySelector('.menu-catalog-img');
            
            let weight = '', calories = '';
            if (weightEl) {
                const weightText = weightEl.textContent;
                const weightMatch = weightText.match(/(\d+)\s*г/);
                const caloriesMatch = weightText.match(/(\d+(?:[.,]\d+)?)\s*ккал/);
                if (weightMatch) weight = weightMatch[1];
                if (caloriesMatch) calories = caloriesMatch[1].replace(',', '.');
            }
            
            let image = '';
            if (imgEl) {
                const bgImage = imgEl.style.backgroundImage;
                const match = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (match) image = match[1];
            }
            
            kidsItems.push({
                id: 101 + kidsItems.length,
                title: title,
                category: mapCategoryFromKey(category, 'kids'),
                weight: weight,
                calories: calories,
                description: descEl ? descEl.textContent : '',
                price: priceEl ? parseInt(priceEl.textContent) : 0,
                image: image || '../image/dishes/1.avif'
            });
        });
        
        if (kidsItems.length > 0) {
            localStorage.setItem('menu_kids_original', JSON.stringify(kidsItems));
        }
    }
    
    // Сохраняем оригинальное банкетное меню
    if (!localStorage.getItem('menu_banquet_original')) {
        const banquetItems = [];
        document.querySelectorAll('#tab-banquet .menu-catalog-item').forEach(item => {
            const title = item.querySelector('.menu-catalog-title')?.textContent || '';
            const category = item.getAttribute('data-category') || '';
            const weightEl = item.querySelector('.menu-catalog-weight');
            const descEl = item.querySelector('.menu-catalog-desc');
            const priceEl = item.querySelector('.menu-catalog-price');
            const imgEl = item.querySelector('.menu-catalog-img');
            
            let weight = '', calories = '';
            if (weightEl) {
                const weightText = weightEl.textContent;
                const weightMatch = weightText.match(/(\d+)\s*г/);
                const caloriesMatch = weightText.match(/(\d+(?:[.,]\d+)?)\s*ккал/);
                if (weightMatch) weight = weightMatch[1];
                if (caloriesMatch) calories = caloriesMatch[1].replace(',', '.');
            }
            
            let image = '';
            if (imgEl) {
                const bgImage = imgEl.style.backgroundImage;
                const match = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (match) image = match[1];
            }
            
            banquetItems.push({
                id: 201 + banquetItems.length,
                title: title,
                category: mapCategoryFromKey(category, 'banquet'),
                weight: weight,
                calories: calories,
                description: descEl ? descEl.textContent : '',
                price: priceEl ? parseInt(priceEl.textContent) : 0,
                image: image || '../image/banquet/buzhenina.jpg'
            });
        });
        
        if (banquetItems.length > 0) {
            localStorage.setItem('menu_banquet_original', JSON.stringify(banquetItems));
        }
    }
}

function mapCategoryFromKey(categoryKey, menuType) {
    if (menuType === 'main') {
        const map = {
            'Завтраки': 'breakfast',
            'Закуски': 'appetizers',
            'Салаты': 'salads',
            'Супы': 'soups',
            'Паста': 'pasta',
            'Горячее': 'hot',
            'Хлеб': 'bread',
            'Десерты': 'desserts',
            'Напитки': 'drinks'
        };
        return map[categoryKey] || categoryKey;
    } else if (menuType === 'kids') {
        const map = {
            'Закуски': 'kids-appetizers',   
            'Салаты': 'kids-salads',
            'Супы': 'kids-soups',              
            'Горячее': 'kids-main',
            'Напитки': 'kids-drinks' 
        };
        return map[categoryKey] || categoryKey;
    } else if (menuType === 'banquet') {
        const map = {
            'Горячее': 'banquet-hot',
            'Закуски': 'banquet-appetizers',
            'Десерты': 'banquet-desserts'
        };
        return map[categoryKey] || categoryKey;
    }
    return categoryKey;
}

function loadMenuToPage(menuType, selector) {
    const savedData = localStorage.getItem(`menu_${menuType}`);
    const catalogGrid = document.querySelector(selector);
    
    if (!catalogGrid) {
        console.log(`Сетка для ${menuType} не найдена`);
        return;
    }
    
    console.log(`Загрузка ${menuType} меню, данных:`, savedData ? 'есть' : 'нет');
    
    try {
        let items;
        
        if (savedData) {
            // Используем данные из localStorage
            items = JSON.parse(savedData);
            console.log(`Загружено ${items.length} позиций для ${menuType} из localStorage`);
        } else {
            // Если в localStorage пусто, берем из оригинального сохраненного меню
            const originalData = localStorage.getItem(`menu_${menuType}_original`);
            if (originalData) {
                items = JSON.parse(originalData);
                console.log(`Загружено ${items.length} позиций для ${menuType} из оригинальных данных`);
            } else {
                console.log(`Нет данных для ${menuType}`);
                return;
            }
        }
        
        // Очищаем сетку
        catalogGrid.innerHTML = '';
        
        // Создаем элементы меню
        items.forEach(item => {
            const itemElement = createMenuItem(item, menuType);
            if (itemElement) {
                catalogGrid.appendChild(itemElement);
            }
        });
        
        console.log(`Создано ${items.length} элементов для ${menuType}`);
        
    } catch (e) {
        console.error(`Ошибка загрузки ${menuType} меню:`, e);
    }
}

function createMenuItem(item, menuType) {
    const div = document.createElement('div');
    div.className = 'menu-catalog-item animate-on-scroll';
    
    let categoryKey;
    if (menuType === 'main') {
        const map = {
            'Завтраки': 'breakfast',
            'Закуски': 'appetizers',
            'Салаты': 'salads',
            'Супы': 'soups',
            'Паста': 'pasta',
            'Горячее': 'hot',
            'Хлеб': 'bread',
            'Десерты': 'desserts',
            'Напитки': 'drinks'
        };
        categoryKey = map[item.category] || 'breakfast';
    } else if (menuType === 'kids') {
        const map = {
            'Закуски': 'kids-appetizers',      
            'Салаты': 'kids-salads',
            'Супы': 'kids-soups',              
            'Горячее': 'kids-main',
            'Напитки': 'kids-drinks' 
        };
        categoryKey = map[item.category] || 'kids-salads';
    } else {
        const map = {
            'Горячее': 'banquet-hot',
            'Закуски': 'banquet-appetizers',
            'Десерты': 'banquet-desserts'
        };
        categoryKey = map[item.category] || 'banquet-hot';
    }
    
    div.setAttribute('data-category', categoryKey);
    
    // ИСПРАВЛЕНИЕ: правильно формируем строку с весом и калориями
    let weightCaloriesStr = '';
    
    if (item.weight) {
        if (item.calories_per_100) {
            // Если есть калории на 100г
            weightCaloriesStr = `${item.weight} г / ${item.calories_per_100} ккал/100г`;
        } else if (item.calories) {
            // Если есть калории на порцию
            weightCaloriesStr = `${item.weight} г / ${item.calories} ккал`;
        } else {
            // Только вес
            weightCaloriesStr = `${item.weight} г`;
        }
    } else if (item.calories) {
        // Только калории (если нет веса)
        weightCaloriesStr = `${item.calories} ккал`;
    }
    
    // Формируем HTML
    let html = `
        <a href="#" class="menu-catalog-link" onclick="return false;">
            <div class="menu-catalog-img-wrapper">
                <div class="menu-catalog-img" style="background-image: url('${item.image}'); background-color: #f0e8e0;"></div>
            </div>
            <div class="menu-catalog-info">
                <h3 class="menu-catalog-title">${escapeHtml(item.title)}</h3>`;
    
    if (weightCaloriesStr) {
        html += `<div class="menu-catalog-weight">${weightCaloriesStr}</div>`;
    }
    
    if (item.description) {
        html += `<div class="menu-catalog-desc">${escapeHtml(item.description)}</div>`;
    }
    
    html += `<div class="menu-catalog-price">${item.price} ₽</div>
            </div>
        </a>
    `;
    
    div.innerHTML = html;
    return div;
}

function updateFiltersForActiveTab() {
    // Определяем активную вкладку
    const activeTab = document.querySelector('.menu-tab-content.active');
    if (!activeTab) return;
    
    const tabId = activeTab.id; // tab-main, tab-kids, tab-banquet
    
    const categoryButtons = activeTab.querySelectorAll('.menu-catalog-cat');
    const catalogItems = activeTab.querySelectorAll('.menu-catalog-item');
    const loadMoreDiv = activeTab.querySelector('.menu-catalog-loadmore');
    
    if (!categoryButtons.length || !catalogItems.length) {
        console.log('Нет кнопок или элементов для фильтрации');
        return;
    }
    
    console.log(`Обновление фильтров для ${tabId}, найдено ${categoryButtons.length} кнопок, ${catalogItems.length} элементов`);
    
    // Удаляем старые обработчики (клонируем кнопки)
    categoryButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // Получаем новые кнопки
    const newButtons = activeTab.querySelectorAll('.menu-catalog-cat');
    
    // Функция для применения фильтра и пагинации
    function applyFilterAndPagination(selectedCategory) {
        // Сначала скрываем все элементы
        catalogItems.forEach(item => item.style.display = 'none');
        
        // Находим элементы выбранной категории
        let itemsToShow = [];
        if (selectedCategory === 'all') {
            itemsToShow = Array.from(catalogItems);
        } else {
            itemsToShow = Array.from(catalogItems).filter(item => 
                item.getAttribute('data-category') === selectedCategory
            );
        }
        
        // Применяем пагинацию (показываем первые 8)
        const itemsPerPage = 8;
        itemsToShow.forEach((item, index) => {
            if (index < itemsPerPage) {
                item.style.display = 'block';
            }
        });
        
        // Обновляем кнопку "Загрузить еще"
        if (loadMoreDiv) {
            if (itemsToShow.length > itemsPerPage) {
                loadMoreDiv.style.display = 'block';
                // Обновляем обработчик кнопки для этой категории
                const loadMoreBtn = loadMoreDiv.querySelector('.menu-catalog-loadmore-btn');
                if (loadMoreBtn) {
                    const newLoadMoreBtn = loadMoreBtn.cloneNode(true);
                    loadMoreBtn.parentNode.replaceChild(newLoadMoreBtn, loadMoreBtn);
                    
                    newLoadMoreBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Считаем, сколько уже показано
                        const currentlyVisible = itemsToShow.filter(item => item.style.display === 'block').length;
                        
                        // Показываем следующие 8
                        for (let i = currentlyVisible; i < currentlyVisible + itemsPerPage; i++) {
                            if (itemsToShow[i]) {
                                itemsToShow[i].style.display = 'block';
                            }
                        }
                        
                        // Проверяем, остались ли еще скрытые
                        const newVisibleCount = itemsToShow.filter(item => item.style.display === 'block').length;
                        if (newVisibleCount >= itemsToShow.length) {
                            loadMoreDiv.style.display = 'none';
                        }
                    });
                }
            } else {
                loadMoreDiv.style.display = 'none';
            }
        }
    }
    
    // Добавляем обработчики на кнопки фильтров
    newButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем active у всех кнопок
            newButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-cat');
            applyFilterAndPagination(category);
        });
    });
    
    // // Активируем кнопку "Все" и применяем фильтр
    // const allBtn = Array.from(newButtons).find(btn => btn.getAttribute('data-cat') === 'all');
    // if (allBtn) {
    //     allBtn.classList.add('active');
    //     applyFilterAndPagination('all');
    // }

        const firstBtn = Array.from(newButtons).find(btn => btn.getAttribute('data-cat') !== 'all');
    if (firstBtn) {
        firstBtn.classList.add('active');
        applyFilterAndPagination(firstBtn.getAttribute('data-cat'));
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

// Функция для принудительного обновления (можно вызвать из консоли для теста)
window.refreshMenu = function() {
    loadAllMenus();
    updateFiltersForActiveTab();
};