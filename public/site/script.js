/* DAGROV TRADE — minimal vanilla JS: menu, i18n, scrollspy, form validation */
(function () {
  "use strict";

  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var header = document.querySelector(".header");

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.removeProperty("overflow");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && window.innerWidth <= 720) document.body.style.overflow = "hidden";
      else document.body.style.removeProperty("overflow");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
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
    var aria = document.querySelectorAll("[data-" + lang + "-aria]");
    for (var a = 0; a < aria.length; a++) {
      aria[a].setAttribute("aria-label", aria[a].getAttribute("data-" + lang + "-aria"));
    }
    var buttons = document.querySelectorAll(".lang__btn");
    for (var j = 0; j < buttons.length; j++) {
      var active = buttons[j].getAttribute("data-lang") === lang;
      buttons[j].classList.toggle("is-active", active);
      buttons[j].setAttribute("aria-pressed", active ? "true" : "false");
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

  function validateField(input) {
    var value = input.value.trim();
    var good = value.length > 1;
    if (input.type === "email") good = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    if (input.type === "tel") good = value.replace(/\D/g, "").length >= 7;
    input.parentNode.classList.toggle("is-invalid", !good);
    input.setAttribute("aria-invalid", good ? "false" : "true");
    return good;
  }

  if (form) {
    var required = form.querySelectorAll("[required]");
    for (var r = 0; r < required.length; r++) {
      required[r].addEventListener("blur", function () { validateField(this); });
      required[r].addEventListener("input", function () {
        if (this.parentNode.classList.contains("is-invalid")) validateField(this);
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var first = null;
      for (var i = 0; i < required.length; i++) {
        var good = validateField(required[i]);
        if (!good && !first) first = required[i];
        if (!good) valid = false;
      }
      if (!valid) {
        if (first) first.focus();
        return;
      }
      if (ok) {
        ok.hidden = false;
        ok.setAttribute("tabindex", "-1");
        ok.focus();
      }
      form.reset();
      var fields = form.querySelectorAll(".field");
      for (var f = 0; f < fields.length; f++) fields[f].classList.remove("is-invalid");
    });
  }

  /* Footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Reveal on scroll */
  if ("IntersectionObserver" in window) {
    var targets = document.querySelectorAll(".section > .container > *, .card, .steps li, .goals li, .fact");
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add("is-visible");
          io.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    for (var t = 0; t < targets.length; t++) {
      targets[t].classList.add("reveal");
      io.observe(targets[t]);
    }

    /* Scrollspy: highlight the section currently in view */
    var links = document.querySelectorAll(".nav a[href^='#']");
    var sections = [];
    for (var l = 0; l < links.length; l++) {
      var id = links[l].getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) sections.push({ el: section, link: links[l] });
    }
    if (sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          for (var s = 0; s < sections.length; s++) {
            if (sections[s].el === entries[i].target) sections[s].link.setAttribute("aria-current", "true");
            else sections[s].link.removeAttribute("aria-current");
          }
        }
      }, { rootMargin: "-45% 0px -50% 0px" });
      for (var q = 0; q < sections.length; q++) spy.observe(sections[q].el);
    }
  }

  /* Header elevation + back-to-top */
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (toTop) toTop.hidden = y < 600;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* Close mobile menu on outside click / Escape / resize */
  document.addEventListener("click", function (e) {
    if (!nav || !burger || !nav.classList.contains("is-open")) return;
    if (nav.contains(e.target) || burger.contains(e.target)) return;
    closeNav();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav && nav.classList.contains("is-open")) {
      closeNav();
      burger.focus();
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 960) closeNav();
  });
})();
