function loadComponent(containerId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(containerId).innerHTML = data;
        })
        .catch(error => console.error(`Error loading ${filePath}:`, error));
}

document.addEventListener('DOMContentLoaded', function () {
    loadComponent('header', '../components/header.html');
    loadComponent('nav', '../components/nav.html');
    loadComponent('layout', '../components/layout.html');
    loadComponent('footer', '../components/footer.html');
});
