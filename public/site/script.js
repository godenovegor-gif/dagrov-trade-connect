/* DAGROV TRADE — minimal vanilla JS: mobile menu, language switcher, form validation */
(function () {
  "use strict";

  /* Mobile menu */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Language switcher (RU / EN) */
  function setLang(lang) {
    document.documentElement.lang = lang;
    var nodes = document.querySelectorAll("[data-" + lang + "]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var value = el.getAttribute("data-" + lang);
      if (el.tagName === "META") el.setAttribute("content", value);
      else if (el.tagName === "IMG") el.setAttribute("src", value);
      else el.textContent = value;
    }
    var buttons = document.querySelectorAll(".lang__btn");
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].classList.toggle("is-active", buttons[j].getAttribute("data-lang") === lang);
    }
    try { localStorage.setItem("dagrov-lang", lang); } catch (err) {}
  }

  var langButtons = document.querySelectorAll(".lang__btn");
  for (var k = 0; k < langButtons.length; k++) {
    langButtons[k].addEventListener("click", function () {
      setLang(this.getAttribute("data-lang"));
    });
  }

  var saved = null;
  try { saved = localStorage.getItem("dagrov-lang"); } catch (err) {}
  if (!saved) saved = (navigator.language || "ru").toLowerCase().indexOf("ru") === 0 ? "ru" : "en";
  setLang(saved);

  /* Contact form validation */
  var form = document.getElementById("contactForm");
  var ok = document.getElementById("formOk");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var required = form.querySelectorAll("[required]");
      for (var i = 0; i < required.length; i++) {
        var input = required[i];
        var value = input.value.trim();
        var good = value.length > 1;
        if (input.type === "email") good = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
        if (input.type === "tel") good = value.replace(/\D/g, "").length >= 7;
        input.parentNode.classList.toggle("is-invalid", !good);
        if (!good && valid) input.focus();
        if (!good) valid = false;
      }
      if (!valid) return;
      if (ok) ok.hidden = false;
      form.reset();
    });
  }

  /* Footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
