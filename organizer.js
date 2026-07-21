(()=>{
  const sections={explore:'explore',views:'views',shopping:'shop',breakfast:'breakfast',restaurants:'eat',pubs:'pubs',apps:'apps'};
  const slug=location.pathname.split('/').filter(Boolean)[0]||'';
  const category=sections[slug];
  const pageLabels={
    explore:'Wonder Wander',
    views:'Sky High',
    shopping:'Retail Therapy Zone',
    breakfast:'Rise & Dine',
    restaurants:'Food for Your Soul',
    pubs:'Pint Stops',
    apps:'App Arsenal'
  };
  const visibleReplacements=new Map([
    ['Explore','Wonder Wander'],
    ['Places to explore','Wonder Wander'],
    ['Explore & culture','Wonder Wander'],
    ['Views','Sky High'],
    ['Skyline views','Sky High'],
    ['Shopping','Retail Therapy Zone'],
    ['Shop & wander','Retail Therapy Zone'],
    ['Breakfast','Rise & Dine'],
    ['Breakfast & brunch','Rise & Dine'],
    ['Restaurants','Food for Your Soul'],
    ['Lunch & dinner','Food for Your Soul'],
    ['Pubs','Pint Stops'],
    ['Pubs & drinks','Pint Stops'],
    ['Apps','App Arsenal'],
    ['Useful apps','App Arsenal'],
    ['Useful Apps','App Arsenal']
  ]);
  function replaceVisibleLabels(){
    if(!document.body)return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const value=node.nodeValue.trim();
      if(visibleReplacements.has(value))node.nodeValue=node.nodeValue.replace(value,visibleReplacements.get(value));
    });
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