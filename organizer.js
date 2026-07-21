(()=>{
  const sections={explore:'explore',views:'views',shopping:'shop',breakfast:'breakfast',restaurants:'eat',pubs:'pubs',apps:'apps'};
  const slug=location.pathname.split('/').filter(Boolean)[0]||'';
  const category=sections[slug];
  const pageLabels={explore:'Food for your Soul',views:'Food for your Soul',shopping:'Retail Therapy Zone',breakfast:'Stomach Satisfiers',restaurants:'Stomach Satisfiers',pubs:'Stomach Satisfiers',apps:'App Arsenal'};
  const visibleReplacements=new Map([
    ['Places to explore','Food for your Soul'],
    ['Skyline views','Food for your Soul'],
    ['Shopping','Retail Therapy Zone'],
    ['Breakfast & brunch','Stomach Satisfiers'],
    ['Restaurants','Stomach Satisfiers'],
    ['Pubs & drinks','Stomach Satisfiers'],
    ['Useful apps','App Arsenal'],
    ['Useful Apps','App Arsenal']
  ]);
  function replaceVisibleLabels(){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{const value=node.nodeValue.trim();if(visibleReplacements.has(value))node.nodeValue=node.nodeValue.replace(value,visibleReplacements.get(value));});
  }
  function organise(){
    document.querySelectorAll('.card-monogram,.collection-icon').forEach(el=>el.remove());
    replaceVisibleLabels();
    if(!category)return;
    const button=document.querySelector(`[data-category="${category}"]`);
    if(button&&!button.classList.contains('is-active'))button.click();
    const collections=document.getElementById('collectionGrid');if(collections)collections.closest('section')?.setAttribute('hidden','');
    const filters=document.getElementById('filterRow');if(filters)filters.style.display='none';
    const label=pageLabels[slug];
    const heroTitle=document.querySelector('main h1');if(heroTitle&&label)heroTitle.textContent=label;
    const heroText=document.querySelector('main h1 + p');if(heroText&&label)heroText.textContent=`A focused shortlist of ${label.toLowerCase()} recommendations in London.`;
    if(label)document.title=`${label} — London by Arash`;
  }
  const style=document.createElement('style');style.textContent='.card-monogram,.collection-icon{display:none!important}';document.head.append(style);
  const observer=new MutationObserver(organise);observer.observe(document.documentElement,{childList:true,subtree:true});organise();
})();
