$(document).ready(function() {
    if (window.location.pathname.includes('manage_posts.html')) {
        setupAdminLogin();
    } else {
        checkAdminAccess();
    }
});

function setupAdminLogin() {
    const adminUsername = 'admin';
    const adminPassword = 'adminpass';

    document.getElementById('loginBtn').addEventListener('click', function() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (username === adminUsername && password === adminPassword) {
            localStorage.setItem('isAdmin', 'true');
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('admin').style.display = 'block';
            document.querySelectorAll('.admin-only').forEach(elem => elem.style.display = 'block');
            loadNews();
        } else {
            alert('Невірне ім\'я користувача або пароль');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('isAdmin');
        location.reload();
    });

    if (localStorage.getItem('isAdmin') === 'true') {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('admin').style.display = 'block';
        document.querySelectorAll('.admin-only').forEach(elem => elem.style.display = 'block');
        loadNews();
    }
}

function checkAdminAccess() {
    if (localStorage.getItem('isAdmin') === 'true') {
        document.querySelectorAll('.admin-only').forEach(elem => elem.style.display = 'block');
    } else {
        document.querySelectorAll('.admin-only').forEach(elem => elem.style.display = 'none');
    }
}

document.getElementById('addNewsBtn')?.addEventListener('click', function() {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('Ви не маєте доступу до цієї функції.');
        return;
    }
    
    const newsTitle = document.getElementById('newsTitle').value.trim();
    const newsInput = document.getElementById('newsInput').value.trim();
    const imageURLs = document.getElementById('imageURLs').value.trim().split(',').map(url => url.trim());
    const newsDate = document.getElementById('newsDate').value;

    if (newsTitle && newsInput && imageURLs.length && newsDate) {
        addNews({
            title: newsTitle,
            content: newsInput,
            images: imageURLs,
            date: newsDate
        });
        document.getElementById('newsTitle').value = '';
        document.getElementById('newsInput').value = '';
        document.getElementById('imageURLs').value = '';
        document.getElementById('newsDate').value = '';
    }
});

function addNews(news) {
    const currentNews = JSON.parse(localStorage.getItem('news')) || [];
    currentNews.push(news);
    localStorage.setItem('news', JSON.stringify(currentNews));
    alert('Новина додана!');
    loadNews();
}

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
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('Ви не маєте доступу до цієї функції.');
        return;
    }

    let news = JSON.parse(localStorage.getItem('news')) || [];
    news.splice(index, 1);
    localStorage.setItem('news', JSON.stringify(news));
    loadNews();
}
