const products = [
  {id:1,name:"Kinder sladký dort",category:"box",price:1290,desc:"Velký sladký dort z oblíbených Kinder dobrot, ozdobený stuhou.",badge:"OBLÍBENÉ",image:"images/darkovy-kinder-dort.png"},
  {id:2,name:"Vánoční modrá kytice",category:"bouquet",price:790,desc:"Sladká vánoční kytice s modrou stuhou a zimní výzdobou.",badge:"NOVINKA",image:"images/vanocni-modra-kytice.jpeg"},
  {id:3,name:"Vánoční červená kytice",category:"bouquet",price:790,desc:"Sladká vánoční kytice v elegantním červeném provedení.",badge:"OBLÍBENÉ",image:"images/vanocni-cervena-kytice.jpeg"},
  {id:4,name:"Raffaello & Kinder dort",category:"personal",price:1190,desc:"Elegantní sladký dort s Raffaello, Kinder a červenými růžemi.",badge:"NA MÍRU",image:"images/raffaello-kinder-dort.jpeg"}
];

let cart = JSON.parse(localStorage.getItem("floreaCart") || "[]");

const productsGrid = document.getElementById("productsGrid");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function formatPrice(value){ return value.toLocaleString("cs-CZ") + " Kč"; }

function renderProducts(list = products){
  productsGrid.innerHTML = "";
  if(!list.length){
    productsGrid.innerHTML = '<p class="empty-cart" style="grid-column:1/-1">Produkt nebyl nalezen.</p>';
    return;
  }
  list.forEach((product,index)=>{
    const card = document.createElement("article");
    card.className = "product-card";
    card.style.animationDelay = `${index*60}ms`;
    card.innerHTML = `
      <div class="product-image">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        <img src="${product.image}" alt="${product.name}" class="product-photo">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <div class="product-bottom">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="add-btn" data-id="${product.id}">Přidat do košíku +</button>
        </div>
      </div>`;
    card.querySelector(".product-image").addEventListener("click",()=>openProduct(product.id));
    card.querySelector(".add-btn").addEventListener("click",()=>addToCart(product.id));
    productsGrid.appendChild(card);
  });
}

function addToCart(id, personalization=""){
  const existing = cart.find(item=>item.id===id && item.personalization===personalization);
  if(existing) existing.qty++;
  else cart.push({id,qty:1,personalization});
  saveCart();
  openCart();
}

function saveCart(){
  localStorage.setItem("floreaCart",JSON.stringify(cart));
  renderCart();
}

function renderCart(){
  const totalQty = cart.reduce((sum,item)=>sum+item.qty,0);
  cartCount.textContent = totalQty;
  if(!cart.length){
    cartItems.innerHTML='<p class="empty-cart">Váš košík je zatím prázdný.</p>';
    cartTotal.textContent="0 Kč";
    return;
  }
  let total=0;
  cartItems.innerHTML="";
  cart.forEach((item,index)=>{
    const product=products.find(p=>p.id===item.id);
    const itemTotal=product.price*item.qty;
    total+=itemTotal;
    const row=document.createElement("div");
    row.className="cart-item";
    row.innerHTML=`
      <img class="cart-thumb" src="${product.image}" alt="${product.name}">
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <p>${formatPrice(product.price)} ${item.personalization ? "• s věnováním" : ""}</p>
        <div class="cart-controls">
          <button data-action="minus">−</button><span>${item.qty}</span><button data-action="plus">+</button>
          <button class="remove" data-action="remove">Odstranit</button>
        </div>
      </div>`;
    row.querySelector('[data-action="minus"]').onclick=()=>changeQty(index,-1);
    row.querySelector('[data-action="plus"]').onclick=()=>changeQty(index,1);
    row.querySelector('[data-action="remove"]').onclick=()=>{cart.splice(index,1);saveCart();};
    cartItems.appendChild(row);
  });
  cartTotal.textContent=formatPrice(total);
}

function changeQty(index,delta){
  cart[index].qty+=delta;
  if(cart[index].qty<=0) cart.splice(index,1);
  saveCart();
}

function openCart(){document.getElementById("cartPanel").classList.add("open");document.getElementById("overlay").classList.add("show");}
function closeCart(){document.getElementById("cartPanel").classList.remove("open");document.getElementById("overlay").classList.remove("show");}

document.getElementById("cartBtn").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
document.getElementById("overlay").onclick=()=>{closeCart();closeSearch();};

document.querySelectorAll(".filter").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const category=btn.dataset.category;
    const search=document.getElementById("productSearch").value.toLowerCase();
    renderProducts(products.filter(p=>(category==="all"||p.category===category)&&p.name.toLowerCase().includes(search)));
  };
});

