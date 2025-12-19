// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Данные товаров и услуг
let allProducts = [];
let allServices = [];

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
const CSV_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(ORIGINAL_CSV_URL);

// CSV URL для услуг с CORS-прокси
const ORIGINAL_SERVICES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4FnD4f8j2UyWp4CMRm58LQHOMdbMBawrg0VnKlKPKjfheTzC6h_16kTmNoB9jgyEPLr3OgiGKubsu/pub?gid=245992410&single=true&output=csv';
const SERVICES_CSV_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(ORIGINAL_SERVICES_CSV_URL);

// Функция обновления счетчика корзины
function updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    const totalItems = cart.length;
    
    if (totalItems > 0) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = 'flex';
    } else {
        cartBadge.style.display = 'none';
    }
}

// Функция добавления товара в корзину
function addToCart(item) {
    // Проверяем, есть ли уже такой товар
    const existingIndex = cart.findIndex(cartItem => 
        cartItem.title === item.title && cartItem.price === item.price
    );
    
    if (existingIndex === -1) {
        // Добавляем новый товар
        cart.push({
            title: item.title,
            price: item.price,
            category: item.category || 'Товар'
        });
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Обновляем badge
    updateCartBadge();
    
    // Вибрация при добавлении
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    // Анимация кнопки корзины
    const cartButton = document.getElementById('cart-button');
    cartButton.classList.add('shake');
    setTimeout(() => cartButton.classList.remove('shake'), 500);
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
            <button class="add-to-cart-btn" onclick='addToCart({title: "${product.name.replace(/'/g, "\\'")}",price: "${product.price}",category: "Запчасть"})'>
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

// ============================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С КАТАЛОГОМ УСЛУГ
// ============================================

// Показать страницу услуг
function showServices() {
    // Скрываем главное меню
    const header = document.querySelector('.header');
    const navigation = document.querySelector('.navigation');
    
    if (header) header.style.display = 'none';
    if (navigation) navigation.style.display = 'none';
    
    // Показываем страницу услуг
    const servicesPage = document.getElementById('services-page');
    if (servicesPage) {
        servicesPage.style.display = 'block';
    }
    
    // Загружаем услуги, если еще не загружены
    if (allServices.length === 0) {
        loadServices();
    }
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Скрыть страницу услуг
function hideServices() {
    // Скрываем страницу услуг
    const servicesPage = document.getElementById('services-page');
    if (servicesPage) {
        servicesPage.style.display = 'none';
    }
    
    // Показываем главное меню
    const header = document.querySelector('.header');
    const navigation = document.querySelector('.navigation');
    
    if (header) header.style.display = 'block';
    if (navigation) navigation.style.display = 'flex';
    
    // Очищаем поиск
    const searchInput = document.getElementById('services-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Загрузить услуги из CSV
function loadServices() {
    const servicesGrid = document.getElementById('services-grid');
    
    // Показываем индикатор загрузки
    servicesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #0097a7; font-size: 1.2rem;"><i class="fas fa-spinner fa-spin"></i> Загрузка услуг...</div>';
    
    fetch(SERVICES_CSV_URL)
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
            
            allServices = [];
            
            // Пропускаем заголовок, обрабатываем строки
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                
                if (values.length >= 6) {
                    const service = {
                        id: values[0].trim(),
                        name: values[1].trim(),
                        description: values[2].trim(),
                        price: values[3].trim(),
                        brand: values[4].trim(),
                        duration: values[5].trim()
                    };
                    
                    allServices.push(service);
                }
            }
            
            // Отображаем услуги
            displayServices(allServices);
            
            console.log('Загружено услуг:', allServices.length);
        })
        .catch(error => {
            console.error('Ошибка при загрузке услуг:', error);
            servicesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff5252; font-size: 1.2rem;"><i class="fas fa-exclamation-triangle"></i> Ошибка загрузки данных</div>';
            
            if (tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
        });
}

// Отобразить услуги в сетке
function displayServices(services) {
    const servicesGrid = document.getElementById('services-grid');
    
    if (services.length === 0) {
        servicesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888; font-size: 1.2rem;">Услуги не найдены</div>';
        return;
    }
    
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = service.id;
        card.dataset.price = service.price;
        card.dataset.name = service.name;
        card.dataset.description = service.description;
        
        card.innerHTML = `
            <h3>${service.name}</h3>
            <div class="description">${service.description}</div>
            <div class="category"><i class="fas fa-car"></i> Марка: ${service.brand}</div>
            <div class="availability"><i class="fas fa-clock"></i> ${service.duration} мин</div>
            <div class="price">${service.price} ₽</div>
            <button class="add-to-cart-btn" onclick='addToCart({title: "${service.name.replace(/'/g, "\\'")}",price: "${service.price}",category: "Услуга"})'>
                <i class="fas fa-cart-plus"></i> В корзину
            </button>
        `;
        
        servicesGrid.appendChild(card);
    });
}

