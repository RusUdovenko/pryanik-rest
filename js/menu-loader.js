// menu-loader.js - загрузка меню на сайт из localStorage

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

function initMenuLoader() {
    console.log('Инициализация menu-loader');
    
    // Загружаем все меню при старте
    loadAllMenus();
    
    // Добавляем обработчики для вкладок
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
            
            // Обновляем фильтры для этой вкладки
            setTimeout(() => {
                updateFiltersForActiveTab();
            }, 50);
        });
    });
    
    // Обновляем фильтры для активной вкладки
    setTimeout(() => {
        updateFiltersForActiveTab();
    }, 100);
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
}

// Функция для сохранения оригинальных данных меню (на случай, если в localStorage пусто)
function saveOriginalMenuData() {
    if (!localStorage.getItem('menu_main_original')) {
        // Сохраняем оригинальное основное меню
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
    
    // Аналогично для детского и банкетного...
}

function mapCategoryFromKey(categoryKey, menuType) {
    if (menuType === 'main') {
        const map = {
            'burgers': 'Бургеры',
            'salads': 'Салаты',
            'appetizers': 'Закуски',
            'hot': 'Горячее',
            'drinks': 'Напитки'
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
    
    // Определяем категорию для data-category
    let categoryKey;
    if (menuType === 'main') {
        const map = {
            'Бургеры': 'burgers',
            'Салаты': 'salads',
            'Супы': 'soups', 
            'Закуски': 'appetizers',
            'Горячее': 'hot',
            'Напитки': 'drinks'
        };
        categoryKey = map[item.category] || 'burgers';
    } else if (menuType === 'kids') {
        const map = {
            'Салаты': 'kids-salads',
            'Супчики': 'kids-soups',
            'Горячее': 'kids-main',
            'Гарниры': 'kids-garnishes',
            'Овершейки': 'kids-overshake',
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
    
    const weightCalories = [];
    if (item.weight) weightCalories.push(`${item.weight} г`);
    if (item.calories) weightCalories.push(`${item.calories} ккал`);
    const weightCaloriesStr = weightCalories.join(' / ');
    
    // Формируем HTML
    let html = `
        <a href="#" class="menu-catalog-link" onclick="return false;">
            <div class="menu-catalog-img-wrapper">
                <div class="menu-catalog-img" style="background-image: url('${item.image || '../image/dishes/1.avif'}');"></div>
            </div>
            <div class="menu-catalog-info">
                <h3 class="menu-catalog-title">${escapeHtml(item.title)}</h3>`;
    
    if (weightCaloriesStr) {
        html += `<div class="menu-catalog-weight">${escapeHtml(weightCaloriesStr)}</div>`;
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
    
    // Добавляем обработчики
    newButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем active у всех кнопок
            newButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-cat');
            
            // Фильтруем элементы
            catalogItems.forEach(item => {
                if (category === 'all') {
                    item.style.display = 'block';
                } else {
                    const itemCategory = item.getAttribute('data-category');
                    item.style.display = itemCategory === category ? 'block' : 'none';
                }
            });
        });
    });
    
    // Активируем кнопку "Все"
    const allBtn = Array.from(newButtons).find(btn => btn.getAttribute('data-cat') === 'all');
    if (allBtn) {
        allBtn.classList.add('active');
    }
    
    // Показываем все элементы
    catalogItems.forEach(item => {
        item.style.display = 'block';
    });
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