// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Глобальная переменная для занятых слотов
let busySlots = [];

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

// Google Apps Script API URLs
const PARTS_API_URL = 'https://script.google.com/macros/s/AKfycbxt27ByU4m8DVCspx_3CNRuKLfGMvfp7_9EcAwhepkftyptUUMVX2lnnV9qfE0obB3W/exec?sheet=parts';
const SERVICES_API_URL = 'https://script.google.com/macros/s/AKfycbxt27ByU4m8DVCspx_3CNRuKLfGMvfp7_9EcAwhepkftyptUUMVX2lnnV9qfE0obB3W/exec?sheet=services';

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

// Загрузить товары из Google Apps Script API
function loadParts() {
    const partsGrid = document.getElementById('parts-grid');
    
    // Показываем индикатор загрузки
    partsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #0097a7; font-size: 1.2rem;"><i class="fas fa-spinner fa-spin"></i> Загрузка товаров...</div>';
    
    fetch(PARTS_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .then(data => {
            // Проверяем успешность ответа
            if (!data.ok || !data.items) {
                throw new Error('Неверный формат данных');
            }
            
            allProducts = [];
            
            // Обрабатываем элементы из JSON
            data.items.forEach(item => {
                const product = {
                    id: item.ID || item.id || '',
                    name: item['Название'] || item.name || '',
                    description: item['Описание'] || item.description || '',
                    price: item['Цена'] || item.price || 0,
                    category: item['Категория'] || item.category || '',
                    availability: item['Наличие'] || item.stock || item.availability || ''
                };
                
                allProducts.push(product);
            });
            
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

// Загрузить услуги из Google Apps Script API
function loadServices() {
    const servicesGrid = document.getElementById('services-grid');
    
    // Показываем индикатор загрузки
    servicesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #0097a7; font-size: 1.2rem;"><i class="fas fa-spinner fa-spin"></i> Загрузка услуг...</div>';
    
    fetch(SERVICES_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .then(data => {
            // Проверяем успешность ответа
            if (!data.ok || !data.items) {
                throw new Error('Неверный формат данных');
            }
            
            allServices = [];
            
            // Обрабатываем элементы из JSON
            data.items.forEach(item => {
                const service = {
                    id: item.ID || item.id || '',
                    name: item['Название'] || item.name || '',
                    description: item['Описание'] || item.description || '',
                    price: item['Цена'] || item.price || 0,
                    brand: item['Марка авто'] || item.carBrand || item.brand || 'Все',
                    duration: item['Продолжительность работ (мин)'] || item.duration || 0
                };
                
                allServices.push(service);
            });
            
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

// Функции управления лоадером
function showLoader(message = 'Загрузка...') {
    const loader = document.getElementById('calendar-loader');
    const loaderMessage = document.getElementById('loader-message');
    
    if (loader) {
        if (loaderMessage) {
            loaderMessage.textContent = message;
        }
        loader.style.display = 'flex';
    }
}

function hideLoader() {
    const loader = document.getElementById('calendar-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Проверка доступности слотов через Make.com
async function checkAvailableSlots(date) {
    const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/ig3c328ypb5wuxq9nleyhw4wl4qas4en';
    
    try {
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ checkDate: date })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка при проверке слотов:', error);
        throw error;
    }
}

// Подтверждение заказа - переход к оформлению
async function confirmOrder() {
    if (cart.length === 0) {
        tg.showAlert('Корзина пуста');
        return;
    }
    
    // Показываем лоадер
    showLoader('Проверяем свободное время...');
    
    try {
        // Получаем текущую дату для проверки
        const today = new Date();
        const checkDate = today.toISOString().split('T')[0]; // Формат YYYY-MM-DD
        
        // Запрашиваем занятые слоты
        const data = await checkAvailableSlots(checkDate);
        
        // Сохраняем занятые слоты
        busySlots = data;
        console.log('Полученные данные о занятых слотах:', data);
        
        // Скрываем лоадер
        hideLoader();
        
        // Показываем форму оформления
        showCheckoutForm();
        
    } catch (error) {
        // Скрываем лоадер
        hideLoader();
        
        // Показываем ошибку
        if (tg.showAlert) {
            tg.showAlert('Не удалось загрузить расписание. Попробуйте позже.');
        } else {
            alert('Не удалось загрузить расписание. Попробуйте позже.');
        }
        
        // Можно все равно показать форму (опционально)
        // showCheckoutForm();
    }
}

// Показ формы оформления (вынесено в отдельную функцию)
function showCheckoutForm() {
    // Скрываем корзину
    const cartPage = document.getElementById('cart-page');
    if (cartPage) {
        cartPage.style.display = 'none';
    }
    
    // Показываем форму оформления
    const checkoutSection = document.getElementById('checkout-section');
    if (checkoutSection) {
        checkoutSection.style.display = 'block';
    }
    
    // Отображаем товары в форме оформления
    renderCheckoutItems();
    
    // Инициализируем выбор даты/времени
    initCheckoutDatePicker();
    
    // Проверяем валидность формы
    validateCheckoutForm();
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Вернуться в корзину из формы оформления (старая функция backToCart)
function backToCart() {
    const checkoutSection = document.getElementById('checkout-section');
    if (checkoutSection) {
        checkoutSection.style.display = 'none';
    }
    
    const cartPage = document.getElementById('cart-page');
    if (cartPage) {
        cartPage.style.display = 'block';
    }
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Отрисовка товаров в форме оформления
function renderCheckoutItems() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotalPrice = document.getElementById('checkout-total-price');
    
    if (!checkoutItems || !checkoutTotalPrice) return;
    
    checkoutItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const price = parseFloat(item.price) || 0;
        total += price;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
            <span class="checkout-item-title">${item.title}</span>
            <span class="checkout-item-price">${item.price} ₽</span>
        `;
        
        checkoutItems.appendChild(itemDiv);
    });
    
    checkoutTotalPrice.textContent = `${total.toFixed(0)} ₽`;
}

// Отправка заказа
// Отправка заказа
async function submitOrder() {
    const form = document.getElementById('checkout-form');
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const date = document.getElementById('booking-date-checkout').value;
    const time = document.getElementById('booking-time').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Проверка обязательных полей
    if (!name || !phone) {
        tg.showAlert('Заполните обязательные поля: ФИО и Телефон');
        return;
    }
    
    if (!date || !time) {
        tg.showAlert('Выберите дату и время записи');
        return;
    }
    
    // Формируем данные заказа
    let total = 0;
    cart.forEach(item => {
        total += parseFloat(item.price) || 0;
    });
    
    // Собираем полные данные заказа для отправки
    const orderData = {
        customer: {
            name: name,
            phone: phone,
            email: email || '',
            date: date,
            time: time
        },
        paymentMethod: paymentMethod,
        items: cart.map(item => ({
            title: item.title,
            price: item.price,
            category: item.category || 'Товар'
        })),
        total: total,
        timestamp: new Date().toISOString()
    };
    
    // Показываем лоадер
    showLoader('Оформляем заказ...');
    
    try {
        // Отправляем заказ на сервер Make.com
        const response = await fetch('https://hook.eu2.make.com/e84kjy57b85quotfiddl4atcshywyva9', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Успешная отправка
        console.log('Заказ успешно отправлен:', orderData);
        
        // Скрываем лоадер
        hideLoader();
        
        // Скрываем форму
        const checkoutSection = document.getElementById('checkout-section');
        if (checkoutSection) {
            checkoutSection.style.display = 'none';
        }
        
        // Показываем экран успеха
        const successSection = document.getElementById('success-section');
        if (successSection) {
            successSection.style.display = 'flex';
        }
        
        // Отправляем данные в Telegram (если нужно)
        try {
            tg.sendData(JSON.stringify(orderData));
        } catch (e) {
            console.log('Telegram sendData not available:', e);
        }
        
        // Очищаем корзину
        cart = [];
        localStorage.removeItem('cart');
        updateCartBadge();
        
        // Вибрация успеха
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
        
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        
        // Скрываем лоадер
        hideLoader();
        
        // Показываем ошибку
        if (tg.showAlert) {
            tg.showAlert('Ошибка при отправке заказа. Попробуйте еще раз.');
        } else {
            alert('Ошибка при отправке заказа. Попробуйте еще раз.');
        }
    }
}

// Завершение оформления заказа
function finishOrder(orderData) {
    // Скрываем имитацию оплаты
    const paymentStub = document.getElementById('payment-stub-section');
    if (paymentStub) {
        paymentStub.style.display = 'none';
    }
    
    // Показываем success screen
    const successSection = document.getElementById('success-section');
    if (successSection) {
        successSection.style.display = 'flex';
    }
    
    // Отправляем данные боту
    const orderText = formatOrderText(orderData);
    tg.sendData(JSON.stringify(orderData));
    
    // Очищаем корзину
    cart = [];
    localStorage.removeItem('cart');
    updateCartBadge();
    
    // Вибрация успеха
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// Форматирование текста заказа
function formatOrderText(orderData) {
    let text = '🛒 НОВЫЙ ЗАКАЗ\n\n';
    text += `👤 Клиент: ${orderData.customer.name}\n`;
    text += `📞 Телефон: ${orderData.customer.phone}\n`;
    
    if (orderData.customer.email) {
        text += `📧 Email: ${orderData.customer.email}\n`;
    }
    
    if (orderData.customer.date) {
        text += `📅 Дата: ${orderData.customer.date}\n`;
    }
    
    if (orderData.customer.time) {
        text += `⏰ Время: ${orderData.customer.time}\n`;
    }
    
    text += `\n💳 Оплата: ${orderData.paymentMethod === 'cash' ? 'Наличными' : 'Картой онлайн'}\n`;
    text += `\n📦 Товары/Услуги:\n`;
    
    orderData.items.forEach((item, index) => {
        text += `${index + 1}. ${item.title} - ${item.price} ₽\n`;
    });
    
    text += `\n💰 Итого: ${orderData.total.toFixed(0)} ₽`;
    
    return text;
}

// Переход в главное меню
function goToMainMenu() {
    // Скрываем success screen
    const successSection = document.getElementById('success-section');
    if (successSection) {
        successSection.style.display = 'none';
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

// Закрыть приложение
function closeApp() {
    tg.close();
}

// Обработчик клика по кнопке корзины
document.getElementById('cart-button').addEventListener('click', showCart);

// Валидация формы оформления заказа
function validateCheckoutForm() {
    const name = document.getElementById('customer-name');
    const phone = document.getElementById('customer-phone');
    const date = document.getElementById('booking-date-checkout');
    const time = document.getElementById('booking-time');
    const submitBtn = document.getElementById('confirm-checkout-btn');
    
    if (!name || !phone || !submitBtn) return;
    
    const isValid = name.value.trim() !== '' && 
                    phone.value.trim() !== '' &&
                    date && date.value.trim() !== '' &&
                    time && time.value.trim() !== '';
    
    submitBtn.disabled = !isValid;
}

// Добавляем слушатели для валидации формы
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    
    if (nameInput) {
        nameInput.addEventListener('input', validateCheckoutForm);
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', validateCheckoutForm);
    }
});

// Инициализация при загрузке
updateCartBadge();

console.log('AutoService Pro WebApp загружен');
console.log('Telegram WebApp готов:', tg.isReady);
// === BOOKING DATE/TIME FUNCTIONS ===

/**
 * Инициализация выбора даты в форме checkout
 */
function initCheckoutDatePicker() {
    const dateInput = document.getElementById('booking-date-checkout');
    const dateDisplay = document.getElementById('booking-date-display');
    const dateDropdown = document.getElementById('booking-date-dropdown');
    
    if (!dateInput || !dateDisplay || !dateDropdown) return;

    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // Форматирование даты
    const formatDateToInput = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateToDisplay = (d) => {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    };

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    // Функция отрисовки календаря
    const renderCalendar = () => {
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 27);

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        let html = `
            <div class="calendar-header">
                <button type="button" class="calendar-nav-btn" id="prev-month">&larr;</button>
                <div>${monthNames[currentMonth]} ${currentYear}</div>
                <button type="button" class="calendar-nav-btn" id="next-month">&rarr;</button>
            </div>
            <div class="calendar-weekdays">
                <div class="calendar-weekday">Пн</div>
                <div class="calendar-weekday">Вт</div>
                <div class="calendar-weekday">Ср</div>
                <div class="calendar-weekday">Чт</div>
                <div class="calendar-weekday">Пт</div>
                <div class="calendar-weekday">Сб</div>
                <div class="calendar-weekday">Вс</div>
            </div>
            <div class="calendar-days">
        `;

        // Пустые ячейки до начала месяца (конвертируем: 0=Вс -> 6, 1=Пн -> 0)
        const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        for (let i = 0; i < startOffset; i++) {
            html += '<button type="button" class="date-option-btn empty"></button>';
        }

        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = formatDateToInput(date);
            const isToday = date.toDateString() === today.toDateString();
            const isSunday = date.getDay() === 0;
            const isPast = date < today;
            const isFuture = date > maxDate;
            const isDisabled = isSunday || isPast || isFuture;

            let classes = 'date-option-btn';
            if (isDisabled) classes += ' disabled';
            if (isToday) classes += ' today';
            if (dateInput.value === dateStr) classes += ' selected';

            html += `<button type="button" class="${classes}" data-date="${dateStr}">${day}</button>`;
        }

        html += '</div>';
        dateDropdown.innerHTML = html;

        // Обработчики для кнопок навигации
        document.getElementById('prev-month')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
            renderCalendar();
        });

        document.getElementById('next-month')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
            renderCalendar();
        });

        // Обработчики для дат
        dateDropdown.querySelectorAll('.date-option-btn:not(.disabled):not(.empty)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedDate = btn.dataset.date;
                const date = new Date(selectedDate + 'T00:00:00');

                // Убираем выделение
                dateDropdown.querySelectorAll('.date-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                // Сохраняем значение
                dateInput.value = selectedDate;
                dateDisplay.textContent = formatDateToDisplay(date);

                // Скрываем календарь
                dateDropdown.style.display = 'none';

                // Генерируем слоты времени
                generateAndRenderTimeSlots(selectedDate);
                validateCheckoutForm();
            });
        });
    };

    // Устанавливаем сегодняшнюю дату по умолчанию
    dateInput.value = formatDateToInput(today);
    dateDisplay.textContent = formatDateToDisplay(today);

    // Обработчик клика по полю отображения
    dateDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dateDropdown.style.display === 'block';
        if (!isVisible) {
            currentMonth = today.getMonth();
            currentYear = today.getFullYear();
            renderCalendar();
        }
        dateDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Закрытие при клике вне
    document.addEventListener('click', (e) => {
        if (!dateDisplay.contains(e.target) && !dateDropdown.contains(e.target)) {
            dateDropdown.style.display = 'none';
        }
    });

    // Генерируем слоты для текущей даты
    generateAndRenderTimeSlots(dateInput.value);
}

/**
 * Получить рабочие часы для конкретной даты
 * @param {string} dateStr - дата в формате YYYY-MM-DD
 * @returns {Object|null} {start: 9, end: 18} или null если выходной
 */
function getWorkingHoursForDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = Воскресенье, 6 = Суббота

    if (dayOfWeek === 0) {
        // Воскресенье - выходной
        return null;
    } else if (dayOfWeek === 6) {
        // Суббота: 10:00 - 16:00
        return { start: 10, end: 16 };
    } else {
        // Понедельник-Пятница: 09:00 - 18:00
        return { start: 9, end: 18 };
    }
}

/**
 * Генерирует массив временных слотов для указанной даты
 * @param {string} dateStr - дата в формате YYYY-MM-DD
 * @returns {Array} массив слотов [{time: "09:00", disabled: false}, ...]
 */
function generateTimeSlotsForDate(dateStr) {
    const workingHours = getWorkingHoursForDate(dateStr);
    
    if (!workingHours) {
        return []; // Выходной день
    }

    const slots = [];
    const selectedDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    // Генерируем слоты с шагом 30 минут
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            
            let disabled = false;
            
            // Если это сегодня, проверяем, не прошло ли время
            if (isToday) {
                const currentHour = today.getHours();
                const currentMinute = today.getMinutes();
                
                if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
                    disabled = true;
                }
            }
            
            slots.push({ time: timeStr, disabled });
        }
    }

    return slots;
}

/**
 * Рендерит временные слоты в контейнере
 * @param {Array} slots - массив слотов
 */
function renderTimeSlots(slots) {
    const container = document.getElementById('booking-time-slots');
    const hiddenInput = document.getElementById('booking-time');
    
    if (!container) return;

    // Очищаем контейнер
    container.innerHTML = '';

    if (slots.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; grid-column: 1 / -1;">В этот день не работаем</p>';
        if (hiddenInput) hiddenInput.value = '';
        return;
    }

    // Создаем кнопки для каждого слота
    slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-slot-btn';
        btn.textContent = slot.time;
        
        if (slot.disabled) {
            btn.classList.add('disabled');
        } else {
            btn.addEventListener('click', () => {
                // Убираем выделение со всех кнопок
                container.querySelectorAll('.time-slot-btn').forEach(b => {
                    b.classList.remove('selected');
                });
                
                // Выделяем текущую кнопку
                btn.classList.add('selected');
                
                // Сохраняем значение в скрытое поле
                if (hiddenInput) {
                    hiddenInput.value = slot.time;
                    // Вызываем валидацию формы
                    validateCheckoutForm();
                }
            });
        }
        
        container.appendChild(btn);
    });

    // Если уже было выбрано время, восстанавливаем выделение
    if (hiddenInput && hiddenInput.value) {
        const selectedBtn = Array.from(container.querySelectorAll('.time-slot-btn'))
            .find(btn => btn.textContent === hiddenInput.value);
        if (selectedBtn && !selectedBtn.classList.contains('disabled')) {
            selectedBtn.classList.add('selected');
        } else {
            // Если выбранное время недоступно, сбрасываем
            hiddenInput.value = '';
        }
    }
}

/**
 * Генерирует и рендерит слоты для указанной даты
 * @param {string} dateStr - дата в формате YYYY-MM-DD
 */
function generateAndRenderTimeSlots(dateStr) {
    const slots = generateTimeSlotsForDate(dateStr);
    renderTimeSlots(slots);
}