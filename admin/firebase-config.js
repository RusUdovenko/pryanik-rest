// firebase-config.js



firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const COLLECTIONS = {
    MAIN: 'menu_main',
    KIDS: 'menu_kids',
    BANQUET: 'menu_banquet'
};

const firebaseAPI = {
    async getItems(collectionName) {
        try {
            const snapshot = await db.collection(collectionName).orderBy('id', 'asc').get();
            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });
            return items;
        } catch (error) {
            return [];
        }
    },
    
    async addItem(collectionName, item) {
        try {
            const existing = await this.getItems(collectionName);
            const maxId = existing.length > 0 ? Math.max(...existing.map(i => parseInt(i.id))) : 0;
            const newId = maxId + 1;
            
            const newItem = { ...item, id: newId };
            await db.collection(collectionName).doc(String(newId)).set(newItem);
            return newItem;
        } catch (error) {
            throw error;
        }
    },
    
    async updateItem(collectionName, id, item) {
        try {
            await db.collection(collectionName).doc(String(id)).update(item);
            return true;
        } catch (error) {
            throw error;
        }
    },
    
    async deleteItem(collectionName, id) {
        try {
            await db.collection(collectionName).doc(String(id)).delete();
            return true;
        } catch (error) {
            throw error;
        }
    },
    
    async initDefaultData(collectionName, defaultData) {
        const existing = await this.getItems(collectionName);
        if (existing.length === 0) {
            for (const item of defaultData) {
                await this.addItem(collectionName, item);
            }
        }
    }
};

window.firebaseAPI = firebaseAPI;
window.COLLECTIONS = COLLECTIONS;
window.db = db;
