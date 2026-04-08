// ========== ПРОВЕРКА АВТОРИЗАЦИИ ==========
if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// ========== API КОНФИГУРАЦИЯ ==========
const API_URL = 'api.php';

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentTab = 'main';
let currentCategoryFilter = 'all';
let mainItems = [];
let kidsItems = [];
let banquetItems = [];
let deleteId = null;

// Категории для каждого меню
let categories = {
    main: ['Закуски', 'Салаты', 'Горячее', 'Напитки'],
    kids: ['Закуски', 'Салаты', 'Супы', 'Горячее', 'Напитки'],
    banquet: ['Горячее', 'Закуски', 'Десерты']
};

// ========== ДЕФОЛТНЫЕ ДАННЫЕ ==========
function getDefaultMainMenu() {
    return [
        { id: 1, category: 'Закуски', title: 'Мини-бургер', weight: '180', calories: '245', description: 'Говяжья котлета, сыр чеддер, помидор, салат айсберг, соус барбекю', price: 390, image: '' },
        { id: 2, category: 'Закуски', title: 'Мини-пицца', weight: '250', calories: '220', description: 'Мини-пицца с сыром и томатами', price: 450, image: '' },
        { id: 3, category: 'Салаты', title: 'Салат с индейкой су-вид', weight: '200', calories: '250', description: 'микс салата, редис, моцарелла, черри, индейка, медово-горчичная заправка', price: 490, image: '' },
        { id: 4, category: 'Салаты', title: 'Салат цезарь с курицей', weight: '220', calories: '240', description: 'Куриное филе, салат романо, пармезан, помидоры черри, гренки, соус цезарь', price: 520, image: '' },
        { id: 5, category: 'Салаты', title: 'Греческий салат', weight: '210', calories: '180', description: 'Огурцы, помидоры, перец болгарский, красный лук, маслины, сыр фета, оливковое масло', price: 450, image: '' },
        { id: 6, category: 'Закуски', title: 'Брускетта с томатами и моцареллой', weight: '150', calories: '180', description: 'Хлеб чиабатта, томаты, моцарелла, базилик, оливковое масло, бальзамик', price: 320, image: '' },
        { id: 7, category: 'Закуски', title: 'Сырная тарелка', weight: '200', calories: '320', description: 'Пармезан, моцарелла, горгонзола, мед, орехи, виноград', price: 590, image: '' },
        { id: 8, category: 'Горячее', title: 'Паста с морепродуктами', weight: '300', calories: '154', description: 'Паста, соус песто, креветки, кальмар, мидии, сливки, пармезан', price: 690, image: '' },
        { id: 9, category: 'Горячее', title: 'Пицца Четыре сыра', weight: '500', calories: '242', description: 'Соус сливочный, моцарелла, пармезан, горгонзола, фета', price: 720, image: '' },
        { id: 10, category: 'Горячее', title: 'Куриные крылышки BBQ', weight: '300', calories: '280', description: 'Крылья в соусе BBQ, подаются с соусом дорблю и сельдереем', price: 550, image: '' },
        { id: 11, category: 'Напитки', title: 'Ягодный чай Летний', weight: '1000', description: 'Клубника, вишня, мята, мед, имбирь', price: 490, image: '' },
        { id: 12, category: 'Напитки', title: 'Лимонад Клубника, базилик, лайм', weight: '400/1000', description: 'Домашний лимонад со свежими ягодами и травами', price: 350, image: '' },
        { id: 13, category: 'Напитки', title: 'Морс клюквенный', weight: '400', description: 'Домашний морс из свежей клюквы с медом', price: 280, image: '' }
    ];
}

