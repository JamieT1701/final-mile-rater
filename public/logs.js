document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const recordsPerPage = 10; // Default number of records per page
    let logs = [];

    async function fetchLogs() {
        try {
            const response = await fetch('/logs');
            logs = await response.json();
            displayLogs(currentPage, recordsPerPage);
            setupPagination();
        } catch (err) {
            console.error('Error fetching logs:', err);
            document.getElementById('no-data-message').style.display = 'block';
        }
    }

    function displayLogs(page, recordsPerPage) {
        const logTableBody = document.getElementById('log-table-body');
        logTableBody.innerHTML = '';

        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, logs.length);

        if (logs.length === 0) {
            document.getElementById('no-data-message').style.display = 'block';
        } else {
            document.getElementById('no-data-message').style.display = 'none';
            for (let i = startIndex; i < endIndex; i++) {
                const log = logs[i];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(log.date).toLocaleString()}</td>
                    <td>${log.zip_code || ''}</td>
                    <td>${log.shipment_weight}</td>
                    <td>$${log.linehaul.toFixed(2)}</td>
                    <td>$${log.fsc.toFixed(2)}</td>
                    <td>$${log.total_rate.toFixed(2)}</td>
                    <td>${log.zone || ''}</td>
                `;
                logTableBody.appendChild(row);
            }
        }
    }

    function setupPagination() {
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';

        const totalPages = Math.ceil(logs.length / recordsPerPage);

        // First and Previous buttons
        paginationControls.appendChild(createPaginationButton('First', () => goToPage(1)));
        paginationControls.appendChild(createPaginationButton('Previous', () => goToPage(currentPage - 1)));

        // Page indicator
        const pageIndicator = document.createElement('span');
        pageIndicator.className = 'page-indicator';
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        paginationControls.appendChild(pageIndicator);

        // Next and Last buttons
        paginationControls.appendChild(createPaginationButton('Next', () => goToPage(currentPage + 1)));
        paginationControls.appendChild(createPaginationButton('Last', () => goToPage(totalPages)));

        // Dropdown to select records per page
        const recordsDropdown = document.createElement('select');
        recordsDropdown.innerHTML = `
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="All">All</option>
        `;
        recordsDropdown.value = recordsPerPage;
        recordsDropdown.addEventListener('change', (e) => {
            const value = e.target.value === 'All' ? logs.length : parseInt(e.target.value);
            currentPage = 1;
            displayLogs(currentPage, value);
            setupPagination();
        });
        paginationControls.appendChild(recordsDropdown);
    }

    function createPaginationButton(label, onClick) {
        const button = document.createElement('button');
        button.textContent = label;
        button.className = 'pagination-button';
        button.disabled = (label === 'First' && currentPage === 1) || (label === 'Previous' && currentPage === 1) || (label === 'Next' && currentPage === Math.ceil(logs.length / recordsPerPage)) || (label === 'Last' && currentPage === Math.ceil(logs.length / recordsPerPage));
        button.addEventListener('click', onClick);
        return button;
    }

    function goToPage(page) {
        const totalPages = Math.ceil(logs.length / recordsPerPage);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        displayLogs(currentPage, recordsPerPage);
        setupPagination();
    }

    fetchLogs();
});
