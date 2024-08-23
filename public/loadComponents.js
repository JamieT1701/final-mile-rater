// Load Header
fetch('/components/header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;

    // After loading the header, load the navigation
    fetch('/components/nav.html')
      .then(response => response.text())
      .then(navData => {
        document.getElementById('nav-placeholder').innerHTML = navData;
      })
      .catch(error => console.error('Error loading navigation:', error));
  })
  .catch(error => console.error('Error loading header:', error));

// Load Footer
fetch('/components/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
  })
  .catch(error => console.error('Error loading footer:', error));
