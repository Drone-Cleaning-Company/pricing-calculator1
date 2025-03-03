export function saveData(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data to sessionStorage:', error);
    }
}

export function getData(key) {
    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error retrieving data from sessionStorage:', error);
        return null;
    }
}

export function clearData(key) {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error('Error clearing data from sessionStorage:', error);
    }
}

export function clearAllData() {
    try {
        sessionStorage.clear();
    } catch (error) {
        console.error('Error clearing all data from sessionStorage:', error);
    }
}
