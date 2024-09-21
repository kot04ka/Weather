$(document).ready(function() {
    loadNews();
});

function loadNews() {
    const news = JSON.parse(localStorage.getItem('news')) || [];
    displayNews(news);
}

function displayNews(news) {
    const newsContent = document.getElementById('newsContent');
    newsContent.innerHTML = '';
    news.forEach((item, index) => {
        const newsElement = document.createElement('div');
        newsElement.classList.add('news-item');
        newsElement.setAttribute('data-index', index);
        newsElement.innerHTML = `
            <h3>${item.title}</h3>
            <img src="${item.images[0]}" alt="Новина зображення">
            <p class="news-date">${item.date}</p>
        `;
        newsElement.addEventListener('click', function() {
            displayNewsModal(index);
        });
        newsContent.appendChild(newsElement);
    });
}

function displayNewsModal(index) {
    const news = JSON.parse(localStorage.getItem('news')) || [];
    const newsItem = news[index];
    const modalContent = `
        <h3>${newsItem.title}</h3>
        ${newsItem.images.map(image => `<img src="${image}" alt="Новина зображення">`).join('')}
        <p>${newsItem.content}</p>
        <p class="news-date">${newsItem.date}</p>
    `;
    $('#newsModal .modal-content .modal-body').html(modalContent);
    $('#newsModal').modal('show');
}

function deleteNews(index) {
    let news = JSON.parse(localStorage.getItem('news')) || [];
    news.splice(index, 1);
    localStorage.setItem('news', JSON.stringify(news));
    loadNews();
}
