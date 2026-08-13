/**
 * app.js - Miel de La Sabretache
 * Interactive shopping cart and checkout integration via WhatsApp & Email.
 */

// --- CONFIGURATION ---
// Set your WhatsApp number here (in international format, e.g., '32470000000' for Belgium +32 470 00 00 00)
const ARTISAN_WHATSAPP_NUMBER = '32477236711'; 
// Set your email address here
const ARTISAN_EMAIL = 'patsy3.massange@gmail.com';

// --- PRODUCTS CONFIGURATION ---
const PRODUCTS = {
  honey: {
    id: 'honey',
    name: 'Miel de Printemps de La Sabretache',
    price: 8.00,
    unit: 'pot de 250g',
    img: 'assets/images/honey.jpg'
  }
};

// --- STATE MANAGEMENT ---
let cart = [];

// --- DOM ELEMENTS ---
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsContainer = document.querySelector('.cart-items-container');
const cartCountBadges = document.querySelectorAll('.cart-count');
const totalPriceEl = document.querySelector('.total-price');
const checkoutForm = document.getElementById('checkoutForm');
const navbar = document.querySelector('.navbar');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Load cart from local storage
  loadCartFromLocalStorage();
  
  // 2. Set scroll listener for navbar glassmorphism transition
  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll(); // Run once in case page starts scrolled
  
  // 3. Set up fallbacks for newer web features
  setupDialogLightDismissFallback();
  setupScrollRevealFallback();
});

// --- SCROLL & STYLE HELPERS ---
function handleNavbarScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// --- CART LOGIC ---
function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('sabretache_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch (e) {
      cart = [];
    }
  }
}

function saveCartToLocalStorage() {
  localStorage.setItem('sabretache_cart', JSON.stringify(cart));
}

function addToCart(productId) {
  const product = PRODUCTS[productId];
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      unit: product.unit,
      img: product.img,
      qty: 1
    });
  }
  
  saveCartToLocalStorage();
  updateCartUI();
  
  // Haptic feedback & bounce animation for cart icon
  animateCartIcon();
  
  // Automatically open the cart drawer so the user sees their product added
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToLocalStorage();
  updateCartUI();
}

function updateQuantity(productId, amount) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  item.qty += amount;
  
  if (item.qty <= 0) {
    removeFromCart(productId);
  } else {
    saveCartToLocalStorage();
    updateCartUI();
  }
}

function getCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.qty), 0);
}

function getCartItemsCount() {
  return cart.reduce((count, item) => count + item.qty, 0);
}

function updateCartUI() {
  // Update cart counters
  const totalCount = getCartItemsCount();
  cartCountBadges.forEach(badge => {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  });
  
  // Update total price
  totalPriceEl.textContent = `${getCartTotal().toFixed(2)} €`;
  
  // Render cart items
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <svg viewBox="0 0 24 24"><path d="M17.21 9l-4.38-6.56c-.18-.28-.5-.44-.83-.44s-.65.16-.83.44L6.79 9H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h.08l1.49 8.28c.11.58.61 1.01 1.2 1.01h14.46c.59 0 1.09-.43 1.2-1.01L21.92 12h.08c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-4.79zM9 9l3-4.5L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
        <p>Votre panier est vide pour l'instant.</p>
        <p style="font-size: 0.85rem; opacity: 0.7;">Parcourez notre boutique et découvrez les délices de Lasne !</p>
      </div>
    `;
    // Disable form fields if cart is empty
    toggleFormFields(false);
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <p style="font-size: 0.8rem; color: var(--color-charcoal-light);">${item.unit}</p>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)" aria-label="Diminuer">-</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)" aria-label="Augmenter">+</button>
            <span class="cart-item-price" style="margin-left: auto;">${(item.price * item.qty).toFixed(2)} €</span>
          </div>
        </div>
        <button class="btn-remove-item" onclick="removeFromCart('${item.id}')" aria-label="Supprimer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `).join('');
    toggleFormFields(true);
  }
}

