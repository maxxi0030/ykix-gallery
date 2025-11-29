// JS НА МЕЙН 

const adminButton = document.querySelector('.admin-button');
const ykixButton = document.querySelector('.font');
const closeButton = document.querySelector('#cancelButton');
const loginButton = document.querySelector('#loginButton');

const modalContent = document.querySelector('.modal-content');
const modal = document.querySelector('#loginModal');
const loginInput = document.getElementById('loginInput');
const passwordInput = document.getElementById('passwordInput');

const mainGallery = document.getElementById("main-gallery");

let loginAttempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
const MAX_ATTEMPTS = 5;
let lockoutTime = parseInt(localStorage.getItem('lockoutTime')) || null;


ykixButton.addEventListener('click', function() {
    setTimeout(function() { location.reload();
    }, 300);
});

adminButton.addEventListener('click', function() {
    modal.style.display = 'flex';
});

closeButton.addEventListener('click', function() {
    modal.style.display = 'none';
    removeError();
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        removeError();
    }
});


// энтер работает как нажитие на кнопку
loginInput.addEventListener('keydown', function(e) {

    if (e.key === 'Enter') { // Проверяем, была ли нажата клавиша Enter
        loginButton.click(); // Имитируем клик по кнопке
    }
});

// энтер работает как нажитие на кнопку
passwordInput.addEventListener('keydown', function(e) {

    if (e.key === 'Enter') {
        loginButton.click();
    }
});

// когда кликают по кнопке, то юзается функция validateInputs
loginButton.addEventListener('click', function() {
    validateInputs();
});



// Защита от подбора пароля

//  validateInputs в которой у нас присходит чек ошибки 
async function validateInputs(){
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

        // Проверка блокировки
    if (lockoutTime && Date.now() < lockoutTime) {
        const remainingSeconds = Math.ceil((lockoutTime - Date.now()) / 1000);
        alert(`⏳ Слишком много попыток! Попробуйте через ${remainingSeconds} сек.`);
        return;
    }

    // проверка ввели ли хотяб что-то
       if (login === '' || password === '') {
        showError();
        return; // Дальше не идем
    }

    // Проверка на XSS в логине/пароле
    if (hasDangerousChars(login) || hasDangerousChars(password)) {
        alert('❌ Недопустимые символы в поле ввода');
        showError();
        return;
    }
    
    // ПРОВЕРКА на верность

    // СТАРЫЙ ВАРИАНТ
    // if (login !== 'admin' || password !== '**********') {
    //     showError(); // Показываем ошибку
    //     return; // Дальше не идем
    // }

        // Всё ОК → переходим на админку
    // window.location.href = 'admin.html';

    


    // НОВЫЙ ВАРИАНТ - теперь хакеры не войдут через обычный терминал:)
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: login,
            password: password
        });

        if (error) {
        // console.error('Ошибка входа:', error);
        // После 5 попыток - блокировка на * минут
            loginAttempts++;
            localStorage.setItem('loginAttempts', loginAttempts);


            if (loginAttempts >= MAX_ATTEMPTS) {
                lockoutTime = Date.now() + (3 * 60 * 1000);
                localStorage.setItem('lockoutTime', lockoutTime);
                alert('🚫 Слишком много неудачных попыток! Доступ заблокирован на 3 минуты.');
            }
            
            showError();
        } 
        
        
        else {
            // Успех - сбрасываем счётчик
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');

        console.log('Успешный вход!', data);
        window.location.href = '/admin.html';
        }



    } catch (err) {
        // console.error('Критическая ошибка:', err);
        showError();
    }
}    

function hasDangerousChars(input) {
    const dangerousPattern = /[<>"'&\/\\]/;
    return dangerousPattern.test(input);
}

// функция которая выводит нам ошибку (с css)
function showError() {

	modalContent.classList.add('error');    
    modalContent.classList.add('shake');

    // Убираем тряску через 0.5 секунды
    setTimeout(function() {
        modalContent.classList.remove('shake');
    }, 500);

    // чистые поля
    loginInput.value = '';
    passwordInput.value = '';
}


// функция которая убирает css стиль с красными рамки 
function removeError() {
    modalContent.classList.remove('error');
}

// уберется стиль когда начнешь писать
loginInput.addEventListener('input', removeError);
passwordInput.addEventListener('input', removeError);
 


// ЗАГРУЗКА СУЩЕСТВУЮЩИХ ФОТО ПРИ ОТКРЫТИИ СТРАНИЦЫ
window.addEventListener("load", async function(){
    console.log('Загружаем фото из базы...');


    const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });


    if (error) {
        console.error('Ошибка:', error);
        return;
    }

    console.log('Найдено фото:', data.length);

    data.forEach(photo => {
        addPhotoToGallery(photo.image_url, photo.created_at);
    });
})


// ПОКАЗЫВАЕМ ФОТО
function addPhotoToGallery(imageUrl, createdAt) {
    const photoCard = document.createElement('div');
    photoCard.className = 'items';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'photo';

    photoCard.dataset.createdAt = createdAt;
    photoCard.dataset.imageUrl = imageUrl;
    
    photoCard.appendChild(img);
    
    const list = mainGallery.querySelector('.list');
    list.append(photoCard);
}





// МОДАЛЬНОЕ ОКНО С ИНФОЙ

// Вешаем слушатель на ВСЮ галерею (делегирование события)
mainGallery.addEventListener("click", function(e){
    if(e.target.tagName === "IMG") {

        // Находим родительский .items
        const photoCard = e.target.closest('.items');
        // Получаем ID фото
        const photoId = photoCard.getAttribute('data-id');
        // Получаем URL картинки
        const imageUrl = e.target.src;

        const createdAt = photoCard.dataset.createdAt;
        // Открываем модальное окно
        openPhotoModal(photoId, imageUrl, createdAt);
    }

});


const photoModal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
const closePhotoModal = document.getElementById('closePhotoModal');
const photoIdDisplay = document.getElementById('photoIdDisplay');
const photoDateElement = document.getElementById('photoDate');

let currentPhotoId = null; // Хранит ID текущего открытого фото
let currentPhotoUrl = null;

// открытие модального окна
function openPhotoModal(photoId, imageUrl, createdAt) {
    currentPhotoId = photoId;
    currentPhotoUrl = imageUrl;
    modalImage.src = imageUrl; // Показываем картинку
    // photoIdDisplay.textContent = photoId; 


    const formattedDate = formatDate(createdAt);
    photoDateElement.textContent = formattedDate;

    
    photoModal.style.display = 'flex'; // Показываем модалку
}
//  ФУНКЦИЯ ФОРМАТИРОВАНИЯ ДАТЫ
function formatDate(dateString) {
    const date = new Date(dateString);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// закрытие модалки
closePhotoModal.addEventListener('click', function() {
    photoModal.style.display = 'none';
    currentPhotoId = null;
    currentPhotoUrl = null; 
});



// Закрытие по клику на темный фон
photoModal.addEventListener('click', function(e) {
    if (e.target === photoModal) {
        photoModal.style.display = 'none';
        currentPhotoId = null;
        currentPhotoUrl = null; 
    }
});
