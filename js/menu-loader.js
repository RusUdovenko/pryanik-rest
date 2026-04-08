// menu-loader.js - загрузка меню с сервера

(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMenuLoader);
    } else {
        initMenuLoader();
    }
})();

const API_URL = 'api.php';
let currentPage = { main: 1, kids: 1, banquet: 1 };
const itemsPerPage = 8;

async function initMenuLoader() {
    console.log('Инициализация menu-loader');
    await loadAllMenus();
    setupTabListeners();
}

async function loadAllMenus() {
    console.log('Загрузка всех меню с сервера');
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        
        // Сохраняем в localStorage как кеш
        if (data.main) localStorage.setItem('menu_main', JSON.stringify(data.main));
        if (data.kids) localStorage.setItem('menu_kids', JSON.stringify(data.kids));
        if (data.banquet) localStorage.setItem('menu_banquet', JSON.stringify(data.banquet));
        
        // Загружаем на страницу
        if (data.main && data.main.length > 0) {
            loadMenuToPage('main', data.main);
        } else {
            loadMenuToPage('main', getDefaultMainMenu());
        }
        
        if (data.kids && data.kids.length > 0) {
            loadMenuToPage('kids', data.kids);
        } else {
            loadMenuToPage('kids', getDefaultKidsMenu());
        }
        
        if (data.banquet && data.banquet.length > 0) {
            loadMenuToPage('banquet', data.banquet);
        } else {
            loadMenuToPage('banquet', getDefaultBanquetMenu());
        }
        
        // Применяем пагинацию
        setTimeout(() => {
            resetPaginationForTab('main');
            resetPaginationForTab('kids');
            resetPaginationForTab('banquet');
            updateFiltersForActiveTab();
        }, 200);
        
    } catch (error) {
        console.error('Ошибка загрузки с сервера:', error);
        loadFromLocalStorage();
    }
}

function getDefaultMainMenu() {
    return [
        { id: 1, category: 'Закуски', title: 'Мини-бургер', weight: '180', calories: '245', description: 'Говяжья котлета, сыр чеддер, помидор, салат айсберг, соус барбекю', price: 390, image: '../image/dishes/mini-burger.avif' },
        { id: 2, category: 'Закуски', title: 'Мини-пицца', weight: '250', calories: '220', description: 'Мини-пицца с сыром и томатами', price: 450, image: '../image/dishes/mini-pizza.avif' },
        { id: 3, category: 'Салаты', title: 'Салат с индейкой су-вид', weight: '200', calories: '250', description: 'микс салата, редис, моцарелла, черри, индейка, медово-горчичная заправка', price: 490, image: '../image/dishes/turkey-salad.avif' }
    ];
}

function getDefaultKidsMenu() {
    return [
        { id: 101, category: 'Закуски', title: 'Пальчики из лаваша с сыром', weight: '120', calories: '180', description: 'Хрустящие пальчики из лаваша с расплавленным сыром', price: 190, image: '../image/kids/cheese-fingers.avif' },
        { id: 102, category: 'Закуски', title: 'Овощные палочки с соусом', weight: '100', calories: '70', description: 'Свежие овощи с нежным йогуртовым соусом', price: 150, image: '../image/kids/veg-sticks.avif' }
    ];
}

function getDefaultBanquetMenu() {
    return [
        { id: 201, category: 'Горячее', title: 'Буженина гриль под соусом демигляс', weight: '300', calories: '65.3', description: 'Свиная буженина с картофелем айдахо, соус демигляс', price: 600, image: '../image/banquet/buzhenina.jpg' },
        { id: 202, category: 'Горячее', title: 'Запеченная куриная грудка', weight: '300', calories: '158.4', description: 'Куриное филе с овощами гриль, соус песто', price: 560, image: '../image/banquet/chicken.jpg' }
    ];
}

