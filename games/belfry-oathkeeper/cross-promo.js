(function(){
  'use strict';
  const defaultItems = [
    { href:'/games/prism-bastion-rogue/', title:'Prism Bastion Rogue', desc:'색 반사 로그라이크 액션' },
    { href:'/games/skyline-penalty/', title:'Skyline Penalty', desc:'휘어지는 슛 스포츠 아케이드' }
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
