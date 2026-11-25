/* ==========================================================================
   ASAS | أساس لمواد البناء
   Interactions: navigation, reveal, counters, product filters, form, FAQ
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var body = doc.body;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = doc.getElementById("siteHeader");

  /* ---------- Current year ---------- */
  var yearEls = doc.querySelectorAll("[data-year]");
  for (var y = 0; y < yearEls.length; y += 1) {
    yearEls[y].textContent = new Date().getFullYear();
  }

  /* ---------- Header & back-to-top ---------- */
  var toTop = doc.querySelector("[data-to-top]");

  function onScroll() {
    var scrolled = window.scrollY > 10;
    if (header) header.classList.toggle("scrolled", scrolled);
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 480);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = doc.querySelector("[data-nav-toggle]");
  var siteNav = doc.getElementById("siteNav");

  function closeNav() {
    body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "فتح القائمة");
    }
  }

  function openNav() {
    body.classList.add("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "إغلاق القائمة");
    }
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      if (body.classList.contains("nav-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    siteNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && body.classList.contains("nav-open")) {
        closeNav();
        navToggle.focus();
      }
    });

    doc.addEventListener("click", function (event) {
      if (
        body.classList.contains("nav-open") &&
        !siteNav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        closeNav();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) closeNav();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll("[data-reveal]"));

  revealEls.forEach(function (el) {
    if (el.dataset.delay) el.style.setProperty("--reveal-delay", el.dataset.delay);
  });

  function revealAll() {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (!("IntersectionObserver" in window) || prefersReduced) {
    revealAll();
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- Animated counters ---------- */
  var counters = Array.prototype.slice.call(doc.querySelectorAll("[data-count]"));

  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var suffix = el.dataset.suffix || "";
    var duration = 1500;
    var startTime = null;

    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }

    function tick(now) {
      if (!startTime) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      var counterObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );

      counters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    }
  }

  /* ---------- Product filters ---------- */
  var filterButtons = Array.prototype.slice.call(doc.querySelectorAll("[data-filter]"));
  var productCards = Array.prototype.slice.call(doc.querySelectorAll("[data-cat]"));
  var filterCount = doc.getElementById("filterCount");

  if (filterButtons.length && productCards.length) {
    var applyFilter = function (filter) {
      var shown = 0;

      productCards.forEach(function (card) {
        var matches = filter === "all" || card.dataset.cat === filter;
        card.hidden = !matches;
        card.classList.remove("card-enter");

        if (matches) {
          shown += 1;
          void card.offsetWidth;
          card.classList.add("card-enter");
        }
      });

      filterButtons.forEach(function (button) {
        var active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (filterCount) {
        filterCount.textContent = shown + " " + (shown === 1 ? "منتج متاح" : "منتجات متاحة");
      }
    };

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.dataset.filter);
      });
    });
  }

  /* ---------- Quote links: carry product name to contact page ---------- */
  var quoteLinks = doc.querySelectorAll(".js-quote");
  Array.prototype.forEach.call(quoteLinks, function (link) {
    var product = link.dataset.product;
    if (!product) return;
    link.href = "contact.html?item=" + encodeURIComponent(product);
  });

  /* ---------- Contact page: prefill from selected product ---------- */
  var params = new URLSearchParams(window.location.search);
  var requestedItem = params.get("item");
  var prefillBox = doc.querySelector("[data-quote-prefill]");
  var prefillName = doc.querySelector("[data-quote-name]");
  var clearPrefill = doc.querySelector("[data-clear-prefill]");
  var messageField = doc.getElementById("message");
  var subjectField = doc.getElementById("subject");

  if (requestedItem && prefillBox) {
    prefillBox.hidden = false;
    if (prefillName) prefillName.textContent = requestedItem;
    if (subjectField) subjectField.value = "quote";
    if (messageField && !messageField.value) {
      messageField.value =
        "أرغب بالحصول على عرض سعر للمنتج: " +
        requestedItem +
        "\nالكمية المطلوبة: \nموقع التوريد: ";
    }

    if (clearPrefill) {
      clearPrefill.addEventListener("click", function () {
        prefillBox.hidden = true;
        if (messageField) messageField.value = "";
        subjectField.value = "";
        if (window.history.replaceState) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      });
    }
  }

  /* ---------- FAQ accordion ---------- */
  var faqButtons = Array.prototype.slice.call(doc.querySelectorAll(".faq-q"));

  faqButtons.forEach(function (button) {
    var panel = doc.getElementById(button.getAttribute("aria-controls"));
    if (panel) panel.setAttribute("aria-hidden", "true");

    button.addEventListener("click", function () {
      var item = button.closest(".faq-item");
      var isOpen = item.classList.contains("open");

      faqButtons.forEach(function (otherButton) {
        var otherItem = otherButton.closest(".faq-item");
        var otherPanel = doc.getElementById(otherButton.getAttribute("aria-controls"));
        otherItem.classList.remove("open");
        otherButton.setAttribute("aria-expanded", "false");
        if (otherPanel) otherPanel.setAttribute("aria-hidden", "true");
      });

      if (!isOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        if (panel) panel.setAttribute("aria-hidden", "false");
      }
    });
  });

  /* ---------- Contact form ---------- */
  var form = doc.getElementById("quoteForm");
  var successPanel = doc.querySelector("[data-form-success]");
  var formIntro = doc.querySelector("[data-form-intro]");
  var mailLink = doc.querySelector("[data-mail-link]");
  var waLink = doc.querySelector("[data-wa-link]");
  var editButton = doc.querySelector("[data-form-reset]");
  var emailAddress = "mohammed.khruos55@gmail.com";
  var whatsappNumber = "966594478231";

  function getWrapper(field) {
    return field.closest(".field") || field.closest(".checkbox-field");
  }

  function setError(field, message) {
    var wrapper = getWrapper(field);
    if (!wrapper) return;
    wrapper.classList.add("has-error");
    wrapper.classList.remove("is-valid");
    field.setAttribute("aria-invalid", "true");
    var error = wrapper.querySelector(".error");
    if (error) error.textContent = message;
  }

  function setValid(field) {
    var wrapper = getWrapper(field);
    if (!wrapper) return;
    wrapper.classList.remove("has-error");
    wrapper.classList.add("is-valid");
    field.removeAttribute("aria-invalid");
  }

  function clearState(field) {
    var wrapper = getWrapper(field);
    if (!wrapper) return;
    wrapper.classList.remove("has-error", "is-valid");
    field.removeAttribute("aria-invalid");
    var error = wrapper.querySelector(".error");
    if (error) error.textContent = "";
  }

  function validateName() {
    var field = doc.getElementById("name");
    if (!field) return true;
    var value = field.value.trim();
    if (!value) {
      setError(field, "يرجى كتابة الاسم الكامل.");
      return false;
    }
    if (value.length < 3) {
      setError(field, "الاسم قصير جدًا، اكتب 3 أحرف على الأقل.");
      return false;
    }
    setValid(field);
    return true;
  }

  function validatePhone() {
    var field = doc.getElementById("phone");
    if (!field) return true;
    var value = field.value.replace(/[\s\-()]/g, "");
    var pattern = /^(?:(?:\+?966)5|05|5)\d{8}$/;
    if (!value) {
      setError(field, "يرجى إدخال رقم الجوال.");
      return false;
    }
    if (!pattern.test(value)) {
      setError(field, "أدخل رقم جوال سعودي صحيح، مثل 05XXXXXXXX.");
      return false;
    }
    setValid(field);
    return true;
  }

  function validateEmail() {
    var field = doc.getElementById("email");
    if (!field) return true;
    var value = field.value.trim();
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!value) {
      setValid(field);
      return true;
    }
    if (!pattern.test(value)) {
      setError(field, "صيغة البريد الإلكتروني غير صحيحة.");
      return false;
    }
    setValid(field);
    return true;
  }

  function validateSubject() {
    var field = doc.getElementById("subject");
    if (!field) return true;
    if (!field.value) {
      setError(field, "اختر نوع الطلب.");
      return false;
    }
    setValid(field);
    return true;
  }

  function validateMessage() {
    var field = doc.getElementById("message");
    if (!field) return true;
    var value = field.value.trim();
    if (!value) {
      setError(field, "يرجى كتابة تفاصيل الطلب.");
      return false;
    }
    if (value.length < 10) {
      setError(field, "التفاصيل قصيرة، اكتب 10 أحرف على الأقل.");
      return false;
    }
    setValid(field);
    return true;
  }

  function validateConsent() {
    var field = doc.getElementById("consent");
    if (!field) return true;
    var wrapper = field.closest(".checkbox-field");
    if (!field.checked) {
      if (wrapper) wrapper.classList.add("has-error");
      return false;
    }
    if (wrapper) wrapper.classList.remove("has-error");
    return true;
  }

  var validators = {
    name: validateName,
    phone: validatePhone,
    email: validateEmail,
    subject: validateSubject,
    message: validateMessage,
    consent: validateConsent
  };

  if (form) {
    var fields = ["name", "phone", "email", "subject", "message", "consent"];

    fields.forEach(function (id) {
      var field = doc.getElementById(id);
      if (!field) return;

      var validate = validators[id];

      field.addEventListener("blur", function () {
        if (field.value || field.checked) validate();
      });

      field.addEventListener("input", function () {
        var wrapper = getWrapper(field);
        if (wrapper && wrapper.classList.contains("has-error")) validate();
      });

      field.addEventListener("change", function () {
        if (id === "consent") validateConsent();
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var results = fields.map(function (id) {
        return validators[id] ? validators[id]() : true;
      });
      var allValid = results.every(Boolean);

      if (!allValid) {
        var firstInvalid = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({
            behavior: prefersReduced ? "auto" : "smooth",
            block: "center"
          });
        }
        return;
      }

      var name = doc.getElementById("name").value.trim();
      var phone = doc.getElementById("phone").value.trim();
      var email = doc.getElementById("email").value.trim();
      var subjectFieldEl = doc.getElementById("subject");
      var subjectLabel = subjectFieldEl.options[subjectFieldEl.selectedIndex].text;
      var message = doc.getElementById("message").value.trim();
      var itemLine = requestedItem ? "\nالمنتج المطلوب: " + requestedItem : "";

      var mailSubject =
        "طلب عرض سعر — " + subjectLabel + (requestedItem ? " — " + requestedItem : "");
      var mailBody =
        "الاسم: " +
        name +
        "\nرقم الجوال: " +
        phone +
        "\nالبريد الإلكتروني: " +
        (email || "غير محدد") +
        "\nنوع الطلب: " +
        subjectLabel +
        itemLine +
        "\n\nتفاصيل الطلب:\n" +
        message;

      var mailto =
        "mailto:" +
        emailAddress +
        "?subject=" +
        encodeURIComponent(mailSubject) +
        "&body=" +
        encodeURIComponent(mailBody);

      var whatsappText =
        "مرحبًا فريق أساس،\n" + mailBody + "\n\n— أُرسلت من موقع أساس";

      if (mailLink) mailLink.href = mailto;
      if (waLink) waLink.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(whatsappText);

      form.hidden = true;
      if (formIntro) formIntro.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.focus();
        successPanel.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "center"
        });
      }
    });

    if (editButton && successPanel) {
      editButton.addEventListener("click", function () {
        successPanel.hidden = true;
        form.hidden = false;
        if (formIntro) formIntro.hidden = false;
        var first = doc.getElementById("name");
        if (first) first.focus();
      });
    }
  }

  /* ---------- Smooth reveal for anchor landing ---------- */
  if (window.location.hash) {
    var target = doc.querySelector(window.location.hash);
    if (target) {
      window.setTimeout(function () {
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      }, 120);
    }
  }
})();
