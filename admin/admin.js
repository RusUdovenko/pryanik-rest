// Проверка авторизации
if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}
// В начало admin.js, после проверки авторизации
// Сохраняем оригинальные данные для восстановления
if (!localStorage.getItem('menu_main_original')) {
    // Сохраняем копию текущих данных как оригинал
    localStorage.setItem('menu_main_original', JSON.stringify(mainItems));
    localStorage.setItem('menu_kids_original', JSON.stringify(kidsItems));
    localStorage.setItem('menu_banquet_original', JSON.stringify(banquetItems));
}

// Выход
document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
});



// Состояние
let currentTab = 'main'; // main, kids, banquet
let currentCategoryFilter = 'all'; // для фильтрации по категориям

let mainItems = [];
let kidsItems = [];
let banquetItems = [];

let categories = {
    main: ['Бургеры', 'Салаты', 'Супы', 'Закуски', 'Горячее', 'Напитки'],  // ← добавили 'Супы'
    kids: ['Салаты', 'Супчики', 'Горячее', 'Гарниры', 'Овершейки', 'Напитки'],
    banquet: ['Горячее', 'Закуски', 'Десерты']
};

let deleteId = null;

// Загрузка данных при старте
function loadAllData() {
    // Загружаем основное меню
    const mainSaved = localStorage.getItem('menu_main');
    if (mainSaved) {
        mainItems = JSON.parse(mainSaved);
    } else {
        // ПОЛНОЕ основное меню из menu.html
        mainItems = [
            { id: 1, category: 'Бургеры', title: 'Мини-бургер', weight: '180', calories: '245', description: 'Говяжья котлета, сыр чеддер, помидор, салат айсберг, соус барбекю', price: 390, image: '../image/dishes/1.avif' },
            { id: 2, category: 'Бургеры', title: 'Мини-пицца', weight: '250', calories: '220', description: 'Мини-пицца с сыром и томатами', price: 450, image: '../image/dishes/1.avif' },
            { id: 3, category: 'Салаты', title: 'Салат с индейкой су-вид', weight: '200', calories: '250', description: 'микс салата, редис, моцарелла, черри, индейка, медово-горчичная заправка', price: 490, image: '../image/dishes/1.avif' },
            { id: 4, category: 'Салаты', title: 'Салат цезарь с курицей', weight: '220', calories: '240', description: 'Куриное филе, салат романо, пармезан, помидоры черри, гренки, соус цезарь', price: 520, image: '../image/dishes/1.avif' },
            { id: 5, category: 'Салаты', title: 'Греческий салат', weight: '210', calories: '180', description: 'Огурцы, помидоры, перец болгарский, красный лук, маслины, сыр фета, оливковое масло', price: 450, image: '../image/dishes/1.avif' },
            { id: 6, category: 'Закуски', title: 'Брускетта с томатами и моцареллой', weight: '150', calories: '180', description: 'Хлеб чиабатта, томаты, моцарелла, базилик, оливковое масло, бальзамик', price: 320, image: '../image/dishes/1.avif' },
            { id: 7, category: 'Закуски', title: 'Сырная тарелка', weight: '200', calories: '320', description: 'Пармезан, моцарелла, горгонзола, мед, орехи, виноград', price: 590, image: '../image/dishes/1.avif' },
            { id: 8, category: 'Горячее', title: 'Паста с морепродуктами', weight: '300', calories: '154', description: 'Паста, соус песто, креветки, кальмар, мидии, сливки, пармезан', price: 690, image: '../image/dishes/pasta.jpg' },
            { id: 9, category: 'Горячее', title: 'Пицца Четыре сыра', weight: '500', calories: '242', description: 'Соус сливочный, моцарелла, пармезан, горгонзола, фета', price: 720, image: '../image/dishes/1.avif' },
            { id: 10, category: 'Горячее', title: 'Куриные крылышки BBQ', weight: '300', calories: '280', description: 'Крылья в соусе BBQ, подаются с соусом дорблю и сельдереем', price: 550, image: '../image/dishes/1.avif' },
            { id: 11, category: 'Напитки', title: 'Ягодный чай Летний', weight: '1000', description: 'Клубника, вишня, мята, мед, имбирь', price: 490, image: '../image/dishes/1.avif' },
            { id: 12, category: 'Напитки', title: 'Лимонад Клубника, базилик, лайм', weight: '400/1000', description: 'Домашний лимонад со свежими ягодами и травами', price: 350, image: '../image/dishes/1.avif' },
            { id: 13, category: 'Напитки', title: 'Морс клюквенный', weight: '400', description: 'Домашний морс из свежей клюквы с медом', price: 280, image: '../image/dishes/1.avif' }
        ];
    }
    
    // Загружаем детское меню
    const kidsSaved = localStorage.getItem('menu_kids');
    if (kidsSaved) {
        kidsItems = JSON.parse(kidsSaved);
    } else {
        // ПОЛНОЕ детское меню из menu.html
        kidsItems = [
            { id: 101, category: 'Салаты', title: 'Салат с курицей и овощами', weight: '150', calories: '180', description: 'Куриное филе, огурцы, помидоры, листья салата, сметана', price: 290, image: '../image/dishes/1.avif' },
            { id: 102, category: 'Салаты', title: 'Фруктовый салат с йогуртом', weight: '140', calories: '120', description: 'Яблоко, банан, апельсин, виноград, йогурт', price: 270, image: '../image/dishes/1.avif' },
            { id: 103, category: 'Супчики', title: 'Суп куриный с лапшой', weight: '250', calories: '95', description: 'Куриный бульон, домашняя лапша, морковь, куриное филе', price: 280, image: '../image/dishes/1.avif' },
            { id: 104, category: 'Супчики', title: 'Суп-пюре из тыквы со сливками', weight: '250', calories: '110', description: 'Тыква, сливки, морковь, тыквенные семечки', price: 290, image: '../image/dishes/1.avif' },
            { id: 105, category: 'Горячее', title: 'Пельмешки куриные', weight: '170', calories: '213', description: 'Домашние пельмени с куриным фаршем, сметана', price: 360, image: '../image/dishes/1.avif' },
            { id: 106, category: 'Горячее', title: 'Пельмешки Конфетки', weight: '180', calories: '247.7', description: 'Цветные пельмени с разными вкусами, сметана', price: 420, image: '../image/dishes/1.avif' },
            { id: 107, category: 'Горячее', title: 'Куриные наггетсы', weight: '150', calories: '220', description: 'Куриное филе в хрустящей панировке, соус на выбор', price: 350, image: '../image/dishes/1.avif' },
            { id: 108, category: 'Гарниры', title: 'Картофельное пюре', weight: '150', calories: '120', description: 'Сливочное пюре с молоком и маслом', price: 150, image: '../image/dishes/1.avif' },
            { id: 109, category: 'Гарниры', title: 'Овощи на пару', weight: '140', calories: '70', description: 'Брокколи, цветная капуста, морковь', price: 170, image: '../image/dishes/1.avif' },
            { id: 110, category: 'Овершейки', title: 'Овершейк клубничный', weight: '300', calories: '280', description: 'Молочный коктейль со свежей клубникой, украшен пончиком', price: 390, image: '../image/dishes/1.avif' },
            { id: 111, category: 'Овершейки', title: 'Овершейк шоколадный с маршмеллоу', weight: '320', calories: '310', description: 'Шоколадный коктейль с маршмеллоу и шоколадной крошкой', price: 420, image: '../image/dishes/1.avif' },
            { id: 112, category: 'Напитки', title: 'Какао с маршмеллоу', weight: '250', calories: '180', description: 'Горячий шоколад с молоком и маршмеллоу', price: 350, image: '../image/dishes/1.avif' },
            { id: 113, category: 'Напитки', title: 'Лимонад Вкус детства', weight: '300', calories: '140', description: 'Бабл-гам, лимонад с шариками мороженого', price: 330, image: '../image/dishes/1.avif' }
        ];
    }
    
    // Загружаем банкетное меню
    const banquetSaved = localStorage.getItem('menu_banquet');
    if (banquetSaved) {
        banquetItems = JSON.parse(banquetSaved);
    } else {
        // ПОЛНОЕ банкетное меню из menu.html
        banquetItems = [
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
    
    // Сохраняем все в localStorage
    saveAllToLocalStorage();
    
    // Обновляем фильтры и отображаем
    updateCategoryFilters();
    renderCurrentTab();
}

// Получить текущий массив
function getCurrentItems() {
    if (currentTab === 'main') return mainItems;
    if (currentTab === 'kids') return kidsItems;
    return banquetItems;
}

// Сохранение всех данных
function saveAllToLocalStorage() {
    localStorage.setItem('menu_main', JSON.stringify(mainItems));
    localStorage.setItem('menu_kids', JSON.stringify(kidsItems));
    localStorage.setItem('menu_banquet', JSON.stringify(banquetItems));
    localStorage.setItem('menu_last_update', Date.now().toString());
}

// Обновление фильтров по категориям
function updateCategoryFilters() {
    const filtersContainer = document.getElementById('categoryFilters');
    if (!filtersContainer) return;
    
    const currentCategories = categories[currentTab];
    
    let filtersHtml = '<button class="filter-btn active" data-filter="all">Все</button>';
    currentCategories.forEach(cat => {
        filtersHtml += `<button class="filter-btn" data-filter="${cat}">${cat}</button>`;
    });
    
    filtersContainer.innerHTML = filtersHtml;
    
    // Добавляем обработчики
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategoryFilter = this.dataset.filter;
            renderCurrentTab();
        });
    });
}

