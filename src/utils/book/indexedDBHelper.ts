// src/utils/book/indexedDBHelper.ts

/**
 * IndexedDB 封装 - 用于存储大容量图书数据
 */

const DB_NAME = 'EpubReaderDB';
const DB_VERSION = 1;
const STORE_NAME = 'books';

interface BookData {
  id: string;
  title: string;
  author: string;
  chapters: any[];
  metadata: any;
  lastRead: number;
  currentChapterIndex: number;
}

class IndexedDBHelper {
  private db: IDBDatabase | null = null;

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // 创建对象存储
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
          });

          // 创建索引
          objectStore.createIndex('title', 'title', { unique: false });
          objectStore.createIndex('lastRead', 'lastRead', { unique: false });
        }
      };
    });
  }

  // 保存图书数据
  async saveBook(bookData: BookData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put({
        ...bookData,
        lastRead: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取图书数据
  async getBook(bookId: string): Promise<BookData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(bookId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有图书列表
  async getAllBooks(): Promise<BookData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 删除图书
  async deleteBook(bookId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(bookId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 清空所有数据
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取数据库大小(估算)
  async getStorageSize(): Promise<number> {
    if (!this.db) await this.init();

    const books = await this.getAllBooks();
    const size = JSON.stringify(books).length;
    return size;
  }
}

// 导出单例
export const indexedDBHelper = new IndexedDBHelper();

// 使用示例:
// import { indexedDBHelper } from '@/utils/book/indexedDBHelper';
//
// // 保存
// await indexedDBHelper.saveBook({
//   id: 'book-123',
//   title: '示例图书',
//   author: '作者',
//   chapters: [...],
//   metadata: {...},
//   currentChapterIndex: 0,
//   lastRead: Date.now()
// });
//
// // 读取
// const book = await indexedDBHelper.getBook('book-123');
