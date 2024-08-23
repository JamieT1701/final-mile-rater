document.addEventListener('DOMContentLoaded', fetchLogs);

let currentPage = 1;
let recordsPerPage = 10;
let totalPages = 1;

const recordsPerPageOptions = [10, 50, 100, 'All'];

async function fetchLogs() {
    try {
        const response = await fetch('/logs');
        const logs = await response.json();

        // Handle pagination and update the table
        totalPages = Math.ceil(logs.length / recordsPerPage);
        displayLogs(logs);
        setupPagination(logs);
    } catch (err) {
        console.error('Error fetching logs:', err);
    }
}

function displayLogs(logs) {
    const logTableBody = document.getElementById('log-table-body');
    logTableBody.innerHTML = ''; // Clear existing logs

    let startIndex = (currentPage - 1) * recordsPerPage;
    let endIndex = recordsPerPage === 'All' ? logs.length : startIndex + recordsPerPage;
    const pageLogs = logs.slice(startIndex, endIndex);

    pageLogs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.date ? new Date(log.date).toLocaleString() : ''}</td>
            <td>${log.zip_code || ''}</td>
            <td>${log.shipment_weight || ''}</td>
            <td>${log.zone || ''}</td>
            <td>${log.linehaul || ''}</td>
            <td>${log.fsc || ''}</td>
            <td>${log.total_rate || ''}</td>
        `;
        logTableBody.appendChild(row);
    });
}

function setupPagination(logs) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination controls

    // Create the dropdown for selecting records per page
    const select = document.createElement('select');
    select.classList.add('records-per-page');
    recordsPerPageOptions.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        if (option === recordsPerPage) opt.selected = true;
        select.appendChild(opt);
    });
    select.addEventListener('change', (e) => {
        recordsPerPage = e.target.value === 'All' ? logs.length : parseInt(e.target.value);
        currentPage = 1;
        totalPages = Math.ceil(logs.length / recordsPerPage);
        displayLogs(logs);
        setupPagination(logs);
    });

    paginationContainer.appendChild(select);

    // Create the pagination controls
    const firstPageButton = createPaginationButton('First', () => goToPage(1, logs));
    const prevPageButton = createPaginationButton('Previous', () => goToPage(currentPage - 1, logs));
    const nextPageButton = createPaginationButton('Next', () => goToPage(currentPage + 1, logs));
    const lastPageButton = createPaginationButton('Last', () => goToPage(totalPages, logs));

    paginationContainer.appendChild(firstPageButton);
    paginationContainer.appendChild(prevPageButton);
    paginationContainer.appendChild(nextPageButton);
    paginationContainer.appendChild(lastPageButton);

    updatePaginationButtons(firstPageButton, prevPageButton, nextPageButton, lastPageButton);
}

function createPaginationButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

function updatePaginationButtons(firstPageButton, prevPageButton, nextPageButton, lastPageButton) {
    firstPageButton.disabled = currentPage === 1;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
    lastPageButton.disabled = currentPage === totalPages;
}

function goToPage(pageNumber, logs) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        currentPage = pageNumber;
        displayLogs(logs);
        setupPagination(logs);
    }
}
