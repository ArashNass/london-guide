(()=>{
  const sections={explore:'explore',views:'views',shopping:'shop',breakfast:'breakfast',restaurants:'eat',pubs:'pubs',apps:'apps'};
  const slug=location.pathname.split('/').filter(Boolean)[0]||'';
  const category=sections[slug];
  const labels={
    explore:'Food for your Soul',
    views:'Food for your Soul',
    shopping:'Retail Therapy Zone',
    breakfast:'Stomach Satisfiers',
    restaurants:'Stomach Satisfiers',
    pubs:'Stomach Satisfiers',
    apps:'App Arsenal'
  };
  function organise(){
    document.querySelectorAll('.card-monogram,.collection-icon').forEach(el=>el.remove());
    if(!category)return;
    const button=document.querySelector(`[data-category="${category}"]`);
    if(button&&!button.classList.contains('is-active'))button.click();
    const collections=document.getElementById('collectionGrid');if(collections)collections.closest('section')?.setAttribute('hidden','');
    const filters=document.getElementById('filterRow');if(filters)filters.style.display='none';
    const heroTitle=document.querySelector('main h1');if(heroTitle)heroTitle.textContent=labels[slug];
    const heroText=document.querySelector('main h1 + p');if(heroText)heroText.textContent=`A focused shortlist of ${labels[slug].toLowerCase()} recommendations in London.`;
    document.title=`${labels[slug]} — London by Arash`;
  }
  const style=document.createElement('style');style.textContent='.card-monogram,.collection-icon{display:none!important}';document.head.append(style);
  const observer=new MutationObserver(organise);observer.observe(document.documentElement,{childList:true,subtree:true});organise();
})();
