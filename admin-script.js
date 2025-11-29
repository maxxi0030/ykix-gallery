// JS ДЛЯ АДМИНКИ

const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const adminGallery = document.getElementById("admin-gallery");

const adminFont = document.querySelector('.admin-font');


// Проверка авторизации при загрузке
let currentUser = null;

(async function initAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            console.log('❌ Неавторизован, редирект...');
            window.location.replace('./index.html');
            throw new Error('Unauthorized');
        }
        
        currentUser = user;
        console.log('✅ Админ подтверждён:', user.email);
        
        // Запускаем автовыход
        startSessionTimeout();
        
    } catch (err) {
        console.error('Ошибка авторизации:', err);
        window.location.replace('./index.html');
    }
})();


// ЗАЩИТА 2: Автоматический выход через час

let sessionTimeout;
const SESSION_DURATION = 60 * 60 * 1000;

function startSessionTimeout() {
    resetSessionTimeout();
    
    // Сброс таймера при любой активности
    document.addEventListener('click', resetSessionTimeout);
    document.addEventListener('keypress', resetSessionTimeout);
    document.addEventListener('mousemove', resetSessionTimeout);
}

function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    
    sessionTimeout = setTimeout(async () => {
        alert('⏰ Сессия истекла. Войдите заново.');
        await supabase.auth.signOut();
        window.location.replace('./index.html');
    }, SESSION_DURATION);
}

async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        window.location.href = './index.html';
        return;
    }
    
    console.log('Админ залогинен:', user.email);




}

checkAuth();


// для перехода на мейн страницу
adminFont.addEventListener('click', function() {
    window.location.href = 'index.html';

});


// браузер не будет открывать файл в новой вкладке
uploadZone.addEventListener("dragover", function(e) {
    e.preventDefault();
    uploadZone.classList.add("dragover");

});

// если файл покинул зону
uploadZone.addEventListener("dragleave", function(e) {
    uploadZone.classList.remove('dragover');

});

// Когда файл отпустили (drop)
uploadZone.addEventListener('drop', function(e) {
    e.preventDefault(); // Браузер не открывает файл
    uploadZone.classList.remove('dragover');

    const files = e.dataTransfer.files;

    for(let i = 0; i < files.length; i++) {
        uploadToSupabase(files[i]);
    }
});


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
        addPhotoToGallery(photo.image_url, photo.id);
    });
})


// ВЫБОР ФАЙЛОВ
fileInput.addEventListener("change", function(e) {
    const files = e.target.files;
    for(let i = 0; i < files.length; i++) {
        uploadToSupabase(files[i]);
    }
});

// проверка: подходит ли название файла

async function safeFileName(originalName) {
    // Проверяем, подходит ли имя для Supabase
    function isValidFileName(name) {
        // Разрешаем только латинские буквы, цифры, точки, дефисы и подчеркивания!
        const validPattern = /^[a-zA-Z0-9._-]+$/;
        return validPattern.test(name.replace(/\.[^/.]+$/, "")); // убираем расширение для проверки
    }

    // Если имя валидно и нету повторов - возвращаем как есть
    if (isValidFileName(originalName)) {
        console.log("ориг имя", originalName)

        const { data } = await supabase
            .storage
            .from('gallery-images')
            .list('', {
                search: originalName
            });
        
        // Если нету повтора - используем оригинальное имя
        if (!data || data.length === 0) {
            console.log("Оригинальное имя свободно:", originalName);
            return originalName;
        }
        
        console.log("Файл с таким именем существует, генерируем новое");
    }

    // Если не валидно или есть повтор - генерируем новое имя
    const extension = originalName.split('.').pop(); //разширение
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    
    // return `${timestamp}_${randomString}.${extension}`; // создадим переменную + выведем в консоль

    const newFileName = `${timestamp}_${randomString}.${extension}`;

    console.log("ориг имя:", originalName);
    console.log("новое имя:", newFileName);

    return newFileName;

}

// Использование: await uploadFileClean(file);

