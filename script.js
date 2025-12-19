// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();

// Корзина
let cart = [];
let cartCount = 0;

// Элементы DOM
const cartButton = document.getElementById('cart-button');
const cartBadge = document.getElementById('cart-badge');
const navButtons = document.querySelectorAll('.nav-button');
const sections = {
    'parts': document.getElementById('parts-section'),
    'services': document.getElementById('services-section'),
    'contacts': document.getElementById('contacts-section')
};

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

console.log('AutoService Pro WebApp загружен');
console.log('Telegram WebApp готов:', tg.isReady);
