// This file will be executed in a Node.js environment on Vercel
module.exports = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const username = url.hash ? url.hash.substring(1) : url.searchParams.get("user");

  res.setHeader("Content-Type", "text/html");
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Viewer</title>
  <style>
    :root {
      --bg-color: #f5f5f5;
      --text-color: #000;
      --card-bg: #fff;
      --card-shadow: rgba(0, 0, 0, 0.1);
    }

    [data-theme="dark"] {
      --bg-color: #1e1e1e;
      --text-color: #eee;
      --card-bg: #2c2c2c;
      --card-shadow: rgba(0, 0, 0, 0.5);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      transition: background-color 0.4s ease, color 0.4s ease;
    }

    .theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 8px 12px;
      background: var(--card-bg);
      border-radius: 6px;
      border: 1px solid #ccc;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 2px 4px var(--card-shadow);
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .profile-container {
      width: 100%;
      max-width: 400px;
    }

    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--bg-color);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      transition: background-color 0.4s ease;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--text-color);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .profile-card-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .profile-card {
      width: 100%;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--card-shadow);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: background-color 0.4s ease;
    }

    .profile-avatar {
      margin-top: 20px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .profile-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .social-icons {
      display: flex;
      gap: 10px;
      margin: 15px 0;
    }

    .social-icons a {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: white;
      transition: opacity 0.2s;
    }

    .social-icons a:hover {
      opacity: 0.9;
    }

    .discord-icon { background-color: #5865F2; }
    .telegram-icon { background-color: #0088cc; }

    .profile-info {
      width: 100%;
      padding: 20px;
      text-align: center;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--card-shadow);
      transition: background-color 0.4s ease;
    }

    .profile-info h2 { font-size: 24px; margin-bottom: 8px; }
    .profile-info p { color: #666; }
    .profile-info h3 { font-size: 18px; margin-bottom: 12px; }
    .profile-info ul { list-style: none; }

    .typing-text {
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      border-right: 2px solid transparent;
      width: 0;
      animation: typing 2s ease-in-out forwards;
    }

    .past-nickname {
      color: #666;
      margin-bottom: 10px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .past-nickname-icon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      color: white;
    }

    .strikethrough::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 0;
      height: 1px;
      background-color: #999;
      animation: strikethrough 1.5s ease-in-out forwards;
      animation-delay: 2s;
    }

    @keyframes typing {
      from { width: 0 }
      to { width: 100% }
    }

    @keyframes strikethrough {
      from { width: 0 }
      to { width: 100% }
    }

    .error-container {
      background-color: var(--card-bg);
      color: #e74c3c;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px var(--card-shadow);
      max-width: 400px;
      margin: 100px auto;
      transition: background-color 0.4s ease;
    }

    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="theme-toggle" onclick="toggleTheme()">Toggle Theme</div>
  <div class="profile-container" id="main-container">
    <div id="loading-screen" class="loading-screen">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>
    </div>
    <div id="profile-container" class="profile-card-container" style="display: none;"></div>
    <div id="error-container" class="error-container" style="display: none;"></div>
  </div>

  <script>
    // Theme toggle
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }

    // Apply saved theme on load
    (() => {
      const saved = localStorage.getItem('theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
      }
    })();

    // Rest of profile logic
    document.addEventListener('DOMContentLoaded', () => {
      const hash = window.location.hash.substring(1);
      const urlParams = new URLSearchParams(window.location.search);
      const queryUser = urlParams.get('user');
      const username = hash || queryUser;
      if (!username) return showError("No username provided");

      setTimeout(() => fetchUserData(username), 5000);
    });

    function hideLoading() {
      const loadingScreen = document.getElementById('loading-screen');
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.style.display = 'none', 500);
    }

    function showError(message) {
      document.getElementById('error-container').innerHTML = '<p>' + message + '</p>';
      document.getElementById('error-container').style.display = 'block';
      document.getElementById('profile-container').style.display = 'none';
      hideLoading();
    }

    async function fetchUserData(username) {
      try {
        const response = await fetch('/Users/' + username + '.json');
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        renderProfile(data);
      } catch {
        showError("Error loading user profile");
      }
    }

    function getPlatformIcon(nickname) {
      const match = nickname.match(/\\[(.*?)\\]/);
      const platform = match && match[1]?.toLowerCase();
      if (platform === 'discord') {
        return '<span class="past-nickname-icon" style="background:#5865F2">D</span>';
      } else if (platform === 'telegram') {
        return '<span class="past-nickname-icon" style="background:#0088cc">T</span>';
      }
      return '';
    }

    function cleanNickname(nick) {
      return nick.replace(/\\[.*?\\]/, '');
    }

    function renderProfile(user) {
      const profileContainer = document.getElementById('profile-container');
      profileContainer.innerHTML = \`
        <div class="profile-card">
          <div class="profile-avatar">
            <img src="\${user.avatar || '/placeholder.svg?height=96&width=96'}" alt="\${user.nickname}">
          </div>
          <div class="social-icons">
            \${user.discord ? \`<a href="https://discord.com/users/\${user.discord}" class="discord-icon" target="_blank">D</a>\` : ''}
            \${user.telegram ? \`<a href="https://t.me/\${user.telegram}" class="telegram-icon" target="_blank">T</a>\` : ''}
          </div>
          <div class="profile-info" id="profile-info">
            <h2>\${user.nickname}</h2>
            <p>\${user.bio || "Click to see past nicknames"}</p>
            <div id="past-nicknames-container" class="hidden">
              <h3>Past Nicknames:</h3>
              <ul id="past-nicknames-list"></ul>
            </div>
          </div>
        </div>
      \`;

      const list = document.getElementById('past-nicknames-list');
      if (user.past_nicknames?.length) {
        user.past_nicknames.forEach((nick, i) => {
          const icon = getPlatformIcon(nick);
          const text = cleanNickname(nick);
          const li = document.createElement('li');
          li.className = 'past-nickname';
          li.style.animationDelay = \`\${i * 0.5}s\`;
          li.innerHTML = \`\${icon}<span class="typing-text strikethrough">\${text}</span>\`;
          list.appendChild(li);
        });
      } else {
        list.innerHTML = '<li>No past nicknames</li>';
      }

      const info = document.getElementById('profile-info');
      let shown = false;
      info.addEventListener('click', () => {
        document.querySelectorAll('#profile-info > h2, #profile-info > p')
          .forEach(el => el.style.display = shown ? 'block' : 'none');
        document.getElementById('past-nicknames-container')
          .classList.toggle('hidden', shown);
        shown = !shown;
      });

      profileContainer.style.display = 'flex';
      hideLoading();
    }
  </script>
</body>
</html>
  `);
};
