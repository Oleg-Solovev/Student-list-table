// Функция сохранения массива студентов в LS 
function saveInLocalStorage(name, data) {
  localStorage.setItem(name, JSON.stringify(data));
}

//  Функция сохранения студента на сервере
async function saveInLocalServer(item) {
  const response = await fetch('http://localhost:3000/api/students', {
    method: 'POST',
    body: JSON.stringify(item),
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const studentItem = await response.json();
  return studentItem;
}

//  Функция загрузки массива студентов с сервера


// Функция загрузки массива студентов из LS 
function downloadFromLocalStorage(name) {
  // Получаем данные в виде строки из LS
  let data = localStorage.getItem(name);
  // Если есть данные в LS - парсим, если нет - возвращаем пустой массив
  return data ? JSON.parse(data) : [];
}

// Функция вывода даты в удобном нам формате
function getDateFormat(date) {
  date = new Date(date);
  let result = date.getDate() < 10 ? '0' + date.getDate() + '.' : date.getDate() + '.';
  result = result + (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) + '.' : (date.getMonth() + 1) + '.');
  result = result + date.getFullYear();
  return result
}

// Функция вычисления возраста
function getAge(birthDate) {
  let today = new Date();
  birthDate = new Date(birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  };
  let y = age % 10;
  switch (y) {
    case 1: age = age + ' год'; break;
    case 2, 3, 4: age = age + ' года'; break;
    default: age = age + ' лет'; break;
  };
  return age;
}

// Функция вычисления курса
function courseNum(studentObj) {
  let today = new Date();
  if (today.getMonth() < 8) {
    today = today.getFullYear() - 1;
  }
  let course = +(today - studentObj.studyStart);
  if (course > -1 && course < 4) {
    course = `${course + 1} курс`;
  }
  else {
    course = 'окончен';
  }
  return course
}

// Функция валидации формы
function validationForm(form) {

  // Текст ошибки
  function createError(input, text) {
    // Получить родителя элемента (parentNode)
    const parent = input.parentNode;
    const errorLabel = document.createElement('label');
    errorLabel.classList.add('error-label');
    errorLabel.textContent = text;
    parent.classList.add('error');
    parent.append(errorLabel);
  }

  // удаление текста ошибки
  function removeError(input) {
    const parent = input.parentNode;
    if (parent.classList.contains('error')) {
      parent.querySelector('.error-label').remove();
      parent.classList.remove('error');
    }
  }

  let accept = true;

  // Проверка текстовых полей
  const allInputs = form.querySelectorAll('.input-text');
  for (const input of allInputs) {
    let text = input.value.trim();
    removeError(input);
    if (text.length < 3) {
      createError(input, 'Должно быть не менее 3 символов!');
      accept = false;
    }
    // Делаю первые буквы текстовых данных заглавными
    input.value = text.substr(0, 1).toUpperCase() + text.substr(1).toLowerCase();
  }

  // Проверка даты рождения
  let date = new Date(birthdayInp.value).getTime();
  currentDate = new Date();
  removeError(birthdayInp);
  if (date < 0 || date > currentDate.getTime()) {
    createError(birthdayInp, 'Диапазон даты от 01.01.1900 до текущей даты!');
    accept = false;
  }
  // Проверка года начала обучения
  removeError(studyStartInp);
  if (studyStartInp.value === ''
    || studyStartInp.value < 2000
    || studyStartInp.value > currentDate.getFullYear()) {
    createError(studyStartInp, 'Год начала обучения от 2000 до текущего года!');
    accept = false;
  }

  return accept
}

// Функция вывода одного студента в таблицу 
function getStudentItem(studentObj) {
  let studentTr = document.createElement("tr")
  let fulNameTd = document.createElement("td")
  let faculTd = document.createElement("td")
  let birthdayTd = document.createElement("td")
  let studyStartTd = document.createElement("td")
  let removeTd = document.createElement("td")
  let removeBtn = document.createElement("button")

  // Удаление строки с данными студента
  removeBtn.onclick = function () {
    if (confirm('Вы уверены?')) {
      studentTr.remove()
      // Загружаю, изменяю и снова записываю в LS массив при удалении студента
      let studentsList = downloadFromLocalStorage('studentsList');
      let newStudentsList = studentsList.filter(student => student.id !== studentObj.id)
      saveInLocalStorage('studentsList', newStudentsList);
    }
  }
  // Добавление данных из объекта в ячейки таблицы
  fulNameTd.textContent = `${studentObj.surname} ${studentObj.name} ${studentObj.lastname}`;
  faculTd.textContent = studentObj.faculty;
  birthdayTd.textContent = `${getDateFormat(studentObj.birthday)} (${getAge(studentObj.birthday)})`;
  studyStartTd.textContent = `${studentObj.studyStart}-${+(studentObj.studyStart) + 4} (${courseNum(studentObj)})`;
  removeTd.append(removeBtn);
  removeBtn.textContent = "Удалить";
  removeBtn.classList.add('btn', 'btn-smal', 'btn-reset');

  studentTr.append(fulNameTd, faculTd, birthdayTd, studyStartTd, removeTd)
  return studentTr
}

// Функция отрисовки таблицы всех студентов
function renderStudentsList(arr) {
  tbody.innerHTML = '';
  for (let studentObj of arr) {
    tbody.append(getStudentItem(studentObj));
  }
}

// функция сортировки массива студентов
function getSortStudentsList(prop) {
  const sortArr = downloadFromLocalStorage('studentsList');
  sortArr.sort((a, b) => (!dir
    ? a[prop] < b[prop]
    : a[prop] > b[prop])
    ? -1
    : 0);
  dir == true ? dir = false : dir = true;
  // console.log(dir);

  // Отрисовка списка после сортировки
  return renderStudentsList(sortArr);
}

// Фильтр
function filterStudent(value, prop, arr) {
  let filterArr = [];
  if (typeof value === 'string') {
    console.log(typeof value);
    filterArr = arr.filter(el => el[prop].toLowerCase().includes(value.toLowerCase()))
  };
  if (typeof value === 'number') {
    console.log(typeof value);
    console.log(value);
    filterArr = arr.filter(el => el[prop] === value);
  };

  return renderStudentsList(filterArr);
}


// Start. Создание статичных элементов html и загрузка интерактивных элементов в JS

// Массив объектов студентов первоначальный
const studentsList = [
  {
    name: 'Олег',
    surname: 'Соловьёв',
    lastname: 'Валерьевич',
    birthday: new Date('1986-09-03'),
    studyStart: 2004,
    faculty: 'Экономический',
  },
  {
    name: 'Павел',
    surname: 'Балов',
    lastname: 'Сергеевич',
    birthday: new Date('1993-04-10'),
    studyStart: 2021,
    faculty: 'Юридический',
  },
  {
    name: 'Вячеслав',
    surname: 'Иванов',
    lastname: 'Павлович',
    birthday: new Date('1990-06-24'),
    studyStart: 2023,
    faculty: 'Финансовый',
  },
];

// сохранение первоначального массива студентов на сервер
for (let studentItem of studentsList) {
  saveInLocalServer(studentItem);
};

// Загрузка модального окна в JS
const openFormBtn = document.getElementById('openFormBtn');
const modalForm = document.getElementById('modal-form');
const addBtn = document.getElementById('add-btn');
let surnameInp = document.getElementById('surname');
let nameInp = document.getElementById('name');
let lastnameInp = document.getElementById('lastname');
let birthdayInp = document.getElementById('birthday');
let studyStartInp = document.getElementById('studyStart');
let facultyInp = document.getElementById('faculty');

// открытие модального окна и очистка предыдущих значений
openFormBtn.addEventListener("click", function () {
  modalForm.classList.add("modal-parent--open");
  surnameInp.value = '';
  nameInp.value = '';
  lastnameInp.value = '';
  birthdayInp.value = '';
  studyStartInp.value = '';
  facultyInp.value = '';
})

//  Загрузка шапки и тела таблицы в JS для сортировки и добавления студентов
const tbody = document.getElementById('tbody');
const sortFIO = document.getElementById('sortFIO');
const sortFaculty = document.getElementById('sortFaculty');
const sortbirthday = document.getElementById('sortbirthday');
const sortstudyStart = document.getElementById('sortstudyStart');

//  Загрузка полей для фильтрации
const surnameFilter = document.getElementById('surnameFilter');
const nameFilter = document.getElementById('nameFilter');
const lastnameFilter = document.getElementById('lastnameFilter');
const facultyFilter = document.getElementById('facultyFilter');
const studyStartFilter = document.getElementById('studyStartFilter');
const finishYearFilter = document.getElementById('finishYearFilter');

// Сортировка. События кликов на соответствующие колонки для сортировки
let dir = true;
sortFIO.addEventListener("click", function (event) {
  if (event._isClick === true) return
  getSortStudentsList('fullName', dir);
});

sortFaculty.addEventListener("click", function (event) {
  if (event._isClick === true) return
  getSortStudentsList('faculty');
});

sortbirthday.addEventListener("click", function (event) {
  if (event._isClick === true) return
  getSortStudentsList('birthday', dir);
});

sortstudyStart.addEventListener("click", function (event) {
  if (event._isClick === true) return
  getSortStudentsList('studyStart', dir);
});

// Фильтрация. Событие клика по кнопке для применения фильтров
document.getElementById('filterBtn').addEventListener("click", (e) => {
  e.preventDefault();
  let filterArr = [...studentsList];

  if (surnameFilter.value.trim() !== '') {
    filterArr = filterStudent(surnameFilter.value.trim(), 'surname', filterArr);
  };
  if (nameFilter.value.trim() !== '') {
    filterArr = filterStudent(nameFilter.value.trim(), 'name', filterArr);
  };
  if (lastnameFilter.value.trim() !== '') {
    filterArr = filterStudent(lastnameFilter.value.trim(), 'lastname', filterArr);
  };
  if (facultyFilter.value.trim() !== '') {
    filterArr = filterStudent(facultyFilter.value.trim(), 'faculty', filterArr);
  };
  if (studyStartFilter.value.trim() !== '') {
    filterArr = filterStudent(+studyStartFilter.value.trim(), 'studyStart', filterArr);
  };
  if (finishYearFilter.value.trim() !== '') {
    filterArr = filterStudent(+finishYearFilter.value.trim(), 'finishYear', filterArr);
  };

});

// Событие клика по кнопке сброса для удаления всех фильтров
document.getElementById('resetFilterBtn').addEventListener("click", (e) => {
  e.preventDefault();
  surnameFilter.value = '';
  nameFilter.value = '';
  lastnameFilter.value = '';
  facultyFilter.value = '';
  studyStartFilter.value = '';
  finishYearFilter.value = '';

  // запуск функции отрисовки таблицы студентов
  renderStudentsList(studentsList);

});

// закрытие модального окна
modalForm.querySelector(".modal").addEventListener("click", function (event) {
  event._isClick = true
})
modalForm.addEventListener("click", function (event) {
  if (event._isClick === true) return
  modalForm.classList.remove("modal-parent--open")
})

// закрытие модального окна по кнопке Esc
window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    modalForm.classList.remove("modal-parent--open")
  }
});


// Кнопка отправки формы и проверка введённых данных
addBtn.addEventListener("click", async e => {
  e.preventDefault();

  if (validationForm(modalForm)) {

    let newStudent = {
      name: nameInp.value,
      surname: surnameInp.value,
      lastname: lastnameInp.value,
      birthday: Date.parse(birthdayInp.value),
      studyStart: +studyStartInp.value,
      faculty: facultyInp.value,
    };

    // Добавляем нового студента с данными на сервер
    saveInLocalServer(newStudent);

    // Закрытие модального окна
    modalForm.classList.remove("modal-parent--open")

    // Получение массива студентов с сервера и запуск отрисовки таблицы студентов
    
    renderStudentsList(studentsList);
    console.log(studentsList);
  }

})



// Отрисовка всех студентов в таблице
renderStudentsList(studentsList);