async function fileToImage(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

async function canvasToBlob(canvas, mime = 'image/jpeg', quality = 0.9) {
  return await new Promise(res => canvas.toBlob(res, mime, quality));
}

async function stripExifClient(file) {
  // Поддержка PNG/JPEG. Если PNG — canvas перекодирует без EXIF.
  const img = await fileToImage(file);
  // Учитываем ориентацию можно через EXIF-js; но простая rotate не делаем — 
  // если ориентация критична, можно использовать exifreader + transform.
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
  return newFile;
}

// ЗАГРУЗКА В SUPABASE
async function uploadToSupabase(file) {
    console.log('Загружаем:', file.name);

    // Уникальное имя с проверкой

    // const fileName = await safeFileName(file.name);
    
    // Загружаем в Storage
    // const { error: uploadError } = await supabase
    //     .storage
    //     .from('gallery-images')
    //     .upload(fileName, file);


    const cleanedFile = await stripExifClient(file);
    const fileName = await safeFileName(cleanedFile.name);
    const { error: uploadError } = await supabase
    .storage
    .from('gallery-images')
    .upload(fileName, cleanedFile);
  // дальше как раньше — получаем publicUrl, записываем в БД
    
    if (uploadError) {
        console.error('Ошибка загрузки:', uploadError);
        alert('Ошибка: ' + uploadError.message);
        return;
    }
    
    // Получаем URL
    const { data: urlData } = supabase
        .storage
        .from('gallery-images')
        .getPublicUrl(fileName);
    
    const imageUrl = urlData.publicUrl;

    const { data: dbData, error: dbError } = await supabase
    .from('photos')
    .insert([{ image_url: imageUrl, file_name: fileName}])
    .select();

    
    if (dbError) {
        console.error('Ошибка базы:', dbError);
        alert('Ошибка БД: ' + dbError.message);
        return;
    }
    
    console.log('Успешно загружено!');
    
    const insertedPhoto = dbData[0];
    // Показываем в галерее
    addPhotoToGallery(imageUrl, insertedPhoto.id);
}


// ПОКАЗЫВАЕМ ФОТО
function addPhotoToGallery(imageUrl, photoId) {
    const photoCard = document.createElement('div');
    photoCard.className = 'items';
    photoCard.setAttribute('data-id', photoId); // Сохраняем ID фото

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'photo';
    photoCard.appendChild(img);

    const list = adminGallery.querySelector('.list');
    list.append(photoCard);
}


// Вешаем слушатель на ВСЮ галерею (делегирование события)
adminGallery.addEventListener("click", function(e){
    if(e.target.tagName === "IMG") {

        // Находим родительский .items
        const photoCard = e.target.closest('.items');
        // Получаем ID фото
        const photoId = photoCard.getAttribute('data-id');
        // Получаем URL картинки
        const imageUrl = e.target.src;
        // Открываем модальное окно
        openPhotoModal(photoId, imageUrl);
    }

});



// ============================================
// ЭЛЕМЕНТЫ МОДАЛЬНОГО ОКНА
// ============================================

const photoModal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
const closePhotoModal = document.getElementById('closePhotoModal');
const deletePhotoBtn = document.getElementById('deletePhotoBtn');
const photoIdDisplay = document.getElementById('photoIdDisplay');

// Элементы модального окна подтверждения
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deletePhotoIdDisplay = document.getElementById('deletePhotoIdDisplay');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let currentPhotoId = null; // Хранит ID текущего открытого фото
let currentPhotoUrl = null;


// открытие модального окна
function openPhotoModal(photoId, imageUrl) {
    currentPhotoId = photoId;
    currentPhotoUrl = imageUrl;
    modalImage.src = imageUrl; // Показываем картинку
    photoIdDisplay.textContent = photoId; // Показываем ID
    
    photoModal.style.display = 'flex'; // Показываем модалку
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


// УДАЛЕНИЕ ФОТО

async function deletePhotoById(photoId) {
//   console.log('Начинаем удаление');
  console.log('photoId:', photoId, 'тип:', typeof photoId);
  
  if (!currentPhotoUrl) {
    console.error('Нет URL фото');
    return false;
  }
  
  // Извлекаем имя файла из URL
  const fileName = currentPhotoUrl.split('/').pop();
//   console.log('fileName для удаления:', fileName);
  
  try {
    // 1. Удаляем файл из Storage
    const { error: storageError } = await supabase
      .storage
      .from('gallery-images')
      .remove([fileName]);
    
    if (storageError) {
      console.error('❌ Ошибка удаления файла:', storageError);
      // Продолжаем удаление из БД даже если файл не найден
    } else {
      console.log('✅ Файл удален из Storage');
    }
    
    // 2. Удаляем запись из БД по ID (bigint)

    // const idToDelete = Number(photoId);
    // console.log('ID для удаления:', photoId);
    
    const { data, error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .select();
    
    console.log('Результат удаления из БД:', data);
    
    if (dbError) {
      console.error('❌ Ошибка удаления из БД:', dbError);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('⚠️ Ничего не удалилось из БД! ID не найден');
      return false;
    }
    
    console.log('✅ Запись удалена из БД');
    return true;
    
  } catch (error) {
    console.error('Неожиданная ошибка:', error);
    return false;
  }
}

// нажатие удалить
deletePhotoBtn.addEventListener('click', async () => {
    const photoId = currentPhotoId;
    const photoUrl = currentPhotoUrl;
  
    console.log('Кнопка нажата. photoId:', photoId, 'photoUrl:', photoUrl);
  
    if (!photoId || !photoUrl) {
        alert('Ошибка: фото не выбрано');
        return;
    }

    deleteConfirmModal.classList.add('active');

});

// нажатие отмена
cancelDeleteBtn.addEventListener('click', () => {
            deleteConfirmModal.classList.remove('active');
        });

// Подтверждение удаления
confirmDeleteBtn.addEventListener('click', async () => {
    const photoId = currentPhotoId;
    const photoUrl = currentPhotoUrl;
            
    // Закрываем модальное окно подтверждения
    deleteConfirmModal.classList.remove('active');
            
    // Выполняем удаление
    const success = await deletePhotoById(photoId);
            
    if (success) {
        // Удаляем карточку из DOM
        const photoCard = document.querySelector(`[data-id="${photoId}"]`);
        if (photoCard) {
            photoCard.remove();
            console.log('Карточка удалена из галереи');
        }
                
        // Закрываем основное модальное окно
        photoModal.style.display = 'none';
        currentPhotoId = null;
        currentPhotoUrl = null;
                
        // alert('Фото удалено!');
    } else {
        alert('Ошибка при удалении!');
        }
}); 

// Закрытие основного модального окна
closePhotoModal.addEventListener('click', () => {
        photoModal.style.display = 'none';
    });

// Закрытие модального окна подтверждения при клике вне его
deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === deleteConfirmModal) {
            deleteConfirmModal.classList.remove('active');
        }
});

