// Load current tabs when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentTabs(); // Load current tabs
    loadCategories(); // Load saved categories
});

// Function to load current tabs
async function loadCurrentTabs() {
    const currentTabsList = document.getElementById('currentTabsList');
    currentTabsList.innerHTML = ''; // Clear the list before populating
    const tabs = await chrome.tabs.query({ currentWindow: true });

    tabs.forEach(tab => {
        const listItem = document.createElement('li');

        // Add a checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = tab.url;
        listItem.appendChild(checkbox);

        // Add the tab title
        const label = document.createElement('label');
        label.textContent = tab.title || tab.url;
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

    // Get selected tabs
    const selectedTabs = [];
    const checkboxes = document.querySelectorAll('#currentTabsList input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => selectedTabs.push(checkbox.value));

    if (selectedTabs.length === 0) {
        alert('Please select at least one tab.');
        return;
    }

    // Save the category and its tabs to storage
    const categoryData = { [categoryName]: selectedTabs };
    chrome.storage.sync.set(categoryData, () => {
        alert(`Tabs saved under "${categoryName}"!`);
        categoryNameInput.value = ''; // Clear the input field
        loadCategories(); // Reload the categories list
    });
});

// Function to load saved categories
function loadCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = ''; // Clear the list before populating

    chrome.storage.sync.get(null, (data) => {
        for (const [categoryName, tabUrls] of Object.entries(data)) {
            const listItem = document.createElement('li');

            // Display category name
            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.textContent = categoryName;
            listItem.appendChild(categoryNameSpan);

            // Add an edit button
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editCategory(categoryName, tabUrls));
            listItem.appendChild(editButton);

            // Add an open button
            const openButton = document.createElement('button');
            openButton.textContent = 'Open';
            openButton.addEventListener('click', () => openTabs(tabUrls));
            listItem.appendChild(openButton);

            // Add a delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteCategory(categoryName));
            listItem.appendChild(deleteButton);

            categoryList.appendChild(listItem);
        }
    });
}

// Function to edit a category
function editCategory(categoryName, tabUrls) {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = ''; // Clear the list before populating

    // Create heading for the edit view
    const editHeading = document.createElement('h2');
    editHeading.textContent = `Editing: ${categoryName}`;
    categoryList.appendChild(editHeading);

    // Create a list of tabs with checkboxes
    const editList = document.createElement('ul');
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            if (tabUrls.includes(tab.url)) {
                const listItem = document.createElement('li');

                // Add checkboxes (pre-ticked)
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true;
                checkbox.value = tab.url;
                listItem.appendChild(checkbox);

                // Add the tab title
                const label = document.createElement('label');
                label.textContent = tab.title || tab.url;
                listItem.appendChild(label);

                editList.appendChild(listItem);
            }
        });
    });

    categoryList.appendChild(editList);

    // Add a Save Changes button
    const saveChangesButton = document.createElement('button');
    saveChangesButton.textContent = 'Save Changes';
    saveChangesButton.addEventListener('click', () => saveCategoryChanges(categoryName, editList));
    categoryList.appendChild(saveChangesButton);
}

// Function to save changes to a category
function saveCategoryChanges(categoryName, editList) {
    // Get selected tabs
    const selectedTabs = [];
    const checkboxes = editList.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => selectedTabs.push(checkbox.value));

    if (selectedTabs.length === 0) {
        alert('A category must have at least one tab.');
        return;
    }

    // Save updated category
    const categoryData = { [categoryName]: selectedTabs };
    chrome.storage.sync.set(categoryData, () => {
        alert(`Category "${categoryName}" updated!`);
        loadCategories(); // Reload the categories list
    });
}

// Function to delete a category
function deleteCategory(categoryName) {
    chrome.storage.sync.remove(categoryName, () => {
        alert(`Category "${categoryName}" deleted!`);
        loadCategories(); // Reload the categories list
    });
}

// Function to open tabs
function openTabs(tabUrls) {
    tabUrls.forEach(url => chrome.tabs.create({ url }));
}
