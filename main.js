// Функция сохранения массива студентов в LS 
function saveInLocalStorage(name, data) {
  localStorage.setItem(name, JSON.stringify(data));
}

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
  let course = +(today - studentObj.startYear);
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
  let date = new Date(birthDayInp.value).getTime();
  currentDate = new Date();
  removeError(birthDayInp);
  if (date < 0 || date > currentDate.getTime()) {
    createError(birthDayInp, 'Диапазон даты от 01.01.1900 до текущей даты!');
    accept = false;
  }
  // Проверка года начала обучения
  removeError(startYearInp);
  if (startYearInp.value === ''
    || startYearInp.value < 2000
    || startYearInp.value > currentDate.getFullYear()) {
    createError(startYearInp, 'Год начала обучения от 2000 до текущего года!');
    accept = false;
  }

  return accept
}

// Функция вывода одного студента в таблицу. Функция должна вернуть html элемент с информацией о студенте. 
// У функции должен быть один аргумент - объект студента.
function getStudentItem(studentObj) {
  let studentTr = document.createElement("tr")
  let fulNameTd = document.createElement("td")
  let faculTd = document.createElement("td")
  let birthDayTd = document.createElement("td")
  let startYearTd = document.createElement("td")
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
  fulNameTd.textContent = studentObj.fullName;
  faculTd.textContent = studentObj.faculty;
  birthDayTd.textContent = `${getDateFormat(studentObj.birthDay)} (${getAge(studentObj.birthDay)})`;
  startYearTd.textContent = `${studentObj.startYear}-${+(studentObj.startYear) + 4} (${courseNum(studentObj)})`;
  removeTd.append(removeBtn);
  removeBtn.textContent = "Удалить";
  removeBtn.classList.add('btn', 'btn-smal', 'btn-reset');

  studentTr.append(fulNameTd, faculTd, birthDayTd, startYearTd, removeTd)
  return studentTr
}

// Функция отрисовки всех студентов. Аргументом функции будет массив студентов. 
// Функция должна использовать ранее созданную функцию создания одной записи для студента.
// Цикл поможет вам создать список студентов. 
// Каждый раз при изменении списка студента вы будете вызывать эту функцию для отрисовки таблицы.
function renderStudentsList(arr) {
  tbody.innerHTML = '';
  for (let studentObj of arr) {
    tbody.append(getStudentItem(studentObj));
  }
}

