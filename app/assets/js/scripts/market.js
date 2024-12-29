// Exemple de données JSON internes pour le shop (produits)
const shopData = {
    "servers": [
        {
            "name": "in maintenance",
            "products": [
                {
                    "name": "",
                    "image": "",
                    "price": 0,
                    "status": ""
                },
            ]
        }        
    ]
};

// Fonction pour charger les données du shop
async function loadShopData() {
    try {
        const shopContainer = document.getElementById('creators-container');
        if (!shopContainer) return;

        shopContainer.innerHTML = '';

        if (!shopData?.servers || shopData.servers.length === 0) {
            shopContainer.innerHTML = `
                <div class="empty-message">
                    <i class="fa-solid fa-box-open"></i> <span>${Lang.queryEJS('status.noItems')}</span>
                </div>`;
            addCloseButton(shopContainer);
            return;
        }

        const fragment = document.createDocumentFragment();
        for (const server of shopData.servers) {
            const serverContent = document.createElement('div');
            serverContent.classList.add('serverContent');

            const serverTitle = document.createElement('div');
            serverTitle.classList.add('server-title');
            serverTitle.innerText = `Shop of ${server.name}`;
            serverContent.appendChild(serverTitle);

            const productList = document.createElement('div');
            productList.classList.add('product-list');

            if (server.products.length > 0) {
                server.products.forEach(product => {
                    const productItem = createProductItem(product);
                    productList.appendChild(productItem);
                });
            }

            serverContent.appendChild(productList);
            fragment.appendChild(serverContent);
        }

        shopContainer.appendChild(fragment);

        addScrollListener();
        addCloseButton(shopContainer);
    } catch (error) {
        console.error('Error loading shop data:', error);
    }
}

// Ajouter un bouton de fermeture
function addCloseButton(container) {
    if (!document.getElementById('shop-close')) {
        const closeButton = document.createElement('button');
        closeButton.id = 'shop-close';
        closeButton.classList.add('Shop-closebtn');
        closeButton.innerText = Lang.queryEJS('status.confirm');
        closeButton.onclick = () => {
            switchView(getCurrentView(), VIEWS.landing);
        };

        container.appendChild(closeButton);
    }
}

// Fonction pour créer un élément produit
function createProductItem(product) {
    const productItem = document.createElement('div');
    productItem.classList.add('product-item');
    if (product.status === 'available') productItem.classList.add('available-opacity');
    if (product.image) {
        productItem.style.backgroundImage = `url(${product.image})`;
        productItem.classList.add('with-bg');
    }

    const productNameContainer = document.createElement('div');
    productNameContainer.classList.add('product-name-container');

    const productStatusCircle = document.createElement('div');
    productStatusCircle.classList.add('status-circle', product.status === 'available' ? 'available' : 'out-of-stock');
    productNameContainer.appendChild(productStatusCircle);

    const productName = document.createElement('div');
    productName.classList.add('product-name');
    productName.innerText = product.name;
    productNameContainer.appendChild(productName);

    productItem.appendChild(productNameContainer);

    const productPrice = document.createElement('div');
    productPrice.classList.add('product-price');
    productPrice.innerText = `$${product.price}`;
    productItem.appendChild(productPrice);

    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-button');
    buyButton.innerText = Lang.queryEJS('status.buyNow');
    buyButton.onclick = () => {
        alert(`You are buying ${product.name} for $${product.price}`);
    };
    productItem.appendChild(buyButton);

    return productItem;
}

// Fonction pour écouter le scroll du conteneur
function shopScrollListener(e) {
    const target = e.target;
    const scrollThreshold = 5;
    if (target.scrollTop > scrollThreshold) {
        target.setAttribute('scrolled', '');
    } else {
        target.removeAttribute('scrolled');
    }
}

// Ajouter un listener de scroll
function addScrollListener() {
    const shopContainer = document.getElementById('creators-container');
    if (shopContainer) {
        shopContainer.addEventListener('scroll', shopScrollListener);
    }
}

// Désactiver le scroll de la page
function disablePageScroll() {
    document.body.style.overflow = 'hidden';
}

// Activer le scroll de la page
function enablePageScroll() {
    document.body.style.overflow = '';
}

// Mettre à jour le statut de disponibilité des produits
async function updateAvailabilityStatus() {
    if (!shopData?.servers) return;

    let anyProductAvailable = false;
    for (const server of shopData.servers) {
        for (const product of server.products) {
            if (product.status === 'available') {
                anyProductAvailable = true;
                break;
            }
        }
        if (anyProductAvailable) break;
    }

    const shopMediaButton = document.getElementById('ShopMediaButton');
    if (shopMediaButton) {
        if (anyProductAvailable) {
            shopMediaButton.classList.add('available');
        } else {
            shopMediaButton.classList.remove('available');
        }
    }
}

// Charger les données dès que le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    loadShopData();
    disablePageScroll();
    updateAvailabilityStatus();
});
