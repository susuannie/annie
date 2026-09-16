// Personal Showcase & Dynamic Clock Script
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Clock
  const clockHoursEl = document.getElementById('clockHours');
  const clockMinutesEl = document.getElementById('clockMinutes');
  const clockSecondsEl = document.getElementById('clockSeconds');
  const clockPeriodEl = document.getElementById('clockPeriod');
  const calendarDateEl = document.getElementById('calendarDate');
  const greetingTextEl = document.getElementById('greetingText');
  const greetingIconEl = document.getElementById('greetingIcon');
  const timezoneTextEl = document.getElementById('timezoneText');
  
  // DOM Elements - Format Toggle
  const formatToggleBtn = document.getElementById('formatToggleBtn');
  const opt12El = document.getElementById('opt12');
  const opt24El = document.getElementById('opt24');

  // DOM Elements - Identity & Editing
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  const avatarInitialsEl = document.getElementById('avatarInitials');
  const editNameBtn = document.getElementById('editNameBtn');
  const editRoleBtn = document.getElementById('editRoleBtn');
  const resetDataBtn = document.getElementById('resetDataBtn');

  // DOM Elements - Actions & Effects
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailHandleEl = document.getElementById('emailHandle');
  const copyIndicatorEl = document.getElementById('copyIndicator');
  const toastNotificationEl = document.getElementById('toastNotification');
  const toastMessageEl = document.getElementById('toastMessage');
  const cursorGlowEl = document.getElementById('cursorGlow');

  // Defaults
  const DEFAULT_NAME = 'Annie';
  const DEFAULT_ROLE = 'Creative Technologist & UI Engineer';

  // State
  let is24HourFormat = localStorage.getItem('pref_24h_format') === 'true';

  // 1. Initialize Name & Role from localStorage
  function loadProfile() {
    const savedName = localStorage.getItem('showcase_user_name') || DEFAULT_NAME;
    const savedRole = localStorage.getItem('showcase_user_role') || DEFAULT_ROLE;

    userNameEl.textContent = savedName;
    userRoleEl.textContent = savedRole;
    updateInitials(savedName);
  }

  function updateInitials(name) {
    const cleanName = name.trim();
    if (!cleanName) {
      avatarInitialsEl.textContent = '★';
      return;
    }
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      avatarInitialsEl.textContent = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
      avatarInitialsEl.textContent = cleanName.substring(0, 2).toUpperCase();
    }
  }

  function saveProfile() {
    const name = userNameEl.textContent.trim() || DEFAULT_NAME;
    const role = userRoleEl.textContent.trim() || DEFAULT_ROLE;
    
    localStorage.setItem('showcase_user_name', name);
    localStorage.setItem('showcase_user_role', role);
    updateInitials(name);
  }

  // Handle Enter key on editable fields
  function setupEditableField(fieldEl, editBtn) {
    fieldEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fieldEl.blur();
      }
    });

    fieldEl.addEventListener('blur', () => {
      if (!fieldEl.textContent.trim()) {
        fieldEl.textContent = fieldEl === userNameEl ? DEFAULT_NAME : DEFAULT_ROLE;
      }
      saveProfile();
      showToast('Profile updated and saved!');
    });

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        fieldEl.focus();
        // Place cursor at end of contenteditable element
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(fieldEl);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      });
    }
  }

  setupEditableField(userNameEl, editNameBtn);
  setupEditableField(userRoleEl, editRoleBtn);

  // 2. Clock & Date Engine
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Time Format handling
    if (!is24HourFormat) {
      const period = hours >= 12 ? 'PM' : 'AM';
      clockPeriodEl.textContent = period;
      clockPeriodEl.style.display = 'inline-block';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
      clockHoursEl.textContent = String(hours).padStart(2, '0');
    } else {
      clockPeriodEl.textContent = '24H';
      clockPeriodEl.style.display = 'inline-block';
      clockHoursEl.textContent = String(hours).padStart(2, '0');
    }

    clockMinutesEl.textContent = minutes;
    clockSecondsEl.textContent = seconds;

    // Calendar Date update
    const dateOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    calendarDateEl.textContent = now.toLocaleDateString(undefined, dateOptions);

    // Dynamic Greeting
    updateGreeting(now.getHours());
  }

  function updateGreeting(hour) {
    let greeting = 'Good Day';
    let icon = '✨';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
      icon = '☀️';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
      icon = '🌤️';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good evening';
      icon = '🌆';
    } else {
      greeting = 'Burning the midnight oil';
      icon = '🌙';
    }

    greetingTextEl.textContent = greeting;
    greetingIconEl.textContent = icon;
  }

  // 3. Timezone Detection
  function detectTimezone() {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
      const offsetMinutes = new Date().getTimezoneOffset();
      const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
      const offsetSign = offsetMinutes <= 0 ? '+' : '-';
      const offsetStr = `UTC${offsetSign}${offsetHours}`;

      timezoneTextEl.textContent = `${timeZone} (${offsetStr})`;
    } catch {
      timezoneTextEl.textContent = 'Local Timezone';
    }
  }

  // 4. Time Format Toggle Button
  function updateFormatUI() {
    if (is24HourFormat) {
      opt24El.classList.add('active');
      opt12El.classList.remove('active');
    } else {
      opt12El.classList.add('active');
      opt24El.classList.remove('active');
    }
    localStorage.setItem('pref_24h_format', is24HourFormat);
    updateClock();
  }

  formatToggleBtn.addEventListener('click', () => {
    is24HourFormat = !is24HourFormat;
    updateFormatUI();
  });

  // 5. Copy Email
  let toastTimeout = null;
  function showToast(message) {
    toastMessageEl.textContent = message;
    toastNotificationEl.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotificationEl.classList.remove('show');
    }, 2800);
  }

  copyEmailBtn.addEventListener('click', async () => {
    const emailToCopy = emailHandleEl.textContent.trim() || 'hello@developer.io';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(emailToCopy);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = emailToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      copyIndicatorEl.textContent = 'Copied!';
      copyIndicatorEl.style.color = '#34d399';
      showToast(`Copied ${emailToCopy} to clipboard!`);

      setTimeout(() => {
        copyIndicatorEl.textContent = 'Copy';
        copyIndicatorEl.style.color = '';
      }, 2000);
    } catch {
      showToast('Press Ctrl+C to copy email: ' + emailToCopy);
    }
  });

  // 6. Reset Preferences
  resetDataBtn.addEventListener('click', () => {
    if (confirm('Reset custom name and role to default values?')) {
      localStorage.removeItem('showcase_user_name');
      localStorage.removeItem('showcase_user_role');
      localStorage.removeItem('pref_24h_format');
      is24HourFormat = false;
      updateFormatUI();
      loadProfile();
      showToast('Preferences restored to defaults.');
    }
  });

  // 7. Interactive Cursor Glow Follower
  let mouseMoveTimeout;
  window.addEventListener('mousemove', (e) => {
    cursorGlowEl.style.opacity = '1';
    cursorGlowEl.style.left = `${e.clientX}px`;
    cursorGlowEl.style.top = `${e.clientY}px`;

    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
      cursorGlowEl.style.opacity = '0.3';
    }, 1200);
  });

  window.addEventListener('mouseleave', () => {
    cursorGlowEl.style.opacity = '0';
  });

  // Init
  loadProfile();
  detectTimezone();
  updateFormatUI();
  updateClock();

  // Tick clock every second synchronously
  setInterval(updateClock, 1000);
});
