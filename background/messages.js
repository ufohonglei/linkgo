/**
 * LinkGo background/messages.js
 * 来自 content script 的消息处理 / Message handler from content script
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LinkGo] Message received:', request.action);

  (async () => {
    switch (request.action) {

      case 'get-bookmarks': {
        const bookmarks = await getAllBookmarks();
        sendResponse({ success: true, data: bookmarks });
        break;
      }

      case 'save-bookmark': {
        const existing = await findBookmarkByUrl(request.url);
        if (existing) {
          sendResponse({ success: false, error: 'duplicate', message: `该网址已存在于"${existing.folder}"文件夹中`, existingBookmark: existing });
          return;
        }
        try {
          const result = await saveBookmark({ title: request.title, url: request.url }, request.tag);
          sendResponse({ success: true, data: result });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
        break;
      }

      case 'get-categories': {
        const categories = await getCategoryFolders();
        sendResponse({ success: true, data: categories });
        break;
      }

      case 'create-category': {
        const name = (request.name || '').trim();
        if (!name) {
          sendResponse({ success: false, error: '分类名称不能为空' });
          return;
        }
        try {
          const root = await getOrCreateQuickLinkFolder();
          const folder = await getOrCreateSubFolder(root.id, name);
          clearBookmarksCache();
          sendResponse({ success: true, data: { id: folder.id, name: folder.title } });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
        break;
      }

      case 'delete-bookmark': {
        try {
          await chrome.bookmarks.remove(request.bookmarkId);
          clearBookmarksCache();
          sendResponse({ success: true });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
        break;
      }

      case 'update-bookmark': {
        try {
          // 1. 更新标题
          if (request.title) {
            await chrome.bookmarks.update(request.bookmarkId, { title: request.title });
          }
          // 2. 移动到新分类（如果提供了 category）
          if (request.category !== undefined) {
            await moveBookmarkToCategory(request.bookmarkId, request.category);
          }
          clearBookmarksCache();
          sendResponse({ success: true });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
        break;
      }

      case 'clear-all-bookmarks': {
        try {
          const root     = await getOrCreateQuickLinkFolder();
          const children = await chrome.bookmarks.getChildren(root.id);
          for (const child of children) await deleteBookmarkRecursive(child);
          clearBookmarksCache();
          sendResponse({ success: true, count: children.length });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
        break;
      }

      case 'open-bookmark': {
        try {
          if (request.newTab) {
            await chrome.tabs.create({ url: request.url });
          } else {
            await chrome.tabs.update(sender.tab.id, { url: request.url });
          }
          sendResponse({ success: true });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
        break;
      }

      case 'open-settings': {
        try {
          await chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
          sendResponse({ success: true });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
        break;
      }

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  })();

  return true; // 异步响应
});
