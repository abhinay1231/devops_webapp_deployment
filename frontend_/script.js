        const logo = document.querySelector(".logo");
        const menu = document.querySelector(".fa-bars");
        const links = document.querySelector("nav ul");

        function changeimgsrc() {
            if (window.innerWidth <= 768) {
                logo.setAttribute("src", "logo-white.png");
                links.style.color = "#ffffff";
            } else {
                logo.setAttribute("src", "logo-dark.png");
            }
        }
        changeimgsrc();

        window.addEventListener("resize", () => {
            changeimgsrc();
        });
        window.addEventListener("load", () => {
            changeimgsrc();
        });

        // Toggle menu bar
        menu.addEventListener("click", () => {
            menu.classList.toggle("fa-xmark");
            menu.classList.toggle("rotate");
            links.classList.toggle("show");
        });

        // Scroll reveal options
        const scrollRevealOption = {
            distance: "50px",
            origin: "bottom",
            duration: 1000,
            delay: 500,
            useDelay: "onload",
            reset: true,
        };
        ScrollReveal().reveal(".home img", {
            ...scrollRevealOption,
            origin: "right",
        });
        ScrollReveal().reveal(".home .content h2", {
            ...scrollRevealOption,
            delay: 500,
        });
        ScrollReveal().reveal(".home .content p", {
            ...scrollRevealOption,
            delay: 1000,
        });
        ScrollReveal().reveal(".menu .cards .card", {
            ...scrollRevealOption,
            interval: 500,
        });
        ScrollReveal().reveal(".contactus img", {
            ...scrollRevealOption,
            interval: 500,
        });
        if (window.innerWidth > 786) {
            ScrollReveal().reveal(".header li", {
                interval: 200,
            });
        }

        // Cart functionality
        const cart = [];
        const cartModal = document.getElementById("cartModal");
        const successModal = document.getElementById("successModal");
        const cartItemsDiv = document.getElementById("cartItems");
        const closeButtons = document.querySelectorAll(".close");

        // Function to show the cart
        function showCart() {
            cartModal.style.display = "block";
            renderCart();
        }

        // Function to hide modals
        function hideModal(modal) {
            modal.style.display = "none";
        }

        // Function to render cart items
        function renderCart() {
            cartItemsDiv.innerHTML = '';
            if (cart.length === 0) {
                cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
            } else {
                cart.forEach((item, index) => {
                    const itemDiv = document.createElement("div");
                    itemDiv.classList.add("cart-item");
                    itemDiv.innerHTML = ` 
                        <span>${item}</span> 
                        <button class="remove-button" data-index="${index}">-</button>
                    `;
                    cartItemsDiv.appendChild(itemDiv);
                });
            }
        }

        // Function to handle order success
        function handleCheckout() {
            hideModal(cartModal);
            successModal.style.display = "block";
            cart.length = 0; // Clear the cart after successful order
            renderCart(); // Update cart display
        }

        // Event listener for order buttons
        document.querySelectorAll(".menu .card button").forEach(button => {
            button.addEventListener("click", (event) => {
                const burgerName = event.target.parentElement.querySelector("h2").innerText;
                cart.push(burgerName);
                showCart();
            });
        });

        // Event listeners for modal close buttons
        closeButtons.forEach(button => {
            button.addEventListener("click", () => {
                hideModal(cartModal);
                hideModal(successModal);
            });
        });

        // Event listener for checkout button
        document.getElementById("checkoutButton").addEventListener("click", handleCheckout);

        // Event listener for removing items from cart
        cartItemsDiv.addEventListener("click", (event) => {
            if (event.target.classList.contains("remove-button")) {
                const index = event.target.dataset.index;
                cart.splice(index, 1);
                renderCart();
            }
        });

        // Close modals when clicking outside of them
        window.onclick = function(event) {
            if (event.target === cartModal || event.target === successModal) {
                hideModal(cartModal);
                hideModal(successModal);
            }
        };
        