// Отображение текущей вкладки с фильтрацией
function renderCurrentTab() {
    const tableBody = document.getElementById('menuTableBody');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const currentItems = getCurrentItems();
    
    // Сначала фильтруем по поиску
    let filteredItems = currentItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        (item.description && item.description.toLowerCase().includes(searchTerm))
    );
    
    // Потом по категории
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
            <td><img src="${item.image || '../image/dishes/1.avif'}" class="thumbnail" onerror="this.src='../image/dishes/1.avif'"></td>
            <td><strong>${escapeHtml(item.title)}</strong></td>
            <td>${escapeHtml(item.category)}</td>
            <td class="weight-cell">${weightCalories.join(' / ') || '-'}</td>
            <td class="description-cell">${escapeHtml(item.description || '')}</td>
            <td><strong>${item.price} ₽</strong></td>
            <td class="actions-cell">
                <button class="edit-btn" onclick="editItem(${item.id})">Ред</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})">Удл</button>
            </td>
        </tr>
    `}).join('');
}

// Обновление категорий в select
function updateCategorySelect() {
    const select = document.getElementById('itemCategory');
    select.innerHTML = '<option value="">Выберите категорию</option>' + 
        categories[currentTab].map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Добавление
document.getElementById('addItemBtn').addEventListener('click', function() {
    document.getElementById('modalTitle').textContent = 'Добавить блюдо';
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('itemImageUrl').value = '';
    document.getElementById('itemImage').value = '';
    updateCategorySelect();
    document.getElementById('itemModal').classList.add('active');
});

// Редактирование
window.editItem = function(id) {
    const currentItems = getCurrentItems();
    const item = currentItems.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('modalTitle').textContent = 'Редактировать блюдо';
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.title;
    document.getElementById('itemWeight').value = item.weight || '';
    document.getElementById('itemCalories').value = item.calories || '';
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemImageUrl').value = item.image || '';
    document.getElementById('itemImage').value = '';
    
    updateCategorySelect();
    setTimeout(() => {
        document.getElementById('itemCategory').value = item.category;
    }, 50);
    
    if (item.image) {
        document.getElementById('imagePreview').innerHTML = `<img src="${item.image}" style="max-width: 100px;">`;
    }
    
    document.getElementById('itemModal').classList.add('active');
};

// Удаление
window.deleteItem = function(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
};

// Сохранение формы
document.getElementById('itemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('itemId').value;
    const imageUrl = document.getElementById('itemImageUrl').value || '../image/dishes/1.avif';
    
    const itemData = {
        title: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        weight: document.getElementById('itemWeight').value || null,
        calories: document.getElementById('itemCalories').value || null,
        description: document.getElementById('itemDescription').value || '',
        price: parseInt(document.getElementById('itemPrice').value),
        image: imageUrl
    };
    
    const currentItems = getCurrentItems();
    
    if (id) {
        // Редактирование
        const index = currentItems.findIndex(i => i.id == id);
        if (index !== -1) {
            currentItems[index] = { ...currentItems[index], ...itemData, id: parseInt(id) };
        }
    } else {
        // Добавление
        const newId = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.id)) + 1 : 1;
        currentItems.push({ id: newId, ...itemData });
    }
    
    saveAllToLocalStorage();
    renderCurrentTab();
    document.getElementById('itemModal').classList.remove('active');
});

// Подтверждение удаления
document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (deleteId) {
        const currentItems = getCurrentItems();
        const index = currentItems.findIndex(i => i.id === deleteId);
        if (index !== -1) {
            currentItems.splice(index, 1);
            saveAllToLocalStorage();
            renderCurrentTab();
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
        currentCategoryFilter = 'all'; // сбрасываем фильтр при смене вкладки
        updateCategoryFilters();
        renderCurrentTab();
        localStorage.setItem('menu_last_update', Date.now().toString());
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

// Защита от XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация
loadAllData();

// Сохранение всех данных
function saveAllToLocalStorage() {
    localStorage.setItem('menu_main', JSON.stringify(mainItems));
    localStorage.setItem('menu_kids', JSON.stringify(kidsItems));
    localStorage.setItem('menu_banquet', JSON.stringify(banquetItems));
    localStorage.setItem('menu_last_update', Date.now().toString()); // 👈 Это важно!
}