// функция сортировки массива студентов
function getSortStudentsList(prop) {
  const sortArr = [...studentsList];
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
function filterStudent(text, prop, arr) {
  let filterArr = [];
  if (typeof text === 'string') {
    console.log(typeof text);
    filterArr = arr.filter(el => el[prop].toLowerCase().includes(text.toLowerCase()))
  };
  if (typeof text === 'number') {
    console.log(typeof text);
    console.log(text);
    filterArr = arr.filter(el => el[prop] === text);
  };

  return renderStudentsList(filterArr);
}


// 1 этап - создание статичных элементов html и загрузка интерактивных элементов в JS

// Загрузка модального окна в JS
const openFormBtn = document.getElementById('openFormBtn');
const modalForm = document.getElementById('modal-form');
const addBtn = document.getElementById('add-btn');
let surnameInp = document.getElementById('surname');
let nameInp = document.getElementById('name');
let middleNameInp = document.getElementById('middleName');
let birthDayInp = document.getElementById('birthDay');
let startYearInp = document.getElementById('startYear');
let facultyInp = document.getElementById('faculty');

// открытие модального окна и очистка предыдущих значений
openFormBtn.addEventListener("click", function () {
  modalForm.classList.add("modal-parent--open");
  surnameInp.value = '';
  nameInp.value = '';
  middleNameInp.value = '';
  birthDayInp.value = '';
  startYearInp.value = '';
  facultyInp.value = '';
})

//  Загрузка шапки и тела таблицы в JS для сортировки и добавления студентов
const tbody = document.getElementById('tbody');
const sortFIO = document.getElementById('sortFIO');
const sortFaculty = document.getElementById('sortFaculty');
const sortBirthDay = document.getElementById('sortBirthDay');
const sortStartYear = document.getElementById('sortStartYear');

//  Загрузка полей для фильтрации
const surnameFilter = document.getElementById('surnameFilter');
const nameFilter = document.getElementById('nameFilter');
const middleNameFilter = document.getElementById('middleNameFilter');
const facultyFilter = document.getElementById('facultyFilter');
const startYearFilter = document.getElementById('startYearFilter');
const finishYearFilter = document.getElementById('finishYearFilter');

// Сортировка    События кликов на соответствующие колонки для сортировки
let dir = true;
sortFIO.addEventListener("click", function (event) {
  if (event._isClick === true) return
  getSortStudentsList('fullName', dir);
});

sortFaculty.addEventListener("click", function (event) {
  if (event._isClick === true) return
  getSortStudentsList('faculty');
});

sortBirthDay.addEventListener("click", function (event) {
  if (event._isClick === true) return
  getSortStudentsList('birthDay', dir);
});

sortStartYear.addEventListener("click", function (event) {
  if (event._isClick === true) return
  getSortStudentsList('startYear', dir);
});

// Фильтрация    События клика по кнопке для применения фильтров
document.getElementById('filterBtn').addEventListener("click", (e) => {
  e.preventDefault();
  let filterArr = [...studentsList];

  if (surnameFilter.value.trim() !== '') {
    filterArr = filterStudent(surnameFilter.value.trim(), 'surname', filterArr);
  };
  if (nameFilter.value.trim() !== '') {
    filterArr = filterStudent(nameFilter.value.trim(), 'name', filterArr);
  };
  if (middleNameFilter.value.trim() !== '') {
    filterArr = filterStudent(middleNameFilter.value.trim(), 'middleName', filterArr);
  };
  if (facultyFilter.value.trim() !== '') {
    filterArr = filterStudent(facultyFilter.value.trim(), 'faculty', filterArr);
  };
  if (startYearFilter.value.trim() !== '') {
    filterArr = filterStudent(+startYearFilter.value.trim(), 'startYear', filterArr);
  };
  if (finishYearFilter.value.trim() !== '') {
    filterArr = filterStudent(+finishYearFilter.value.trim(), 'finishYear', filterArr);
  };

});

// Сброс всех фильтров по кнопке сброса
document.getElementById('resetFilterBtn').addEventListener("click", (e) => {
  e.preventDefault();
  surnameFilter.value = '';
  nameFilter.value = '';
  middleNameFilter.value = '';
  facultyFilter.value = '';
  startYearFilter.value = '';
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

// закрытие модального окна на Esc
window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    modalForm.classList.remove("modal-parent--open")
  }
});


// Этап 5. К форме добавления студента добавьте слушатель события отправки формы, в котором будет проверка введенных данных.
// Кнопка отправки формы и проверка введённых данных
addBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (validationForm(modalForm)) {

    let newStudent = {
      surname: surnameInp.value,
      name: nameInp.value,
      middleName: middleNameInp.value,
      fullName: `${surnameInp.value} ${nameInp.value} ${middleNameInp.value}`,
      birthDay: Date.parse(birthDayInp.value),
      startYear: startYearInp.value,
      finishYear: startYearInp.value + 4,
      faculty: facultyInp.value,
    };

    studentsList.push(newStudent);
    saveInLocalStorage("studentsList", studentsList);
    modalForm.classList.remove("modal-parent--open")

    // запуск функции отрисовки таблицы студентов
    renderStudentsList(studentsList);
    console.log(studentsList);
  }

})

// Массив объектов студентов
const studentsList = [
  {
    id: Math.round(Math.random() * 1000),
    surname: 'Соловьёв',
    name: 'Олег',
    middleName: 'Валерьевич',
    fullName: 'Соловьёв Олег Валерьевич',
    birthDay: new Date('1986-09-03'),
    startYear: 2004,
    finishYear: 2008,
    faculty: 'Экономический',
  },
  {
    id: Math.round(Math.random() * 1000),
    surname: 'Балов',
    name: 'Павел',
    middleName: 'Сергеевич',
    fullName: 'Балов Павел Сергеевич',
    birthDay: new Date('1993-04-10'),
    startYear: 2021,
    finishYear: 2025,
    faculty: 'Юридический',
  },
  {
    id: Math.round(Math.random() * 1000),
    surname: 'Иванов',
    name: 'Вячеслав',
    middleName: 'Павлович',
    fullName: 'Иванов Вячеслав Павлович',
    birthDay: new Date('1990-06-24'),
    startYear: 2023,
    finishYear: 2027,
    faculty: 'Финансовый',
  },
];

// сохранение массива студентов в LS 
saveInLocalStorage("studentsList", studentsList);
console.log(studentsList);

// Отрисовка всех студентов в таблице
renderStudentsList(studentsList);