function getDefaultKidsMenu() {
    return [
        { id: 101, category: 'Закуски', title: 'Пальчики из лаваша с сыром', weight: '120', calories: '180', description: 'Хрустящие пальчики из лаваша с расплавленным сыром', price: 190, image: '' },
        { id: 102, category: 'Закуски', title: 'Овощные палочки с соусом', weight: '100', calories: '70', description: 'Свежие овощи с нежным йогуртовым соусом', price: 150, image: '' },
        { id: 103, category: 'Салаты', title: 'Салат с курицей и овощами', weight: '150', calories: '180', description: 'Куриное филе, огурцы, помидоры, листья салата, сметана', price: 290, image: '' },
        { id: 104, category: 'Салаты', title: 'Фруктовый салат с йогуртом', weight: '140', calories: '120', description: 'Яблоко, банан, апельсин, виноград, йогурт', price: 270, image: '' },
        { id: 105, category: 'Супы', title: 'Суп куриный с лапшой', weight: '250', calories: '95', description: 'Куриный бульон, домашняя лапша, морковь, куриное филе', price: 280, image: '' },
        { id: 106, category: 'Супы', title: 'Суп-пюре из тыквы со сливками', weight: '250', calories: '110', description: 'Тыква, сливки, морковь, тыквенные семечки', price: 290, image: '' },
        { id: 107, category: 'Горячее', title: 'Пельмешки куриные', weight: '170', calories: '213', description: 'Домашние пельмени с куриным фаршем, сметана', price: 360, image: '' },
        { id: 108, category: 'Горячее', title: 'Пельмешки Конфетки', weight: '180', calories: '247.7', description: 'Цветные пельмени с разными вкусами, сметана', price: 420, image: '' },
        { id: 109, category: 'Горячее', title: 'Куриные наггетсы', weight: '150', calories: '220', description: 'Куриное филе в хрустящей панировке, соус на выбор', price: 350, image: '' },
        { id: 110, category: 'Горячее', title: 'Мини-бургер', weight: '120', calories: '210', description: 'Маленький бургер с котлетой из говядины', price: 290, image: '' },
        { id: 111, category: 'Напитки', title: 'Какао с маршмеллоу', weight: '250', calories: '180', description: 'Горячий шоколад с молоком и маршмеллоу', price: 350, image: '' },
        { id: 112, category: 'Напитки', title: 'Лимонад Вкус детства', weight: '300', calories: '140', description: 'Бабл-гам, лимонад с шариками мороженого', price: 330, image: '' },
        { id: 113, category: 'Напитки', title: 'Морс клюквенный', weight: '300', description: 'Домашний морс из свежей клюквы', price: 250, image: '' }
    ];
}

function getDefaultBanquetMenu() {
    return [
        { id: 201, category: 'Горячее', title: 'Буженина гриль под соусом демигляс', weight: '300', calories: '65.3', description: 'Свиная буженина с картофелем айдахо, соус демигляс', price: 600, image: '../image/banquet/buzhenina.jpg' },
        { id: 202, category: 'Горячее', title: 'Запеченная куриная грудка', weight: '300', calories: '158.4', description: 'Куриное филе с овощами гриль, соус песто', price: 560, image: '../image/banquet/chicken.jpg' },
        { id: 203, category: 'Горячее', title: 'Мясное ассорти', weight: '600', calories: '320', description: 'Свинина, говядина, курица, колбаски, соусы', price: 1500, image: '../image/banquet/meat.jpg' },
        { id: 204, category: 'Закуски', title: 'Рулетики из ветчины с сыром и чесноком', weight: '360', calories: '287.5', description: 'Ветчина с сырно-чесночной начинкой, зелень', price: 590, image: '../image/banquet/rolls.jpg' },
        { id: 205, category: 'Закуски', title: 'Плато из морепродуктов', weight: '450', calories: '104.7', description: 'Креветки, мидии, кальмары, соус тартар', price: 2020, image: '../image/banquet/seafood.jpg' },
        { id: 206, category: 'Закуски', title: 'Канапе ассорти', weight: '400', calories: '180', description: 'С лососем, с ветчиной, с сыром, с оливками', price: 950, image: '../image/banquet/canapes.jpg' },
        { id: 207, category: 'Десерты', title: 'Фруктовая тарелка', weight: '800', description: 'Сезонные фрукты, ягоды', price: 900, image: '../image/banquet/fruits.jpg' },
        { id: 208, category: 'Десерты', title: 'Мини-трайфлы', weight: '70', calories: '238.5', description: 'Бисквит, крем, ягоды (ассорти)', price: 110, image: '../image/banquet/trifles.jpg' },
        { id: 209, category: 'Десерты', title: 'Торт Медовик', weight: '120', calories: '320', description: 'Классический медовый торт со сметанным кремом', price: 250, image: '../image/banquet/cake.jpg' }
    ];
}

