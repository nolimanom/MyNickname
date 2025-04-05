// This file will be executed in a Node.js environment on Vercel
module.exports = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const username = url.hash ? url.hash.substring(1) : url.searchParams.get("user")

  res.setHeader("Content-Type", "text/html")
  res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Viewer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --bg-color: #f5f5f5;
      --card-bg: #ffffff;
      --text-primary: #000000;
      --text-secondary: #666666;
      --shadow-color: rgba(0, 0, 0, 0.1);
      --error-color: #e74c3c;
      transition: all 0.5s ease;
    }
    
    [data-theme="dark"] {
      --bg-color: #1a1a1a;
      --card-bg: #2d2d2d;
      --text-primary: #ffffff;
      --text-secondary: #aaaaaa;
      --shadow-color: rgba(0, 0, 0, 0.3);
      --error-color: #ff6b6b;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: var(--bg-color);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .theme-switcher {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1001;
    }
    
    .theme-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background-color: var(--card-bg);
      box-shadow: 0 2px 4px var(--shadow-color);
      transition: all 0.3s ease;
    }
    
    .theme-button:hover {
      transform: scale(1.1);
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
      background-color: var(--card-bg);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      transition: opacity 0.5s ease;
    }
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--text-primary);
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
      box-shadow: 0 4px 12px var(--shadow-color);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .profile-avatar {
      margin-top: 20px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid var(--card-bg);
      box-shadow: 0 2px 8px var(--shadow-color);
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
    
    .discord-icon {
      background-color: #5865F2;
    }
    
    .telegram-icon {
      background-color: #0088cc;
    }
    
    .profile-info {
      width: 100%;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--shadow-color);
      color: var(--text-primary);
    }
    
    .badges-container {
      display: flex;
      justify-content: center;
      gap: 5px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    
    .badge {
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .badge img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    .profile-info h2 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .profile-info p {
      color: var(--text-secondary);
    }
    
    .profile-info h3 {
      font-size: 18px;
      margin-bottom: 12px;
    }
    
    .profile-info ul {
      list-style: none;
    }
    
    .typing-text {
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      border-right: 2px solid transparent;
      width: 0;
      animation: typing 2s ease-in-out forwards;
    }
    
    .past-nickname {
      color: var(--text-secondary);
      margin-bottom: 10px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .past-nickname-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      color: white;
      flex-shrink: 0;
    }
    
    .strikethrough {
      position: relative;
    }
    
    .strikethrough::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 0;
      height: 1px;
      background-color: var(--text-secondary);
      animation: strikethrough 1.5s ease-in-out forwards;
      animation-delay: 2s;
    }
    
    #past-nicknames-container {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease-in-out;
      width: 100%;
    }
    
    #past-nicknames-container.expanded {
      max-height: 500px;
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
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px var(--shadow-color);
      color: var(--error-color);
      text-align: center;
      max-width: 400px;
      margin: 100px auto;
    }
    
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="theme-switcher">
    <button class="theme-button" id="theme-toggle" title="Toggle theme">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
  </div>
  
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
    (function() {
      document.addEventListener('DOMContentLoaded', init);

      const badgeIcons = {
        "Owner": {
          icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNyb3duLWljb24gbHVjaWRlLWNyb3duIj48cGF0aCBkPSJNMTEuNTYyIDMuMjY2YS41LjUgMCAwIDEgLjg3NiAwTDE1LjM5IDguODdhMSAxIDAgMCAwIDEuNTE2LjI5NEwyMS4xODMgNS41YS41LjUgMCAwIDEgLjc5OC41MTlsLTIuODM0IDEwLjI0NmExIDEgMCAwIDEtLjk1Ni43MzRINS44MWExIDEgMCAwIDEtLjk1Ny0uNzM0TDIuMDIgNi4wMmEuNS41IDAgMCAxIC43OTgtLjUxOWw0LjI3NiAzLjY2NGExIDEgMCAwIDAgMS41MTYtLjI5NHoiLz48cGF0aCBkPSJNNSAyMWgxNCIvPjwvc3ZnPg==",
          color: "#FFD700" // Gold
        },
        "Developer": {
          icon: "data:image/svg+xml;base64,PHN2ZyB4b Asc смущённо улыбнувшись4eLXdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb25zLWxlZnQtcmlnaHQtaWNvbiBsdWNpZGUtY2hldnJvbnMtbGVmdC1yaWdodCI+PHBhdGggZD0ibTkgNy01IDUgNSA1Ii8+PHBhdGggZD0ibTE1IDcgNSA1LTUgNSIvPjwvc3ZnPg==",
          color: "#00CED1" // Turquoise
        },
        "Verified": {
          icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJhZGdlLWNoZWNrLWljb24gbHVjaWRlLWJhZGdlLWNoZWNrIj48cGF0aCBkPSJNMy44NSA4LjYyYTQgNCAwIDAgMSA0Ljc4LTQuNzcgNCA0IDAgMCAxIDYuNzQgMCA0IDQgMCAwIDEgNC43OCA0Ljc4IDQgNCAwIDAgMSAwIDYuNzQgNCA0IDAgMCAxLTQuNzcgNC43OCA0IDQgMCAwIDEtNi43NSAwIDQgNCAwIDAgMS00Ljc4LTQuNzcgNCA0IDAgMCAxIDAtNi43NloiLz48cGF0aCBkPSJtOSAxMiAyIDIgNC00Ii8+PC9zdmc+",
          color: "#1DA1F2" // Twitter Blue
        }
      };

      function init() {
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        html.setAttribute('data-theme', savedTheme);
        
        themeToggle.addEventListener('click', () => {
          const currentTheme = html.getAttribute('data-theme');
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          html.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
        });

        const hash = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(window.location.search);
        const queryUser = urlParams.get('user');
        const username = hash || queryUser;
        
        if (!username) {
          showError("No username provided in URL hash or query parameter");
          return;
        }
        
        setTimeout(() => {
          fetchUserData(username);
        }, 5000);
      }
      
      function hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
      
      function showError(message) {
        const errorContainer = document.getElementById('error-container');
        const profileContainer = document.getElementById('profile-container');
        
        errorContainer.innerHTML = \`<p>\${message}</p>\`;
        errorContainer.style.display = 'block';
        profileContainer.style.display = 'none';
        hideLoading();
      }
      
      async function fetchUserData(username) {
        try {
          const response = await fetch(\`/Users/\${username}.json\`);
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const userData = await response.json();
          renderProfile(userData);
        } catch (err) {
          showError("Error loading user profile");
          console.error(err);
        }
      }
      
      function getPlatformIcon(nickname) {
        const platformMatch = nickname.match(/\\[(.*?)\\]/);
        if (!platformMatch) return null;
        
        const platform = platformMatch[1].toLowerCase();
        let iconHtml = '';
        
        if (platform === 'discord') {
          iconHtml = \`
            <span class="past-nickname-icon" style="background-color: #5865F2;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0531 1.5076 4.0414 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743. emis74 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.8732.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6061 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-4.5468-.3722-9.0694-3.7882-13.6922a.0669.0669 0 00-.0322-.0281zm-6.6836 13.8098c-1.1864 0-2.1504-.911-2.1504-2.035s.966-2.038 2.1504-2.038c1.1821 0 2.1371.917 2.1371 2.038 consciente-.9549 2.035-2.1371 2.035zm5.5898 0c-1.1835 0-2.1495-.911-2.1495-2.035s.966-2.038 2.1495-2.038c1.1844 0 2.1371.917 2.1371 2.038s-.9527 2.035-2.1371 2.035z"/>
              </svg>
            </span>
          \`;
        } else if (platform === 'telegram') {
          iconHtml = \`
            <span class="past-nickname-icon" style="background-color: #0088cc;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
                <path d="M228.88 26.19a9 9 0 00-9.16-1.57L17.06 103.93a14 14 0 002.1 27.14l59.06 21.73 24.71-25.65c2.73-2.83 7.13-2.93 9.86-.22s2.63 7.11-.1 9.94l-24.72 25.65 33.53 35.94a14 14 0 0013.42 4.31c.24-.05.47-.11.71-.17l101.53-37.37a14 14 0 009-18.63L232.22 35a9 9 0 00-3.34-8.81zM215 113.57l-89.35 32.88-28.88-30.95L215 45.89z"/>
              </svg>
            </span>
          \`;
        }
        return iconHtml;
      }
      
      function cleanNickname(nickname) {
        return nickname.replace(/\\[.*?\\]/, '');
      }
      
      function renderProfile(user) {
        const profileContainer = document.getElementById('profile-container');
        
        const badgesHTML = (user.badges || []).map(badge => {
          if (badgeIcons[badge]) {
            return \`<span class="badge" title="\${badge}"><img src="\${badgeIcons[badge].icon}" alt="\${badge} badge" style="color: \${badgeIcons[badge].color};"></span>\`;
          }
          return '';
        }).join('');
        
        const profileHTML = \`
          <div class="profile-card">
            <div class="profile-avatar">
              <img src="\${user.avatar || '/placeholder.svg?height=96&width=96'}" alt="\${user.nickname}" />
            </div>
            
            <div class="social-icons">
              \${user.discord ? \`
                <a href="https://discord.com/users/\${user.discord}" target="_blank" rel="noopener noreferrer" class="discord-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0531 1.5076 4.0414 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.8732.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6061 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-4.5468-.3722-9.0694-3.7882-13.6922a.0669.0669 0 00-.0322-.0281zm-6.6836 13.8098c-1.1864 0-2.1504-.911-2.1504-2.035s.966-2.038 2.1504-2.038c1.1821 0 2.1371.917 2.1371 2.038s-.9549 2.035-2.1371 2.035zm5.5898 0c-1.1835 0-2.1495-.911-2.1495-2.035s.966-2.038 2.1495-2.038c1.1844 0 2.1371.917 2.1371 2.038s-.9527 2.035-2.1371 2.035z"/>
                  </svg>
                </a>
              \` : ''}
              
              \${user.telegram ? \`
                <a href="https://t.me/\${user.telegram}" target="_blank" rel="noopener noreferrer" class="telegram-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M228.88 26.19a9 9 0 00-9.16-1.57L17.06 103.93a14 14 0 002.1 27.14l59.06 21.73 24.71-25.65c2.73-2.83 7.13-2.93 9.86-.22s2.63 7.11-.1 9.94l-24.72 25.65 33.53 35.94a14 14 0 0013.42 4.31c.24-.05.47-.11.71-.17l101.53-37.37a14 14 0 009-18.63L232.22 35a9 9 0 00-3.34-8.81zM215 113.57l-89.35 32.88-28.88-30.95L215 45.89z"/>
                  </svg>
                </a>
              \` : ''}
            </div>
            
            <div class="profile-info" id="profile-info">
              <div class="badges-container">
                \${badgesHTML}
              </div>
              <h2>\${user.nickname}</h2>
              <p>\${user.bio || "Click to see past nicknames"}</p>
              
              <div id="past-nicknames-container">
                <h3>Past Nicknames:</h3>
                <ul id="past-nicknames-list"></ul>
              </div>
            </div>
          </div>
        \`;
        
        profileContainer.innerHTML = profileHTML;
        profileContainer.style.display = 'flex';
        hideLoading();
        
        const pastNicknamesList = document.getElementById('past-nicknames-list');
        const pastNicknamesContainer = document.getElementById('past-nicknames-container');
        
        if (user.past_nicknames && user.past_nicknames.length > 0) {
          user.past_nicknames.forEach((nick, index) => {
            const delay = index * 1.0;
            const platformIcon = getPlatformIcon(nick);
            const cleanedNick = cleanNickname(nick);
            
            const li = document.createElement('li');
            li.className = 'past-nickname';
            li.style.animationDelay = \`\${delay}s\`;
            
            li.innerHTML = \`
              \${platformIcon || ''}
              <span class="typing-text strikethrough" style="animation-delay: \${delay}s;">\${cleanedNick}</span>
            \`;
            
            pastNicknamesList.appendChild(li);
          });
        } else {
          pastNicknamesList.innerHTML = '<li>No past nicknames</li>';
        }
        
        let showingPastNicknames = false;
        const profileInfo = document.getElementById('profile-info');
        const currentNicknameElements = Array.from(profileInfo.querySelectorAll('h2, p')).filter(el => !el.closest('#past-nicknames-container'));
        
        profileInfo.addEventListener('click', () => {
          if (!showingPastNicknames) {
            currentNicknameElements.forEach(el => el.style.display = 'none');
            pastNicknamesContainer.classList.add('expanded');
          } else {
            pastNicknamesContainer.classList.remove('expanded');
            setTimeout(() => {
              currentNicknameElements.forEach(el => el.style.display = 'block');
            }, 500);
          }
          showingPastNicknames = !showingPastNicknames;
        });
      }
    })();
  </script>
</body>
</html>
  `)
}
