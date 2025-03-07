document.addEventListener('DOMContentLoaded', () => {
    loadCurrentTabs();
    loadCategories();
});

// Function to load current tabs
async function loadCurrentTabs() {
    const currentTabsList = document.getElementById('currentTabsList');
    currentTabsList.innerHTML = '';
    const tabs = await chrome.tabs.query({ currentWindow: true });

    tabs.forEach(tab => {
        const listItem = document.createElement('li');
        listItem.classList.add('tab-item'); // Added for uniform styling

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = tab.url;
        listItem.appendChild(checkbox);

        const label = document.createElement('label');
        label.textContent = tab.title || tab.url;
        label.classList.add('tab-label'); // Added to fix alignment
        listItem.appendChild(label);

        currentTabsList.appendChild(listItem);
    });
}

// Save selected tabs
const saveTabsButton = document.getElementById('saveTabs');
const categoryNameInput = document.getElementById('categoryName');

saveTabsButton.addEventListener('click', async () => {
    const categoryName = categoryNameInput.value.trim();
    if (!categoryName) {
        alert('Please enter a valid category name.');
        return;
    }

    const selectedTabs = [];
    const checkboxes = document.querySelectorAll('#currentTabsList input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => selectedTabs.push(checkbox.value));

    if (selectedTabs.length === 0) {
        alert('Please select at least one tab.');
        return;
    }

    chrome.storage.sync.get(null, (data) => {
        let updatedData = data || {};
        updatedData[categoryName] = selectedTabs;

        chrome.storage.sync.set(updatedData, () => {
            alert(`Tabs saved under "${categoryName}"!`);
            categoryNameInput.value = '';
            loadCategories();
        });
    });
});

// Function to load saved categories
function loadCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    chrome.storage.sync.get(null, (data) => {
        for (const [categoryName, tabUrls] of Object.entries(data)) {
            const listItem = document.createElement('li');

            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.textContent = categoryName;
            listItem.appendChild(categoryNameSpan);

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-btn');
            editButton.addEventListener('click', () => editCategory(categoryName, tabUrls));
            listItem.appendChild(editButton);

            const openButton = document.createElement('button');
            openButton.textContent = 'Open';
            openButton.classList.add('open-btn');
            openButton.addEventListener('click', () => openTabs(tabUrls));
            listItem.appendChild(openButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => deleteCategory(categoryName));
            listItem.appendChild(deleteButton);

            categoryList.appendChild(listItem);
        }
    });
}

// Function to edit a category
function editCategory(categoryName, tabUrls) {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    const editHeading = document.createElement('h2');
    editHeading.textContent = `Editing: ${categoryName}`;
    categoryList.appendChild(editHeading);

    const editList = document.createElement('ul');
    editList.classList.add('tabs-list');

    chrome.storage.sync.get(null, (data) => {
        const savedUrls = data[categoryName] || [];

        savedUrls.forEach(url => {
            const listItem = document.createElement('li');
            listItem.classList.add('tab-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.value = url;
            listItem.appendChild(checkbox);

            const label = document.createElement('label');
            label.textContent = url;
            label.classList.add('tab-label');
            listItem.appendChild(label);

            editList.appendChild(listItem);
        });

        categoryList.appendChild(editList);

        const saveChangesButton = document.createElement('button');
        saveChangesButton.textContent = 'Save Changes';
        saveChangesButton.classList.add('btn', 'save-btn');
        saveChangesButton.addEventListener('click', () => saveCategoryChanges(categoryName, editList));
        categoryList.appendChild(saveChangesButton);
    });
}

// Function to save changes to a category
function saveCategoryChanges(categoryName, editList) {
    const selectedTabs = [];
    const checkboxes = editList.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => selectedTabs.push(checkbox.value));

    if (selectedTabs.length === 0) {
        alert('A category must have at least one tab.');
        return;
    }

    chrome.storage.sync.set({ [categoryName]: selectedTabs }, () => {
        alert(`Category "${categoryName}" updated!`);
        loadCategories();
    });
}

// Function to delete a category
function deleteCategory(categoryName) {
    chrome.storage.sync.remove(categoryName, () => {
        alert(`Category "${categoryName}" deleted!`);
        loadCategories();
    });
}

// Function to open tabs
function openTabs(tabUrls) {
    tabUrls.forEach(url => chrome.tabs.create({ url }));
}