// ========== API ФУНКЦИИ ==========
async function loadAllDataFromServer() {
    showLoading(true);
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // Загружаем данные с сервера
        mainItems = data.main && data.main.length > 0 ? data.main : getDefaultMainMenu();
        kidsItems = data.kids && data.kids.length > 0 ? data.kids : getDefaultKidsMenu();
        banquetItems = data.banquet && data.banquet.length > 0 ? data.banquet : getDefaultBanquetMenu();
        
        // Сохраняем в localStorage как кеш
        saveToLocalStorage();
        
        // Если данные были пустые, сохраняем дефолтные на сервер
        if (!data.main || data.main.length === 0) {
            await saveAllToServer();
        }
        
        updateCategoryFilters();
        renderCurrentTab();
        
        console.log('Данные загружены с сервера');
    } catch (error) {
        console.error('Ошибка загрузки с сервера:', error);
        // Fallback на localStorage
        loadFromLocalStorage();
    } finally {
        showLoading(false);
    }
}

async function saveAllToServer() {
    const allData = {
        main: mainItems,
        kids: kidsItems,
        banquet: banquetItems
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allData)
        });
        
        if (response.ok) {
            console.log('Данные сохранены на сервер');
            saveToLocalStorage(); // Обновляем кеш
            showNotification('Сохранено успешно!', 'success');
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Ошибка сохранения на сервер:', error);
        saveToLocalStorage(); // Сохраняем хотя бы в localStorage
        showNotification('Ошибка сохранения. Данные сохранены локально.', 'error');
    }
}

function saveToLocalStorage() {
    localStorage.setItem('menu_main', JSON.stringify(mainItems));
    localStorage.setItem('menu_kids', JSON.stringify(kidsItems));
    localStorage.setItem('menu_banquet', JSON.stringify(banquetItems));
    localStorage.setItem('menu_last_update', Date.now().toString());
}

function loadFromLocalStorage() {
    const mainSaved = localStorage.getItem('menu_main');
    const kidsSaved = localStorage.getItem('menu_kids');
    const banquetSaved = localStorage.getItem('menu_banquet');
    
    mainItems = mainSaved ? JSON.parse(mainSaved) : getDefaultMainMenu();
    kidsItems = kidsSaved ? JSON.parse(kidsSaved) : getDefaultKidsMenu();
    banquetItems = banquetSaved ? JSON.parse(banquetSaved) : getDefaultBanquetMenu();
    
    updateCategoryFilters();
    renderCurrentTab();
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function showLoading(show) {
    const tableBody = document.getElementById('menuTableBody');
    if (tableBody && show) {
        tableBody.innerHTML = '<tr><td colspan="7" class="loading">Загрузка...</td></tr>';
    }
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ========== ФУНКЦИИ ВАЛИДАЦИИ ==========
function isValidWeight(value) {
    if (!value || value.trim() === '') return true;
    const str = value.trim();
    if (str.includes('/')) {
        const parts = str.split('/').map(p => p.trim());
        if (parts.length !== 2) return false;
        return parts.every(part => /^\d+$/.test(part));
    }
    return /^\d*\.?\d+$/.test(str) && parseFloat(str) > 0;
}

function isValidNumber(value, allowDecimal = true) {
    if (!value || value.trim() === '') return true;
    const str = value.trim().replace(',', '.');
    if (allowDecimal) {
        return /^-?\d*\.?\d+$/.test(str) && !isNaN(parseFloat(str));
    } else {
        return /^-?\d+$/.test(str) && Number.isInteger(parseFloat(str));
    }
}

function isValidPrice(value) {
    if (!value || value.trim() === '') return false;
    const num = parseInt(value);
    return /^\d+$/.test(value.trim()) && num > 0;
}

function validateForm() {
    let isValid = true;
    
    const name = document.getElementById('itemName').value.trim();
    if (!name) {
        showError('itemName', 'Название обязательно');
        isValid = false;
    }
    
    const category = document.getElementById('itemCategory').value;
    if (!category) {
        showError('itemCategory', 'Выберите категорию');
        isValid = false;
    }
    
    const weight = document.getElementById('itemWeight').value.trim();
    if (weight && !isValidWeight(weight)) {
        showError('itemWeight', 'Введите корректный вес');
        isValid = false;
    }
    
    const price = document.getElementById('itemPrice').value.trim();
    if (!price) {
        showError('itemPrice', 'Цена обязательна');
        isValid = false;
    } else if (!isValidPrice(price)) {
        showError('itemPrice', 'Введите корректную цену');
        isValid = false;
    }
    
    return isValid;
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const existingError = element.parentNode.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    element.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    
    element.parentNode.appendChild(errorDiv);
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.classList.remove('error');
    const existingError = element.parentNode.querySelector('.error-message');
    if (existingError) existingError.remove();
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========
function getCurrentItems() {
    if (currentTab === 'main') return mainItems;
    if (currentTab === 'kids') return kidsItems;
    return banquetItems;
}

function updateCategoryFilters() {
    const filtersContainer = document.getElementById('categoryFilters');
    if (!filtersContainer) return;
    
    const currentCategories = categories[currentTab];
    
    let filtersHtml = '';
    currentCategories.forEach(cat => {
        filtersHtml += `<button class="filter-btn" data-filter="${cat}">${cat}</button>`;
    });
    
    filtersContainer.innerHTML = filtersHtml;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategoryFilter = this.dataset.filter;
            renderCurrentTab();
        });
    });
    
    // Активируем первую категорию по умолчанию
    const firstBtn = document.querySelector('.filter-btn');
    if (firstBtn) {
        firstBtn.classList.add('active');
        currentCategoryFilter = firstBtn.dataset.filter;
    }
}

