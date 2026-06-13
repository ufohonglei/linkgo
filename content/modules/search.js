/**
 * LinkGo search.js
 * 搜索、分类筛选、键盘导航 / Search, category filter, keyboard navigation
 */

/* global LinkPlus, Fuse */

/**
 * 初始化 Fuse.js
 */
LinkPlus.initFuse = function() {
  if (typeof Fuse === 'undefined') {
    console.error('[LinkGo] Fuse.js not loaded');
    return;
  }
  LinkPlus.state.fuse = new Fuse(LinkPlus.state.bookmarks, {
    keys: ['title', 'url', 'folder'],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 1,
  });
};

/**
 * 加载书签数据
 */
LinkPlus.loadBookmarks = async function() {
  try {
    console.log('[LinkGo] loadBookmarks started');
    
    const localRes = await chrome.runtime.sendMessage({ action: 'get-bookmarks' });
    if (localRes.success) {
      LinkPlus.state.bookmarks = localRes.data;
      LinkPlus.initFuse();
      console.log('[LinkGo] Bookmarks loaded from local:', LinkPlus.state.bookmarks.length);
    }

    const categoryRes = await chrome.runtime.sendMessage({ action: 'get-categories' });
    if (categoryRes.success) {
      LinkPlus.state.categories = categoryRes.data || [];
    }
    
    // 刷新显示
    LinkPlus.performSearch(LinkPlus.state.searchQuery || '');
  } catch (e) {
    console.error('[LinkGo] Failed to load bookmarks:', e);
  }
};

/**
 * 处理输入框输入
 */
LinkPlus.handleInput = function(e) {
  const { state } = LinkPlus;
  const query = e.target.value.trim();
  state.searchQuery = query;
  state.isCommandMode = query.startsWith('+');

  LinkPlus.updateSearchIcon();
  LinkPlus.updateCommandHint();

  if (state.isCommandMode) {
    LinkPlus.parseCommand(query);
    LinkPlus.renderResults([]);
  } else {
    LinkPlus.performSearch(query);
  }
};

/**
 * 解析指令（+ 自定义标题 #标签）
 */
LinkPlus.parseCommand = function(query) {
  const content = query.substring(1).trim();
  const tagMatch = content.match(/#([^\s#]+)/);
  LinkPlus.state.commandTag   = tagMatch ? tagMatch[1] : null;
  LinkPlus.state.commandTitle = content.replace(/#[^\s#]+/g, '').trim();
};

/**
 * 执行搜索并更新结果
 */
LinkPlus.performSearch = function(query) {
  const { state } = LinkPlus;
  console.log('[LinkGo] performSearch, query:', query, 'bookmarks count:', state.bookmarks?.length || 0);
  let results;

  if (!query) {
    results = state.bookmarks || [];
  } else if (state.fuse) {
    results = state.fuse.search(query).map(r => r.item);
  } else {
    results = [];
  }
  console.log('[LinkGo] performSearch results:', results.length);

  // 分类筛选
  if (state.activeCategory !== 'all') {
    results = results.filter(b => (b.folder || '未分类') === state.activeCategory);
  }

  state.filteredBookmarks = results.slice(0, 50);
  state.selectedIndex = 0;
  LinkPlus.updateCategoryBar();
  LinkPlus.renderResults(state.filteredBookmarks);
};

/**
 * 更新分类标签栏
 */
LinkPlus.updateCategoryBar = function() {
  const { state, shadowRoot, escapeHtml } = LinkPlus;
  const bar = shadowRoot.getElementById('linkplus-category-bar');
  if (!bar) {
    console.log('[LinkGo] Category bar not found');
    return;
  }
  
  console.log('[LinkGo] Updating category bar, bookmarks:', state.bookmarks.length);

  const map = {};
  state.bookmarks.forEach(b => {
    const cat = b.folder && b.folder !== 'QuickLink_Data' ? b.folder : '未分类';
    map[cat] = (map[cat] || 0) + 1;
  });
  (state.categories || []).forEach(cat => {
    if (cat && cat !== 'QuickLink_Data') map[cat] = map[cat] || 0;
  });
  const categories = Object.keys(map).sort();
  console.log('[LinkGo] Categories found:', categories, map);

  if (categories.length === 0) { 
    bar.style.display = 'none'; 
    bar.classList.remove('has-categories');
    return; 
  }
  bar.style.display = 'flex';
  bar.classList.add('has-categories');

  bar.innerHTML = [
    `<button class="linkplus-category-tab${state.activeCategory === 'all' ? ' active' : ''}" data-category="all">全部 <span class="linkplus-category-count">${state.bookmarks.length}</span></button>`,
    ...categories.map(cat => {
      const active = state.activeCategory === cat ? ' active' : '';
      return `<button class="linkplus-category-tab${active}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)} <span class="linkplus-category-count">${map[cat]}</span></button>`;
    }),
  ].join('');

  bar.querySelectorAll('.linkplus-category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeCategory = tab.dataset.category;
      LinkPlus.performSearch(state.searchQuery);
    });
  });
};

/**
 * 处理键盘事件
 */
LinkPlus.handleKeyDown = function(e) {
  if (!LinkPlus.state.isSearchOpen) return;
  switch (e.key) {
    case 'Escape':   LinkPlus.closeSearchPanel(); break;
    case 'ArrowDown': e.preventDefault(); LinkPlus.navigateResults(1);  break;
    case 'ArrowUp':   e.preventDefault(); LinkPlus.navigateResults(-1); break;
    case 'Enter':
      e.preventDefault();
      if (LinkPlus.state.isCommandMode) {
        LinkPlus.executeCommand();
      } else {
        // 修改默认行为：直接按回车也在新标签页打开
        LinkPlus.selectBookmark(true); 
      }
      break;
  }
};

/**
 * 方向键导航结果
 */
LinkPlus.navigateResults = function(dir) {
  const { state } = LinkPlus;
  if (!state.filteredBookmarks.length) return;
  state.selectedIndex = (state.selectedIndex + dir + state.filteredBookmarks.length) % state.filteredBookmarks.length;
  LinkPlus.renderResults(state.filteredBookmarks);
  // 滚动到选中项
  const sel = LinkPlus.shadowRoot.querySelector('.linkplus-result-item.selected');
  if (sel) sel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

/**
 * 用 Enter 选中书签
 */
LinkPlus.selectBookmark = function(newTab = false) {
  const bm = LinkPlus.state.filteredBookmarks[LinkPlus.state.selectedIndex];
  if (bm) LinkPlus.openBookmark(bm.url, newTab);
};

/**
 * 打开书签
 */
LinkPlus.openBookmark = async function(url, newTab) {
  try {
    await chrome.runtime.sendMessage({ action: 'open-bookmark', url, newTab });
    LinkPlus.closeSearchPanel();
  } catch (e) {
    console.error('[LinkGo] Failed to open bookmark:', e);
  }
};
