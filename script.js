document.addEventListener('DOMContentLoaded', function() {
    
    var track = document.querySelector('.interior-slds__items-wrapper');
    var slides = document.querySelectorAll('.interior-slds__item');
    var prevBtn = document.querySelector('.interior-slds__arrow-left');
    var nextBtn = document.querySelector('.interior-slds__arrow-right');
    var bullets = document.querySelectorAll('.interior-slds__bullet');
    var isMobile = window.innerWidth <= 768;
    
    if (!track || !slides.length) return;
    
    if (isMobile) {
        track.style.transform = 'none';
        track.style.transition = 'none';
        
        for (var k = 0; k < bullets.length; k++) {
            bullets[k].onclick = (function(index) {
                return function() {
                    var slide = slides[index];
                    if (slide) {
                        slide.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center'
                        });
                    }
                    
                    for (var j = 0; j < bullets.length; j++) {
                        bullets[j].classList.remove('interior-slds__bullet-active');
                    }
                    bullets[index].classList.add('interior-slds__bullet-active');
                };
            })(k);
        }
        
        track.addEventListener('scroll', function() {
            var scrollPosition = track.scrollLeft;
            var slideWidth = slides[0].offsetWidth + 15;
            
            var activeIndex = Math.round(scrollPosition / slideWidth);
            if (activeIndex >= slides.length) activeIndex = slides.length - 1;
            
            for (var j = 0; j < bullets.length; j++) {
                bullets[j].classList.remove('interior-slds__bullet-active');
            }
            if (bullets[activeIndex]) {
                bullets[activeIndex].classList.add('interior-slds__bullet-active');
            }
        });
        
        return;
    }
    
    var currentIndex = 0;
    var slideWidth = 700;
    var gap = 30;
    
    function updateArrows() {
        if (currentIndex === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
        }
        
        if (currentIndex === slides.length - 1) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'flex';
        }
    }
    
    function centerActiveSlide() {
        var offset = currentIndex * (slideWidth + gap);
        var container = track.parentElement;
        var containerWidth = container.offsetWidth;
        var centerOffset = (containerWidth - slideWidth) / 2;
        
        track.style.transform = 'translateX(' + (centerOffset - offset) + 'px)';
        
        for (var i = 0; i < slides.length; i++) {
            if (i === currentIndex) {
                slides[i].classList.add('active-slide');
            } else {
                slides[i].classList.remove('active-slide');
            }
        }
        
        for (var j = 0; j < bullets.length; j++) {
            if (j === currentIndex) {
                bullets[j].classList.add('interior-slds__bullet-active');
            } else {
                bullets[j].classList.remove('interior-slds__bullet-active');
            }
        }
        
        updateArrows();
    }
    
    if (nextBtn) {
        nextBtn.onclick = function() {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                centerActiveSlide();
            }
        };
    }
    
    if (prevBtn) {
        prevBtn.onclick = function() {
            if (currentIndex > 0) {
                currentIndex--;
                centerActiveSlide();
            }
        };
    }
    
    for (var k = 0; k < bullets.length; k++) {
        bullets[k].onclick = (function(index) {
            return function() {
                currentIndex = index;
                centerActiveSlide();
            };
        })(k);
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            location.reload();
        } else {
            centerActiveSlide();
        }
    });
    
    centerActiveSlide();
});

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.interior-slds__item');
    
    slides.forEach(function(slide) {
        slide.addEventListener('click', function(e) {
            if (e.target.closest('.interior-slds__arrow')) return;
            
            const bgDiv = this.querySelector('.interior-slds__bgimg');
            if (!bgDiv) return;
            
            const bgStyle = bgDiv.style.backgroundImage;
            const url = bgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            
            if (!url) return;
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const img = document.createElement('img');
            img.className = 'modal-image';
            img.src = url;
            img.alt = 'Увеличенное фото интерьера';
            
            modalContent.appendChild(img);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', function() {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            });
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.body.contains(modal)) {
                    document.body.removeChild(modal);
                    document.body.style.overflow = '';
                }
            });
            
            document.body.style.overflow = 'hidden';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const burgerButton = document.querySelector('.burger-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (burgerButton && mobileMenu) {
        burgerButton.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        const closeButton = mobileMenu.querySelector('.mobile-menu__close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                burgerButton.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                burgerButton.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                burgerButton.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.menu-main-tab');
    const contents = document.querySelectorAll('.menu-tab-content');
    
    if (!tabs.length || !contents.length) return;
    
    function switchTab(tabId) {
        tabs.forEach(t => t.classList.remove('active'));
        
        const activeTab = document.querySelector(`.menu-main-tab[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        contents.forEach(content => content.classList.remove('active'));
        
        const activeContent = document.getElementById(`tab-${tabId}`);
        if (activeContent) {
            activeContent.classList.add('active');
            
            const categoryButtons = activeContent.querySelectorAll('.menu-catalog-cat');
            const catalogItems = activeContent.querySelectorAll('.menu-catalog-item');
            
            if (categoryButtons.length && catalogItems.length) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                const allButton = activeContent.querySelector('.menu-catalog-cat[data-cat="all"]');
                if (allButton) {
                    allButton.classList.add('active');
                }
                
                catalogItems.forEach(item => {
                    item.style.display = 'block';
                });
            }
        }
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    const firstTab = document.querySelector('.menu-main-tab.active');
    if (firstTab) {
        const firstTabId = firstTab.getAttribute('data-tab');
        switchTab(firstTabId);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    
    function initFiltersForContainer(container) {
        const categoryButtons = container.querySelectorAll('.menu-catalog-cat');
        const catalogItems = container.querySelectorAll('.menu-catalog-item');
        
        if (!categoryButtons.length || !catalogItems.length) return;
        
        function filterItems(category) {
            
            catalogItems.forEach(item => {
                if (category === 'all') {
                    item.style.display = 'block';
                } else {
                    const itemCategory = item.getAttribute('data-category');
                    if (itemCategory === category) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        }
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.getAttribute('data-cat');
                filterItems(category);
            });
        });
        
        const allButton = container.querySelector('.menu-catalog-cat[data-cat="all"]');
        if (allButton) {
            filterItems('all');
        }
    }
    
    const tabContents = document.querySelectorAll('.menu-tab-content');
    tabContents.forEach(content => {
        initFiltersForContainer(content);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    function initLoadMore(container) {
        const loadMoreBtn = container.querySelector('.menu-catalog-loadmore-btn');
        if (!loadMoreBtn) return;
        
        const catalogGrid = container.querySelector('.menu-catalog-grid');
        if (!catalogGrid) return;
        
        const allItems = Array.from(catalogGrid.querySelectorAll('.menu-catalog-item'));
        if (allItems.length === 0) return;
        
        let itemsPerPage = 8;
        let currentlyShown = itemsPerPage;
        
        allItems.forEach((item, index) => {
            if (index < itemsPerPage) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        loadMoreBtn.addEventListener('click', function() {
            const nextItems = currentlyShown + itemsPerPage;
            const itemsToShow = Math.min(nextItems, allItems.length);
            
            for (let i = currentlyShown; i < itemsToShow; i++) {
                allItems[i].style.display = 'block';
            }
            
            currentlyShown = itemsToShow;
            
            if (currentlyShown >= allItems.length) {
                loadMoreBtn.style.display = 'none';
            }
        });
    }
    
    const tabContents = document.querySelectorAll('.menu-tab-content');
    tabContents.forEach(content => {
        initLoadMore(content);
    });
    
    const mainContainer = document.querySelector('.menu-catalog-block');
    if (mainContainer && !mainContainer.closest('.menu-tab-content')) {
        initLoadMore(mainContainer);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkScroll() {
        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.85;
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerPoint) {
                element.classList.add('animated');
            }
        });
    }
    
    checkScroll();
    
    window.addEventListener('scroll', checkScroll);
});

document.addEventListener('DOMContentLoaded', function() {
    const accordionItems = document.querySelectorAll('.vacancy-accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.vacancy-accordion-header');
        const content = item.querySelector('.vacancy-accordion-content');
        
        if (!header || !content) return;
        
        header.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    const otherContent = otherItem.querySelector('.vacancy-accordion-content');
                    otherItem.classList.remove('active');
                    if (otherContent) {
                        otherContent.style.maxHeight = '0';
                    }
                }
            });
            
            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = '0';
            } else {
                item.classList.add('active');
                setTimeout(() => {
                    content.style.maxHeight = content.scrollHeight + 30 + 'px';
                }, 10);
            }
        });
    });
});

const mobileLogoLink = document.querySelector('.mobile-menu__logo-wrapper a');
const burgerButton = document.querySelector('.burger-button');
const mobileMenu = document.querySelector('.mobile-menu');
if (mobileLogoLink && burgerButton && mobileMenu) {
    mobileLogoLink.addEventListener('click', function() {
        burgerButton.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
}

