// Конфигурация админ-панели
const ADMIN_CONFIG = {
    // Основные настройки
    enabled: true, // Включить/выключить админку
    
    // Настройки авторизации
    auth: {
        enabled: true,
        login: 'pryanik',
        password: 'pryanik'
    },
    
    // Настройки меню
    menu: {
        main: {
            name: 'Основное меню',
            categories: ['Бургеры', 'Салаты', 'Закуски', 'Горячее', 'Напитки'],
            enabled: true
        },
        kids: {
            name: 'Детское меню',
            categories: ['Салаты', 'Супчики', 'Горячее', 'Гарниры', 'Овершейки', 'Напитки'],
            enabled: true
        },
        banquet: {
            name: 'Банкетное меню',
            categories: ['Горячее', 'Закуски', 'Десерты'],
            enabled: true
        }
    },
    
    // Настройки изображений
    images: {
        uploadEnabled: false, // Отключить загрузку файлов, только URL
        defaultImage: '../image/dishes/1.avif',
        maxSize: 5 * 1024 * 1024, // 5 MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/avif', 'image/webp']
    },
    
    // Настройки localStorage
    storage: {
        prefix: 'menu_',
        autoSave: true,
        compression: false // для будущего сжатия
    },
    
    // Интерфейс
    ui: {
        theme: 'light', // light/dark
        itemsPerPage: 20,
        showDescriptions: true,
        showWeight: true,
        showCalories: true
    }
};

// Не изменяйте эту функцию
window.ADMIN_CONFIG = ADMIN_CONFIG;