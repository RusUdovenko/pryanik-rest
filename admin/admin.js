// admin.js - версия для Firebase

if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    });
}

let currentTab = 'main';
let currentCategoryFilter = 'all';

let mainItems = [];
let kidsItems = [];
let banquetItems = [];

let categories = {
    main: ['Завтраки', 'Закуски', 'Салаты', 'Супы', 'Паста', 'Горячее', 'Хлеб', 'Десерты', 'Напитки'],
    kids: ['Закуски', 'Салаты', 'Супы', 'Горячее', 'Напитки'],
    banquet: ['Горячее', 'Закуски', 'Десерты']
};

let deleteId = null;
let isLoading = false;

function getDefaultMainMenu() {

}

function getDefaultKidsMenu() {

}

function getDefaultBanquetMenu() {

}

function getCurrentItems() {
    if (currentTab === 'main') return mainItems;
    if (currentTab === 'kids') return kidsItems;
    return banquetItems;
}

async function loadAllData() {
    if (isLoading) return;
    isLoading = true;
    
    const tableBody = document.getElementById('menuTableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" class="loading">Загрузка данных...</td></tr>';
    }
    
    try {
        if (typeof firebaseAPI === 'undefined') {
            throw new Error('Firebase не загружен');
        }
        
        await firebaseAPI.initDefaultData(COLLECTIONS.MAIN, getDefaultMainMenu());
        await firebaseAPI.initDefaultData(COLLECTIONS.KIDS, getDefaultKidsMenu());
        await firebaseAPI.initDefaultData(COLLECTIONS.BANQUET, getDefaultBanquetMenu());
        
        const [mainData, kidsData, banquetData] = await Promise.all([
            firebaseAPI.getItems(COLLECTIONS.MAIN),
            firebaseAPI.getItems(COLLECTIONS.KIDS),
            firebaseAPI.getItems(COLLECTIONS.BANQUET)
        ]);
        
        mainItems = mainData;
        kidsItems = kidsData;
        banquetItems = banquetData;
        
        updateCategoryFilters();
        renderCurrentTab();
        
    } catch (error) {
        if (tableBody) {
            tableBody.innerHTML = `<td><td colspan="7" class="loading" style="color: #dc3545;">
                Ошибка загрузки данных. Проверьте подключение к Firebase.
            </td></tr>`;
        }
    } finally {
        isLoading = false;
    }
}

function updateCategoryFilters() {
    const filtersContainer = document.getElementById('categoryFilters');
    if (!filtersContainer) return;
    
    const currentCategories = categories[currentTab];
    let filtersHtml = '<button class="filter-btn active" data-filter="all">Все</button>';
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
}