function loadFromLocalStorage() {
    const mainSaved = localStorage.getItem('menu_main');
    const kidsSaved = localStorage.getItem('menu_kids');
    const banquetSaved = localStorage.getItem('menu_banquet');
    
    if (mainSaved) loadMenuToPage('main', JSON.parse(mainSaved));
    else loadMenuToPage('main', getDefaultMainMenu());
    
    if (kidsSaved) loadMenuToPage('kids', JSON.parse(kidsSaved));
    else loadMenuToPage('kids', getDefaultKidsMenu());
    
    if (banquetSaved) loadMenuToPage('banquet', JSON.parse(banquetSaved));
    else loadMenuToPage('banquet', getDefaultBanquetMenu());
}

function loadMenuToPage(menuType, items) {
    const selector = `#tab-${menuType} .menu-catalog-grid`;
    const catalogGrid = document.querySelector(selector);
    
    if (!catalogGrid) {
        console.log(`Сетка для ${menuType} не найдена`);
        return;
    }
    
    catalogGrid.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = createMenuItem(item, menuType);
        if (itemElement) {
            catalogGrid.appendChild(itemElement);
        }
    });
}

function createMenuItem(item, menuType) {
    const div = document.createElement('div');
    div.className = 'menu-catalog-item animate-on-scroll';
    
    // Определяем категорию для data-category
    let categoryKey = item.category;
    if (menuType === 'main') {
        const map = {
            'Закуски': 'appetizers',
            'Салаты': 'salads',
            'Горячее': 'hot',
            'Напитки': 'drinks'
        };
        categoryKey = map[item.category] || item.category;
    } else if (menuType === 'kids') {
        const map = {
            'Закуски': 'kids-appetizers',
            'Салаты': 'kids-salads',
            'Супы': 'kids-soups',
            'Горячее': 'kids-main',
            'Напитки': 'kids-drinks'
        };
        categoryKey = map[item.category] || item.category;
    } else if (menuType === 'banquet') {
        const map = {
            'Горячее': 'banquet-hot',
            'Закуски': 'banquet-appetizers',
            'Десерты': 'banquet-desserts'
        };
        categoryKey = map[item.category] || item.category;
    }
    
    div.setAttribute('data-category', categoryKey);
    
    let weightCaloriesStr = '';
    if (item.weight) {
        if (item.calories_per_100) {
            weightCaloriesStr = `${item.weight} г / ${item.calories_per_100} ккал/100г`;
        } else if (item.calories) {
            weightCaloriesStr = `${item.weight} г / ${item.calories} ккал`;
        } else {
            weightCaloriesStr = `${item.weight} г`;
        }
    } else if (item.calories) {
        weightCaloriesStr = `${item.calories} ккал`;
    }
    
    const imagePath = item.image || '../image/dishes/1.avif';
    
    div.innerHTML = `
        <a href="#" class="menu-catalog-link" onclick="return false;">
            <div class="menu-catalog-img-wrapper">
                <div class="menu-catalog-img" style="background-image: url('${imagePath}'); background-color: #f0e8e0;"></div>
            </div>
            <div class="menu-catalog-info">
                <h3 class="menu-catalog-title">${escapeHtml(item.title)}</h3>
                ${weightCaloriesStr ? `<div class="menu-catalog-weight">${weightCaloriesStr}</div>` : ''}
                ${item.description ? `<div class="menu-catalog-desc">${escapeHtml(item.description)}</div>` : ''}
                <div class="menu-catalog-price">${item.price} ₽</div>
            </div>
        </a>
    `;
    
    return div;
}

function setupTabListeners() {
    const tabs = document.querySelectorAll('.menu-main-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.dataset.tab;
            document.querySelectorAll('.menu-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            setTimeout(() => {
                resetPaginationForTab(tabId);
                updateFiltersForActiveTab();
            }, 100);
        });
    });
}

function resetPaginationForTab(menuType) {
    currentPage[menuType] = 1;
    
    const container = document.querySelector(`#tab-${menuType}`);
    if (!container) return;
    
    const items = container.querySelectorAll('.menu-catalog-item');
    items.forEach((item, index) => {
        item.style.display = index < itemsPerPage ? 'block' : 'none';
    });
    
    updateLoadMoreButton(menuType);
}