// Фильтрация услуг по поисковому запросу
function filterServices() {
    const searchInput = document.getElementById('services-search-input');
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        // Показываем все услуги
        displayServices(allServices);
    } else {
        // Фильтруем услуги
        const filtered = allServices.filter(service => {
            return service.name.toLowerCase().includes(query) ||
                   service.description.toLowerCase().includes(query) ||
                   service.brand.toLowerCase().includes(query);
        });
        
        displayServices(filtered);
    }
}

// ============================================
// ФУНКЦИИ ДЛЯ РАБОТЫ СО СТРАНИЦЕЙ КОНТАКТОВ
// ============================================

// Показать страницу контактов
function showContacts() {
    // Скрываем главное меню
    const header = document.querySelector('.header');
    const navigation = document.querySelector('.navigation');
    
    if (header) header.style.display = 'none';
    if (navigation) navigation.style.display = 'none';
    
    // Показываем страницу контактов
    const contactsPage = document.getElementById('contacts-page');
    if (contactsPage) {
        contactsPage.style.display = 'flex';
    }
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Скрыть страницу контактов
function hideContacts() {
    // Скрываем страницу контактов
    const contactsPage = document.getElementById('contacts-page');
    if (contactsPage) {
        contactsPage.style.display = 'none';
    }
    
    // Показываем главное меню
    const header = document.querySelector('.header');
    const navigation = document.querySelector('.navigation');
    
    if (header) header.style.display = 'block';
    if (navigation) navigation.style.display = 'flex';
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// ============================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С КОРЗИНОЙ
// ============================================

// Показать корзину
function showCart() {
    // Скрываем главное меню
    const header = document.querySelector('.header');
    const navigation = document.querySelector('.navigation');
    
    if (header) header.style.display = 'none';
    if (navigation) navigation.style.display = 'none';
    
    // Показываем страницу корзины
    const cartPage = document.getElementById('cart-page');
    if (cartPage) {
        cartPage.style.display = 'block';
    }
    
    // Отображаем товары в корзине
    renderCart();
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Скрыть корзину
function hideCart() {
    // Скрываем страницу корзины
    const cartPage = document.getElementById('cart-page');
    if (cartPage) {
        cartPage.style.display = 'none';
    }
    
    // Показываем главное меню
    const header = document.querySelector('.header');
    const navigation = document.querySelector('.navigation');
    
    if (header) header.style.display = 'block';
    if (navigation) navigation.style.display = 'flex';
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Отрисовка корзины
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart"></i><br>Корзина пуста</div>';
        cartTotalPrice.textContent = '0 ₽';
        return;
    }
    
    // Генерируем HTML для каждого товара
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        total += price;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-category">${item.category}</div>
            </div>
            <div class="cart-item-price">${item.price} ₽</div>
            <button class="remove-btn" onclick="removeFromCart(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Обновляем итоговую сумму
    cartTotalPrice.textContent = `${total.toFixed(0)} ₽`;
}

// Удалить товар из корзины
function removeFromCart(index) {
    cart.splice(index, 1);
    
    // Сохраняем в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Обновляем badge
    updateCartBadge();
    
    // Перерисовываем корзину
    renderCart();
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Подтверждение заказа
function confirmOrder() {
    if (cart.length === 0) {
        tg.showAlert('Корзина пуста');
        return;
    }
    
    // Формируем текст заказа
    let orderText = '🛒 ЗАКАЗ:\n\n';
    let total = 0;
    
    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        total += price;
        orderText += `${index + 1}. ${item.title}\n`;
        orderText += `   Категория: ${item.category}\n`;
        orderText += `   Цена: ${item.price} ₽\n\n`;
    });
    
    orderText += `💰 Итого: ${total.toFixed(0)} ₽`;
    
    // Отправляем данные боту
    tg.sendData(JSON.stringify({
        order: cart,
        total: total,
        text: orderText
    }));
    
    // Очищаем корзину
    cart = [];
    localStorage.removeItem('cart');
    updateCartBadge();
    
    // Вибрация успеха
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
    
    tg.close();
}

// Обработчик клика по кнопке корзины
document.getElementById('cart-button').addEventListener('click', showCart);

// Инициализация при загрузке
updateCartBadge();

console.log('AutoService Pro WebApp загружен');
console.log('Telegram WebApp готов:', tg.isReady);
