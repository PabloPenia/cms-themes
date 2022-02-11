/* Minimum Javascript in favor of accessibility  */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('#toggle')
  var menu = document.querySelector('.l-header ul')
  var menuItems = document.querySelectorAll('.nav-link')

  toggle.addEventListener('click', function () {
    if (menu.classList.contains('is-active')) {
      this.setAttribute('aria-expanded', 'false')
      menu.classList.remove('is-active')
    } else {
      menu.classList.add('is-active')
      this.setAttribute('aria-expanded', 'true')
      //menuItems[0].focus();
    }
  })
})