function renderCurrentTab() {
    const tableBody = document.getElementById('menuTableBody');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const currentItems = getCurrentItems();
    
    let filteredItems = currentItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        (item.description && item.description.toLowerCase().includes(searchTerm))
    );
    
    if (currentCategoryFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === currentCategoryFilter);
    }
    
    if (filteredItems.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="loading">Ничего не найдено</td></tr>';
        return;
    }
    
    tableBody.innerHTML = filteredItems.map(item => {
        const weightCalories = [];
        if (item.weight) weightCalories.push(`${item.weight} г`);
        if (item.calories) weightCalories.push(`${item.calories} ккал`);
        
        return `
            <tr>
                <td><div class="thumbnail" style="background-image: ${item.image ? `url('${item.image}')` : 'none'}; background-size: cover; background-position: center; background-color: #e0d5cc; width: 60px; height: 60px; border-radius: 8px;"></div></td>
                <td><strong>${escapeHtml(item.title)}</strong></td>
                <td>${escapeHtml(item.category)}</td>
                <td>${weightCalories.join(' / ') || '-'}</td>
                <td class="description-cell">${escapeHtml(item.description || '')}</td>
                <td><strong>${item.price} ₽</strong></td>
                <td class="actions-cell">
                    <button class="edit-btn" onclick="editItem(${item.id})">Ред</button>
                    <button class="delete-btn" onclick="deleteItem(${item.id})">Удл</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateCategorySelect() {
    const select = document.getElementById('itemCategory');
    select.innerHTML = '<option value="">Выберите категорию</option>' + 
        categories[currentTab].map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
});

document.getElementById('addItemBtn').addEventListener('click', function() {
    document.getElementById('modalTitle').textContent = 'Добавить блюдо';
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('itemImageUrl').value = '';
    document.getElementById('itemImage').value = '';
    
    ['itemName', 'itemCategory', 'itemWeight', 'itemCalories', 'itemCaloriesPer100', 'itemPrice'].forEach(clearError);
    
    updateCategorySelect();
    document.getElementById('itemModal').classList.add('active');
});

window.editItem = function(id) {
    const currentItems = getCurrentItems();
    const item = currentItems.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('modalTitle').textContent = 'Редактировать блюдо';
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.title;
    document.getElementById('itemWeight').value = item.weight || '';
    document.getElementById('itemCalories').value = item.calories || '';
    document.getElementById('itemCaloriesPer100').value = item.calories_per_100 || '';
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemImageUrl').value = item.image || '';
    document.getElementById('itemImage').value = '';
    
    ['itemName', 'itemCategory', 'itemWeight', 'itemCalories', 'itemCaloriesPer100', 'itemPrice'].forEach(clearError);
    
    updateCategorySelect();
    setTimeout(() => {
        document.getElementById('itemCategory').value = item.category;
    }, 50);
    
    if (item.image) {
        document.getElementById('imagePreview').innerHTML = `<img src="${item.image}" style="max-width: 100px;">`;
    }
    
    document.getElementById('itemModal').classList.add('active');
};

window.deleteItem = function(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
};

// Сохранение формы
document.getElementById('itemForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const id = document.getElementById('itemId').value;
    const imageUrl = document.getElementById('itemImageUrl').value || '';
    
    const itemData = {
        title: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        weight: document.getElementById('itemWeight').value || null,
        calories: document.getElementById('itemCalories').value || null,
        calories_per_100: document.getElementById('itemCaloriesPer100').value || null,
        description: document.getElementById('itemDescription').value || '',
        price: parseInt(document.getElementById('itemPrice').value),
        image: imageUrl
    };
    
    const currentItems = getCurrentItems();
    
    if (id) {
        const index = currentItems.findIndex(i => i.id == id);
        if (index !== -1) {
            currentItems[index] = { ...currentItems[index], ...itemData, id: parseInt(id) };
        }
    } else {
        const newId = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.id)) + 1 : 1;
        currentItems.push({ id: newId, ...itemData });
    }
    
    await saveAllToServer();
    renderCurrentTab();
    document.getElementById('itemModal').classList.remove('active');
    showNotification('Блюдо сохранено!', 'success');
});

// Подтверждение удаления
document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
    if (deleteId) {
        const currentItems = getCurrentItems();
        const index = currentItems.findIndex(i => i.id === deleteId);
        if (index !== -1) {
            currentItems.splice(index, 1);
            await saveAllToServer();
            renderCurrentTab();
            showNotification('Блюдо удалено', 'success');
        }
        document.getElementById('deleteModal').classList.remove('active');
        deleteId = null;
    }
});

// Закрытие модалок
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('itemModal').classList.remove('active');
});

document.getElementById('cancelModal').addEventListener('click', () => {
    document.getElementById('itemModal').classList.remove('active');
});

document.getElementById('closeDeleteModal').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
});

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
});

// Переключение вкладок
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentTab = this.dataset.tab;
        currentCategoryFilter = 'all';
        updateCategoryFilters();
        renderCurrentTab();
    });
});

// Поиск
document.getElementById('searchInput').addEventListener('input', function() {
    renderCurrentTab();
});

// Загрузка фото
document.getElementById('itemImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('imagePreview').innerHTML = `<img src="${event.target.result}" style="max-width: 100px;">`;
            document.getElementById('itemImageUrl').value = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Валидация в реальном времени
document.getElementById('itemWeight').addEventListener('blur', function() {
    const value = this.value.trim();
    if (value && !isValidWeight(value)) {
        showError('itemWeight', 'Введите корректный вес');
    } else {
        clearError('itemWeight');
    }
});

document.getElementById('itemPrice').addEventListener('blur', function() {
    const value = this.value.trim();
    if (value && !isValidPrice(value)) {
        showError('itemPrice', 'Введите корректную цену');
    } else if (!value) {
        showError('itemPrice', 'Цена обязательна');
    } else {
        clearError('itemPrice');
    }
});

document.getElementById('itemName').addEventListener('blur', function() {
    if (!this.value.trim()) {
        showError('itemName', 'Название обязательно');
    } else {
        clearError('itemName');
    }
});

// Защита от XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
loadAllDataFromServer();

// Добавляем стили для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification {
        animation: slideIn 0.3s ease;
    }
    
    .error {
        border-color: #dc3545 !important;
    }
`;
document.head.appendChild(style);