function toggleFormFields(enable) {
  const inputs = checkoutForm.querySelectorAll('input, select, button');
  inputs.forEach(input => {
    if (enable) {
      input.removeAttribute('disabled');
    } else {
      input.setAttribute('disabled', 'true');
    }
  });
}

function animateCartIcon() {
  const toggle = document.querySelector('.cart-toggle');
  toggle.style.transform = 'scale(0.8)';
  setTimeout(() => {
    toggle.style.transform = 'scale(1.15)';
    setTimeout(() => {
      toggle.style.transform = 'none';
    }, 150);
  }, 100);
}

// --- DRAWER OPEN/CLOSE ---
function openCart() {
  cartDrawer.showModal();
  document.body.style.overflow = 'hidden'; // Lock background scrolling
}

function closeCart() {
  cartDrawer.close();
  document.body.style.overflow = ''; // Release scroll
}

// --- FALLBACKS ---

/**
 * Fallback for closedby="any" attribute (light-dismiss) in Safari
 */
function setupDialogLightDismissFallback() {
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    cartDrawer.addEventListener('click', (event) => {
      if (event.target !== cartDrawer) return;
      
      const rect = cartDrawer.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      
      if (!isDialogContent) {
        closeCart();
      }
    });
  }
}

/**
 * Fallback for scroll-driven animations in unsupported browsers (like Firefox or older Safari)
 */
function setupScrollRevealFallback() {
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    const reveals = document.querySelectorAll('.scroll-reveal');
    
    // Add fallback structure classes
    reveals.forEach(el => el.classList.add('scroll-reveal-fallback'));
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once visible, we can unobserve if we only want entry effect once
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully in viewport
    });
    
    reveals.forEach(el => observer.observe(el));
  }
}

// --- CHECKOUT CHANNELS ---

function handleCheckout(channel) {
  // 1. Basic Form Validation
  const name = document.getElementById('custName').value.trim();
  const pickup = document.getElementById('pickupOption').value;
  
  if (!name) {
    alert("Veuillez saisir votre nom pour valider la commande.");
    document.getElementById('custName').focus();
    return;
  }
  
  if (cart.length === 0) {
    alert("Votre panier est vide.");
    return;
  }
  
  // 2. Draft order text
  const dateStr = new Date().toLocaleDateString('fr-FR');
  const itemsText = cart.map(item => `- ${item.qty}x ${item.name} (${item.unit}) : ${(item.price * item.qty).toFixed(2)}€`).join('\n');
  const total = getCartTotal().toFixed(2);
  const pickupMethod = pickup === 'collect' ? 'Retrait à La Sabretache (Lasne)' : 'Livraison locale de proximité';
  
  const rawMessage = `Bonjour ! 🍯🌸\nJe souhaite réserver des produits de La Sabretache :\n\nCommande du ${dateStr} :\n${itemsText}\n\nTotal : ${total} €\n\nClient : ${name}\nMode de retrait : ${pickupMethod}\n\nMerci beaucoup ! À bientôt pour le retrait.`;
  
  // 3. Direct to WhatsApp or Email
  if (channel === 'whatsapp') {
    const encodedText = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/${ARTISAN_WHATSAPP_NUMBER}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  } else if (channel === 'email') {
    const subject = encodeURIComponent(`Réservation Miel de Printemps - Sabretache - ${name}`);
    const encodedBody = encodeURIComponent(rawMessage);
    const mailtoUrl = `mailto:${ARTISAN_EMAIL}?subject=${subject}&body=${encodedBody}`;
    window.location.href = mailtoUrl;
  }
  
  // 4. Optional: Clear cart after submission so they don't double order
  // (We do it after a slight delay to let the redirect complete)
  setTimeout(() => {
    cart = [];
    saveCartToLocalStorage();
    updateCartUI();
    closeCart();
    alert("Votre message de commande a été préparé ! Merci de l'envoyer dans l'application ouverte.");
  }, 1000);
}
