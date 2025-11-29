ЧЕРНОВИК

/* КНОПКА АДМИНА - 1 вариант */


.admin-button{

    width: 39px;
    height: 39px;

    border: none;
    background: transparent; /* Полностью прозрачная */
    cursor: pointer; /* Рука при наведении */

    transition: transform 0.3s;
}

/* Иконка внутри кнопки */
.admin-button img {
    width: 90%; /* Иконка занимает всю ширину кнопки */
    height: 90%; /* Иконка занимает всю высоту кнопки */

    transition: all 0.3s 0.4s; /* плавность задержка */
}

.admin-button:hover {
    transform: translateY(-5px); /* поднимаем на 5 пикселей вверх */
}

.close {
    display: block;
}

.open{
    display: none;
}

.admin-button:hover .close {
    display: none;

}

.admin-button:hover .open {
    display: block;
    
}



/* КНОПКА АДМИНА - 2 вариант */


.admin-button {
    position: relative;
    width: 39px;
    height: 39px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: transform 0.3s;
}

.admin-button img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90%;
    height: 90%;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
}

/* По умолчанию показываем закрытый замок */
.close {
    opacity: 1;
}

.open {
    opacity: 0;
}

/* При наведении меняем прозрачность, а не display */
.admin-button:hover .close {
    opacity: 0;
}

.admin-button:hover .open {
    opacity: 1;
}

.admin-button:hover {
    transform: translateY(-5px);
}






; третий варик
.admin-button:hover .button-img {
  content: url('icon2.png'); /* ← здесь укажи путь ко второй картинке */
}







/* МОДАЛЬНОЕ ОКНО - 1 версия */

.modal {
    display: none;
    position: fixed;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px); 

    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #999999;
    border-radius: 10px;

    padding: 40px;
    text-align: center;

}

.modal-content input {
    display: block; /* каждый элемент(поле) на новой строке */

    width: 250px;
    padding: 10px;
    margin: 10px auto;

    /* BORDER - рамка вокруг поля */
    /* 1px = толщина, solid = сплошная линия, #ccc = светло-серый цвет */
    border: 1px solid black;
    border-radius: 5px;

}



.modal-buttons button {

    /* Внутренние отступы кнопки */
    /* 10px сверху/снизу, 20px слева/справа */
    padding: 10px 20px;

    /* Внешние отступы между кнопками */
    /* 10px сверху/снизу, 5px слева/справа */
    margin: 10px 5px;

    cursor: pointer; /* pointer = рука с пальцем (показывает что это кликабельно) */
}






if (login === "" || password === "" || login !== "admin" || password !== "a123") {

        if (login === "" || login !== "admin") {
            loginInput.classList.add("error");
            loginInput.value = "";
        }

        if (password === "" || password !== "a123"){
            passwordInput.classList.add("error");
            passwordInput.value = "";
        }

        modalContent.classList.add("shake");
        setTimeout(() => {
            modalContent.classList.remove('shake');
        }, 500);

        return; 
    }