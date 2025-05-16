interface IProduct {
    name: string;
    quantity: number;
    price: number;
}

export class DatabaseService {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'productDB'
    private readonly STORE_NAME = 'product';

    constructor () {
        this.initDatabase();
    }

    public initDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, {
                        keyPath: 'name',
                        autoIncrement: false
                });
                }
            };
        });
    };

    async addToCart(name: string, price: number, quantity: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const getRequest = store.get(name);

        getRequest.onsuccess = () => {
            const existing = getRequest.result;
            let newQuantity = quantity;
            if (existing) {
                newQuantity = existing.quantity + quantity;
            }
            const item = { name, quantity: newQuantity, price };
            const putRequest = store.put(item);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
    });

}

async removeFromCart(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(name);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async getCartItems(): Promise<IProduct[]> {
    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result as IProduct[]);
        request.onerror = () => reject(request.error);
    });
}

async updateCartItem(name: string, quantity: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const items = await this.getCartItems();
            const item = items.find(i => i.name === name);
            if (item) {
                item.quantity = quantity;
                await this.addToCart(item.name, item.quantity, item.price);
                resolve();
            } else {
                reject('Item not found');
            }
        } catch (err) {
            reject(err);
        }
    });
}

async clearCart(): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
}