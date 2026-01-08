// Variables globales
let cart = [];
let cartTotal = 0;

// DOM Elements
const categoryButtons = document.querySelectorAll('.category-btn');
const menuSections = document.querySelectorAll('.menu-section');
const cartModal = document.getElementById('cartModal');
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountElement = document.getElementById('cartCount');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const emptyCartElement = document.getElementById('emptyCart');

// Formatear precio a moneda
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
}

// Filtrar menú por categoría
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remover clase activa de todos los botones
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        
        // Agregar clase activa al botón clickeado
        button.classList.add('active');
        
        const category = button.dataset.category;
        
        // Mostrar/ocultar secciones según la categoría
        if (category === 'all') {
            menuSections.forEach(section => section.classList.add('active'));
        } else {
            menuSections.forEach(section => {
                if (section.id === category) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        }
        
        // Scroll suave a la sección seleccionada
        if (category !== 'all') {
            const targetSection = document.getElementById(category);
            window.scrollTo({
                top: targetSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// Función para agregar items al carrito
document.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart')) {
        const button = e.target.closest('.add-to-cart');
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseInt(button.dataset.price);
        const image = button.dataset.image;
        
        addToCart(id, name, price, image);
        
        // Efecto visual de confirmación
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-plus"></i>';
            button.style.backgroundColor = '';
        }, 1000);
    }
});

// Función para agregar producto al carrito
function addToCart(id, name, price, image) {
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            image,
            quantity: 1
        });
    }
    
    // Actualizar carrito
    updateCart();
    
    // Mostrar notificación
    showNotification(`${name} agregado al carrito`);
}

// Función para actualizar carrito
function updateCart() {
    // Actualizar contador
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Actualizar total
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    cartTotalElement.textContent = formatPrice(cartTotal);
    
    // Actualizar lista de items en el carrito
    renderCartItems();
}

// Función para renderizar items del carrito
function renderCartItems() {
    if (cart.length === 0) {
        emptyCartElement.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        cartItemsContainer.appendChild(emptyCartElement);
        return;
    }
    
    emptyCartElement.style.display = 'none';
    
    let cartItemsHTML = '';
    
    cart.forEach(item => {
        cartItemsHTML += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartItemsHTML;
    
    // Agregar event listeners a los botones de cantidad
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateQuantity(id, -1);
        });
    });
    
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateQuantity(id, 1);
        });
    });
}

// Función para actualizar cantidad de un item
function updateQuantity(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        // Si la cantidad es 0 o menor, eliminar el item
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        updateCart();
    }
}

// Mostrar notificación
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: var(--accent);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    // Agregar estilos para la animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remover notificación después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event listeners para el carrito
openCartBtn.addEventListener('click', () => {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Cerrar carrito al hacer clic fuera
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Checkout
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos platos antes de realizar el pedido.');
        return;
    }
    
    // Simular proceso de checkout
    const orderDetails = cart.map(item => 
        `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');
    
    const total = formatPrice(cartTotal);
    const message = `¡Pedido realizado con éxito!\n\nDetalles:\n${orderDetails}\n\nTotal: ${total}\n\nGracias por tu compra.`;
    
    alert(message);
    
    // Limpiar carrito
    cart = [];
    updateCart();
    
    // Cerrar modal
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Inicializar carrito
updateCart();

// Mostrar todas las secciones por defecto
document.addEventListener('DOMContentLoaded', () => {
    menuSections.forEach(section => section.classList.add('active'));
});
