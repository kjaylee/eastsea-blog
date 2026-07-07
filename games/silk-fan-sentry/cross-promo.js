(function(){
  'use strict';
  const defaultItems = [
    { href:'/games/prism-bastion-rogue/', title:'Prism Bastion Rogue', desc:'반사 로그라이크 액션' },
    { href:'/games/tether-shield-ward/', title:'Tether Shield Ward', desc:'드래그 실드 라인 디펜스' }
  ];
  window.mountCrossPromo = function(container, items){
    if(!container) return;
    const promos = items && items.length ? items : defaultItems;
    container.innerHTML = promos.map(item => `
      <a class="promoCard" href="${item.href}">
        <strong>${item.title}</strong>
        <span>${item.desc}</span>
      </a>
    `).join('');
  };
})();
