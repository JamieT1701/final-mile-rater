document.addEventListener('DOMContentLoaded', function () {
  // Load header
  fetch('../components/header.html')
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('header-container').innerHTML = data;

      // Load the navigation dynamically into the header
      return fetch('../components/nav.html');
    })
    .then((response) => response.text())
    .then((navData) => {
      document.getElementById('nav-container').innerHTML = navData;
    });

  // Load footer
  fetch('../components/footer.html')
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('footer-container').innerHTML = data;
    });
});
