document.addEventListener('DOMContentLoaded', function () {
  const logTableBody = document.getElementById('log-table-body');
  const paginationControls = document.querySelector('.pagination-controls');
  const recordsPerPageSelect = document.getElementById('records-per-page');
  let logs = [];
  let currentPage = 1;
  let recordsPerPage = 10;

  // Fetch logs data
  async function fetchLogs() {
      try {
          const response = await fetch('/logs');
          logs = await response.json();
          renderLogs();
          setupPagination();
      } catch (error) {
          console.error('Error fetching logs:', error);
      }
  }

  // Render logs data in the table
  function renderLogs() {
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      const paginatedLogs = logs.slice(startIndex, endIndex);

      logTableBody.innerHTML = '';

      if (paginatedLogs.length === 0) {
          logTableBody.innerHTML = '<tr><td colspan="7">No log data available.</td></tr>';
      } else {
          paginatedLogs.forEach(log => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${new Date(log.date).toLocaleString()}</td>
                  <td>${log.zip_code || ''}</td>
                  <td>${log.shipment_weight || ''}</td>
                  <td>${log.linehaul || ''}</td>
                  <td>${log.fsc || ''}</td>
                  <td>${log.total_rate || ''}</td>
                  <td>${log.zone || ''}</td>
              `;
              logTableBody.appendChild(row);
          });
      }
  }

  // Setup pagination controls
  function setupPagination() {
      const totalPages = Math.ceil(logs.length / recordsPerPage);
      paginationControls.innerHTML = '';

      const firstButton = document.createElement('button');
      firstButton.textContent = 'First';
      firstButton.className = 'pagination-button';
      firstButton.disabled = currentPage === 1;
      firstButton.addEventListener('click', () => {
          currentPage = 1;
          renderLogs();
          setupPagination();
      });

      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.className = 'pagination-button';
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener('click', () => {
          if (currentPage > 1) {
              currentPage--;
              renderLogs();
              setupPagination();
          }
      });

      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.className = 'pagination-button';
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener('click', () => {
          if (currentPage < totalPages) {
              currentPage++;
              renderLogs();
              setupPagination();
          }
      });

      const lastButton = document.createElement('button');
      lastButton.textContent = 'Last';
      lastButton.className = 'pagination-button';
      lastButton.disabled = currentPage === totalPages;
      lastButton.addEventListener('click', () => {
          currentPage = totalPages;
          renderLogs();
          setupPagination();
      });

      const pageIndicator = document.createElement('span');
      pageIndicator.className = 'page-indicator';
      pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

      paginationControls.appendChild(firstButton);
      paginationControls.appendChild(prevButton);
      paginationControls.appendChild(pageIndicator);
      paginationControls.appendChild(nextButton);
      paginationControls.appendChild(lastButton);
  }

  // Handle changing the number of records per page
  recordsPerPageSelect.addEventListener('change', function () {
      recordsPerPage = parseInt(recordsPerPageSelect.value);
      currentPage = 1; // Reset to the first page
      renderLogs();
      setupPagination();
  });

  // Fetch and display the logs initially
  fetchLogs();
});