document.getElementById("productSearch").addEventListener("input",e=>{
  const category=document.querySelector(".filter.active").dataset.category;
  const term=e.target.value.toLowerCase();
  renderProducts(products.filter(p=>(category==="all"||p.category===category)&&p.name.toLowerCase().includes(term)));
});

function openProduct(id){
  const p=products.find(x=>x.id===id);
  document.getElementById("modalContent").innerHTML=`
    <div class="modal-product">
      <div class="modal-product-image"><div class="product-art">FLOREA<small>${p.name}</small></div></div>
      <div>
        <p class="eyebrow">FLOREA • DETAIL PRODUKTU</p>
        <h2>${p.name}</h2>
        <div class="modal-price">${formatPrice(p.price)}</div>
        <p>${p.desc}</p>
        <div class="personalization">
          <label for="personalNote">Věnování / osobní přání (volitelné)</label>
          <textarea id="personalNote" placeholder="Např. Všechno nejlepší, Aničko..."></textarea>
        </div>
        <button class="btn btn-dark" id="modalAdd">Přidat do košíku</button>
      </div>
    </div>`;
  document.getElementById("productModal").classList.add("open");
  document.body.classList.add("no-scroll");
  document.getElementById("modalAdd").onclick=()=>{
    addToCart(p.id,document.getElementById("personalNote").value.trim());
    closeModal();
  };
}
function closeModal(){document.getElementById("productModal").classList.remove("open");document.body.classList.remove("no-scroll");}
document.getElementById("modalClose").onclick=closeModal;
document.getElementById("productModal").onclick=e=>{if(e.target.id==="productModal")closeModal();};

const menuBtn=document.getElementById("menuBtn"),navLinks=document.getElementById("navLinks");
menuBtn.onclick=()=>navLinks.classList.toggle("open");
navLinks.querySelectorAll("a").forEach(a=>a.onclick=()=>navLinks.classList.remove("open"));

const searchPanel=document.getElementById("searchPanel");
function openSearch(){searchPanel.classList.add("open");document.getElementById("overlay").classList.add("show");setTimeout(()=>document.getElementById("globalSearch").focus(),300)}
function closeSearch(){searchPanel.classList.remove("open");}
document.getElementById("searchBtn").onclick=openSearch;
document.getElementById("closeSearch").onclick=()=>{closeSearch();document.getElementById("overlay").classList.remove("show")};
document.getElementById("globalSearch").addEventListener("input",e=>{
  document.getElementById("productSearch").value=e.target.value;
  document.getElementById("products").scrollIntoView({behavior:"smooth"});
  const term=e.target.value.toLowerCase();
  renderProducts(products.filter(p=>p.name.toLowerCase().includes(term)));
});

const chatToggle=document.getElementById("chatToggle"),chatWindow=document.getElementById("chatWindow");
chatToggle.onclick=()=>chatWindow.classList.toggle("open");
document.getElementById("chatClose").onclick=()=>chatWindow.classList.remove("open");

function botReply(message){
  const msg=message.toLowerCase();
  if(msg.includes("narozen")) return "Na narozeniny bych doporučil Dárkový box nebo Sladkou kytici. Pokud chcete, můžete přidat osobní věnování.";
  if(msg.includes("personal")) return "U vybraných produktů můžete přidat vlastní věnování. Stačí otevřít detail produktu.";
  if(msg.includes("objed")) return "Vyberte produkt, přidejte ho do košíku a pokračujte k objednávce. Zatím jde o DEMO objednávkový proces.";
  if(msg.includes("vybrat")) return "Rádi poradíme. Pro výjimečný dárek můžete zvolit Luxusní sladký box, pro menší radost Mini sladký box.";
  return "Rád vám pomohu s výběrem sladkého dárku. Zkuste jednu z možností níže.";
}
function sendChat(message){
  const messages=document.getElementById("chatMessages");
  const user=document.createElement("div");user.className="user-message";user.textContent=message;messages.appendChild(user);
  setTimeout(()=>{const bot=document.createElement("div");bot.className="bot-message";bot.textContent=botReply(message);messages.appendChild(bot);messages.scrollTop=messages.scrollHeight;},400);
}
document.querySelectorAll(".quick-replies button").forEach(btn=>btn.onclick=()=>sendChat(btn.dataset.message));

document.getElementById("contactForm").onsubmit=e=>{
  e.preventDefault();
  alert("Děkujeme za zprávu. Toto je DEMO formulář FLOREA.");
  e.target.reset();
};

document.getElementById("checkoutBtn").onclick=()=>{
  if(!cart.length){alert("Košík je prázdný.");return;}
  alert("Checkout je připraven jako DEMO. Pro skutečné objednávky je potřeba připojit backend.");
};

renderProducts();
renderCart();
