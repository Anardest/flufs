const API_BASE = 'http://localhost:3000/api'
async function getGroups() {
    try {
        const response = await fetch(`${API_BASE}/groups/`);
        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.statusText);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log('Ошибка при получении данных:', error);
    }
}

getGroups();