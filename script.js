// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();

// Корзина
let cart = [];
let cartCount = 0;

// Данные товаров
let allProducts = [];

// Элементы DOM
const cartButton = document.getElementById('cart-button');
const cartBadge = document.getElementById('cart-badge');
const navButtons = document.querySelectorAll('.nav-button');
const sections = {
    'parts': document.getElementById('parts-section'),
    'services': document.getElementById('services-section'),
    'contacts': document.getElementById('contacts-section')
};

// CSV URL с CORS-прокси
const ORIGINAL_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4FnD4f8j2UyWp4CMRm58LQHOMdbMBawrg0VnKlKPKjfheTzC6h_16kTmNoB9jgyEPLr3OgiGKubsu/pub?gid=0&single=true&output=csv';
const CSV_URL = 'https://corsproxy.io/?' + encodeURIComponent(ORIGINAL_CSV_URL);

// Функция обновления счетчика корзины
function updateCartBadge() {
    cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = cartCount;
    
    if (cartCount > 0) {
        cartBadge.style.display = 'flex';
        cartButton.classList.add('shake');
        setTimeout(() => cartButton.classList.remove('shake'), 500);
    } else {
        cartBadge.style.display = 'none';
    }
}

// Функция добавления товара в корзину
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCartBadge();
    
    // Вибрация при добавлении
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Функция переключения секций
function showSection(sectionName) {
    // Скрываем все секции
    Object.values(sections).forEach(section => {
        section.classList.remove('active');
    });
    
    // Убираем активность у всех кнопок
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранную секцию
    if (sections[sectionName]) {
        sections[sectionName].classList.add('active');
    }
    
    // Активируем соответствующую кнопку
    const activeButton = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Вибрация при переключении
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Обработчики навигации
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionName = button.getAttribute('data-section');
        showSection(sectionName);
    });
});

// Обработчик кнопки корзины
cartButton.addEventListener('click', () => {
    if (cartCount > 0) {
        // Здесь можно открыть модальное окно корзины
        // или отправить данные в бота
        tg.showAlert(`В корзине товаров: ${cartCount}`);
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    } else {
        tg.showAlert('Корзина пуста');
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
        }
    }
});

// Пример: добавление обработчиков для кнопок товаров/услуг
// (будет работать после добавления контента)
document.addEventListener('click', (e) => {
    // Обработка кнопок "Добавить в корзину"
    if (e.target.classList.contains('add-to-cart-btn')) {
        const itemCard = e.target.closest('.item-card, .service-card');
        if (itemCard) {
            const item = {
                id: itemCard.dataset.id || Date.now(),
                name: itemCard.querySelector('h3')?.textContent || 'Товар',
                price: itemCard.dataset.price || 0
            };
            addToCart(item);
        }
    }
});

// Инициализация: показываем первую секцию по умолчанию
showSection('parts');

// Применение темы Telegram
if (tg.themeParams) {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0097a7');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
}

// ============================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С КАТАЛОГОМ ЗАПЧАСТЕЙ
// ============================================

// Показать страницу запчастей
function showParts() {
    // Скрываем главное меню
    const header = document.querySelector('.header');
    const navigation = document.querySelector('.navigation');
    
    if (header) header.style.display = 'none';
    if (navigation) navigation.style.display = 'none';
    
    // Показываем страницу запчастей
    const partsPage = document.getElementById('parts-page');
    if (partsPage) {
        partsPage.style.display = 'block';
    }
    
    // Загружаем товары, если еще не загружены
    if (allProducts.length === 0) {
        loadParts();
    }
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Скрыть страницу запчастей
function hideParts() {
    // Скрываем страницу запчастей
    const partsPage = document.getElementById('parts-page');
    if (partsPage) {
        partsPage.style.display = 'none';
    }
    
    // Показываем главное меню
    const header = document.querySelector('.header');
    const navigation = document.querySelector('.navigation');
    
    if (header) header.style.display = 'block';
    if (navigation) navigation.style.display = 'flex';
    
    // Очищаем поиск
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Загрузить товары из CSV
function loadParts() {
    const partsGrid = document.getElementById('parts-grid');
    
    // Показываем индикатор загрузки
    partsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #0097a7; font-size: 1.2rem;"><i class="fas fa-spinner fa-spin"></i> Загрузка товаров...</div>';
    
    fetch(CSV_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.text();
        })
        .then(csvData => {
            // Парсинг CSV
            const lines = csvData.trim().split('\n');
            const headers = lines[0].split(',');
            
            allProducts = [];
            
            // Пропускаем заголовок, обрабатываем строки
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                
                if (values.length >= 6) {
                    const product = {
                        id: values[0].trim(),
                        name: values[1].trim(),
                        description: values[2].trim(),
                        price: values[3].trim(),
                        category: values[4].trim(),
                        availability: values[5].trim()
                    };
                    
                    allProducts.push(product);
                }
            }
            
            // Отображаем товары
            displayProducts(allProducts);
            
            console.log('Загружено товаров:', allProducts.length);
        })
        .catch(error => {
            console.error('Ошибка при загрузке товаров:', error);
            partsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff5252; font-size: 1.2rem;"><i class="fas fa-exclamation-triangle"></i> Ошибка загрузки данных</div>';
            
            if (tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
        });
}

// Парсинг строки CSV с учетом запятых внутри кавычек
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Отобразить товары в сетке
function displayProducts(products) {
    const partsGrid = document.getElementById('parts-grid');
    
    if (products.length === 0) {
        partsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888; font-size: 1.2rem;">Товары не найдены</div>';
        return;
    }
    
    partsGrid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.dataset.price = product.price;
        card.dataset.name = product.name;
        card.dataset.description = product.description;
        
        card.innerHTML = `
            <h3>${product.name}</h3>
            <div class="description">${product.description}</div>
            <div class="category">${product.category}</div>
            <div class="availability">${product.availability}</div>
            <div class="price">${product.price} ₽</div>
            <button class="add-to-cart-btn">
                <i class="fas fa-cart-plus"></i> В корзину
            </button>
        `;
        
        partsGrid.appendChild(card);
    });
}

// Фильтрация товаров по поисковому запросу
function filterParts() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        // Показываем все товары
        displayProducts(allProducts);
    } else {
        // Фильтруем товары
        const filtered = allProducts.filter(product => {
            return product.name.toLowerCase().includes(query) ||
                   product.description.toLowerCase().includes(query) ||
                   product.category.toLowerCase().includes(query);
        });
        
        displayProducts(filtered);
    }
}

console.log('AutoService Pro WebApp загружен');
console.log('Telegram WebApp готов:', tg.isReady);
