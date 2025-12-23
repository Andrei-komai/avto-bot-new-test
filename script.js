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

// Подтверждение заказа - переход к оформлению
function confirmOrder() {
    if (cart.length === 0) {
        tg.showAlert('Корзина пуста');
        return;
    }
    
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
    initBookingDateRange();
    
    // Проверяем валидность формы
    validateCheckoutForm();
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

// Вернуться в корзину из формы оформления
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
function submitOrder() {
    const form = document.getElementById('checkout-form');
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const date = document.getElementById('booking-date').value;
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
    
    const orderData = {
        customer: {
            name: name,
            phone: phone,
            email: email,
            date: date,
            time: time
        },
        paymentMethod: paymentMethod,
        items: cart,
        total: total
    };
    
    // Скрываем форму
    const checkoutSection = document.getElementById('checkout-section');
    if (checkoutSection) {
        checkoutSection.style.display = 'none';
    }
    
    // Если оплата картой - показываем имитацию
    if (paymentMethod === 'card') {
        const paymentStub = document.getElementById('payment-stub-section');
        if (paymentStub) {
            paymentStub.style.display = 'flex';
        }
        
        // Имитация обработки платежа
        setTimeout(() => {
            finishOrder(orderData);
        }, 2000);
    } else {
        // Наличными - сразу завершаем
        finishOrder(orderData);
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
    const date = document.getElementById('booking-date');
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
    const dateInput = document.getElementById('booking-date');
    
    if (nameInput) {
        nameInput.addEventListener('input', validateCheckoutForm);
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', validateCheckoutForm);
    }

    if (dateInput) {
        dateInput.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value + 'T00:00:00');
            
            // Проверка на воскресенье
            if (isWeekend(selectedDate)) {
                alert('В воскресенье сервис не работает, выберите другой день.');
                
                // Находим следующий понедельник
                const nextMonday = new Date(selectedDate);
                nextMonday.setDate(selectedDate.getDate() + 1);
                
                // Проверяем, что понедельник в пределах max
                const maxDate = new Date(dateInput.max + 'T00:00:00');
                if (nextMonday <= maxDate) {
                    const year = nextMonday.getFullYear();
                    const month = String(nextMonday.getMonth() + 1).padStart(2, '0');
                    const day = String(nextMonday.getDate()).padStart(2, '0');
                    dateInput.value = `${year}-${month}-${day}`;
                } else {
                    // Если понедельник выходит за пределы, ставим предыдущую пятницу
                    const prevFriday = new Date(selectedDate);
                    prevFriday.setDate(selectedDate.getDate() - 2);
                    const year = prevFriday.getFullYear();
                    const month = String(prevFriday.getMonth() + 1).padStart(2, '0');
                    const day = String(prevFriday.getDate()).padStart(2, '0');
                    dateInput.value = `${year}-${month}-${day}`;
                }
                
                // Генерируем слоты для новой даты
                generateAndRenderTimeSlots(dateInput.value);
            } else {
                // Обычная логика для рабочих дней
                validateCheckoutForm();
                generateAndRenderTimeSlots(e.target.value);
            }
        });
    }
    
    // Инициализация диапазона дат
    initBookingDateRange();
});

// Инициализация при загрузке
updateCartBadge();

console.log('AutoService Pro WebApp загружен');
console.log('Telegram WebApp готов:', tg.isReady);
// === BOOKING DATE/TIME FUNCTIONS ===

/**
 * Инициализация диапазона дат для записи (сегодня + 27 дней)
 */
function initBookingDateRange() {
    const bookingDateInput = document.getElementById('booking-date');
    if (!bookingDateInput) return;

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 27);

    // Форматируем в YYYY-MM-DD для input[type="date"]
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    bookingDateInput.min = formatDate(today);
    bookingDateInput.max = formatDate(maxDate);
    bookingDateInput.value = formatDate(today);

    // Генерируем слоты для текущей даты
    generateAndRenderTimeSlots(bookingDateInput.value);
}

/**
 * Проверяет, является ли дата воскресеньем
 * @param {Date} date - объект Date
 * @returns {boolean} true если воскресенье
 */
function isWeekend(date) {
    return date.getDay() === 0;
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