function updateLoadMoreButton(menuType) {
    const container = document.querySelector(`#tab-${menuType}`);
    const loadMoreContainer = container?.querySelector('.menu-catalog-loadmore');
    
    if (!container || !loadMoreContainer) return;
    
    const items = container.querySelectorAll('.menu-catalog-item');
    const totalItems = items.length;
    
    if (totalItems > currentPage[menuType] * itemsPerPage) {
        loadMoreContainer.style.display = 'block';
        setupLoadMoreButton(menuType);
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

function setupLoadMoreButton(menuType) {
    const container = document.querySelector(`#tab-${menuType}`);
    const loadMoreBtn = container?.querySelector('.menu-catalog-loadmore-btn');
    
    if (loadMoreBtn) {
        const newBtn = loadMoreBtn.cloneNode(true);
        loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadMoreForTab(menuType);
        });
    }
}

function loadMoreForTab(menuType) {
    const container = document.querySelector(`#tab-${menuType}`);
    if (!container) return;
    
    const items = container.querySelectorAll('.menu-catalog-item');
    if (items.length === 0) return;
    
    currentPage[menuType]++;
    
    const end = currentPage[menuType] * itemsPerPage;
    items.forEach((item, index) => {
        if (index < end) item.style.display = 'block';
    });
    
    updateLoadMoreButton(menuType);
}

function updateFiltersForActiveTab() {
    const activeTab = document.querySelector('.menu-tab-content.active');
    if (!activeTab) return;
    
    const categoryButtons = activeTab.querySelectorAll('.menu-catalog-cat');
    const catalogItems = activeTab.querySelectorAll('.menu-catalog-item');
    const loadMoreDiv = activeTab.querySelector('.menu-catalog-loadmore');
    
    if (!categoryButtons.length) return;
    
    // Клонируем кнопки для обновления обработчиков
    categoryButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    const newButtons = activeTab.querySelectorAll('.menu-catalog-cat');
    
    function applyFilterAndPagination(selectedCategory) {
        catalogItems.forEach(item => item.style.display = 'none');
        
        let itemsToShow = [];
        if (selectedCategory === 'all') {
            itemsToShow = Array.from(catalogItems);
        } else {
            itemsToShow = Array.from(catalogItems).filter(item => 
                item.getAttribute('data-category') === selectedCategory
            );
        }
        
        const perPage = 8;
        itemsToShow.forEach((item, index) => {
            if (index < perPage) item.style.display = 'block';
        });
        
        if (loadMoreDiv) {
            if (itemsToShow.length > perPage) {
                loadMoreDiv.style.display = 'block';
                const loadMoreBtn = loadMoreDiv.querySelector('.menu-catalog-loadmore-btn');
                if (loadMoreBtn) {
                    const newLoadMoreBtn = loadMoreBtn.cloneNode(true);
                    loadMoreBtn.parentNode.replaceChild(newLoadMoreBtn, loadMoreBtn);
                    
                    newLoadMoreBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const currentlyVisible = itemsToShow.filter(item => item.style.display === 'block').length;
                        for (let i = currentlyVisible; i < currentlyVisible + perPage; i++) {
                            if (itemsToShow[i]) itemsToShow[i].style.display = 'block';
                        }
                        const newVisibleCount = itemsToShow.filter(item => item.style.display === 'block').length;
                        if (newVisibleCount >= itemsToShow.length) loadMoreDiv.style.display = 'none';
                    });
                }
            } else {
                loadMoreDiv.style.display = 'none';
            }
        }
    }
    
    newButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            newButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilterAndPagination(btn.getAttribute('data-cat'));
        });
    });
    
    // Активируем первую категорию
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

// Обновление в реальном времени (каждые 5 секунд)
setInterval(async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const lastUpdate = localStorage.getItem('menu_last_update_server');
        
        if (data.lastUpdate && data.lastUpdate !== lastUpdate) {
            localStorage.setItem('menu_last_update_server', data.lastUpdate);
            await loadAllMenus();
            console.log('Меню обновлено с сервера');
        }
    } catch (error) {
        console.error('Polling error:', error);
    }
}, 5000);

window.refreshMenu = loadAllMenus;