function renderCurrentTab() {
    const tableBody = document.getElementById('menuTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
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
        if (item.weight && item.weight !== '') weightCalories.push(`${item.weight} г`);
        if (item.calories_per_100 && item.calories_per_100 !== '') {
            weightCalories.push(`${item.calories_per_100} ккал/100г`);
        } else if (item.calories && item.calories !== '') {
            weightCalories.push(`${item.calories} ккал`);
        }
        
        const imageUrl = item.image && item.image !== '' ? item.image : '';
        
        return `
            <tr>
                <td><div class="thumbnail" style="background-image: ${imageUrl ? `url('${imageUrl}')` : 'none'};"></div></td>
                <td><strong>${escapeHtml(item.title)}</strong></td>
                <td>${escapeHtml(item.category)}</td>
                <td class="weight-cell">${weightCalories.join(' / ') || '-'}</td>
                <td class="description-cell">${escapeHtml(item.description || '')}</td>
                <td><strong>${item.price} ₽</strong></td>
                <td class="actions-cell">
                    <button class="edit-btn" onclick="editItem('${item.id}')">Ред</button>
                    <button class="delete-btn" onclick="deleteItem('${item.id}')">Удл</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateCategorySelect() {
    const select = document.getElementById('itemCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите категорию</option>' + 
        categories[currentTab].map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

document.getElementById('addItemBtn')?.addEventListener('click', function() {
    document.getElementById('modalTitle').textContent = 'Добавить блюдо';
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('itemImageUrl').value = '';
    document.getElementById('itemImage').value = '';
    updateCategorySelect();
    document.getElementById('itemModal').classList.add('active');
});

window.editItem = async function(id) {
    const currentItems = getCurrentItems();
    const item = currentItems.find(i => i.id == id);
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
    updateCategorySelect();
    setTimeout(() => {
        document.getElementById('itemCategory').value = item.category;
    }, 50);
    
    if (item.image) {
        document.getElementById('imagePreview').innerHTML = `<img src="${item.image}" style="max-width: 100px;">`;
    } else {
        document.getElementById('imagePreview').innerHTML = '';
    }
    
    document.getElementById('itemModal').classList.add('active');
};

window.deleteItem = function(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
};

document.getElementById('itemForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('itemId').value;
    
    let collectionName;
    if (currentTab === 'main') collectionName = COLLECTIONS.MAIN;
    else if (currentTab === 'kids') collectionName = COLLECTIONS.KIDS;
    else collectionName = COLLECTIONS.BANQUET;
    
    const itemData = {
        title: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        weight: document.getElementById('itemWeight').value || null,
        calories: document.getElementById('itemCalories').value || null,
        calories_per_100: document.getElementById('itemCaloriesPer100').value || null,
        description: document.getElementById('itemDescription').value || '',
        price: parseInt(document.getElementById('itemPrice').value),
        image: document.getElementById('itemImageUrl').value || ''
    };
    
    try {
        if (id) {
            await firebaseAPI.updateItem(collectionName, id, itemData);
            showTemporaryMessage('✅ Блюдо обновлено!');
        } else {
            await firebaseAPI.addItem(collectionName, itemData);
            showTemporaryMessage('✅ Блюдо добавлено!');
        }
        
        await loadAllData();
        document.getElementById('itemModal').classList.remove('active');
        
    } catch (error) {
        showTemporaryMessage('❌ Ошибка сохранения', true);
    }
});

document.getElementById('confirmDeleteBtn')?.addEventListener('click', async function() {
    if (deleteId) {
        let collectionName;
        if (currentTab === 'main') collectionName = COLLECTIONS.MAIN;
        else if (currentTab === 'kids') collectionName = COLLECTIONS.KIDS;
        else collectionName = COLLECTIONS.BANQUET;
        
        try {
            await firebaseAPI.deleteItem(collectionName, deleteId);
            showTemporaryMessage('✅ Блюдо удалено!');
            await loadAllData();
        } catch (error) {
            showTemporaryMessage('❌ Ошибка удаления', true);
        }
        
        document.getElementById('deleteModal').classList.remove('active');
        deleteId = null;
    }
});

function showTemporaryMessage(message, isError = false) {
    const existingMsg = document.querySelector('.temp-message');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.className = 'temp-message';
    msg.textContent = message;
    msg.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${isError ? '#dc3545' : '#28a745'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeOut 3s forwards;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(msg);
    setTimeout(() => { if (msg.parentNode) msg.remove(); }, 3000);
}

document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('itemModal').classList.remove('active');
});

document.getElementById('cancelModal')?.addEventListener('click', () => {
    document.getElementById('itemModal').classList.remove('active');
});

document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
});

document.getElementById('closeDeleteModal')?.addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
});

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

document.getElementById('searchInput')?.addEventListener('input', function() {
    renderCurrentTab();
});

document.getElementById('itemImage')?.addEventListener('change', function(e) {
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translateY(0); }
        70% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(20px); visibility: hidden; }
    }
    .thumbnail {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        background-size: cover;
        background-position: center;
        background-color: #e0d5cc;
    }
    .error-message {
        color: #dc3545;
        font-size: 12px;
        margin-top: 4px;
    }
    input.error, select.error, textarea.error {
        border-color: #dc3545;
    }
`;
document.head.appendChild(style);

loadAllData();